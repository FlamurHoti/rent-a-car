const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { prisma } = require('../database');

const BCRYPT_ROUNDS = 10;

async function register(req, res) {
  const {
    companyName, companyEmail, companyPhone, companyAddress,
    businessNumber, subscriptionPlan, subscriptionExpiry,
    name, email, password,
  } = req.body;

  if (!name?.trim() || !email?.trim() || !password?.trim() || !companyName?.trim() || !companyEmail?.trim()) {
    return res.status(400).json({ error: 'Required fields: companyName, companyEmail, name, email, password.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters with uppercase, lowercase, and a number.' });
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    return res.status(400).json({ error: 'Password must contain uppercase, lowercase, and a number.' });
  }

  const normalEmail = email.toLowerCase().trim();
  const normalCompanyEmail = companyEmail.toLowerCase().trim();

  const existingCompany = await prisma.company.findUnique({ where: { email: normalCompanyEmail } });
  if (existingCompany) return res.status(400).json({ error: 'Company email already registered.' });

  const existingUser = await prisma.user.findFirst({ where: { email: normalEmail } });
  if (existingUser) return res.status(400).json({ error: 'This email is already registered with another company.' });

  let parsedExpiry = null;
  if (subscriptionExpiry) {
    parsedExpiry = new Date(subscriptionExpiry);
    if (isNaN(parsedExpiry.getTime())) return res.status(400).json({ error: 'Invalid subscription expiry date.' });
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const company = await prisma.company.create({
    data: {
      name: companyName.trim(), email: normalCompanyEmail,
      phone: companyPhone?.trim() || null, address: companyAddress?.trim() || null,
      businessNumber: businessNumber?.trim() || null,
      subscriptionPlan: subscriptionPlan?.trim() || 'basic',
      subscriptionExpiry: parsedExpiry,
    },
  });
  const user = await prisma.user.create({
    data: { email: normalEmail, password: hashedPassword, name: name.trim(), role: 'OWNER', companyId: company.id },
    include: { company: true },
  });

  const token = jwt.sign(
    { userId: user.id, companyId: user.companyId, role: user.role },
    config.jwt.secret, { expiresIn: config.jwt.expiresIn }
  );
  res.status(201).json({ token, user: safeUser(user) });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email?.trim() || !password) return res.status(400).json({ error: 'Email and password are required.' });

  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase().trim() },
    include: { company: true },
  });
  if (!user || !user.password) return res.status(401).json({ error: 'Invalid email or password.' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

  const token = jwt.sign(
    { userId: user.id, companyId: user.companyId, role: user.role },
    config.jwt.secret, { expiresIn: config.jwt.expiresIn }
  );
  res.json({ token, user: safeUser(user) });
}

async function me(req, res) {
  const user = req.user;
  const company = user.company
    ? { id: user.company.id, name: user.company.name, email: user.company.email, phone: user.company.phone ?? null, address: user.company.address ?? null }
    : null;
  res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, companyId: user.companyId, company } });
}

function safeUser(user) {
  return {
    id: user.id, email: user.email, name: user.name,
    role: user.role, companyId: user.companyId,
    company: { id: user.company.id, name: user.company.name, email: user.company.email },
  };
}

module.exports = { register, login, me };
