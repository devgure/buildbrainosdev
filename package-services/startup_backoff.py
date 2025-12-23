import asyncio
import time

async def retry_async(func, retries=6, base=0.5):
    """Retry async function with exponential backoff.
    func: async callable
    retries: number of retries
    base: base seconds
    """
    for attempt in range(retries + 1):
        try:
            return await func()
        except Exception as e:
            if attempt >= retries:
                raise
            backoff = min(30, base * (2 ** attempt))
            print(f"startup_backoff: attempt {attempt+1} failed: {e}; sleeping {backoff}s")
            await asyncio.sleep(backoff)
