const { prisma } = require('../database');

async function getMyCompany(req, res) {
  const company = await prisma.company.findUnique({ where: { id: req.companyId } });
  if (!company) return res.status(404).json({ error: 'Company not found.' });
  res.json(company);
}

async function updateMyCompany(req, res) {
  const { name, email, phone, address, businessNumber, subscriptionPlan, subscriptionExpiry } = req.body;
  const data = {};

  if (name != null) {
    if (typeof name === 'string' && !name.trim()) return res.status(400).json({ error: 'Company name cannot be empty.' });
    data.name = name.trim();
  }
  if (email != null) {
    if (typeof email === 'string' && !email.trim()) return res.status(400).json({ error: 'Company email cannot be empty.' });
    data.email = email.toLowerCase().trim();
  }
  if (phone !== undefined) data.phone = phone?.trim() || null;
  if (address !== undefined) data.address = address?.trim() || null;
  if (businessNumber !== undefined) data.businessNumber = businessNumber?.trim() || null;
  if (subscriptionPlan !== undefined) data.subscriptionPlan = subscriptionPlan?.trim() || null;
  if (subscriptionExpiry !== undefined) {
    if (subscriptionExpiry) {
      const parsed = new Date(subscriptionExpiry);
      if (isNaN(parsed.getTime())) return res.status(400).json({ error: 'Invalid subscription expiry date.' });
      data.subscriptionExpiry = parsed;
    } else {
      data.subscriptionExpiry = null;
    }
  }

  try {
    const company = await prisma.company.update({ where: { id: req.companyId }, data });
    res.json(company);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Company email already in use.' });
    throw err;
  }
}

module.exports = { getMyCompany, updateMyCompany };
