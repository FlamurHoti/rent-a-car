const { prisma } = require('../database');
const { logActivity } = require('../utils/activityLog');
const { isDueForService } = require('../utils/serviceAlert');
const { safeParseFloat, safeParseInt } = require('../utils/parseUtils');

const CAR_LIST_SELECT = {
  id: true, brand: true, model: true, year: true, plateNumber: true,
  imageUrl: true, fuelType: true, transmission: true, pricePerDay: true,
  status: true, currentKm: true, serviceDueKm: true, createdAt: true,
};

async function list(req, res) {
  const { status, search } = req.query;
  const where = { companyId: req.companyId };
  if (status) where.status = status;
  if (search && search.trim()) {
    const term = search.trim().slice(0, 100);
    where.OR = [
      { brand: { contains: term } },
      { model: { contains: term } },
      { plateNumber: { contains: term } },
    ];
  }
  const cars = await prisma.car.findMany({ where, select: CAR_LIST_SELECT, orderBy: { createdAt: 'desc' } });
  res.json(cars.map((car) => ({ ...car, dueForService: isDueForService(car.currentKm, car.serviceDueKm) })));
}

async function getById(req, res) {
  const car = await prisma.car.findFirst({ where: { id: req.params.id, companyId: req.companyId } });
  if (!car) return res.status(404).json({ error: 'Car not found.' });
  res.json({ ...car, dueForService: isDueForService(car.currentKm, car.serviceDueKm) });
}

async function create(req, res) {
  const { brand, model, plateNumber } = req.body;
  if (!brand?.trim() || !model?.trim() || !plateNumber?.trim()) {
    return res.status(400).json({ error: 'Brand, model, and plate number are required.' });
  }
  const pricePerDay = safeParseFloat(req.body.pricePerDay);
  const year = safeParseInt(req.body.year);
  const currentKm = safeParseInt(req.body.currentKm || 0, 0);
  const serviceDueKm = req.body.serviceDueKm != null ? safeParseInt(req.body.serviceDueKm) : null;

  if (pricePerDay === null || pricePerDay < 0.01) return res.status(400).json({ error: 'Price per day must be at least 0.01.' });
  if (year === null || year < 1990) return res.status(400).json({ error: 'Invalid year.' });
  if (currentKm < 0) return res.status(400).json({ error: 'Current km cannot be negative.' });

  try {
    const car = await prisma.car.create({
      data: {
        companyId: req.companyId,
        brand: req.body.brand.trim(),
        model: req.body.model.trim(),
        plateNumber: req.body.plateNumber.trim(),
        fuelType: req.body.fuelType,
        transmission: req.body.transmission,
        imageUrl: req.body.imageUrl || null,
        pricePerDay, year, currentKm, serviceDueKm,
        status: req.body.status || 'AVAILABLE',
      },
    });
    await logActivity({ userId: req.user.id, companyId: req.companyId, action: 'car_added', entityType: 'car', entityId: car.id, details: { plateNumber: car.plateNumber } });
    res.status(201).json(car);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Plate number already exists in this company.' });
    throw err;
  }
}

async function update(req, res) {
  const existing = await prisma.car.findFirst({
    where: { id: req.params.id, companyId: req.companyId },
    select: { id: true },
  });
  if (!existing) return res.status(404).json({ error: 'Car not found.' });

  // Whitelist — only allowed fields
  const ALLOWED = ['brand', 'model', 'plateNumber', 'fuelType', 'transmission', 'pricePerDay', 'status', 'currentKm', 'serviceDueKm', 'imageUrl', 'year'];
  const body = {};
  for (const key of ALLOWED) {
    if (req.body[key] !== undefined) body[key] = req.body[key];
  }
  if (body.pricePerDay != null) {
    body.pricePerDay = safeParseFloat(body.pricePerDay);
    if (body.pricePerDay === null || body.pricePerDay < 0.01) return res.status(400).json({ error: 'Price per day must be at least 0.01.' });
  }
  if (body.year != null) { body.year = safeParseInt(body.year); if (body.year === null) return res.status(400).json({ error: 'Invalid year.' }); }
  if (body.currentKm != null) { body.currentKm = safeParseInt(body.currentKm); if (body.currentKm === null || body.currentKm < 0) return res.status(400).json({ error: 'Invalid current km.' }); }
  if (body.serviceDueKm !== undefined) {
    body.serviceDueKm = body.serviceDueKm === '' || body.serviceDueKm == null ? null : safeParseInt(body.serviceDueKm);
    if (body.serviceDueKm !== null && body.serviceDueKm < 0) return res.status(400).json({ error: 'Invalid service due km.' });
  }

  try {
    const car = await prisma.car.update({ where: { id: req.params.id }, data: body });
    await logActivity({ userId: req.user.id, companyId: req.companyId, action: 'car_updated', entityType: 'car', entityId: car.id, details: { plateNumber: car.plateNumber } });
    res.json(car);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Plate number already exists.' });
    throw err;
  }
}

async function remove(req, res) {
  const existing = await prisma.car.findFirst({
    where: { id: req.params.id, companyId: req.companyId },
    select: { id: true, plateNumber: true },
  });
  if (!existing) return res.status(404).json({ error: 'Car not found.' });
  await prisma.car.delete({ where: { id: req.params.id } });
  await logActivity({ userId: req.user.id, companyId: req.companyId, action: 'car_deleted', entityType: 'car', entityId: req.params.id, details: { plateNumber: existing.plateNumber } });
  res.status(204).send();
}

module.exports = { list, getById, create, update, remove };
