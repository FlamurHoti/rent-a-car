const { prisma } = require('../database');

/**
 * Log an action for dashboard activity feed. Fire-and-forget.
 */
async function logActivity({ userId, companyId, action, entityType, entityId, details }) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        companyId,
        action,
        entityType,
        entityId: entityId || null,
        details: details != null ? (typeof details === 'string' ? details : JSON.stringify(details)) : null,
      },
    });
  } catch (err) {
    console.error('Activity log error:', err);
  }
}

module.exports = { logActivity };
