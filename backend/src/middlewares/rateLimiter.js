const rateLimit = require('express-rate-limit');

/** Rate limiter for authenticated API endpoints — 60 requests per minute per IP. */
const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
});

module.exports = { apiRateLimit };
