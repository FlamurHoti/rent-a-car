const { prisma } = require('../database');
const { isCarAvailable } = require('../utils/availability');
const { validateDateRange } = require('../utils/dateUtils');
const { sendBookingConfirmation, sendNewBookingAlert } = require('../utils/email');

const CAR_PUBLIC_SELECT = {
  id: true, brand: true, model: true, year: true, plateNumber: true,
  imageUrl: true, fuelType: true, transmission: true, pricePerDay: true, status: true,
};

async function listCompanies(_req, res) {
  const companies = await prisma.company.findMany({
    where: { cars: { some: { status: 'AVAILABLE' } } },
    select: { id: true, name: true, address: true, phone: true, _count: { select: { cars: { where: { status: 'AVAILABLE' } } } } },
    orderBy: { name: 'asc' },
  });
  res.json(companies);
}

async function listCars(req, res) {
  const { companyId } = req.params;
  const { startDate, endDate } = req.query;

  const company = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true, name: true } });
  if (!company) return res.status(404).json({ error: 'Company not found.' });

  const cars = await prisma.car.findMany({
    where: { companyId, status: 'AVAILABLE' },
    select: CAR_PUBLIC_SELECT,
    orderBy: [{ brand: 'asc' }, { model: 'asc' }],
  });

  if (startDate && endDate) {
    let range;
    try { range = validateDateRange(startDate, endDate); }
    catch (e) { return res.status(e.status).json({ error: e.error }); }

    const overlapping = await prisma.reservation.findMany({
      where: {
        companyId, status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          { startDate: { lte: range.start }, endDate: { gt: range.start } },
          { startDate: { lt: range.end }, endDate: { gte: range.end } },
          { startDate: { gte: range.start }, endDate: { lte: range.end } },
        ],
      },
      select: { carId: true },
    });
    const busyCarIds = new Set(overlapping.map((r) => r.carId));
    return res.json({ company, cars: cars.filter((c) => !busyCarIds.has(c.id)), filtered: true });
  }

  res.json({ company, cars, filtered: false });
}

async function getCar(req, res) {
  const { companyId, carId } = req.params;
  const car = await prisma.car.findFirst({ where: { id: carId, companyId }, select: CAR_PUBLIC_SELECT });
  if (!car) return res.status(404).json({ error: 'Car not found.' });
  const company = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true, name: true, phone: true } });
  res.json({ company, car });
}

async function createReservation(req, res) {
  const { companyId, carId, customerName, customerPhone, customerEmail, startDate, endDate, notes } = req.body;

  let range;
  try { range = validateDateRange(startDate, endDate, { rejectPast: true }); }
  catch (e) { return res.status(e.status).json({ error: e.error }); }

  const car = await prisma.car.findFirst({
    where: { id: carId, companyId },
    select: { id: true, brand: true, model: true, plateNumber: true, pricePerDay: true, status: true },
  });
  if (!car) return res.status(404).json({ error: 'Car not found.' });
  if (car.status !== 'AVAILABLE') return res.status(400).json({ error: 'Car is not available for booking.' });

  const available = await isCarAvailable(carId, startDate, endDate, null, companyId);
  if (!available) return res.status(400).json({ error: 'Car is not available for the selected dates (overlapping reservation).' });

  const totalPrice = Number(car.pricePerDay) * range.days;
  if (totalPrice <= 0) return res.status(400).json({ error: 'Invalid price calculation.' });

  const reservation = await prisma.reservation.create({
    data: {
      companyId, carId, customerName: customerName.trim(), customerPhone: customerPhone.trim(),
      customerEmail: customerEmail?.toLowerCase().trim() || null,
      startDate: range.start, endDate: range.end, totalPrice,
      status: 'PENDING', notes: notes?.trim() || null,
    },
    include: { car: true },
  });

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, name: true, email: true, phone: true },
  });
  sendBookingConfirmation({ reservation, car, company }).catch(() => {});
  sendNewBookingAlert({ reservation, car, company }).catch(() => {});
  res.status(201).json(reservation);
}

module.exports = { listCompanies, listCars, getCar, createReservation };
