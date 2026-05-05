/**
 * LAYER 1 — AsyncLocalStorage Tenant Context
 *
 * Stores { companyId, userId, role } in an async-continuation-local variable.
 * Any code running downstream of als.run() — including all Promises and
 * callbacks — inherits the same store without passing it through function args.
 *
 * This means even if a developer forgets to pass companyId to a utility function,
 * the function can call getTenantContextOrNull() and still get the right company.
 */

const { AsyncLocalStorage } = require('node:async_hooks');

const als = new AsyncLocalStorage();

// Private symbol — cannot be forged from outside this module
const BYPASS = Symbol('bypass_tenant_scope');

/**
 * Runs fn inside an ALS context bound to the given tenant.
 * Called once per request by verifyJWT middleware.
 */
function runWithTenant(companyId, userId, role, fn) {
  return als.run({ companyId, userId, role }, fn);
}

/**
 * Returns the current tenant context or throws.
 * Use this in code that MUST run inside an authenticated request.
 * A thrown error here means a missing verifyJWT in the route — a programming bug.
 */
function getTenantContext() {
  const ctx = als.getStore();
  if (!ctx) {
    throw new Error(
      '[TenantContext] No active tenant context. ' +
      'Ensure the verifyJWT middleware ran before this call.'
    );
  }
  return ctx;
}

/**
 * Returns the current tenant context or null.
 * Safe to call from any code path (public routes return null).
 */
function getTenantContextOrNull() {
  return als.getStore() ?? null;
}

/**
 * Escape hatch for legitimate cross-tenant admin operations.
 * EVERY call is audit-logged to stdout (captured by your log aggregator).
 * Requires a descriptive reason string (enforced at runtime).
 *
 * Usage:
 *   const { withoutTenantScope } = require('../context/tenantContext');
 *   const allCars = await withoutTenantScope(
 *     () => prisma.car.findMany(),
 *     'admin-export: generate monthly billing report'
 *   );
 */
function withoutTenantScope(fn, reason) {
  if (typeof reason !== 'string' || reason.trim().length < 10) {
    throw new Error(
      '[TenantContext] withoutTenantScope() requires a descriptive reason string (min 10 chars). ' +
      'This requirement exists so every bypass is self-documenting in audit logs.'
    );
  }

  const ctx = als.getStore();
  // Capture call site for audit trail
  const stack = new Error().stack
    .split('\n')
    .slice(2, 5)
    .map(l => l.trim())
    .join(' | ');

  // Mandatory structured audit log — cannot be suppressed
  console.warn(
    JSON.stringify({
      event:     'TENANT_SCOPE_BYPASS',
      reason:    reason.trim(),
      userId:    ctx?.userId    ?? null,
      companyId: ctx?.companyId ?? null,
      caller:    stack,
      timestamp: new Date().toISOString(),
    })
  );

  return als.run({ ...ctx, [BYPASS]: true }, fn);
}

/** Returns true if the current call stack is inside a withoutTenantScope() block. */
function isBypassActive() {
  const ctx = als.getStore();
  return ctx?.[BYPASS] === true;
}

module.exports = {
  runWithTenant,
  getTenantContext,
  getTenantContextOrNull,
  withoutTenantScope,
  isBypassActive,
};