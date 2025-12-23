from fastapi import FastAPI, UploadFile, File
import httpx

app = FastAPI(title='Safety Agent')


@app.get('/live')
def live():
    return {'status': 'ok', 'service': 'safety-agent'}


@app.get('/ready')
def ready():
    return {'ready': True}


@app.post('/analyze-photo')
async def analyze_photo(file: UploadFile = File(...)):
    # stub analysis: return a fake safety score and detected issues
    content = await file.read()
    # In production, run YOLO/OpenCV model here
    return {'score': 0.92, 'issues': ['missing_hard_hat'], 'size_bytes': len(content)}
