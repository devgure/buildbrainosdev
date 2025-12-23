const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:27017';
const MONGO_DB = process.env.MONGO_DB || 'buildbrain';
const MONGO_MAX_POOL = parseInt(process.env.MONGO_MAX_POOL || '20', 10);
const MONGO_MIN_POOL = parseInt(process.env.MONGO_MIN_POOL || '2', 10);

const app = express();
app.use(cors());
app.use(express.json());

let projects = [
  { id: 1, name: 'Demo Hospital', address: '123 Build St' }
];

// Reusable Mongo client initialized at startup
let mongoClient;
let ready = false;
const { retryAsync } = require('../../utils/startup');
async function initDb() {
  if (mongoClient) return;
  await retryAsync(async () => {
    mongoClient = new MongoClient(MONGO_URL, {
      maxPoolSize: MONGO_MAX_POOL,
      minPoolSize: MONGO_MIN_POOL,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    await mongoClient.connect();
    console.log('project-service connected to MongoDB');
    ready = true;
  }, { retries: 6, baseMs: 500 });
}

// Liveness: quick check that process is up
app.get('/live', (req, res) => res.json({ status: 'ok', service: 'project-service' }));

// Readiness: report if DB connectivity is available
app.get('/ready', async (req, res) => {
  try {
    if (!mongoClient) await initDb();
    await mongoClient.db(MONGO_DB).command({ ping: 1 });
    return res.json({ ready: true });
  } catch (err) {
    return res.status(503).json({ ready: false, reason: String(err.message) });
  }
});

app.get('/projects', (req, res) => res.json(projects));

app.post('/projects', (req, res) => {
  const p = { id: projects.length + 1, ...req.body };
  projects.push(p);
  res.status(201).json(p);
});

// initialize DB and start server
(async () => {
  try {
    await initDb();
  } catch (err) {
    console.warn('project-service failed to connect to Mongo at startup:', err.message || err);
  }
  const server = app.listen(5000, () => {
    ready = true;
    console.log('Project-service listening on 5000');
  });

  // graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down project-service...');
    try { if (mongoClient) await mongoClient.close(); } catch(e){}
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
})();
