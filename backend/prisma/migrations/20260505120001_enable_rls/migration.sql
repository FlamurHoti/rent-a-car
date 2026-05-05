-- Layer 3: PostgreSQL Row Level Security
-- Idempotent: safe to re-run (uses DROP POLICY IF EXISTS before CREATE)

-- ── cars ──────────────────────────────────────────────────────────────────────
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON cars;
CREATE POLICY tenant_isolation ON cars
  USING (
    current_setting('app.current_company_id', true) IS NULL
    OR current_setting('app.current_company_id', true) = ''
    OR company_id = current_setting('app.current_company_id', true)
  );

-- ── reservations ──────────────────────────────────────────────────────────────
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON reservations;
CREATE POLICY tenant_isolation ON reservations
  USING (
    current_setting('app.current_company_id', true) IS NULL
    OR current_setting('app.current_company_id', true) = ''
    OR company_id = current_setting('app.current_company_id', true)
  );

-- ── payments ──────────────────────────────────────────────────────────────────
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
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON users;
CREATE POLICY tenant_isolation ON users
  USING (
    current_setting('app.current_company_id', true) IS NULL
    OR current_setting('app.current_company_id', true) = ''
    OR company_id = current_setting('app.current_company_id', true)
  );
