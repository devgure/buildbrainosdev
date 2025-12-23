FROM python:3.11-slim AS builder
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
COPY requirements.txt ./
RUN apt-get update && apt-get install -y gcc libpq-dev build-essential --no-install-recommends && \
	pip install --no-cache-dir -r requirements.txt && \
	apt-get purge -y --auto-remove gcc build-essential
COPY . .

FROM python:3.11-slim AS runtime
RUN groupadd -g 1000 app && useradd -m -u 1000 -g app app
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /app /app
USER app
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
