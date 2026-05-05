/**
 * LAYER 2 — Prisma Client with Tenant-Scope Extension
 *
 * Uses the Prisma $extends API (Prisma 5.x, not deprecated middleware) to
 * automatically inject companyId into every query against tenant-owned models.
 *
 * HOW IT WORKS:
 *   1. Every Prisma operation on a TENANT_MODEL goes through $allOperations hook.
 *   2. The hook reads the ALS tenant context (Layer 1).
 *   3. If a context is present: companyId is injected into WHERE (reads/writes)
 *      or into data.companyId (creates).
 *   4. If no context (public/marketplace routes): query passes through unchanged.
 *   5. If withoutTenantScope() is active: query passes through (bypass is audited).
 *
 * RESULT: A developer who forgets WHERE companyId = ... in a protected controller
 * still cannot leak cross-tenant data, because the extension adds it anyway.
 *
 * MODELS PROTECTED: Car, Reservation, Payment, ActivityLog, User
 * MODELS EXCLUDED:  Company (queried by id for login, registration, profile)
 */

const { PrismaClient } = require('@prisma/client');
const { getTenantContextOrNull, isBypassActive } = require('../context/tenantContext');

// Models that are owned by a single company — all queries must be scoped
const TENANT_MODELS = new Set([
  'car',
  'reservation',
  'payment',
  'activityLog',
  'user',
]);

// Operations that read rows — inject companyId into WHERE
const FILTER_OPS = new Set([
  'findMany',
  'findFirst',
  'findFirstOrThrow',
  'findUnique',
  'findUniqueOrThrow',
  'update',
  'updateMany',
  'delete',
  'deleteMany',
  'count',
  'aggregate',
  'groupBy',
]);

// Operations that create rows — inject companyId into data
const CREATE_OPS = new Set(['create', 'createMany']);

function applyWhereScope(args, companyId) {
  return { ...args, where: { ...(args.where ?? {}), companyId } };
}

function applyDataScope(args, companyId) {
  if (Array.isArray(args.data)) {
    return { ...args, data: args.data.map(row => ({ ...row, companyId })) };
  }
  return { ...args, data: { ...(args.data ?? {}), companyId } };
}

const _base = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

const prisma = _base.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        // Normalize "Car" → "car", "ActivityLog" → "activityLog", etc.
        const modelKey = model.charAt(0).toLowerCase() + model.slice(1);

        // Company table is excluded — it's looked up by id for auth / onboarding
        if (!TENANT_MODELS.has(modelKey)) return query(args);

        // withoutTenantScope() active → bypass with audit log already written
        if (isBypassActive()) return query(args);

        const ctx = getTenantContextOrNull();

        // No context → public/marketplace route, pass through unchanged
        // (marketplace controller already filters by companyId from URL params)
        if (!ctx) return query(args);

        const { companyId } = ctx;

        if (FILTER_OPS.has(operation)) {
          // For findUnique/update/delete: adds companyId as an AND condition so
          // Prisma generates: WHERE id = $1 AND company_id = $2.
          // If the record belongs to another company, Prisma returns null / throws P2025.
          args = applyWhereScope(args, companyId);

        } else if (CREATE_OPS.has(operation)) {
          args = applyDataScope(args, companyId);

        } else if (operation === 'upsert') {
          args = {
            ...args,
            where:  { ...(args.where  ?? {}), companyId },
            create: { ...(args.create ?? {}), companyId },
            // update clause intentionally left unmodified
          };
        }

        return query(args);
      },
    },
  },
});

/**
 * Raw, unscoped PrismaClient.
 * Use ONLY for seed scripts, migrations, and admin cross-tenant operations.
 * In application code, use withoutTenantScope() instead of importing this directly.
 */
const rawPrisma = _base;

module.exports = { prisma, rawPrisma };