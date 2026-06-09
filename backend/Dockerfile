FROM python:3.10-slim

# Set the working directory
WORKDIR /code

# Set PYTHONPATH to ensure 'services' module and others resolve correctly
ENV PYTHONPATH=/code

# Copy the requirements file and install dependencies
COPY requirements.txt /code/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the remaining project files
COPY . /code/

# Expose Hugging Face Space port
EXPOSE 7860

# Run Uvicorn listening on all interfaces on port 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
