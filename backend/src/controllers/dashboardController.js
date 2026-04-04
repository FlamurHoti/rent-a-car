const { prisma } = require('../database');
const { safeParseInt } = require('../utils/parseUtils');

async function getStats(req, res) {
  const companyId = req.companyId;
  const start = startOfMonth();
  const end = endOfMonth();

  const [totalCars, activeCars, reservationsToday, reservationsThisMonth, revenueResult] =
    await Promise.all([
      prisma.car.count({ where: { companyId } }),
      prisma.car.count({ where: { companyId, status: 'AVAILABLE' } }),
      prisma.reservation.count({ where: { companyId, status: { in: ['PENDING', 'CONFIRMED'] }, startDate: { lte: new Date() }, endDate: { gte: new Date() } } }),
      prisma.reservation.count({ where: { companyId, status: { in: ['CONFIRMED', 'COMPLETED'] }, startDate: { gte: start }, endDate: { lte: end } } }),
      prisma.reservation.aggregate({ where: { companyId, status: 'COMPLETED', startDate: { gte: start }, endDate: { lte: end } }, _sum: { totalPrice: true } }),
    ]);

  res.json({ totalCars, activeCars, reservationsToday, monthlyRevenue: revenueResult._sum.totalPrice ?? 0, reservationsThisMonth });
}

async function getServiceAlerts(req, res) {
  const cars = await prisma.car.findMany({
    where: {
      companyId: req.companyId,
      status: { not: 'MAINTENANCE' },
      serviceDueKm: { not: null },
    },
    select: { id: true, brand: true, model: true, plateNumber: true, currentKm: true, serviceDueKm: true },
  });
  const alerts = cars
    .filter((c) => c.currentKm >= c.serviceDueKm)
    .map((c) => ({ ...c, dueForService: true, kmOverdue: Math.max(0, c.currentKm - c.serviceDueKm) }));
  res.json(alerts);
}

async function getActivity(req, res) {
  const raw = safeParseInt(req.query.limit);
  const limit = (raw !== null && raw >= 1) ? Math.min(raw, 100) : 50;
  const logs = await prisma.activityLog.findMany({
    where: { companyId: req.companyId },
    select: {
      id: true, action: true, entityType: true, entityId: true, details: true, createdAt: true,
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' }, take: limit,
  });
  res.json(logs);
}

function startOfMonth() { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d; }
function endOfMonth() { const d = new Date(); d.setMonth(d.getMonth() + 1, 0); d.setHours(23, 59, 59, 999); return d; }

module.exports = { getStats, getServiceAlerts, getActivity };
