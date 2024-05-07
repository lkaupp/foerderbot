import logging
import sys

import nest_asyncio


import os

from llama_index.core import (
    SimpleDirectoryReader,
    VectorStoreIndex,
    StorageContext, load_index_from_storage, Settings,

)

from llama_index.core.utils import get_cache_dir

from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.ollama import Ollama

from llama_index.core.node_parser import SentenceSplitter, SemanticSplitterNodeParser, HierarchicalNodeParser
import ollama
# fix windows registry stuff
import mimetypes

from starlette.middleware.cors import CORSMiddleware
from starlette.responses import PlainTextResponse

mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')

#logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)
#logging.getLogger().addHandler(logging.StreamHandler(stream=sys.stdout))
from llama_index.readers.file import FlatReader
from llama_index.vector_stores.qdrant import QdrantVectorStore
from llama_index_client import SimpleWebPageReader
from qdrant_client import qdrant_client, AsyncQdrantClient
from sentence_transformers import SentenceTransformer

import uvicorn
from fastapi import FastAPI

ollama_url = os.environ.get("OLLAMA_URL", None)
database_url = os.environ.get("DATABASE_URL", None)
print('database url')
print(database_url)
print('ollama url')
print(ollama_url)
app = FastAPI(docs_url=None, redoc_url=None)


nest_asyncio.apply()
client = qdrant_client.QdrantClient(
    database_url,
)
aclient = AsyncQdrantClient(
    database_url,
)

origins = [
    "http://localhost",
    "http://localhost:4200",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
#'http://localhost:11434'
def initialize_index():
    global index
    global storage_context


    cache_folder = os.path.join(get_cache_dir(), "models")
    os.makedirs(cache_folder, exist_ok=True)

    embed_model = HuggingFaceEmbedding(model_name='aari1995/German_Semantic_STS_V2', cache_folder=cache_folder, device='cuda')
    Settings.embed_model = embed_model

    # ollama
    llm = Ollama(base_url=ollama_url, model="llama3", request_timeout=30.0, system_prompt='Always respond in German.', context_window=8192)
    Settings.llm = llm

    if  os.listdir("storage") != []:
        vector_store = QdrantVectorStore(client=client,
                                         collection_name="documents_aari_normal_8k_sentence_md",
                                         aclient=aclient,
                                         prefer_grpc=True)
        storage_context = StorageContext.from_defaults(persist_dir='storage', vector_store=vector_store)
        index = load_index_from_storage(storage_context)
    else:
        documents = SimpleDirectoryReader("preprocessed").load_data()

        splitter = SentenceSplitter(chunk_size=8192)
        vector_store = QdrantVectorStore(client=client,
                                         collection_name="documents_aari_normal_8k_sentence_md",
                                         aclient=aclient,
                                         prefer_grpc=True)
        storage_context = StorageContext.from_defaults(vector_store=vector_store)
        index = VectorStoreIndex.from_documents(documents,
                                                  llm=llm,
                                                  transformations=[splitter],
                                                  storage_context=storage_context,
                                                  show_progress=True,
                                                  use_async=True)

        index.storage_context.persist("storage")



@app.get("/query", response_class=PlainTextResponse)
def query_index(text: str = ""):
    global index
    query_text = text
    if query_text is None:
        return (
            "No text found, please include a ?text=blah parameter in the URL",
            400,
        )


    query_engine = index.as_query_engine(
        use_async=True, similarity_top_k=20,
    )

    response = query_engine.query(query_text)

    return str(response.response)

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles




app.mount("/static", StaticFiles(directory="static/", html=True), name="static")

@app.get('/')
def get_app_angular():

    with open('static/index.html', 'r') as file_index:
        html_content = file_index.read()
    return HTMLResponse(html_content, status_code=200)

initialize_index()

if __name__ == "__main__":
    uvicorn.run("app:app")
