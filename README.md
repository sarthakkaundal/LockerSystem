# Smart Campus Locker System

A smart locker management system for universities that helps day scholars securely store their belongings for short durations using digital access methods like OTP or QR.

## Problem

Day scholars often carry heavy bags, laptops, books, lunchboxes, and personal items throughout the day. In many universities, there are no secure short-term storage options near libraries, labs, or academic blocks. This creates inconvenience, theft risk, and poor locker utilization.

## Proposed Solution

The Smart Campus Locker System provides on-demand locker access through a digital platform. Students can view available lockers, reserve one, and access it using OTP or QR-based verification. The system is designed to improve security, convenience, and locker utilization on campus.

## Tech Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | React (Vite), Tailwind CSS v4, React Router     |
| Backend  | Node.js, Express                                |
| Database | SQLite (Prisma) — swap `DATABASE_URL` for PostgreSQL |

## Quick start (full stack)

1. **Install dependencies**

   ```bash
   cd d:\LockerSystem
   npm install
   npm install --prefix backend
   npm install --prefix frontend
   ```

2. **Database** — from `backend/`, create the schema and seed demo users:

   ```bash
   cd backend
   copy .env.example .env
   npx prisma db push
   npx prisma db seed
   ```

   Demo accounts:

   - Student: `student@university.edu` / `password123`
   - Admin: `admin@university.edu` / `admin123`

3. **Run API + UI together** (from repo root):

   ```bash
   npm run dev
   ```

   - Frontend: [http://localhost:5173](http://localhost:5173) (proxies `/api` to the backend)
   - API: [http://localhost:4000](http://localhost:4000)

4. **Flow to demo**

   - Sign in as the student → **Dashboard** (live stats) → **Lockers** → **Reserve** → **My Locker** (countdown, OTP, QR).
   - **Release** or **Extend** (new OTP; total span capped at 8 hours from original start).
   - Sign in as admin → **Admin** for analytics, logs, CSV export, maintenance toggle, force release.

### Verify the build locally

If automated tools cannot run scripts in your environment, run:

```bash
npm run lint --prefix frontend
npm run build --prefix frontend
```

### Production notes

- Set `JWT_SECRET` and a strong database URL in `backend/.env`.
- Point `DATABASE_URL` at PostgreSQL and run `npx prisma db push` (or migrations) there.
- Build the SPA (`npm run build --prefix frontend`) and serve `frontend/dist` behind your reverse proxy; set `VITE_API_URL` at build time to the public API origin if the UI is not same-origin (see `frontend/.env.example`).

## API overview

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/api/auth/login` | Email/password → JWT |
| GET | `/api/lockers` | List lockers (`?location=&status=`) |
| GET | `/api/stats` | Aggregate counts |
| GET | `/api/activity` | Recent log lines for the dashboard |
| GET | `/api/bookings/active` | Current user’s active booking (auth) |
| GET | `/api/bookings/history` | Completed bookings (auth) |
| POST | `/api/bookings` | Create booking: `lockerCode`, `durationHours` 1\|2\|4, optional `note` (auth) |
| POST | `/api/bookings/:id/release` | Release (auth) |
| POST | `/api/bookings/:id/extend` | Body `{ hours: 1 \| 2 }` (auth) |
| GET | `/api/admin/overview` | Analytics (admin) |
| GET | `/api/admin/logs` | Log rows (admin) |
| GET | `/api/admin/logs/export` | CSV (admin) |
| POST | `/api/admin/lockers/maintenance` | Body `{ code, maintenance: boolean }` (admin) |
| POST | `/api/admin/bookings/force-release` | Body `{ lockerCode }` (admin) |

Expired bookings are finalized on read (locker freed, log entry).

## Roadmap status

- **Phase 1 — UI prototype:** Initial screens and navigation (superseded by live data).
- **Phase 2 — Backend integration:** Express APIs, JWT auth, Prisma persistence, OTP on booking, frontend wired to `/api`.
- **Phase 3 — Access logic:** QR from booking payload, live countdown, release + extend, booking history and server-side logs.
- **Phase 4 — Polish:** Responsive nav, form validation and error states, admin analytics and CSV export, this documentation.

## Future scope

- RFID-based access  
- Smart lock hardware integration  
- Charging-enabled lockers  
- Real-time campus locker station monitoring  
