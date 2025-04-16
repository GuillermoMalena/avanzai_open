FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install Poetry
RUN pip install --upgrade pip && pip install poetry

# Copy pyproject.toml and poetry.lock
COPY pyproject.toml poetry.lock* /app/

# Install dependencies
RUN poetry config virtualenvs.create false && poetry install --no-interaction --no-ansi

# Copy app source
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Run the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
