#  Vaulta – Smart Locker Management

Vaulta is a premium, full-stack smart locker management system designed for university campuses. It helps students securely reserve and access short-term storage using digital keys (OTP and QR codes), while providing administrators with a powerful dashboard to monitor usage, track logs, and manage resources.

---

##  Key Features

###  For Students
*   **Live Availability:** Browse available lockers across various campus locations.
*   **Instant Booking:** Reserve lockers for 1, 2, or 4-hour sessions with a single click.
*   **Digital Access:** Securely unlock lockers using session-specific One-Time Passcodes (OTP) or QR codes.
*   **Active Management:** Monitor remaining time with live countdowns, extend sessions, or release early.

###  For Administrators
*   **System Overview:** View real-time analytics on locker utilization, available resources, and user activity.
*   **Audit Logs:** Track all system events comprehensively, with capabilities to export logs to CSV.
*   **Resource Control:** Quickly put specific lockers into maintenance mode or force-release overdue/abandoned bookings.

---

##  Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS v4, Framer Motion, React Router, Lucide Icons |
| **Backend** | Node.js, Express.js, JWT Authentication |
| **Database** | PostgreSQL (Neon DB) via Prisma ORM |

---

##  Getting Started (Local Development)

### 1. Install Dependencies
Run the following commands from the root directory to install all necessary packages for both frontend and backend:

```bash
cd d:\LockerSystem
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 2. Environment Configuration
Navigate to the backend directory and set up your environment variables:

```bash
cd backend
copy .env.example .env
```
Ensure you provide a valid `DATABASE_URL` (SQLite or PostgreSQL) and `JWT_SECRET` in your `.env` file.

### 3. Database Setup
Initialize the database schema and populate it with sample data:

```bash
npx prisma db push
npx prisma db seed
```

**Demo Accounts Created by Seed:**
*   **Student:** `student@university.edu` / `password123`
*   **Admin:** `admin@university.edu` / `admin123`

### 4. Run the Application
Start both the frontend and backend development servers concurrently from the root directory:

```bash
cd ..
npm run dev
```

*   **Frontend UI:** [http://localhost:5173](http://localhost:5173) 
*   **Backend API:** [http://localhost:3000](http://localhost:3000)

---

##  API Reference

### Authentication
*   `POST /api/auth/login` - Authenticate user and receive JWT.
*   `POST /api/auth/register` - Create a new user account.

### Lockers
*   `GET /api/lockers` - List all lockers (supports `?location=` and `?status=` filters).

### Bookings
*   `GET /api/bookings/active` - Fetch the current user's active booking.
*   `GET /api/bookings/history` - Fetch the current user's past bookings.
*   `POST /api/bookings` - Create a new reservation (`lockerCode`, `durationHours`).
*   `POST /api/bookings/:id/extend` - Extend an active booking.
*   `POST /api/bookings/:id/release` - End an active booking.

### Administration (Requires Admin Role)
*   `GET /api/admin/overview` - Aggregate system analytics.
*   `GET /api/admin/logs` - System audit logs.
*   `GET /api/admin/logs/export` - Export logs as CSV.
*   `POST /api/admin/lockers/maintenance` - Toggle locker maintenance status.
*   `POST /api/admin/bookings/force-release` - Administratively release a locker.

---

##  Future Roadmap

*   **Hardware Integration:** Connect the platform with physical IoT smart locks and RFID scanners.
*   **Monetization / Billing:** Integration with payment gateways for premium tiered access.
*   **Push Notifications:** Alerts for expiring sessions and system updates.
*   **Mobile Application:** Native iOS/Android apps built with React Native.

---
*Built as a student project. Designed for practicality, simplicity, and modern aesthetics.*
