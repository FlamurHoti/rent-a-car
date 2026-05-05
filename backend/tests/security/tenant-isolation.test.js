/**
 * LAYER 4 — Tenant Isolation Security Test Suite
 *
 * Proves all three application layers work correctly by mounting the real
 * Express app (no mocks) against a real database (TEST_DATABASE_URL or
 * DATABASE_URL) and running actual HTTP requests with supertest.
 *
 * Setup:   Creates Company A and Company B, each with a car, reservation,
 *          and payment. All data is prefixed with a unique test run ID and
 *          fully cleaned up in afterAll().
 *
 * Run:
 *   npm test                         (all tests)
 *   npm run test:security            (only this file)
 *   TEST_DATABASE_URL=<url> npm test  (explicit test DB — recommended)
 */

'use strict';

const request = require('supertest');
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');

// Load env BEFORE importing config/app so DATABASE_URL override works
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}
process.env.NODE_ENV = 'test';

const app    = require('../../src/app');
const config = require('../../src/config');
const { rawPrisma } = require('../../src/database');
const { getTenantContext, getTenantContextOrNull, isBypassActive } = require('../../src/context/tenantContext');

// ── Unique prefix so parallel test runs don't collide ──────────────────────
const RUN_ID = `test_${Date.now()}`;
const emailA  = `${RUN_ID}_ownerA@security-test.invalid`;
const emailB  = `${RUN_ID}_ownerB@security-test.invalid`;
const coEmailA = `${RUN_ID}_compA@security-test.invalid`;
const coEmailB = `${RUN_ID}_compB@security-test.invalid`;

// Shared state populated in beforeAll
let companyA, companyB;
let userA, userB;
let tokenA, tokenB;
let carA, carB;
let reservationA, reservationB;
let paymentA, paymentB;

// ── Helpers ────────────────────────────────────────────────────────────────
function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

async function registerAndLogin(companyName, companyEmail, ownerName, ownerEmail, password) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      companyName,
      companyEmail,
      name: ownerName,
      email: ownerEmail,
      password,
    });
  if (res.status !== 201) {
    throw new Error(`Register failed (${res.status}): ${JSON.stringify(res.body)}`);
  }
  return res.body; // { token, user }
}

// ── Setup / Teardown ────────────────────────────────────────────────────────
beforeAll(async () => {
  const pw = 'SecurePass1';

  // Register Company A
  const regA = await registerAndLogin(
    `${RUN_ID} Company A`, coEmailA, 'Owner A', emailA, pw
  );
  tokenA    = regA.token;
  userA     = regA.user;
  companyA  = regA.user.company;

  // Register Company B
  const regB = await registerAndLogin(
    `${RUN_ID} Company B`, coEmailB, 'Owner B', emailB, pw
  );
  tokenB    = regB.token;
  userB     = regB.user;
  companyB  = regB.user.company;

  // Create a car for Company A
  const carARes = await request(app)
    .post('/api/cars')
    .set(authHeader(tokenA))
    .send({
      brand: 'Toyota', model: 'Yaris', year: 2022,
      plateNumber: `${RUN_ID.slice(-6)}-AA`,
      fuelType: 'PETROL', transmission: 'MANUAL', pricePerDay: 35,
    });
  if (carARes.status !== 201) throw new Error(`Create carA failed: ${JSON.stringify(carARes.body)}`);
  carA = carARes.body;

  // Create a car for Company B
  const carBRes = await request(app)
    .post('/api/cars')
    .set(authHeader(tokenB))
    .send({
      brand: 'VW', model: 'Golf', year: 2021,
      plateNumber: `${RUN_ID.slice(-6)}-BB`,
      fuelType: 'DIESEL', transmission: 'AUTOMATIC', pricePerDay: 50,
    });
  if (carBRes.status !== 201) throw new Error(`Create carB failed: ${JSON.stringify(carBRes.body)}`);
  carB = carBRes.body;

  // Create a reservation for Company A
  const tomorrow  = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];
  const nextWeek  = new Date(Date.now() + 7 * 86_400_000).toISOString().split('T')[0];
  const resvARes = await request(app)
    .post('/api/reservations')
    .set(authHeader(tokenA))
    .send({
      carId: carA.id,
      customerName: 'Customer A', customerPhone: '044111111',
      startDate: tomorrow, endDate: nextWeek,
    });
  if (resvARes.status !== 201) throw new Error(`Create resvA failed: ${JSON.stringify(resvARes.body)}`);
  reservationA = resvARes.body;

  // Create a reservation for Company B
  const resvBRes = await request(app)
    .post('/api/reservations')
    .set(authHeader(tokenB))
    .send({
      carId: carB.id,
      customerName: 'Customer B', customerPhone: '044222222',
      startDate: tomorrow, endDate: nextWeek,
    });
  if (resvBRes.status !== 201) throw new Error(`Create resvB failed: ${JSON.stringify(resvBRes.body)}`);
  reservationB = resvBRes.body;

  // Create a payment for Company A
  const payARes = await request(app)
    .post('/api/payments')
    .set(authHeader(tokenA))
    .send({ reservationId: reservationA.id, amount: 100, method: 'CASH' });
  if (payARes.status !== 201) throw new Error(`Create payA failed: ${JSON.stringify(payARes.body)}`);
  paymentA = payARes.body;

  // Create a payment for Company B
  const payBRes = await request(app)
    .post('/api/payments')
    .set(authHeader(tokenB))
    .send({ reservationId: reservationB.id, amount: 150, method: 'BANK' });
  if (payBRes.status !== 201) throw new Error(`Create payB failed: ${JSON.stringify(payBRes.body)}`);
  paymentB = payBRes.body;
}, 60_000);

