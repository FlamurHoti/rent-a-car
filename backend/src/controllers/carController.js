const { validationResult } = require('express-validator');
const { prisma } = require('../database');
const { logActivity } = require('../utils/activityLog');
const { isDueForService } = require('../utils/serviceAlert');

/**
 * GET /api/cars - list cars for current company (with optional filters)
 */
async function list(req, res, next) {
  try {
    const { status, search } = req.query;
    const where = { companyId: req.companyId };
    if (status) where.status = status;
    // SQLite does not support mode: 'insensitive'; use contains only (SQLite LIKE is case-insensitive for ASCII)
    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { brand: { contains: term } },
        { model: { contains: term } },
        { plateNumber: { contains: term } },
      ];
    }
    const cars = await prisma.car.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    const withServiceAlert = cars.map((car) => ({
      ...car,
      dueForService: isDueForService(car.currentKm, car.serviceDueKm),
    }));
    res.json(withServiceAlert);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/cars/:id
 */
async function getById(req, res, next) {
  try {
    const car = await prisma.car.findFirst({
      where: { id: req.params.id, companyId: req.companyId },
    });
    if (!car) {
      return res.status(404).json({ error: 'Car not found.' });
    }
    const dueForService = isDueForService(car.currentKm, car.serviceDueKm);
    res.json({ ...car, dueForService });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/cars
 */
async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { brand, model, plateNumber } = req.body;
    if (!brand?.trim() || !model?.trim() || !plateNumber?.trim()) {
      return res.status(400).json({ error: 'Brand, model, and plate number are required and cannot be empty.' });
    }
    const data = {
      ...req.body,
      companyId: req.companyId,
      pricePerDay: parseFloat(req.body.pricePerDay),
      year: parseInt(req.body.year, 10),
      currentKm: parseInt(req.body.currentKm || 0, 10),
      serviceDueKm: req.body.serviceDueKm != null ? parseInt(req.body.serviceDueKm, 10) : null,
    };
    const car = await prisma.car.create({ data });
    await logActivity({
      userId: req.user.id,
      companyId: req.companyId,
      action: 'car_added',
      entityType: 'car',
      entityId: car.id,
      details: { plateNumber: car.plateNumber },
    });
    res.status(201).json(car);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Plate number already exists in this company.' });
    }
    next(err);
  }
}

/**
 * PATCH /api/cars/:id
 */
async function update(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const existing = await prisma.car.findFirst({
      where: { id: req.params.id, companyId: req.companyId },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Car not found.' });
    }
    const body = { ...req.body };
    if (body.pricePerDay != null) body.pricePerDay = parseFloat(body.pricePerDay);
    if (body.year != null) body.year = parseInt(body.year, 10);
    if (body.currentKm != null) body.currentKm = parseInt(body.currentKm, 10);
    if (body.serviceDueKm !== undefined) {
      body.serviceDueKm = body.serviceDueKm === '' || body.serviceDueKm == null
        ? null
        : parseInt(body.serviceDueKm, 10);
    }
    const car = await prisma.car.update({
      where: { id: req.params.id },
      data: body,
    });
    await logActivity({
      userId: req.user.id,
      companyId: req.companyId,
      action: 'car_updated',
      entityType: 'car',
      entityId: car.id,
      details: { plateNumber: car.plateNumber },
    });
    res.json(car);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Plate number already exists.' });
    }
    next(err);
  }
}

/**
 * DELETE /api/cars/:id
 */
async function remove(req, res, next) {
  try {
    const existing = await prisma.car.findFirst({
      where: { id: req.params.id, companyId: req.companyId },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Car not found.' });
    }
    await prisma.car.delete({ where: { id: req.params.id } });
    await logActivity({
      userId: req.user.id,
      companyId: req.companyId,
      action: 'car_deleted',
      entityType: 'car',
      entityId: req.params.id,
      details: { plateNumber: existing.plateNumber },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove };
