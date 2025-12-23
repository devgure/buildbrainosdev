const express = require('express');
const cors = require('cors');
const fetch = global.fetch || require('node-fetch');
const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const app = express();
app.use(cors());
app.use(express.json());

// Liveness endpoint - cheap and local
app.get('/live', async (req, res) => {
  return res.json({ status: 'ok', service: 'gateway' });
});

// Readiness: aggregate downstream readiness (short timeout)
app.get('/ready', async (req, res) => {
  const services = [
    { name: 'project-service', url: process.env.PROJECT_SERVICE_URL || 'http://project-service:5000/ready' },
    { name: 'auth-service', url: process.env.AUTH_SERVICE_URL || 'http://auth-service:5100/ready' },
    { name: 'ai-service', url: process.env.AI_SERVICE_URL || 'http://ai-service:8000/ready' }
  ];
  const results = {};
  let overallReady = true;
  for (const s of services) {
    try {
      const r = await fetch(s.url, { method: 'GET', timeout: 3000 });
      if (!r.ok) {
        overallReady = false;
        results[s.name] = `http ${r.status}`;
      } else {
        results[s.name] = await r.json();
      }
    } catch (err) {
      overallReady = false;
      results[s.name] = String(err.message || err);
    }
  }
  if (overallReady) return res.json({ ready: true, checks: results });
  return res.status(503).json({ ready: false, checks: results });
});

// Auth middleware using Auth0 JWKS
const auth0Domain = process.env.AUTH0_DOMAIN || '';
const auth0Audience = process.env.AUTH0_AUDIENCE || '';

let checkJwt;
if (auth0Domain && auth0Audience) {
  checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${auth0Domain}/.well-known/jwks.json`
    }),
    audience: auth0Audience,
    issuer: `https://${auth0Domain}/`,
    algorithms: ['RS256']
  });
} else {
  // noop middleware for local development
  checkJwt = (req, res, next) => { next(); };
}

// Proxy example for projects (protected)
app.get('/api/projects', checkJwt, async (req, res) => {
  try {
    const r = await fetch('http://project-service:5000/projects');
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'project-service unavailable', detail: err.message });
  }
});

let ready = false;
const server = app.listen(4000, () => {
  ready = true;
  console.log('Gateway listening on 4000');
});

app.get('/ready', (req, res) => res.json({ ready }));

const shutdown = () => {
  console.log('Shutting down gateway...');
  try { server.close(() => process.exit(0)); } catch (e) { process.exit(0); }
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
