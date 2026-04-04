const { prisma } = require('../database');
const { logActivity } = require('../utils/activityLog');
const { isCarAvailable } = require('../utils/availability');
const { validateDateRange } = require('../utils/dateUtils');

const CAR_SUMMARY = { select: { id: true, brand: true, model: true, plateNumber: true, pricePerDay: true } };

async function list(req, res) {
  const { status, carId, from, to } = req.query;
  const where = { companyId: req.companyId };
  if (status) where.status = status;
  if (carId) where.carId = carId;
  if (from) { const d = new Date(from); if (!isNaN(d.getTime())) where.endDate = { gte: d }; }
  if (to) { const d = new Date(to); if (!isNaN(d.getTime())) where.startDate = { lte: d }; }
  const reservations = await prisma.reservation.findMany({
    where,
    select: {
      id: true, carId: true, customerName: true, customerPhone: true,
      startDate: true, endDate: true, totalPrice: true, status: true, notes: true, createdAt: true,
      car: CAR_SUMMARY,
    },
    orderBy: { startDate: 'desc' },
  });
  res.json(reservations);
}

async function getById(req, res) {
  const reservation = await prisma.reservation.findFirst({
    where: { id: req.params.id, companyId: req.companyId },
    include: { car: true },
  });
  if (!reservation) return res.status(404).json({ error: 'Reservation not found.' });
  res.json(reservation);
}

async function create(req, res) {
  const { carId, customerName, customerPhone, startDate, endDate, notes } = req.body;

  let range;
  try { range = validateDateRange(startDate, endDate); }
  catch (e) { return res.status(e.status).json({ error: e.error }); }

  const car = await prisma.car.findFirst({
    where: { id: carId, companyId: req.companyId },
    select: { id: true, pricePerDay: true },
  });
  if (!car) return res.status(404).json({ error: 'Car not found.' });

  const available = await isCarAvailable(carId, startDate, endDate, null, req.companyId);
  if (!available) return res.status(400).json({ error: 'Car is not available for the selected dates (overlapping reservation).' });

  const totalPrice = Number(car.pricePerDay) * range.days;
  if (totalPrice <= 0) return res.status(400).json({ error: 'Invalid total price calculation.' });

  const reservation = await prisma.reservation.create({
    data: {
      carId, customerName: customerName.trim(), customerPhone: customerPhone.trim(),
      startDate: range.start, endDate: range.end, totalPrice,
      status: 'PENDING', notes: notes?.trim() || null, companyId: req.companyId,
    },
    include: { car: true },
  });
  await logActivity({ userId: req.user.id, companyId: req.companyId, action: 'reservation_created', entityType: 'reservation', entityId: reservation.id, details: { customerName, carId } });
  res.status(201).json(reservation);
}

async function update(req, res) {
  const existing = await prisma.reservation.findFirst({
    where: { id: req.params.id, companyId: req.companyId },
    select: { id: true, carId: true, startDate: true, endDate: true, car: { select: { pricePerDay: true } } },
  });
  if (!existing) return res.status(404).json({ error: 'Reservation not found.' });

  const { startDate, endDate, status, customerName, customerPhone, notes } = req.body;
  const newStartStr = startDate || existing.startDate.toISOString();
  const newEndStr = endDate || existing.endDate.toISOString();

  let range;
  try { range = validateDateRange(newStartStr, newEndStr); }
  catch (e) { return res.status(e.status).json({ error: e.error }); }

  if (startDate || endDate) {
    const available = await isCarAvailable(existing.carId, range.start, range.end, existing.id, req.companyId);
    if (!available) return res.status(400).json({ error: 'Car is not available for the selected dates.' });
  }

  const totalPrice = Number(existing.car.pricePerDay) * range.days;
  const reservation = await prisma.reservation.update({
    where: { id: req.params.id },
    data: {
      ...(startDate && { startDate: range.start }), ...(endDate && { endDate: range.end }),
      ...(status && { status }),
      ...(customerName !== undefined && { customerName: customerName.trim() }),
      ...(customerPhone !== undefined && { customerPhone: customerPhone.trim() }),
      ...(notes !== undefined && { notes: notes?.trim() || null }),
      totalPrice,
    },
    include: { car: true },
  });
  await logActivity({ userId: req.user.id, companyId: req.companyId, action: 'reservation_updated', entityType: 'reservation', entityId: reservation.id, details: { customerName: reservation.customerName } });
  res.json(reservation);
}

async function remove(req, res) {
  const existing = await prisma.reservation.findFirst({
    where: { id: req.params.id, companyId: req.companyId },
    select: { id: true, customerName: true },
  });
  if (!existing) return res.status(404).json({ error: 'Reservation not found.' });
  await prisma.reservation.delete({ where: { id: req.params.id } });
  await logActivity({ userId: req.user.id, companyId: req.companyId, action: 'reservation_deleted', entityType: 'reservation', entityId: req.params.id, details: { customerName: existing.customerName } });
  res.status(204).send();
}

async function checkAvailability(req, res) {
  const { carId, startDate, endDate, excludeReservationId } = req.query;
  if (!carId || !startDate || !endDate) return res.status(400).json({ error: 'carId, startDate, endDate required.' });
  try { validateDateRange(startDate, endDate); }
  catch (e) { return res.status(e.status).json({ error: e.error }); }
  const available = await isCarAvailable(carId, startDate, endDate, excludeReservationId || null);
  res.json({ available });
}

module.exports = { list, getById, create, update, remove, checkAvailability };
