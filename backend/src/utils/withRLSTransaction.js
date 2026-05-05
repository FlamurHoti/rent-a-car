/**
 * LAYER 3 — Hard-guarantee RLS helper
 *
 * withRLSTransaction() wraps operations in an interactive Prisma transaction
 * that first runs SET LOCAL app.current_company_id = $1 before any queries.
 *
 * SET LOCAL ensures the variable is scoped to this exact transaction and is
 * automatically cleared when the transaction commits or rolls back — making
 * it safe with all connection pool configurations including Neon serverless.
 *
 * Use this for the most sensitive operations (payments, deletion, exports)
 * where you want a hard database-level guarantee in addition to Layers 1 & 2.
 *
 * Usage:
 *   const result = await withRLSTransaction(req.companyId, async (tx) => {
 *     return tx.payment.findMany();   // RLS enforced at DB level
 *   });
 */

const { rawPrisma } = require('../database');

async function withRLSTransaction(companyId, fn, options = {}) {
  if (!companyId || typeof companyId !== 'string') {
    throw new Error('[withRLSTransaction] companyId is required');
  }

  return rawPrisma.$transaction(async (tx) => {
    // SET LOCAL: variable is active only within this transaction
    await tx.$executeRaw`SELECT set_config('app.current_company_id', ${companyId}, true)`;
    return fn(tx);
  }, options);
}

module.exports = { withRLSTransaction };