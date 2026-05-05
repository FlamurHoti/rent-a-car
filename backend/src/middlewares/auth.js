/**
 * Authentication & RBAC middleware
 *
 * verifyJWT activates ALL three application-side isolation layers in order:
 *   1. Loads user from DB (companyId comes from DB, never from JWT payload)
 *   2. Activates AsyncLocalStorage tenant context (Layer 1)
 *   3. Sets PostgreSQL session variable for RLS (Layer 3, requires ENABLE_RLS=true)
 *
 * Layer 2 (Prisma $extends auto-inject) fires automatically on every query
 * downstream — no explicit call needed here.
 */

const jwt     = require('jsonwebtoken');
const { prisma } = require('../database');
const config  = require('../config');
const { runWithTenant } = require('../context/tenantContext');

/**
 * Verify JWT and activate tenant context for the request.
 * companyId is ALWAYS sourced from the database, not from the JWT payload —
 * so a token with a tampered companyId claim still gets the correct DB value.
 */
const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { company: true },
    });
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    req.user      = user;
    req.companyId = user.companyId; // always from DB, not from JWT claim

    // LAYER 1: wrap all downstream async work in the ALS tenant context.
    // Every controller, utility, and Prisma hook running after next() will
    // be able to call getTenantContextOrNull() and get the right companyId.
    return runWithTenant(user.companyId, user.id, user.role, async () => {
      // LAYER 3: set PostgreSQL session variable so RLS policies fire.
      // Guarded by ENABLE_RLS env var so you can deploy the app before the
      // SQL migration and enable it later with zero code changes.
      // Note: with connection pooling this is best-effort on the same
      // connection — use withRLSTransaction() for operations that need a
      // hard guarantee (see src/utils/withRLSTransaction.js).
      if (process.env.ENABLE_RLS === 'true') {
        try {
          // set_config(key, value, is_local=false) — session-scoped
          await prisma.$queryRaw`SELECT set_config('app.current_company_id', ${user.companyId}, false)`;
        } catch (rlsErr) {
          // Non-fatal: Layer 2 (Prisma extension) still enforces isolation.
          // Log so you know RLS is degraded.
          console.error('[RLS] set_config failed:', rlsErr.message);
        }
      }

      next();
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError')  return res.status(401).json({ error: 'Invalid token.' });
    if (err.name === 'TokenExpiredError')  return res.status(401).json({ error: 'Token expired.' });
    next(err);
  }
};

/** Alias kept for backward compatibility */
const authenticate = verifyJWT;

/**
 * Role-based access control. Must run after verifyJWT.
 * Usage: requireRole('OWNER') or requireRole('OWNER', 'STAFF')
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Insufficient permissions.' });
  next();
};

module.exports = { verifyJWT, authenticate, requireRole };