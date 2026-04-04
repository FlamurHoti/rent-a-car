/** Wraps async route handlers — catches errors and forwards to Express error handler. */
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
