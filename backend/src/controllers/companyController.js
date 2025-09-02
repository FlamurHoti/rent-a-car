const { validationResult } = require('express-validator');
const { prisma } = require('../database');

/**
 * GET /api/companies/me - get current user's company (auth required)
 */
async function getMyCompany(req, res, next) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.companyId },
    });
    if (!company) {
      return res.status(404).json({ error: 'Company not found.' });
    }
    res.json(company);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/companies/me - update current user's company (OWNER only recommended)
 */
async function updateMyCompany(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, phone, address, businessNumber, subscriptionPlan, subscriptionExpiry } = req.body;
    const data = {};
    if (name != null) {
      if (typeof name === 'string' && !name.trim()) {
        return res.status(400).json({ error: 'Company name cannot be empty.' });
      }
      data.name = name;
    }
    if (email != null) {
      if (typeof email === 'string' && !email.trim()) {
        return res.status(400).json({ error: 'Company email cannot be empty.' });
      }
      data.email = email;
    }
    if (phone !== undefined) data.phone = phone;
    if (address !== undefined) data.address = address;
    if (businessNumber !== undefined) data.businessNumber = businessNumber;
    if (subscriptionPlan !== undefined) data.subscriptionPlan = subscriptionPlan;
    if (subscriptionExpiry !== undefined) {
      data.subscriptionExpiry = subscriptionExpiry ? new Date(subscriptionExpiry) : null;
    }
    const company = await prisma.company.update({
      where: { id: req.companyId },
      data,
    });
    res.json(company);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Company email already in use.' });
    }
    next(err);
  }
}

module.exports = { getMyCompany, updateMyCompany };
