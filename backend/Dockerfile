# Use an official Python runtime as a parent image
FROM python:3.11-slim
# Set the working directory to /app
WORKDIR /app

# System deps needed by opencv / dlib-based libs
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 build-essential cmake \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
# Install dependencies from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
# Copy the current directory contents into the container at /app
COPY . .

# Make port 8000 available to the world outside this container
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
#we use 0.0.0.0 because it allows to accept connections from any IP address, which is necessary when running inside a Docker container.