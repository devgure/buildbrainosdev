from fastapi import FastAPI, UploadFile, File
import pytesseract
import io
from PIL import Image

app = FastAPI(title='Compliance OCR Agent')


@app.get('/live')
def live():
    return {'status': 'ok', 'service': 'compliance-ocr-agent'}


@app.get('/ready')
def ready():
    return {'ready': True}


@app.post('/validate-coi')
async def validate_coi(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        img = Image.open(io.BytesIO(contents))
        text = pytesseract.image_to_string(img)
    except Exception:
        # fallback: return empty
        text = ''
    # very naive check for 'General Liability' phrase
    valid = 'General Liability' in text or 'GL' in text
    return {'valid': valid, 'snippet': text[:500]}
