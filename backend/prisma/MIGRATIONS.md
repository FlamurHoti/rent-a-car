# Database Migrations — Rent-a-Car SaaS

## ⚠️ Rregulli Numër 1 — KURRË MOS PREK `prisma db push`

```
NEVER run `prisma db push` against any environment except a throwaway
local database. It bypasses migration history and CAN silently drop
columns or reset data in production.
```

`db push` është hequr nga të gjitha scripts-et e projektit. Nëse sheh
dikë duke shtuar `db push` → refuzo PR-in.

---

## Si të ndryshosh schema-n (workflow normal)

```bash
# 1. Ndrysho prisma/schema.prisma sipas dëshirës

# 2. Gjenero migration file (kërkon DATABASE_URL → Postgres lokal ose Neon branch)
npm run db:migrate:dev -- --name <emri_pershkrues>
# Shembull: npm run db:migrate:dev -- --name add_driver_license_field

# 3. Inspekto migration.sql të gjeneruar
#    Kontrollo: a bën ALTER TABLE saktë? A ka DROP? A është idempotent?

# 4. Testo lokalisht
npm run dev   # verifiko app funksionon

# 5. Commit migration file + schema.prisma bashkërisht
git add prisma/migrations/ prisma/schema.prisma
git commit -m "db: <pershkrim i ndryshimit>"

# 6. Push → Render ekzekuton automatikisht `prisma migrate deploy`
```

---

## Si funksionon në production (Render)

`render.yaml` ka:
```yaml
startCommand: npx prisma migrate deploy && npm start
```

Kjo do të thotë:
1. Render ndërton aplikacionin (`npm run build` = `prisma generate`)
2. Kur starton, ekzekuton `prisma migrate deploy` → aplikon çdo migration të paplikuar
3. Pastaj starton serverin Node.js
4. Nëse migration dështon → serveri NUK starton (intentional safety net)

---

## Migrimi Fillestar — Historiku

Kjo DB u krijua me `prisma db push` (para adoptimit të migration workflow).
Dy migrimet e para janë "baseline" — SQL-i tashmë ekziston në DB.
Janë shënuar si `--applied` manualisht. **Mos i ri-apliko.**

| Migration | Statusi | Përmbajtja |
|-----------|---------|------------|
| `20260505120000_baseline` | ✅ Applied (resolve) | Schema e plotë — 6 tabela, 16 indexes, FK-të |
| `20260505120001_enable_rls` | ✅ Applied (resolve) | RLS policies — 5 tabela tenant |

---

## Testimi i migrimit para deploy (OBLIGATOR)

Neon ofron **branching falas** — krijo gjithmonë branch test para çdo ndryshimi:

```bash
# 1. Krijo branch në Neon Dashboard → "migration-test"
# 2. Merr connection string të branch-it

# 3. Apliko migration-in në branch
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# 4. Verifiko
DATABASE_URL="postgresql://..." npx prisma migrate status
# Duhet: "All migrations have been successfully applied."

# 5. Smoke test: lidhu me Prisma Studio
DATABASE_URL="postgresql://..." npx prisma studio

# 6. Po kalon → merge + redeploy production
# 7. Fshi branch-in (nuk kushton asgjë)
```

---

## Çfarë të bësh kur migration dështon në production

### Scenario 1 — Migration.sql ka gabim sintaksor
```bash
# 1. Shiko Render logs për errorin e saktë
# 2. Ndrysho migration.sql
# 3. Redeploy
```

### Scenario 2 — Migration u ekzekutua pjesërisht
```bash
# Shëno si rolled-back
DATABASE_URL=$PROD npx prisma migrate resolve --rolled-back 20260505xxxxxx_emri

# Kontrollo manualisht DB-në për gjendjen e tabelave
psql $DATABASE_URL -c "SELECT * FROM _prisma_migrations ORDER BY started_at;"
```

### Scenario 3 — Korrupsion i të dhënave (last resort)
1. Shko te Neon Dashboard → Branch-i `main` → "Restore" (Point-in-Time)
2. Zgjedh timestamp para migration-it që dështoi
3. **Kjo humb të gjitha të dhënat e krijuara pas atij momenti**
4. Verifiko backup-in para se ta bësh këtë

---

## RLS — Konsiderata Speciale

Politikat RLS janë brenda migration historiku (`20260505120001_enable_rls`).

Çdo migration e re që shton tabela tenant-owned **DUHET** të përfshijë:
```sql
-- Në fund të migration.sql
ALTER TABLE emri_tabeles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emri_tabeles FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON emri_tabeles;
CREATE POLICY tenant_isolation ON emri_tabeles
  USING (
    current_setting('app.current_company_id', true) IS NULL
    OR current_setting('app.current_company_id', true) = ''
    OR company_id = current_setting('app.current_company_id', true)
  );
```

---

## Komanda të shpeshta

```bash
# Gjenero migration të re
npm run db:migrate:dev -- --name <emri>

# Apliko migrations në production
npm run db:migrate:deploy

# Shiko statusin
npm run db:migrate:status

# Reset i plotë (VETËM lokal, KURRË production)
npm run db:migrate:reset

# Prisma Studio (GUI për DB)
npm run db:studio
```
