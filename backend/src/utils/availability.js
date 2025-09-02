const { prisma } = require('../database');

/**
 * Check if a car has overlapping reservations for the given date range.
 * Exclude specific reservation id when updating.
 * Returns true if available (no overlap), false if conflict.
 */
async function isCarAvailable(carId, startDate, endDate, excludeReservationId = null) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (start >= end) return false;

  const where = {
    carId,
    status: { in: ['PENDING', 'CONFIRMED'] },
    OR: [
      { startDate: { lte: start }, endDate: { gt: start } },
      { startDate: { lt: end }, endDate: { gte: end } },
      { startDate: { gte: start }, endDate: { lte: end } },
    ],
  };
  if (excludeReservationId) {
    where.id = { not: excludeReservationId };
  }

  const overlapping = await prisma.reservation.findFirst({ where });
  return !overlapping;
}

module.exports = { isCarAvailable };
