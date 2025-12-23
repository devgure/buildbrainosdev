from fastapi import FastAPI
import os
import asyncio
import redis.asyncio as aioredis
from package_services.startup_backoff import retry_async

app = FastAPI(title='BuildBrain AI Service')

# Reusable Redis client and readiness flag
REDIS_URL = os.getenv('REDIS_URL', 'redis://redis:6379')
REDIS_MAX_CONNS = int(os.getenv('REDIS_MAX_CONNS', '20'))
redis_client: aioredis.Redis | None = None
ready = False


@app.on_event('startup')
async def startup_event():
    global redis_client, ready
    try:
        async def connect():
            nonlocal redis_client
            redis_client = aioredis.from_url(REDIS_URL, max_connections=REDIS_MAX_CONNS)
            await redis_client.ping()
        await retry_async(connect, retries=6, base=0.5)
        ready = True
        print('ai-service connected to Redis')
    except Exception as e:
        print('ai-service failed to connect to Redis at startup:', e)


@app.on_event('shutdown')
async def shutdown_event():
    global redis_client
    try:
        if redis_client:
            await redis_client.close()
    except Exception:
        pass


@app.get('/live')
async def live():
    return {'status': 'ok', 'service': 'ai-service'}


@app.get('/ready')
async def ready_probe():
    try:
        if not redis_client:
            return {'ready': False, 'reason': 'redis-uninitialized'}, 503
        await redis_client.ping()
        return {'ready': True}
    except Exception as e:
        return {'ready': False, 'reason': str(e)}, 503


# removed old simple ready (we now actively ping redis)


@app.post('/ai/ingest')
async def ingest(payload: dict):
    # stub: accept blueprint/contract metadata and return a task id
    return {'task_id': 'stub-123', 'received': payload}


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
