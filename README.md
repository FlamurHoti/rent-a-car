# Rent-a-Car SaaS – Kosovo MVP (Version 1)

Full-stack Rent-a-Car application for Kosovo: multi-tenant (companies), JWT auth, cars, reservations, dashboard, payments, and activity log.

## Tech stack

- **Backend:** Node.js, Express, PostgreSQL, Prisma ORM
- **Frontend:** React 18, React Router, Axios
- **Auth:** JWT, role-based (OWNER, STAFF)

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Quick start

### 1. Database

Create a PostgreSQL database:

```bash
createdb rentacar_db
```

Or in `psql`:

```sql
CREATE DATABASE rentacar_db;
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL, JWT_SECRET
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Backend runs at **http://localhost:5000**.

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs at **http://localhost:3000**.

### 4. Test login (after seed)

- **Owner:** `owner@autorent.com` / `password123`
- **Staff:** `staff@autorent.com` / `password123`

---

## Project structure

```
RENT/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # DB models
│   │   └── seed.js          # Sample data
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/      # auth, tenant
│   │   ├── routes/
│   │   ├── utils/           # activityLog, availability, serviceAlert
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/             # axios instance
│   │   ├── components/     # Layout
│   │   ├── context/         # AuthContext
│   │   ├── pages/
│   │   └── utils/           # format, contractPdf
│   └── package.json
└── README.md
```

---

## Module overview

### 1. Authentication

- **POST /api/auth/register** – Create company + owner user (body: companyName, companyEmail, name, email, password).
- **POST /api/auth/login** – Returns JWT and user (with company).
- **GET /api/auth/me** – Current user (Bearer token).

Roles: `OWNER`, `STAFF`. All company-scoped routes use `authenticate` and filter by `companyId`.

### 2. Companies (multi-tenant)

- **GET /api/companies/me** – Current company.
- **PATCH /api/companies/me** – Update company (name, email, phone, address).

Every resource (cars, reservations, payments) is scoped by `companyId`; no cross-tenant access.

### 3. Cars

- **GET /api/cars** – List (query: `status`, `search`). Response includes `dueForService` when `currentKm` is near `serviceDueKm`.
- **GET /api/cars/:id**
- **POST /api/cars** – Body: brand, model, year, plateNumber, fuelType, transmission, pricePerDay, status?, currentKm?, serviceDueKm?
- **PATCH /api/cars/:id**
- **DELETE /api/cars/:id**

Unique per company: `(companyId, plateNumber)`.

### 4. Reservations

- **GET /api/reservations/availability?carId=&startDate=&endDate=&excludeReservationId?** – Check overlap (no auth required if you want public check).
- **GET /api/reservations** – List (query: status, carId, from, to).
- **GET /api/reservations/:id**
- **POST /api/reservations** – Validates no overlapping PENDING/CONFIRMED for same car; computes totalPrice from pricePerDay × days.
- **PATCH /api/reservations/:id** – Re-checks availability if dates change.
- **DELETE /api/reservations/:id**

### 5. Dashboard

- **GET /api/dashboard/stats** – totalCars, activeCars, reservationsToday, monthlyRevenue, reservationsThisMonth.
- **GET /api/dashboard/service-alerts** – Cars due for service (currentKm >= serviceDueKm - 500).
- **GET /api/dashboard/activity?limit=50** – Recent activity log (action, user, time).

### 6. Payments (V1 basic)

- **GET /api/payments** – List (query: reservationId).
- **GET /api/payments/:id**
- **POST /api/payments** – Body: reservationId, amount, method (CASH|BANK|ONLINE).
- **PATCH /api/payments/:id** – Body: status. **Only OWNER** can set status to `COMPLETED` (and paidAt is set).

### 7. Activity log

Logged automatically from controllers: car add/update/delete, reservation create/update/delete. Stored in `activity_logs` (userId, companyId, action, entityType, entityId, details).

---

## Security notes

- **JWT:** Use a strong `JWT_SECRET` in production; keep it out of version control.
- **Passwords:** Stored hashed with bcrypt (salt rounds 10).
- **Multi-tenant:** All queries filter by `req.companyId` from the authenticated user; never trust client for company id.
- **RBAC:** Payment “mark completed” is restricted to OWNER in the controller.
- **CORS:** Backend allows `FRONTEND_URL` (e.g. http://localhost:3000); restrict in production.
- **HTTPS:** Use HTTPS in production; consider httpOnly cookies for tokens in a future version.

---

## UI/UX suggestions

- **Filters:** Cars and reservations already have status/search filters; you can add date range on reservations.
- **Notifications:** Add toasts for success/error (e.g. react-hot-toast).
- **Loading states:** Skeleton loaders for list pages.
- **Mobile:** Layout and tables are responsive; consider card layout for small screens.
- **Contracts:** Current “Print contract” opens a new window with printable HTML; user can “Print → Save as PDF”. For V2, consider a server-side PDF (e.g. Puppeteer or pdf-lib).

---

## Environment variables

**Backend (.env)**

| Variable       | Description                    |
|----------------|--------------------------------|
| DATABASE_URL   | PostgreSQL connection string   |
| JWT_SECRET     | Secret for signing JWTs        |
| JWT_EXPIRES_IN | e.g. 7d                        |
| PORT           | 5000                           |
| FRONTEND_URL   | http://localhost:3000 (CORS)   |

**Frontend**

- `REACT_APP_API_URL` – Optional; defaults to http://localhost:5000/api.

---

## Sample data (seed)

- Company: AutoRent Kosovo (autorent@example.com)
- Owner: owner@autorent.com / password123
- Staff: staff@autorent.com / password123
- 2 cars (Toyota Corolla, VW Golf), 1 confirmed reservation, 1 activity log entry

---

## Version 2 ideas

- Payments: full workflow, refunds, payment link
- Public catalog: list available cars by company (slug/domain) for customers
- Customer self-service: create reservation from public form, optional customer account
- Server-side PDF contracts
- Email notifications (booking confirmation, reminders)
- Reporting and exports
