-- =============================================================================
-- LAYER 3 — PostgreSQL Row Level Security
--
-- Run this migration ONCE against your Neon database after deploying the app:
--   psql $DATABASE_URL -f prisma/migrations/manual/001_enable_rls.sql
--
-- What this does:
--   1. Enables RLS on all 5 tenant-owned tables.
--   2. FORCE ROW LEVEL SECURITY ensures the table owner (the app DB user)
--      is also subject to the policies — without FORCE, superusers bypass RLS.
--   3. Each policy allows a query through ONLY if the row's company_id matches
--      the session variable set by verifyJWT middleware (Layer 3 in auth.js).
--   4. If the session variable is not set (public/marketplace routes), the
--      policy falls back to allowing the query — the app-level WHERE clause
--      and Prisma extension (Layer 2) still provide correct filtering.
--
-- To activate Layer 3 in the app after running this:
--   Add  ENABLE_RLS=true  to your Render environment variables.
-- =============================================================================

-- ── cars ─────────────────────────────────────────────────────────────────────
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON cars;
CREATE POLICY tenant_isolation ON cars
  USING (
    -- No session var set (public route) → allow; app code filters by companyId
    current_setting('app.current_company_id', true) IS NULL
    OR current_setting('app.current_company_id', true) = ''
    -- Session var set (authenticated route) → must match
    OR company_id = current_setting('app.current_company_id', true)
  );

-- ── reservations ─────────────────────────────────────────────────────────────
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON reservations;
CREATE POLICY tenant_isolation ON reservations
  USING (
    current_setting('app.current_company_id', true) IS NULL
    OR current_setting('app.current_company_id', true) = ''
    OR company_id = current_setting('app.current_company_id', true)
  );

-- ── payments ─────────────────────────────────────────────────────────────────
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON payments;
CREATE POLICY tenant_isolation ON payments
  USING (
    current_setting('app.current_company_id', true) IS NULL
    OR current_setting('app.current_company_id', true) = ''
    OR company_id = current_setting('app.current_company_id', true)
  );

-- ── activity_logs ─────────────────────────────────────────────────────────────
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON activity_logs;
CREATE POLICY tenant_isolation ON activity_logs
  USING (
    current_setting('app.current_company_id', true) IS NULL
    OR current_setting('app.current_company_id', true) = ''
    OR company_id = current_setting('app.current_company_id', true)
  );

-- ── users ─────────────────────────────────────────────────────────────────────
-- Note: users table also needs RLS so Company A cannot enumerate Company B users.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON users;
CREATE POLICY tenant_isolation ON users
  USING (
    current_setting('app.current_company_id', true) IS NULL
    OR current_setting('app.current_company_id', true) = ''
    OR company_id = current_setting('app.current_company_id', true)
  );

-- ── Verify (run SELECT to confirm all tables have RLS enabled) ────────────────
SELECT
  tablename,
  rowsecurity AS rls_enabled,
  forcerowsecurity AS rls_forced
FROM pg_tables
WHERE tablename IN ('cars', 'reservations', 'payments', 'activity_logs', 'users')
ORDER BY tablename;
