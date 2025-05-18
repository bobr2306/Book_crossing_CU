FROM python:3.9-slim
LABEL authors="konst"

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD flask db upgrade && flask seed-db && flask run --host=0.0.0.0 --port=5000