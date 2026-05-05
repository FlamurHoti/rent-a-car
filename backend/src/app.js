const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

const config              = require('./config');
const routes              = require('./routes');
const errorHandler        = require('./middlewares/errorHandler');
const { apiRateLimit }    = require('./middlewares/rateLimiter');
const { isShuttingDown }  = require('./lib/gracefulShutdown');

const app = express();

// ── Security headers + CORS ────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// ── Health endpoints (BEFORE shutdown middleware so they always respond) ───

// Liveness: process is alive — always 200.
// Render/uptime monitors should point here.
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Readiness: safe to receive traffic — 503 during shutdown.
// Load balancers / Render drain logic should poll this endpoint.
// Return 503 as early as possible so the LB stops routing new requests
// before we call server.close().
app.get('/api/health/ready', (_req, res) => {
  if (isShuttingDown()) {
    return res.status(503).json({ ok: false, reason: 'shutting_down' });
  }
  res.json({ ok: true });
});

// ── Shutdown gate ──────────────────────────────────────────────────────────
// After SIGTERM: server.close() stops new TCP connections, but existing
// keep-alive connections can still deliver new HTTP requests before the client
// detects the closure. This middleware returns 503 on those "late" requests
// and sends "Connection: close" so the client drops the keep-alive immediately.
app.use((req, res, next) => {
  if (isShuttingDown()) {
    res.set('Connection', 'close');
    return res.status(503).json({ error: 'Service is shutting down. Please retry in a moment.' });
  }
  next();
});

// ── Application routes ─────────────────────────────────────────────────────
app.use('/api', apiRateLimit, routes);

// ── 404 + error handler ────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

module.exports = app;
