FROM tiangolo/uvicorn-gunicorn-fastapi:python3.11

COPY ../requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt
RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
COPY ../app /app

CMD ["fastapi", "run", "app.py", "--port", "80"]