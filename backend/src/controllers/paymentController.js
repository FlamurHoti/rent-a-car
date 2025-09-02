const { validationResult } = require('express-validator');
const { prisma } = require('../database');

/**
 * GET /api/payments - list payments for company (filter by reservationId optional)
 */
async function list(req, res, next) {
  try {
    const { reservationId } = req.query;
    const where = { companyId: req.companyId };
    if (reservationId) where.reservationId = reservationId;
    const payments = await prisma.payment.findMany({
      where,
      include: { reservation: { include: { car: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(payments);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/payments/:id
 */
async function getById(req, res, next) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { id: req.params.id, companyId: req.companyId },
      include: { reservation: { include: { car: true } } },
    });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found.' });
    }
    res.json(payment);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/payments - create payment for a reservation (staff can create, OWNER marks completed)
 */
async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { reservationId, amount, method } = req.body;
    const reservation = await prisma.reservation.findFirst({
      where: { id: reservationId, companyId: req.companyId },
    });
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found.' });
    }
    const payment = await prisma.payment.create({
      data: {
        reservationId,
        amount: parseFloat(amount),
        method,
        status: 'PENDING',
        companyId: req.companyId,
      },
      include: { reservation: { include: { car: true } } },
    });
    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/payments/:id - only OWNER can set status to COMPLETED
 */
async function update(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const existing = await prisma.payment.findFirst({
      where: { id: req.params.id, companyId: req.companyId },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Payment not found.' });
    }
    const { status } = req.body;
    if (status === 'COMPLETED' && req.user.role !== 'OWNER') {
      return res.status(403).json({ error: 'Only OWNER can mark payments as completed.' });
    }
    const updates = {};
    if (status === 'COMPLETED') {
      updates.status = 'COMPLETED';
      updates.paidAt = new Date();
    } else if (['PENDING', 'FAILED', 'REFUNDED'].includes(status)) {
      updates.status = status;
      if (status !== 'PENDING') updates.paidAt = null;
    }
    const payment = await prisma.payment.update({
      where: { id: req.params.id },
      data: updates,
      include: { reservation: { include: { car: true } } },
    });
    res.json(payment);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update };
