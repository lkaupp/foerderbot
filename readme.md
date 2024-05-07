# Förderbot
______

An example application for retrieval augmented generation (RAG) based on hessian funding lines.

Technology Stack:
* [LLamaIndex](https://www.llamaindex.ai/) (Framework)
* [Qdrant](https://qdrant.tech/) (Vector Database)
* [Ollama](https://ollama.com/) (LLM Server)
* [FastAPI](https://fastapi.tiangolo.com/) (Web-Framework)
* [Angular](https://angular.io/) (Frontend-Framwork)
* [Angular Material](https://material.angular.io/) (Frontend Design Library)

Models:
* [German_Semantic_STS_V2](https://huggingface.co/aari1995/German_Semantic_STS_V2) (Embedding model)
* [Llama3](https://huggingface.co/docs/transformers/main/model_doc/llama3) (LLM model)

LLamaIndex is used with the regular SimpleDataLoader, and Vector Store (both can be improved by using Plugins or external vector databases). 
Ollama is used for hosting the Llama3 model which of course can be used standalone. FastAPI is the standard backend server, interacting with the Angular application 
over a super basic REST API. Angular 2+ and Material are used as frontend libraries (used a fraction of their capabilities only, 
IMHO Angular is the best enterprise frontend framework).

In order to run the application:

1. Install nvidia drivers
2. Install docker CE
3. Install nvidia toolkit & configure docker
4. Create folder "foerderbot"
5. Copy folders and files `docker, app, storage, qdrant_storage, requirements.txt, docker-compose.yml` to the foerderbot folder
6. Run `sudo docker compose --env-file=.env.prod up --build -d`
7. Foerderbot is now running at port 80