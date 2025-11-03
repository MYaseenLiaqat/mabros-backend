# Use Python 3.11 slim image for smaller size
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY server.py .

# Create a non-root user for security
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Run with Gunicorn for production
# --bind :8080 - Bind to port 8080
# --workers 1 - Single worker (Cloud Run handles scaling)
# --threads 8 - 8 threads per worker for concurrent requests
# --timeout 0 - Disable timeout (Cloud Run manages this)
CMD exec gunicorn --bind :8080 --workers 1 --threads 8 --timeout 0 server:app
