FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt ./
RUN apt-get update && apt-get install -y tesseract-ocr libtesseract-dev --no-install-recommends && \
    pip install --no-cache-dir -r requirements.txt
COPY . .

FROM python:3.11-slim AS runtime
RUN groupadd -g 1000 app && useradd -m -u 1000 -g app app
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /app /app
USER app
EXPOSE 8300
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8300"]
