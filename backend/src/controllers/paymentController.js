const { prisma } = require('../database');
const { safeParseFloat } = require('../utils/parseUtils');

const VALID_TRANSITIONS = {
  PENDING:   ['COMPLETED', 'FAILED', 'CANCELLED'],
  COMPLETED: ['REFUNDED'],
  FAILED:    ['PENDING'],
  REFUNDED:  [],
};

const PAYMENT_LIST_SELECT = {
  id: true, amount: true, method: true, status: true, paidAt: true, createdAt: true,
  reservation: {
    select: {
      id: true, customerName: true, startDate: true, totalPrice: true,
      car: { select: { brand: true, model: true, plateNumber: true } },
    },
  },
};

async function list(req, res) {
  const { reservationId } = req.query;
  const where = { companyId: req.companyId };
  if (reservationId) where.reservationId = reservationId;
  const payments = await prisma.payment.findMany({
    where, select: PAYMENT_LIST_SELECT, orderBy: { createdAt: 'desc' },
  });
  res.json(payments);
}

async function getById(req, res) {
  const payment = await prisma.payment.findFirst({
    where: { id: req.params.id, companyId: req.companyId },
    select: PAYMENT_LIST_SELECT,
  });
  if (!payment) return res.status(404).json({ error: 'Payment not found.' });
  res.json(payment);
}

async function create(req, res) {
  const { reservationId, amount, method } = req.body;
  const parsedAmount = safeParseFloat(amount);
  if (parsedAmount === null || parsedAmount < 0.01) return res.status(400).json({ error: 'Amount must be at least 0.01.' });

  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, companyId: req.companyId },
    select: { id: true, totalPrice: true },
  });
  if (!reservation) return res.status(404).json({ error: 'Reservation not found.' });
  if (parsedAmount > Number(reservation.totalPrice)) return res.status(400).json({ error: 'Payment amount cannot exceed reservation total price.' });

  const payment = await prisma.payment.create({
    data: { reservationId, amount: parsedAmount, method, status: 'PENDING', companyId: req.companyId },
    select: PAYMENT_LIST_SELECT,
  });
  res.status(201).json(payment);
}

async function update(req, res) {
  const existing = await prisma.payment.findFirst({
    where: { id: req.params.id, companyId: req.companyId },
    select: { id: true, status: true },
  });
  if (!existing) return res.status(404).json({ error: 'Payment not found.' });

  const { status } = req.body;
  const allowed = VALID_TRANSITIONS[existing.status] || [];
  if (!allowed.includes(status)) return res.status(400).json({ error: `Cannot transition from ${existing.status} to ${status}.` });
  if (status === 'COMPLETED' && req.user.role !== 'OWNER') return res.status(403).json({ error: 'Only OWNER can mark payments as completed.' });

  const updates = { status };
  if (status === 'COMPLETED') updates.paidAt = new Date();
  else if (status !== 'REFUNDED') updates.paidAt = null;

  const payment = await prisma.payment.update({
    where: { id: req.params.id }, data: updates,
    select: PAYMENT_LIST_SELECT,
  });
  res.json(payment);
}

module.exports = { list, getById, create, update };
