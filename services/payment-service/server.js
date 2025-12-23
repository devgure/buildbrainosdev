const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Stripe = require('stripe');


const app = express();
app.use(cors());
// Use JSON parser for all routes except the webhook which requires the raw body
app.use((req, res, next) => {
  if (req.path === '/webhook') return next();
  return bodyParser.json()(req, res, next);
});

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// MongoDB setup for event persistence and retry queue
const { MongoClient } = require('mongodb');
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:27017';
const MONGO_DB = process.env.MONGO_DB || 'buildbrain';
const MONGO_MAX_POOL = parseInt(process.env.MONGO_MAX_POOL || '30', 10);
const MONGO_MIN_POOL = parseInt(process.env.MONGO_MIN_POOL || '2', 10);
let dbClient, db;
let ready = false;
const { retryAsync } = require('../../utils/startup');

async function connectDb() {
  if (dbClient) return;
  await retryAsync(async () => {
    dbClient = new MongoClient(MONGO_URL, {
      maxPoolSize: MONGO_MAX_POOL,
      minPoolSize: MONGO_MIN_POOL,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    await dbClient.connect();
    db = dbClient.db(MONGO_DB);
  }, { retries: 6, baseMs: 1000 });
  // ensure indexes for job queue
  await db.collection('webhook_jobs').createIndex({ nextAttemptAt: 1 });
  await db.collection('webhook_jobs').createIndex({ status: 1 });
  console.log('Connected to MongoDB', MONGO_URL, 'DB:', MONGO_DB);
}

// Simple exponential backoff helper
function nextBackoff(attempts) {
  const base = 5; // seconds
  return Math.min(60 * 60, Math.pow(2, attempts) * base);
}

// Background worker to process webhook jobs
const MAX_ATTEMPTS = 5;
async function processPendingJobs() {
  try {
    await connectDb();
    const now = new Date();
    const job = await db.collection('webhook_jobs').findOneAndUpdate(
      { status: { $in: ['pending','retry'] }, nextAttemptAt: { $lte: now } },
      { $set: { status: 'processing', startedAt: new Date() } },
      { sort: { nextAttemptAt: 1 }, returnDocument: 'after' }
    );
    if (!job.value) return;
    const j = job.value;
    console.log('Processing webhook job', j._id, 'attempts', j.attempts);
    try {
      // handle the event (this is where business logic goes)
      await handleEvent(j.event);
      await db.collection('webhook_jobs').updateOne({ _id: j._id }, { $set: { status: 'done', doneAt: new Date() } });
      await db.collection('stripe_events').insertOne({ event: j.event, receivedAt: new Date(), processed: true });
    } catch (err) {
      console.error('Job processing failed:', err.message || err);
      const attempts = (j.attempts || 0) + 1;
      const update = { $set: { attempts, lastError: String(err.message || err), lastAttemptAt: new Date() } };
      if (attempts >= MAX_ATTEMPTS) update.$set.status = 'failed';
      else update.$set.status = 'retry';
      update.$set.nextAttemptAt = new Date(Date.now() + nextBackoff(attempts) * 1000);
      await db.collection('webhook_jobs').updateOne({ _id: j._id }, update);
    }
  } catch (err) {
    console.error('processPendingJobs error', err.message || err);
  }
}

// Simple event handler: extend with DB updates, invoices, accounting, etc.
async function handleEvent(event) {
  if (!event || !event.type) throw new Error('Invalid event');
  if (event.type === 'payment_intent.succeeded') {
    // Business logic: mark invoice, payout, notify
    console.log('handleEvent: payment_intent.succeeded', event.data?.object?.id);
    // simulate idempotent write
    await db.collection('payments').updateOne(
      { payment_intent_id: event.data.object.id },
      { $set: { status: 'succeeded', updatedAt: new Date(), raw: event.data.object } },
      { upsert: true }
    );
    return;
  }
  // Default: persist event
  await db.collection('stripe_events').insertOne({ event, receivedAt: new Date(), processed: false });
}

// Start worker interval
setInterval(() => {
  processPendingJobs();
}, 3000);

// initialize DB connection at startup so handlers can reuse it
(async () => {
  try {
    await connectDb();
    ready = true;
    console.log('payment-service connected to MongoDB');
  } catch (err) {
    console.warn('payment-service failed to connect to MongoDB at startup:', err.message || err);
  }
})();

// Liveness
app.get('/live', (req, res) => res.json({ status: 'ok', service: 'payment-service' }));

// Readiness: ensures DB connectivity and returns 503 when not ready
app.get('/ready', async (req, res) => {
  try {
    await connectDb();
    const pending = await db.collection('webhook_jobs').countDocuments({ status: { $in: ['pending','retry','processing'] } });
    return res.json({ ready: true, pending_webhook_jobs: pending });
  } catch (err) {
    return res.status(503).json({ ready: false, reason: String(err.message) });
  }
});

// Create a payment intent (stub)
app.post('/create-payment-intent', async (req, res) => {
  const { amount = 1000, currency = 'usd' } = req.body;
  try {
    const intent = await stripe.paymentIntents.create({ amount, currency });
    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Webhook endpoint: use raw body so Stripe signature can be verified.
// For this endpoint we parse the raw body to allow signature verification.
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const buf = req.body;
  let event;

  if (!webhookSecret) {
    // No webhook secret set: accept unsigned payload (convenience for CI/dev)
    try {
      event = JSON.parse(buf.toString());
      console.warn('No STRIPE_WEBHOOK_SECRET set - accepting unsigned webhook (dev only)');
    } catch (err) {
      console.error('Invalid JSON payload and no webhook secret configured:', err.message);
      return res.status(400).send('Invalid payload');
    }
  } else {
    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  console.log('Received webhook event:', event.type || event);
  try {
    await connectDb();
    // persist event and enqueue job for processing
    const ev = event;
    const insert = await db.collection('stripe_events').insertOne({ event: ev, receivedAt: new Date(), processed: false });
    const job = {
      event: ev,
      status: 'pending',
      attempts: 0,
      createdAt: new Date(),
      nextAttemptAt: new Date()
    };
    await db.collection('webhook_jobs').insertOne(job);
    res.json({ received: true, storedEventId: insert.insertedId });
  } catch (err) {
    console.error('Failed to persist webhook event:', err.message || err);
    // If we fail to persist, return 500 so Stripe may retry
    res.status(500).send('failed to persist event');
  }
});

const server = app.listen(5200, () => console.log('Payment-service listening on 5200'));

// graceful shutdown: close mongo and exit
const shutdown = async () => {
  console.log('Shutting down payment-service...');
  try { if (dbClient) await dbClient.close(); } catch (e) {}
  server.close(() => process.exit(0));
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
