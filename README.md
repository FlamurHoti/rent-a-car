# Rent-a-Car Kosovo — SaaS Platform

A full-stack multi-tenant car rental management system built for the Kosovo market. Companies register, manage their fleet, and receive online bookings through a public marketplace.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [Security](#security)
- [Frontend](#frontend)
- [Deployment](#deployment)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)

---

## Overview

| Metric | Value |
|--------|-------|
| Backend files | 32 JS files, 1,295 lines |
| Frontend files | 27 JS files, 2,723 lines |
| API endpoints | 27 |
| React pages/components | 19 |
| Database models | 6 |
| Prisma indexes | 16 |

### What it does

- **Companies** register and manage cars, reservations, payments, and staff
- **Customers** browse the public marketplace, pick dates, compare companies, and book online
- **Multi-tenant** — every company sees only its own data, enforced at middleware + query level
- **Role-based** — OWNER has full access, STAFF has limited permissions

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 19.3 | JavaScript runtime |
| Express.js | 4.22 | REST API framework |
| Prisma ORM | 5.22 | Database ORM with type-safe queries |
| SQLite | — | Local development database |
| PostgreSQL | — | Production database (Neon) |
| JSON Web Token | 9.0 | Stateless authentication |
| bcryptjs | 2.4 | Password hashing (10 salt rounds) |
| express-validator | 7.3 | Input validation and sanitization |
| express-rate-limit | 7.5 | Brute-force and DDoS protection |
| helmet | latest | HTTP security headers |
| cors | 2.8 | Cross-Origin Resource Sharing |
| nodemailer | 8.0 | Email notifications (SMTP) |
| dotenv | 16.6 | Environment variable management |
| nodemon | 3.1 | Auto-restart in development |

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3 | UI component library |
| React Router | 6.30 | Client-side SPA routing |
| Axios | 1.14 | HTTP client with interceptors |
| Tailwind CSS | 3.4 | Utility-first CSS framework |
| PostCSS | 8.5 | CSS processing pipeline |
| Autoprefixer | 10.4 | Browser compatibility prefixes |

### Deployment

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| Render | Backend hosting | 750 hrs/month |
| Vercel | Frontend CDN hosting | 100GB bandwidth |
| Neon | PostgreSQL serverless | 0.5GB storage |

---

## Architecture

```
                    HTTPS                    HTTPS                  TCP/SSL
  +-----------+  ---------> +-----------+  ---------> +-----------+
  |  Vercel   |             |  Render   |             |   Neon    |
  |  (React)  | <---------- | (Express) | <---------- |(PostgreSQL|
  |  CDN/SPA  |  JSON API   |  Node.js  |   Prisma   | Serverless|
  +-----------+             +-----------+             +-----------+
       |                         |
  Static files             Rate limiting
  Tailwind CSS             JWT auth
  React Router             RBAC middleware
                           helmet headers
```

### Multi-tenant Data Isolation

```
HTTP Request
  |
  v
JWT Middleware ---- verifies token, loads user from DB
  |
  v
req.companyId = user.companyId  (from database, NOT from token)
  |
  v
Controller ---- WHERE companyId = req.companyId (every query)
  |
  v
Prisma ORM ---- parameterized queries (SQL injection proof)
```

Three layers of protection:
1. **Middleware** — `req.companyId` derived from authenticated user's DB record
2. **Controller** — every Prisma query filters by `companyId`
3. **Database** — composite indexes optimize `companyId` queries

---

## Project Structure

```
rent-a-car/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (6 models)
│   │   ├── seed.js                # Database seeder
│   │   └── dev.db                 # SQLite database (dev)
│   ├── src/
│   │   ├── app.js                 # Express app setup (helmet, cors, json, routes)
│   │   ├── server.js              # HTTP server entry point
│   │   ├── config/
│   │   │   └── index.js           # Environment config (port, JWT, URLs)
│   │   ├── constants/
│   │   │   └── index.js           # Frozen enums (status, fuel, roles)
│   │   ├── controllers/
│   │   │   ├── authController.js          # Register, login, me
│   │   │   ├── carController.js           # CRUD cars
│   │   │   ├── companyController.js       # Company profile
│   │   │   ├── dashboardController.js     # Stats, alerts, activity
│   │   │   ├── marketplaceController.js   # Public: companies, cars, booking
│   │   │   ├── paymentController.js       # Payments (OWNER only)
│   │   │   └── reservationController.js   # CRUD reservations
│   │   ├── database/
│   │   │   └── index.js           # Prisma client singleton
│   │   ├── middlewares/
│   │   │   ├── asyncHandler.js    # Wraps async routes (error forwarding)
│   │   │   ├── auth.js            # JWT verification + RBAC
│   │   │   ├── errorHandler.js    # Centralized error responses
│   │   │   ├── rateLimiter.js     # Global API rate limiter
│   │   │   ├── tenant.js          # Multi-tenant companyId injection
│   │   │   └── validateRequest.js # express-validator result checker
│   │   ├── routes/
│   │   │   ├── index.js           # Central route registration
│   │   │   ├── auth.js            # /api/auth/*
│   │   │   ├── cars.js            # /api/cars/*
│   │   │   ├── companies.js       # /api/companies/*
│   │   │   ├── dashboard.js       # /api/dashboard/*
│   │   │   ├── marketplace.js     # /api/public/*
│   │   │   ├── payments.js        # /api/payments/*
│   │   │   └── reservations.js    # /api/reservations/*
│   │   └── utils/
│   │       ├── activityLog.js     # Activity log helper
│   │       ├── availability.js    # Car availability check
│   │       ├── dateUtils.js       # Date range validation
│   │       ├── email.js           # Email notifications (HTML escaped)
│   │       ├── parseUtils.js      # Safe number parsing
│   │       └── serviceAlert.js    # Service due alerts
│   ├── .env.example               # Environment template
│   ├── package.json
│   └── render.yaml                # Render deployment config
│
├── frontend/
│   ├── public/
│   │   └── index.html             # SPA entry (viewport-fit=cover)
│   ├── src/
│   │   ├── App.js                 # Route definitions
│   │   ├── index.js               # React entry point
│   │   ├── index.css              # Tailwind + custom animations
│   │   ├── api/
│   │   │   ├── client.js          # Axios with JWT interceptor
│   │   │   └── publicClient.js    # Axios without auth (marketplace)
│   │   ├── components/
│   │   │   ├── EmptyState.js      # Reusable empty state
│   │   │   ├── Icons.js           # SVG icon library (25 icons)
│   │   │   ├── LoadingSpinner.js  # Reusable loading spinner
│   │   │   ├── layout/
│   │   │   │   ├── AdminLayout.js       # Admin: header + bottom nav
│   │   │   │   └── MarketplaceLayout.js # Public: header + footer
│   │   │   └── ui/
│   │   │       ├── Button.js      # 5 variants, 3 sizes
│   │   │       └── Card.js        # With hover animation
│   │   ├── constants/
│   │   │   └── index.js           # Labels, colors, options
│   │   ├── context/
│   │   │   └── AuthContext.js     # Auth state (login, logout, register)
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── CarForm.js     # Add/edit car with image preview
│   │   │   │   ├── Cars.js        # Car list with search/filter
│   │   │   │   ├── Company.js     # Company profile editor
│   │   │   │   ├── Dashboard.js   # Stats, alerts, activity log
│   │   │   │   ├── Payments.js    # Payment management (OWNER)
│   │   │   │   ├── ReservationForm.js  # Add/edit reservation
│   │   │   │   └── Reservations.js     # Reservation list
│   │   │   ├── auth/
│   │   │   │   ├── Login.js       # Login with floating orbs
│   │   │   │   └── Register.js    # Company registration
│   │   │   └── marketplace/
│   │   │       ├── BookCar.js     # Booking form + success screen
│   │   │       ├── CompanyCatalog.js  # Car grid with filters
│   │   │       └── Marketplace.js     # Hero + company listing
│   │   └── utils/
│   │       ├── contractPdf.js     # PDF contract generator
│   │       └── format.js          # Date/currency formatting
│   ├── tailwind.config.js         # Colors, animations, shadows
│   ├── vercel.json                # SPA rewrite rules
│   └── package.json
│
└── README.md
```

---

## Database Schema

### Models and Relations

```
Company (1) ──── (*) User
   |                  |
   |                  └──── (*) ActivityLog
   |
   ├──── (*) Car ──── (*) Reservation ──── (*) Payment
   |
   ├──── (*) Reservation
   |
   ├──── (*) Payment
   |
   └──── (*) ActivityLog
```

### Models

| Model | Fields | Key Constraints |
|-------|--------|----------------|
| **Company** | id, name, email, phone, address, businessNumber, subscriptionPlan, subscriptionExpiry | `email` UNIQUE |
| **User** | id, companyId, name, email, password, role | `(companyId, email)` UNIQUE |
| **Car** | id, companyId, brand, model, year, plateNumber, imageUrl, fuelType, transmission, pricePerDay, status, currentKm, serviceDueKm | `(companyId, plateNumber)` UNIQUE |
| **Reservation** | id, companyId, carId, customerName, customerPhone, customerEmail, startDate, endDate, totalPrice, status, notes | Composite index on dates |
| **Payment** | id, reservationId, companyId, amount, method, status, paidAt | Index on reservationId |
| **ActivityLog** | id, companyId, userId, action, entityType, entityId, details | Composite index (companyId, createdAt) |

### Cascade Rules

| Relation | onDelete | Reason |
|----------|----------|--------|
| Company → User | CASCADE | Delete company = delete all users |
| Company → Car | CASCADE | Delete company = delete all cars |
| Company → Reservation | CASCADE | Delete company = delete all reservations |
| Car → Reservation | RESTRICT | Cannot delete car with active reservations |
| Reservation → Payment | CASCADE | Delete reservation = delete its payments |
| User → ActivityLog | CASCADE | Delete user = delete their logs |

### Indexes (16 total)

Optimized for multi-tenant queries, availability checks, and date range filtering.

---

## API Endpoints

### Authentication (3)

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/auth/register` | No | Register company + owner |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Current user info |

### Cars (5)

| Method | URL | Auth | Role | Description |
|--------|-----|------|------|-------------|
| GET | `/api/cars` | JWT | Any | List company cars |
| GET | `/api/cars/:id` | JWT | Any | Get car by ID |
| POST | `/api/cars` | JWT | Any | Create car |
| PATCH | `/api/cars/:id` | JWT | Any | Update car |
| DELETE | `/api/cars/:id` | JWT | OWNER | Delete car |

### Reservations (6)

| Method | URL | Auth | Role | Description |
|--------|-----|------|------|-------------|
| GET | `/api/reservations` | JWT | Any | List reservations |
| GET | `/api/reservations/:id` | JWT | Any | Get reservation |
| POST | `/api/reservations` | JWT | Any | Create reservation |
| PATCH | `/api/reservations/:id` | JWT | Any | Update reservation |
| DELETE | `/api/reservations/:id` | JWT | OWNER | Delete reservation |
| GET | `/api/reservations/availability` | No | — | Check car availability |

### Payments (4)

| Method | URL | Auth | Role | Description |
|--------|-----|------|------|-------------|
| GET | `/api/payments` | JWT | Any | List payments |
| GET | `/api/payments/:id` | JWT | Any | Get payment |
| POST | `/api/payments` | JWT | OWNER | Create payment |
| PATCH | `/api/payments/:id` | JWT | OWNER | Update payment status |

### Company (2)

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/companies/me` | JWT | Get company profile |
| PATCH | `/api/companies/me` | JWT | Update company profile |

### Dashboard (3)

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/dashboard/stats` | JWT | Cars, revenue, reservations |
| GET | `/api/dashboard/service-alerts` | JWT | Cars due for service |
| GET | `/api/dashboard/activity` | JWT | Recent activity log |

### Public Marketplace (4)

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/public/companies` | No | List companies with available cars |
| GET | `/api/public/companies/:id/cars` | No | List available cars (date filtering) |
| GET | `/api/public/companies/:id/cars/:carId` | No | Get single car |
| POST | `/api/public/reservations` | No | Create booking (rate limited) |

---

## Authentication & Authorization

### JWT Flow

```
Login (email + password)
  → bcrypt.compare (10 rounds)
  → jwt.sign({ userId, companyId, role }, secret, { expiresIn: '7d' })
  → Token returned to client

Every request:
  → Authorization: Bearer <token>
  → jwt.verify(token, secret)
  → prisma.user.findUnique(decoded.userId) — verifies user still exists in DB
  → req.user = user (from DB, not token)
  → req.companyId = user.companyId (from DB, not token)
```

### RBAC

| Action | OWNER | STAFF |
|--------|-------|-------|
| View dashboard, cars, reservations | Yes | Yes |
| Create cars, reservations | Yes | Yes |
| Update cars, reservations | Yes | Yes |
| Delete cars, reservations | Yes | **No** |
| Create/update payments | Yes | **No** |

### Password Policy

- Minimum 8 characters
- Must contain uppercase, lowercase, and a number
- Hashed with bcryptjs (10 salt rounds)

---

## Security

| Protection | Implementation |
|-----------|---------------|
| SQL Injection | Prisma ORM — 100% parameterized queries |
| XSS | React auto-escaping + `esc()` in email templates |
| CSRF | JWT in Authorization header (not cookies) |
| Brute force | Rate limiting: 60/min global, 20/15min auth, 10/hr booking |
| DDoS | express-rate-limit on all `/api/*` routes |
| Clickjacking | helmet `X-Frame-Options: DENY` |
| MIME sniffing | helmet `X-Content-Type-Options: nosniff` |
| Mass assignment | Field whitelist in carController |
| CORS | Single allowed origin, `credentials: true` |
| Input validation | express-validator on all routes |
| JSON body limit | `express.json({ limit: '1mb' })` |

### Payment State Transitions

```
PENDING   → COMPLETED (OWNER only), FAILED, CANCELLED
COMPLETED → REFUNDED (OWNER only)
FAILED    → PENDING
REFUNDED  → (no transitions)
```

---

## Frontend

### Animations (16 Tailwind keyframes)

fade-in, fade-in-up, fade-in-down, slide-in-left, slide-in-right, slide-down, scale-in, bounce-in, pop, count-up, expand-width, wiggle, float, glow-pulse, pulse-soft, shimmer

### Responsive Design

- Mobile bottom navigation bar (admin panel)
- Hamburger menu for mobile header
- `safe-area-inset-bottom` for iOS devices
- Grid: 1 col mobile → 2 col tablet → 3 col desktop

### useEffect Cleanup

Every API call uses `AbortController` to prevent memory leaks on unmount.

---

## Deployment

### Render (Backend)

- Build: `npm install && prisma generate && prisma db push`
- Start: `node src/server.js`

### Vercel (Frontend)

- Framework: Create React App
- Rewrites: `/(.*) → /index.html` (SPA routing)

### Neon (Database)

- PostgreSQL serverless with connection pooling

> **Note:** Change `provider = "sqlite"` to `provider = "postgresql"` in schema.prisma before deploying.

---

## Getting Started

```bash
# Clone
git clone https://github.com/FlamurHoti/rent-a-car.git
cd rent-a-car

# Backend
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm start
```

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Marketplace |
| http://localhost:3000/login | Admin login |
| http://localhost:5000 | Backend API |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | `file:./dev.db` (dev) or `postgresql://...` (prod) | Yes |
| `JWT_SECRET` | Min 32 character random string | Yes |
| `JWT_EXPIRES_IN` | Token lifetime (default: `7d`) | No |
| `PORT` | Server port (default: `5000`) | No |
| `NODE_ENV` | `development` or `production` | No |
| `FRONTEND_URL` | CORS origin (default: `http://localhost:3000`) | Yes (prod) |
| `SMTP_HOST` | SMTP server for emails | No |
| `SMTP_PORT` | SMTP port (default: `587`) | No |
| `SMTP_USER` | SMTP username | No |
| `SMTP_PASS` | SMTP password | No |
| `SMTP_FROM` | Sender email address | No |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend URL (default: `http://localhost:5000/api`) |

---

## License

Private project — Flamur Hoti, Kosovo.
