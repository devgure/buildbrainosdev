const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:27017';
const MONGO_DB = process.env.MONGO_DB || 'buildbrain';
const MONGO_MAX_POOL = parseInt(process.env.MONGO_MAX_POOL || '20', 10);
const MONGO_MIN_POOL = parseInt(process.env.MONGO_MIN_POOL || '2', 10);

const app = express();
app.use(cors());
app.use(bodyParser.json());

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
    console.log('auth-service connected to MongoDB');
    ready = true;
  }, { retries: 6, baseMs: 800 });
}

// Liveness
app.get('/live', (req, res) => res.json({ status: 'ok', service: 'auth-service' }));

// Readiness: ensure DB connection
app.get('/ready', async (req, res) => {
  try {
    if (!mongoClient) await initDb();
    await mongoClient.db(MONGO_DB).command({ ping: 1 });
    return res.json({ ready: true });
  } catch (err) {
    return res.status(503).json({ ready: false, reason: String(err.message) });
  }
});

// Simple endpoint to upsert a user (post-login hook)
app.post('/users', async (req, res) => {
  try {
    const { sub, email, name } = req.body; // expects an Auth0 profile
    const user = await prisma.user.upsert({
      where: { authId: sub },
      update: { email, name },
      create: { authId: sub, email, name }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


(async () => {
  try {
    await initDb();
  } catch (err) {
    console.warn('auth-service failed to connect to Mongo at startup:', err.message || err);
  }
  const server = app.listen(5100, () => {
    ready = true;
    console.log('Auth-service listening on 5100');
  });

  const shutdown = async () => {
    console.log('Shutting down auth-service...');
    try { if (mongoClient) await mongoClient.close(); } catch(e){}
    try { await prisma.$disconnect(); } catch(e){}
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
})();
