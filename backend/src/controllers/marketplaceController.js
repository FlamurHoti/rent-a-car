const { validationResult } = require('express-validator');
const { prisma } = require('../database');
const { isCarAvailable } = require('../utils/availability');
const { sendBookingConfirmation, sendNewBookingAlert } = require('../utils/email');

/**
 * GET /api/public/companies - list companies (for marketplace landing)
 */
async function listCompanies(req, res, next) {
  try {
    const companies = await prisma.company.findMany({
      where: {
        cars: {
          some: { status: 'AVAILABLE' },
        },
      },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        _count: { select: { cars: { where: { status: 'AVAILABLE' } } } },
      },
      orderBy: { name: 'asc' },
    });
    res.json(companies);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/public/companies/:companyId/cars - list available cars for a company
 */
async function listCars(req, res, next) {
  try {
    const { companyId } = req.params;
    const { startDate, endDate } = req.query;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true },
    });
    if (!company) {
      return res.status(404).json({ error: 'Company not found.' });
    }

    const cars = await prisma.car.findMany({
      where: { companyId, status: 'AVAILABLE' },
      orderBy: [{ brand: 'asc' }, { model: 'asc' }],
    });

    // If date range provided, filter out cars with overlapping reservations
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start) && !isNaN(end) && start < end) {
        const overlapping = await prisma.reservation.findMany({
          where: {
            companyId,
            status: { in: ['PENDING', 'CONFIRMED'] },
            OR: [
              { startDate: { lte: start }, endDate: { gt: start } },
              { startDate: { lt: end }, endDate: { gte: end } },
              { startDate: { gte: start }, endDate: { lte: end } },
            ],
          },
          select: { carId: true },
        });
        const busyCarIds = new Set(overlapping.map((r) => r.carId));
        const available = cars.filter((c) => !busyCarIds.has(c.id));
        return res.json({ company, cars: available, filtered: true });
      }
    }

    res.json({ company, cars, filtered: false });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/public/companies/:companyId/cars/:carId - get single car (public)
 */
async function getCar(req, res, next) {
  try {
    const { companyId, carId } = req.params;
    const car = await prisma.car.findFirst({
      where: { id: carId, companyId },
    });
    if (!car) {
      return res.status(404).json({ error: 'Car not found.' });
    }
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, phone: true },
    });
    res.json({ company, car });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/public/reservations - create reservation (guest, no auth)
 */
async function createReservation(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { companyId, carId, customerName, customerPhone, customerEmail, startDate, endDate, notes } = req.body;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) {
      return res.status(404).json({ error: 'Company not found.' });
    }

    const car = await prisma.car.findFirst({
      where: { id: carId, companyId },
    });
    if (!car) {
      return res.status(404).json({ error: 'Car not found.' });
    }
    if (car.status !== 'AVAILABLE') {
      return res.status(400).json({ error: 'Car is not available for booking.' });
    }

    const available = await isCarAvailable(carId, startDate, endDate);
    if (!available) {
      return res.status(400).json({
        error: 'Car is not available for the selected dates (overlapping reservation).',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({ error: 'End date must be after start date.' });
    }
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
    const totalPrice = Number(car.pricePerDay) * days;

    const reservation = await prisma.reservation.create({
      data: {
        companyId,
        carId,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        startDate: start,
        endDate: end,
        totalPrice,
        status: 'PENDING',
        notes: notes || null,
      },
      include: { car: true },
    });

    // Send emails in background — don't block the response
    const fullCompany = await prisma.company.findUnique({ where: { id: companyId } });
    sendBookingConfirmation({ reservation, car, company: fullCompany }).catch(() => {});
    sendNewBookingAlert({ reservation, car, company: fullCompany }).catch(() => {});

    res.status(201).json(reservation);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCompanies,
  listCars,
  getCar,
  createReservation,
};
