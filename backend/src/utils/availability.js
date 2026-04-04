const { prisma } = require('../database');

/**
 * Check if a car has overlapping reservations for the given date range.
 * @param {string} carId
 * @param {string|Date} startDate
 * @param {string|Date} endDate
 * @param {string|null} excludeReservationId - exclude this reservation (for updates)
 * @param {string|null} companyId - optional company scope for extra safety
 * @returns {Promise<boolean>} true if available
 */
async function isCarAvailable(carId, startDate, endDate, excludeReservationId = null, companyId = null) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
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
  if (companyId) {
    where.companyId = companyId;
  }

  const count = await prisma.reservation.count({ where });
  return count === 0;
}

module.exports = { isCarAvailable };
