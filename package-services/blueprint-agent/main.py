from fastapi import FastAPI, File, UploadFile
import fitz  # PyMuPDF
import pytesseract
import io
import os
import boto3
from botocore.exceptions import ClientError
from botocore.config import Config as BotoConfig
import httpx
from pathlib import Path

app = FastAPI(title='Blueprint Ingest Agent')

# Initialize S3/MinIO client once if configured
MINIO_ENDPOINT = os.getenv('MINIO_ENDPOINT')
MINIO_BUCKET = os.getenv('MINIO_BUCKET')
MINIO_KEY = os.getenv('MINIO_ACCESS_KEY') or os.getenv('MINIO_ROOT_USER')
MINIO_SECRET = os.getenv('MINIO_SECRET_KEY') or os.getenv('MINIO_ROOT_PASSWORD')
S3_CLIENT = None
if MINIO_ENDPOINT and MINIO_KEY and MINIO_SECRET and MINIO_BUCKET:
    try:
        S3_CLIENT = boto3.client('s3', aws_access_key_id=MINIO_KEY, aws_secret_access_key=MINIO_SECRET, endpoint_url=MINIO_ENDPOINT, config=BotoConfig(signature_version='s3v4'))
    except Exception as _:
        S3_CLIENT = None
ready = False


@app.on_event('startup')
def startup_event():
    global ready
    if S3_CLIENT:
        try:
            S3_CLIENT.head_bucket(Bucket=MINIO_BUCKET)
            ready = True
            print('blueprint-agent: MinIO available')
        except Exception as e:
            print('blueprint-agent: MinIO not available on startup', e)
    else:
        # no MinIO configured - consider ready
        ready = True


@app.on_event('shutdown')
def shutdown_event():
    # boto3 client does not require explicit close
    pass


@app.get('/live')
def live():
    return {'status': 'ok', 'service': 'blueprint-agent'}


@app.get('/ready')
def ready_probe():
    if S3_CLIENT:
        try:
            S3_CLIENT.head_bucket(Bucket=MINIO_BUCKET)
            return {'ready': True}
        except Exception as e:
            return {'ready': False, 'reason': str(e)}, 503
    return {'ready': True}


def upload_to_s3(contents: bytes, filename: str) -> str:
    """Upload to S3 or MinIO if credentials are present, else save locally and return path/url."""
    aws_key = os.getenv('AWS_ACCESS_KEY_ID')
    aws_secret = os.getenv('AWS_SECRET_ACCESS_KEY')
    bucket = os.getenv('AWS_S3_BUCKET')
    region = os.getenv('AWS_REGION', 'us-east-1')

    # MinIO compatibility
    minio_endpoint = os.getenv('MINIO_ENDPOINT')
    minio_key = os.getenv('MINIO_ACCESS_KEY') or os.getenv('MINIO_ROOT_USER')
    minio_secret = os.getenv('MINIO_SECRET_KEY') or os.getenv('MINIO_ROOT_PASSWORD')
    minio_bucket = os.getenv('MINIO_BUCKET')

    # Prefer S3 (AWS) if configured
    if aws_key and aws_secret and bucket:
        s3 = boto3.client('s3', aws_access_key_id=aws_key, aws_secret_access_key=aws_secret, region_name=region)
        key = f"blueprints/{filename}"
        try:
            s3.put_object(Bucket=bucket, Key=key, Body=contents)
            url = s3.generate_presigned_url('get_object', Params={'Bucket': bucket, 'Key': key}, ExpiresIn=3600)
            return url
        except ClientError as e:
            return f"error:{str(e)}"

    # If MinIO is configured, use it
    if minio_endpoint and minio_key and minio_secret and minio_bucket:
        # boto3 client with custom endpoint
        config = BotoConfig(signature_version='s3v4')
        s3 = boto3.client('s3', aws_access_key_id=minio_key, aws_secret_access_key=minio_secret, endpoint_url=minio_endpoint, config=config)
        key = f"blueprints/{filename}"
        try:
            s3.put_object(Bucket=minio_bucket, Key=key, Body=contents)
            # generate presigned URL (MinIO will accept presigned URLs)
            url = s3.generate_presigned_url('get_object', Params={'Bucket': minio_bucket, 'Key': key}, ExpiresIn=3600)
            return url
        except ClientError as e:
            return f"error:{str(e)}"

    # fallback - save locally in data/uploads
    outdir = Path('./data/uploads')
    outdir.mkdir(parents=True, exist_ok=True)
    p = outdir / filename
    p.write_bytes(contents)
    return str(p.resolve())


@app.get('/ready')
def ready_probe():
    return {'ready': ready}


@app.post('/ingest')
async def ingest(file: UploadFile = File(...)):
    contents = await file.read()
    # perform OCR on first page for quick text extraction
    doc = fitz.open(stream=contents, filetype='pdf')
    page = doc.load_page(0)
    pix = page.get_pixmap(dpi=150)
    img_bytes = pix.tobytes()
    text = pytesseract.image_to_string(io.BytesIO(img_bytes))

    # Upload original PDF to S3 (or local fallback)
    s3_url = upload_to_s3(contents, file.filename)

    # Notify AI service with the uploaded file URL and extracted snippet
    ai_service = os.getenv('AI_SERVICE_URL', 'http://ai-service:8000')
    payload = {
        'source_url': s3_url,
        'filename': file.filename,
        'snippet': text[:4000]
    }
    ai_response = None
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            r = await client.post(f"{ai_service}/ai/ingest", json=payload)
            ai_response = r.json()
    except Exception as e:
        ai_response = {'error': str(e)}

    return { 'filename': file.filename, 's3_url': s3_url, 'snippet': text[:1000], 'ai_response': ai_response }


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8100)
