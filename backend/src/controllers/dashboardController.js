const { isDueForService } = require('../utils/serviceAlert');
const { prisma } = require('../database');

/**
 * GET /api/dashboard/stats - summary for current company
 */
async function getStats(req, res, next) {
  try {
    const companyId = req.companyId;
    const start = startOfMonth();
    const end = endOfMonth();
    const [totalCars, activeCars, reservationsToday, reservationsThisMonth, revenueResult] =
      await Promise.all([
        prisma.car.count({ where: { companyId } }),
        prisma.car.count({ where: { companyId, status: 'AVAILABLE' } }),
        prisma.reservation.count({
          where: {
            companyId,
            status: { in: ['PENDING', 'CONFIRMED'] },
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        }),
        prisma.reservation.count({
          where: {
            companyId,
            status: { in: ['CONFIRMED', 'COMPLETED'] },
            startDate: { gte: start },
            endDate: { lte: end },
          },
        }),
        prisma.reservation.aggregate({
          where: {
            companyId,
            status: 'COMPLETED',
            startDate: { gte: start },
            endDate: { lte: end },
          },
          _sum: { totalPrice: true },
        }),
      ]);

    const monthlyRevenue = Number(revenueResult._sum.totalPrice || 0);

    res.json({
      totalCars,
      activeCars,
      reservationsToday,
      monthlyRevenue,
      reservationsThisMonth,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/dashboard/service-alerts - cars due for service
 */
async function getServiceAlerts(req, res, next) {
  try {
    const cars = await prisma.car.findMany({
      where: { companyId: req.companyId, status: { not: 'MAINTENANCE' } },
    });
    const alerts = cars
      .filter((c) => isDueForService(c.currentKm, c.serviceDueKm))
      .map((c) => ({
        ...c,
        dueForService: true,
        kmOverdue: c.serviceDueKm ? c.currentKm - c.serviceDueKm : 0,
      }));
    res.json(alerts);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/dashboard/activity - recent activity log
 */
async function getActivity(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const logs = await prisma.activityLog.findMany({
      where: { companyId: req.companyId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    res.json(logs);
  } catch (err) {
    next(err);
  }
}

function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfMonth() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
}

module.exports = { getStats, getServiceAlerts, getActivity };
