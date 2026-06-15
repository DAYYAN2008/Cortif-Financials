FROM python:3.10-slim

WORKDIR /code

# Set PYTHONPATH to ensure 'services' module and others resolve correctly
ENV PYTHONPATH=/code

# 1. Install system dependencies and the Redis server daemon
RUN apt-get update && apt-get install -y --no-install-recommends \
    redis-server \
    && rm -rf /var/lib/apt/lists/*

# 2. Copy and install your Python wheels matrix
COPY requirements.txt /code/
RUN pip install --no-cache-dir -r requirements.txt

# 3. Copy the rest of your backend source files
COPY . /code/

# Hugging Face Spaces always look for port 7860
EXPOSE 7860

# 4. CRITICAL: Start Redis silently in the background, then launch Uvicorn
CMD redis-server --daemonize yes && uvicorn main:app --host 0.0.0.0 --port 7860
