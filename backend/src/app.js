const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

const config         = require('./config');
const routes         = require('./routes');
const errorHandler   = require('./middlewares/errorHandler');
const { apiRateLimit } = require('./middlewares/rateLimiter');

const app = express();

app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.use('/api', apiRateLimit, routes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

module.exports = app;