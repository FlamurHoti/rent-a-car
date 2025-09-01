/**
 * Authentication & RBAC middleware
 * - verifyJWT: validates token, attaches req.user and req.companyId (multi-tenant)
 * - requireRole: restricts access by role (OWNER, STAFF)
 * Prisma protects against SQL injection via parameterized queries.
 */

const jwt = require('jsonwebtoken');
const { prisma } = require('../database');
const config = require('../config');

/**
 * Verify JWT and attach user + company_id to request.
 * Multi-tenant: req.companyId is used by all protected routes to filter data.
 * Token payload may contain userId, companyId, role; we still load user from DB for integrity.
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

    req.user = user;
    req.companyId = user.companyId; // multi-tenant: every query filters by this
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    next(err);
  }
};

/** Alias for backward compatibility */
const authenticate = verifyJWT;

/**
 * Role-based access control. Use after verifyJWT.
 * Example: requireRole('OWNER') or requireRole('OWNER', 'STAFF')
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions.' });
  }
  next();
};

module.exports = { verifyJWT, authenticate, requireRole };
