const MAX_RENTAL_DAYS = 365;

/**
 * Parse and validate a date range. Throws an object { status, error } on failure.
 * @returns {{ start: Date, end: Date, days: number }}
 */
function validateDateRange(startDate, endDate, { maxDays = MAX_RENTAL_DAYS, rejectPast = false } = {}) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw { status: 400, error: 'Invalid date format.' };
  }
  if (start >= end) {
    throw { status: 400, error: 'End date must be after start date.' };
  }
  if (rejectPast) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      throw { status: 400, error: 'Start date cannot be in the past.' };
    }
  }

  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  if (days < 1 || days > maxDays) {
    throw { status: 400, error: `Rental must be between 1 and ${maxDays} days.` };
  }

  return { start, end, days };
}

module.exports = { validateDateRange, MAX_RENTAL_DAYS };
