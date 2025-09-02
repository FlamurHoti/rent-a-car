const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const config = require('../config');
const { prisma } = require('../database');

// Salt rounds for bcrypt (10 = production-safe, higher = slower)
const BCRYPT_ROUNDS = 10;

/**
 * POST /api/auth/register
 * Creates company + first user as OWNER. Password hashed with bcrypt.
 * Body: companyName, companyEmail, companyPhone?, businessNumber?, subscriptionPlan?,
 *       name, email, password
 */
async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      companyName,
      companyEmail,
      companyPhone,
      companyAddress,
      businessNumber,
      subscriptionPlan,
      subscriptionExpiry,
      name,
      email,
      password,
    } = req.body;

    if (!name?.trim() || !email?.trim() || !password || !companyName?.trim() || !companyEmail?.trim()) {
      return res.status(400).json({ error: 'Required fields: companyName, companyEmail, name, email, password.' });
    }

    const existingCompany = await prisma.company.findUnique({
      where: { email: companyEmail },
    });
    if (existingCompany) {
      return res.status(400).json({ error: 'Company email already registered.' });
    }
    // Email unique per company: check after we have company, or check any company has this user email
    const existingUserGlobal = await prisma.user.findFirst({
      where: { email },
    });
    if (existingUserGlobal) {
      return res.status(400).json({ error: 'This email is already registered with another company.' });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const company = await prisma.company.create({
      data: {
        name: companyName,
        email: companyEmail,
        phone: companyPhone || null,
        address: companyAddress || null,
        businessNumber: businessNumber || null,
        subscriptionPlan: subscriptionPlan || 'basic',
        subscriptionExpiry: subscriptionExpiry ? new Date(subscriptionExpiry) : null,
      },
    });
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'OWNER',
        companyId: company.id,
      },
      include: { company: true },
    });

    // JWT payload: user_id, company_id, role (for multi-tenant middleware and RBAC)
    const token = jwt.sign(
      {
        userId: user.id,
        companyId: user.companyId,
        role: user.role,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
        company: {
          id: user.company.id,
          name: user.company.name,
          email: user.company.email,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Validates email + password, returns JWT with user_id, company_id, role.
 */
async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    const user = await prisma.user.findFirst({
      where: { email },
      include: { company: true },
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user.id, companyId: user.companyId, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
        company: {
          id: user.company.id,
          name: user.company.name,
          email: user.company.email,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me - current user (requires auth)
 */
async function me(req, res, next) {
  try {
    const user = req.user;
    const company = user.company
      ? {
          id: user.company.id,
          name: user.company.name,
          email: user.company.email,
          phone: user.company.phone ?? null,
          address: user.company.address ?? null,
        }
      : null;
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
        company,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
