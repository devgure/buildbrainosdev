// Utility: retry async function with exponential backoff
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function retryAsync(fn, opts = {}) {
  const retries = opts.retries ?? 5;
  const baseMs = opts.baseMs ?? 500; // initial backoff
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      const backoff = Math.min(30000, baseMs * Math.pow(2, attempt));
      console.warn(`retryAsync attempt ${attempt + 1} failed: ${err.message || err}. backing off ${backoff}ms`);
      await sleep(backoff);
    }
  }
}

module.exports = { retryAsync };
