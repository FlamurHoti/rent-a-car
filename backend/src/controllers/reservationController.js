const { validationResult } = require('express-validator');
const { prisma } = require('../database');
const { logActivity } = require('../utils/activityLog');
const { isCarAvailable } = require('../utils/availability');

/**
 * GET /api/reservations - list reservations for current company
 */
async function list(req, res, next) {
  try {
    const { status, carId, from, to } = req.query;
    const where = { companyId: req.companyId };
    if (status) where.status = status;
    if (carId) where.carId = carId;
    if (from) where.endDate = { gte: new Date(from) };
    if (to) where.startDate = { lte: new Date(to) };
    const reservations = await prisma.reservation.findMany({
      where,
      include: { car: true },
      orderBy: { startDate: 'desc' },
    });
    res.json(reservations);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/reservations/:id
 */
async function getById(req, res, next) {
  try {
    const reservation = await prisma.reservation.findFirst({
      where: { id: req.params.id, companyId: req.companyId },
      include: { car: true },
    });
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found.' });
    }
    res.json(reservation);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/reservations - with availability check
 */
async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { carId, customerName, customerPhone, startDate, endDate, notes } = req.body;
    const car = await prisma.car.findFirst({
      where: { id: carId, companyId: req.companyId },
    });
    if (!car) {
      return res.status(404).json({ error: 'Car not found.' });
    }
    const available = await isCarAvailable(carId, startDate, endDate);
    if (!available) {
      return res.status(400).json({
        error: 'Car is not available for the selected dates (overlapping reservation).',
      });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
    const totalPrice = Number(car.pricePerDay) * days;

    const reservation = await prisma.reservation.create({
      data: {
        carId,
        customerName,
        customerPhone,
        startDate: start,
        endDate: end,
        totalPrice,
        status: 'PENDING',
        notes: notes || null,
        companyId: req.companyId,
      },
      include: { car: true },
    });
    await logActivity({
      userId: req.user.id,
      companyId: req.companyId,
      action: 'reservation_created',
      entityType: 'reservation',
      entityId: reservation.id,
      details: { customerName, carId },
    });
    res.status(201).json(reservation);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/reservations/:id - optional availability check when dates change
 */
async function update(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const existing = await prisma.reservation.findFirst({
      where: { id: req.params.id, companyId: req.companyId },
      include: { car: true },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Reservation not found.' });
    }
    const { startDate, endDate, status, customerName, customerPhone, notes } = req.body;
    let newStart = existing.startDate;
    let newEnd = existing.endDate;
    if (startDate) newStart = new Date(startDate);
    if (endDate) newEnd = new Date(endDate);
    if (newStart >= newEnd) {
      return res.status(400).json({ error: 'End date must be after start date.' });
    }
    if (startDate || endDate) {
      const available = await isCarAvailable(existing.carId, newStart, newEnd, existing.id);
      if (!available) {
        return res.status(400).json({
          error: 'Car is not available for the selected dates.',
        });
      }
    }
    const days = Math.ceil((newEnd - newStart) / (1000 * 60 * 60 * 24)) || 1;
    const totalPrice = Number(existing.car.pricePerDay) * days;

    const reservation = await prisma.reservation.update({
      where: { id: req.params.id },
      data: {
        ...(startDate && { startDate: newStart }),
        ...(endDate && { endDate: newEnd }),
        ...(status && { status }),
        ...(customerName !== undefined && { customerName }),
        ...(customerPhone !== undefined && { customerPhone }),
        ...(notes !== undefined && { notes }),
        totalPrice,
      },
      include: { car: true },
    });
    await logActivity({
      userId: req.user.id,
      companyId: req.companyId,
      action: 'reservation_updated',
      entityType: 'reservation',
      entityId: reservation.id,
      details: { customerName: reservation.customerName },
    });
    res.json(reservation);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/reservations/:id
 */
async function remove(req, res, next) {
  try {
    const existing = await prisma.reservation.findFirst({
      where: { id: req.params.id, companyId: req.companyId },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Reservation not found.' });
    }
    await prisma.reservation.delete({ where: { id: req.params.id } });
    await logActivity({
      userId: req.user.id,
      companyId: req.companyId,
      action: 'reservation_deleted',
      entityType: 'reservation',
      entityId: req.params.id,
      details: { customerName: existing.customerName },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/reservations/availability?carId=&startDate=&endDate=
 * Public or auth: check if car is available (optional excludeReservationId for edit)
 */
async function checkAvailability(req, res, next) {
  try {
    const { carId, startDate, endDate, excludeReservationId } = req.query;
    if (!carId || !startDate || !endDate) {
      return res.status(400).json({ error: 'carId, startDate, endDate required.' });
    }
    const available = await isCarAvailable(
      carId,
      startDate,
      endDate,
      excludeReservationId || null
    );
    res.json({ available });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove, checkAvailability };