afterAll(async () => {
  // Delete test companies — cascades to users, cars, reservations, payments, logs
  await rawPrisma.company.deleteMany({
    where: { email: { in: [coEmailA, coEmailB] } },
  });
  await rawPrisma.$disconnect();
}, 30_000);

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 1 — Cross-tenant READ attacks
// ═══════════════════════════════════════════════════════════════════════════════
describe('Cross-tenant READ', () => {
  test('Company A cannot read Company B car by ID', async () => {
    const res = await request(app)
      .get(`/api/cars/${carB.id}`)
      .set(authHeader(tokenA));
    expect(res.status).toBe(404);
  });

  test('Company A cannot read Company B reservation by ID', async () => {
    const res = await request(app)
      .get(`/api/reservations/${reservationB.id}`)
      .set(authHeader(tokenA));
    expect(res.status).toBe(404);
  });

  test('Company A cannot read Company B payment by ID', async () => {
    const res = await request(app)
      .get(`/api/payments/${paymentB.id}`)
      .set(authHeader(tokenA));
    expect(res.status).toBe(404);
  });

  test('Company B cannot read Company A car by ID', async () => {
    const res = await request(app)
      .get(`/api/cars/${carA.id}`)
      .set(authHeader(tokenB));
    expect(res.status).toBe(404);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 2 — List endpoints must not leak cross-tenant data
// ═══════════════════════════════════════════════════════════════════════════════
describe('List endpoints — no cross-tenant leakage', () => {
  test('GET /api/cars returns only Company A cars for tokenA', async () => {
    const res = await request(app)
      .get('/api/cars')
      .set(authHeader(tokenA));
    expect(res.status).toBe(200);
    const ids = res.body.map(c => c.id);
    expect(ids).toContain(carA.id);
    expect(ids).not.toContain(carB.id);
  });

  test('GET /api/reservations returns only Company A reservations for tokenA', async () => {
    const res = await request(app)
      .get('/api/reservations')
      .set(authHeader(tokenA));
    expect(res.status).toBe(200);
    const ids = res.body.map(r => r.id);
    expect(ids).toContain(reservationA.id);
    expect(ids).not.toContain(reservationB.id);
  });

  test('GET /api/payments returns only Company A payments for tokenA', async () => {
    const res = await request(app)
      .get('/api/payments')
      .set(authHeader(tokenA));
    expect(res.status).toBe(200);
    const ids = res.body.map(p => p.id);
    expect(ids).toContain(paymentA.id);
    expect(ids).not.toContain(paymentB.id);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 3 — Cross-tenant UPDATE / DELETE attacks
// ═══════════════════════════════════════════════════════════════════════════════
describe('Cross-tenant UPDATE / DELETE', () => {
  test('Company A cannot update Company B car', async () => {
    const res = await request(app)
      .patch(`/api/cars/${carB.id}`)
      .set(authHeader(tokenA))
      .send({ pricePerDay: 1 });
    expect(res.status).toBe(404);
    // Verify price unchanged
    const verify = await request(app)
      .get(`/api/cars/${carB.id}`)
      .set(authHeader(tokenB));
    expect(verify.body.pricePerDay).toBe(50);
  });

  test('Company A cannot delete Company B car', async () => {
    const res = await request(app)
      .delete(`/api/cars/${carB.id}`)
      .set(authHeader(tokenA));
    expect(res.status).toBe(404);
    // Verify car still exists
    const verify = await request(app)
      .get(`/api/cars/${carB.id}`)
      .set(authHeader(tokenB));
    expect(verify.status).toBe(200);
  });

  test('Company A cannot update Company B reservation', async () => {
    const res = await request(app)
      .patch(`/api/reservations/${reservationB.id}`)
      .set(authHeader(tokenA))
      .send({ status: 'CANCELLED' });
    expect(res.status).toBe(404);
    // Verify status unchanged
    const verify = await request(app)
      .get(`/api/reservations/${reservationB.id}`)
      .set(authHeader(tokenB));
    expect(verify.body.status).toBe('PENDING');
  });

  test('Company A cannot delete Company B reservation', async () => {
    const res = await request(app)
      .delete(`/api/reservations/${reservationB.id}`)
      .set(authHeader(tokenA));
    expect(res.status).toBe(404);
  });

  test('Company A cannot update Company B payment status', async () => {
    const res = await request(app)
      .patch(`/api/payments/${paymentB.id}`)
      .set(authHeader(tokenA))
      .send({ status: 'COMPLETED' });
    expect(res.status).toBe(404);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 4 — Cross-tenant CREATE attacks
// (Company A creates a reservation pointing to Company B's car)
// ═══════════════════════════════════════════════════════════════════════════════
describe('Cross-tenant CREATE', () => {
  test('Company A cannot create a reservation for Company B car', async () => {
    const nextMonth  = new Date(Date.now() + 30 * 86_400_000).toISOString().split('T')[0];
    const nextMonth2 = new Date(Date.now() + 37 * 86_400_000).toISOString().split('T')[0];
    const res = await request(app)
      .post('/api/reservations')
      .set(authHeader(tokenA))
      .send({
        carId: carB.id, // ← cross-tenant car ID
        customerName: 'Attacker', customerPhone: '044999999',
        startDate: nextMonth, endDate: nextMonth2,
      });
    // carB.id not found in Company A's scope → 404
    expect(res.status).toBe(404);
  });

  test('Company A cannot create a payment for Company B reservation', async () => {
    const res = await request(app)
      .post('/api/payments')
      .set(authHeader(tokenA))
      .send({ reservationId: reservationB.id, amount: 50, method: 'CASH' });
    expect(res.status).toBe(404);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 5 — JWT manipulation attacks
// ═══════════════════════════════════════════════════════════════════════════════
describe('JWT manipulation', () => {
  test('JWT with companyId swapped to Company A — still scoped to B (DB overrides JWT claim)', async () => {
    // userB's userId, but claims companyA.id in the JWT payload
    const forgedToken = jwt.sign(
      { userId: userB.id, companyId: companyA.id, role: 'OWNER' },
      config.jwt.secret,
      { expiresIn: '1h' }
    );
    const res = await request(app)
      .get(`/api/cars/${carA.id}`)
      .set(authHeader(forgedToken));
    // verifyJWT loads user from DB → gets companyB → carA not found in companyB
    expect(res.status).toBe(404);
  });

  test('JWT signed with a different secret is rejected', async () => {
    const badToken = jwt.sign(
      { userId: userA.id, companyId: companyA.id, role: 'OWNER' },
      'this-is-the-wrong-secret-entirely'
    );
    const res = await request(app)
      .get('/api/cars')
      .set(authHeader(badToken));
    expect(res.status).toBe(401);
  });

  test('Expired JWT is rejected', async () => {
    const expiredToken = jwt.sign(
      { userId: userA.id, companyId: companyA.id, role: 'OWNER' },
      config.jwt.secret,
      { expiresIn: '-1s' } // already expired
    );
    const res = await request(app)
      .get('/api/cars')
      .set(authHeader(expiredToken));
    expect(res.status).toBe(401);
  });

  test('Completely fabricated JWT (no matching user) is rejected', async () => {
    const ghostToken = jwt.sign(
      { userId: 'cnonexistentuser000000000', companyId: companyA.id, role: 'OWNER' },
      config.jwt.secret,
      { expiresIn: '1h' }
    );
    const res = await request(app)
      .get('/api/cars')
      .set(authHeader(ghostToken));
    expect(res.status).toBe(401);
  });

  test('Request with no Authorization header is rejected', async () => {
    const res = await request(app).get('/api/cars');
    expect(res.status).toBe(401);
  });

  test('Request with malformed Bearer token is rejected', async () => {
    const res = await request(app)
      .get('/api/cars')
      .set('Authorization', 'Bearer not.a.jwt');
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 6 — Injection attacks
// ═══════════════════════════════════════════════════════════════════════════════
describe('Injection resistance', () => {
  test("SQL injection in car :id path parameter does not leak data", async () => {
    // Prisma uses parameterized queries — this will simply return 404
    const maliciousId = "' OR '1'='1";
    const res = await request(app)
      .get(`/api/cars/${encodeURIComponent(maliciousId)}`)
      .set(authHeader(tokenA));
    expect(res.status).toBe(404);
  });

  test("SQL injection in ?search query only returns Company A's cars", async () => {
    const res = await request(app)
      .get("/api/cars?search=' OR 1=1 --")
      .set(authHeader(tokenA));
    expect(res.status).toBe(200);
    const ids = res.body.map(c => c.id);
    expect(ids).not.toContain(carB.id);
  });

  test("CRLF injection in search does not crash the server", async () => {
    const res = await request(app)
      .get("/api/cars?search=test%0d%0aInjected-Header%3A+bad")
      .set(authHeader(tokenA));
    expect([200, 400]).toContain(res.status);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 7 — RBAC (OWNER vs STAFF)
// ═══════════════════════════════════════════════════════════════════════════════
describe('Role-based access control', () => {
  let staffToken;

  beforeAll(async () => {
    // Create a STAFF user in Company A directly via DB (bypass register endpoint)
    const staffEmail = `${RUN_ID}_staff@security-test.invalid`;
    const hashed = await bcrypt.hash('SecurePass1', 10);
    await rawPrisma.user.create({
      data: {
        companyId: companyA.id,
        name: 'Staff User',
        email: staffEmail,
        password: hashed,
        role: 'STAFF',
      },
    });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: staffEmail, password: 'SecurePass1' });
    staffToken = loginRes.body.token;
  });

  test('STAFF cannot delete a car (OWNER only)', async () => {
    const res = await request(app)
      .delete(`/api/cars/${carA.id}`)
      .set(authHeader(staffToken));
    expect(res.status).toBe(403);
  });

  test('STAFF cannot delete a reservation (OWNER only)', async () => {
    const res = await request(app)
      .delete(`/api/reservations/${reservationA.id}`)
      .set(authHeader(staffToken));
    expect(res.status).toBe(403);
  });

  test('STAFF cannot create a payment (OWNER only)', async () => {
    const res = await request(app)
      .post('/api/payments')
      .set(authHeader(staffToken))
      .send({ reservationId: reservationA.id, amount: 50, method: 'CASH' });
    expect(res.status).toBe(403);
  });

  test('STAFF can list cars within their own company', async () => {
    const res = await request(app)
      .get('/api/cars')
      .set(authHeader(staffToken));
    expect(res.status).toBe(200);
    const ids = res.body.map(c => c.id);
    expect(ids).not.toContain(carB.id); // still isolated
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 8 — ALS context unit tests (no HTTP — tests Layer 1 directly)
// ═══════════════════════════════════════════════════════════════════════════════
describe('ALS tenant context', () => {
  test('getTenantContext() outside request scope throws', () => {
    // This call is NOT inside an als.run() → should throw
    expect(() => getTenantContext()).toThrow('[TenantContext]');
  });

  test('getTenantContextOrNull() outside request scope returns null', () => {
    expect(getTenantContextOrNull()).toBeNull();
  });

  test('isBypassActive() outside scope returns false', () => {
    expect(isBypassActive()).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 9 — Public marketplace endpoints (must work WITHOUT auth)
// ═══════════════════════════════════════════════════════════════════════════════
describe('Public marketplace endpoints (no auth required)', () => {
  test('GET /api/public/companies works without token', async () => {
    const res = await request(app).get('/api/public/companies');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /api/public/companies/:id/cars only returns that company's cars", async () => {
    const res = await request(app)
      .get(`/api/public/companies/${companyA.id}/cars`);
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      const ids = res.body.map(c => c.id);
      expect(ids).not.toContain(carB.id);
    }
  });
});
