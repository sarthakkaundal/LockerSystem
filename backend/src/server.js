import "dotenv/config";
import { z } from "zod";
import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";
import {
  authMiddleware,
  comparePassword,
  requireAdmin,
  signToken,
} from "./lib/auth.js";
import {
  expireStaleBookings,
  generateAccessToken,
  generateOtp,
  mapLockerStatus,
} from "./lib/bookings.js";
import { BookingStatus, LockerStatus } from "@prisma/client";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: e.errors[0]?.message || "Invalid input." });
    }
    return res.status(400).json({ error: "Invalid input." });
  }
};

async function refreshStale() {
  await expireStaleBookings();
}

// Run expiry cleanup in the background every 1 minute
setInterval(() => {
  refreshStale().catch(err => console.error("Error in background expiry job:", err));
}, 60000);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

const loginAttempts = new Map();
const loginRateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  
  if (!loginAttempts.has(ip)) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return next();
  }
  
  const record = loginAttempts.get(ip);
  if (now - record.firstAttempt > windowMs) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return next();
  }
  
  if (record.count >= 5) {
    return res.status(429).json({ error: "Too many login attempts. Please try again later." });
  }
  
  record.count++;
  next();
};

const loginSchema = z.object({
  email: z.string().email("Invalid email address").transform(e => e.trim().toLowerCase()),
  password: z.string().min(1, "Password is required")
});

app.post("/api/auth/login", loginRateLimiter, validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  const token = signToken(user);
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      profilePhoto: user.profilePhoto,
      role: user.role,
      studentId: user.studentId,
    },
  });
});

const registerSchema = z.object({
  email: z.string().email("Invalid email address").transform(e => e.trim().toLowerCase()),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required").max(100),
});

import bcrypt from "bcryptjs";

app.post("/api/auth/register", loginRateLimiter, validateBody(registerSchema), async (req, res) => {
  const { email, password, name } = req.body;
  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (existingUser) {
    return res.status(409).json({ error: "User with this email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  
  const newUser = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: "STUDENT", // Default role
    },
  });

  const token = signToken(newUser);
  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      profilePhoto: newUser.profilePhoto,
      role: newUser.role,
      studentId: newUser.studentId,
    },
  });
});

app.get("/api/users/profile", authMiddleware(true), async (req, res) => {
  const userId = req.user.sub;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      profilePhoto: user.profilePhoto,
      role: user.role,
      studentId: user.studentId,
    },
  });
});

const profileSchema = z.object({
  name: z.string().max(100).optional().nullable(),
  profilePhoto: z.string().optional().nullable(),
});

app.put("/api/users/profile", authMiddleware(true), validateBody(profileSchema), async (req, res) => {
  const userId = req.user.sub;
  const { name, profilePhoto } = req.body;
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { name, profilePhoto },
  });
  res.json({
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      profilePhoto: updatedUser.profilePhoto,
      role: updatedUser.role,
      studentId: updatedUser.studentId,
    },
  });
});

app.get("/api/lockers", authMiddleware(false), async (req, res) => {
  await refreshStale();
  const location = req.query.location;
  const status = req.query.status;
  const lockers = await prisma.locker.findMany({
    orderBy: { code: "asc" },
  });
  const mapped = lockers.map((l) => ({
    id: l.code,
    code: l.code,
    location: l.location,
    status: mapLockerStatus(l.status),
    statusRaw: l.status,
  }));
  let filtered = mapped;
  if (location && location !== "all") {
    filtered = filtered.filter((l) => l.location === location);
  }
  if (status && status !== "all") {
    filtered = filtered.filter((l) => l.status === status);
  }
  res.json({ lockers: filtered });
});

app.get("/api/stats", async (_req, res) => {
  await refreshStale();
  const lockers = await prisma.locker.findMany();
  const total = lockers.length;
  const available = lockers.filter((l) => l.status === LockerStatus.AVAILABLE).length;
  const occupied = lockers.filter((l) => l.status === LockerStatus.OCCUPIED).length;
  const maintenance = lockers.filter((l) => l.status === LockerStatus.MAINTENANCE).length;
  res.json({ total, available, occupied, maintenance });
});

app.get("/api/activity", async (req, res) => {
  await refreshStale();
  const limit = Math.min(Number(req.query.limit) || 12, 50);
  const logs = await prisma.bookingLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  res.json({
    activity: logs.map((log) => ({
      id: log.id,
      locker: log.lockerCode,
      action: log.action,
      details: log.details,
      at: log.createdAt.toISOString(),
    })),
  });
});

app.get(
  "/api/bookings/active",
  authMiddleware(true),
  async (req, res) => {
    await refreshStale();
    const userId = req.user.sub;
    const booking = await prisma.booking.findFirst({
      where: { userId, status: BookingStatus.ACTIVE },
      include: { locker: true },
    });
    if (!booking) {
      return res.json({ booking: null });
    }
    res.json({
      booking: {
        id: booking.id,
        lockerCode: booking.locker.code,
        location: booking.locker.location,
        startsAt: booking.startsAt.toISOString(),
        endsAt: booking.endsAt.toISOString(),
        otpCode: booking.otpCode,
        qrPayload: `${booking.id}:${booking.accessToken}`,
        note: booking.note,
      },
    });
  }
);

app.get("/api/bookings/history", authMiddleware(true), async (req, res) => {
  await refreshStale();
  const userId = req.user.sub;
  const rows = await prisma.booking.findMany({
    where: { userId, status: BookingStatus.COMPLETED },
    include: { locker: true },
    orderBy: { endsAt: "desc" },
    take: 50,
  });
  res.json({
    history: rows.map((b) => ({
      id: b.id,
      lockerCode: b.locker.code,
      location: b.locker.location,
      startedAt: b.startsAt.toISOString(),
      endedAt: b.endsAt.toISOString(),
    })),
  });
});

const bookingSchema = z.object({
  lockerCode: z.string().min(1, "Locker code is required").transform(s => s.trim()),
  durationHours: z.number().refine(n => [1, 2, 4].includes(n), "Duration must be 1, 2, or 4 hours."),
  note: z.string().max(500, "Note too long").optional().nullable()
});

app.post("/api/bookings", authMiddleware(true), validateBody(bookingSchema), async (req, res) => {
  if (req.user.role !== "STUDENT" && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Only students can reserve lockers." });
  }
  await refreshStale();
  const userId = req.user.sub;
  const { lockerCode, durationHours, note } = req.body;

  const existing = await prisma.booking.findFirst({
    where: { userId, status: BookingStatus.ACTIVE },
  });
  if (existing) {
    return res.status(409).json({
      error: "You already have an active booking. Release it before reserving another.",
    });
  }

  const locker = await prisma.locker.findUnique({ where: { code: lockerCode } });
  if (!locker || locker.status !== LockerStatus.AVAILABLE) {
    return res.status(400).json({ error: "That locker is not available." });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const startsAt = new Date();
  const endsAt = new Date(startsAt.getTime() + durationHours * 60 * 60 * 1000);
  const otpCode = generateOtp();
  const accessToken = generateAccessToken();

  const booking = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.create({
      data: {
        userId,
        lockerId: locker.id,
        startsAt,
        endsAt,
        otpCode,
        accessToken,
        note: note || undefined,
      },
    });
    await tx.locker.update({
      where: { id: locker.id },
      data: { status: LockerStatus.OCCUPIED },
    });
    await tx.bookingLog.create({
      data: {
        bookingId: b.id,
        lockerCode: locker.code,
        actorEmail: user?.email ?? null,
        action: "BOOKED",
        details: `Reserved for ${durationHours}h`,
      },
    });
    return b;
  });

  res.status(201).json({
    booking: {
      id: booking.id,
      lockerCode: locker.code,
      location: locker.location,
      startsAt: booking.startsAt.toISOString(),
      endsAt: booking.endsAt.toISOString(),
      durationHours,
      otpCode: booking.otpCode,
      qrPayload: `${booking.id}:${booking.accessToken}`,
      note: booking.note,
    },
  });
});

app.post("/api/bookings/:id/release", authMiddleware(true), async (req, res) => {
  await refreshStale();
  const userId = req.user.sub;
  const id = req.params.id;
  const booking = await prisma.booking.findFirst({
    where: { id, userId, status: BookingStatus.ACTIVE },
    include: { locker: true, user: true },
  });
  if (!booking) {
    return res.status(404).json({ error: "No active booking found." });
  }

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.COMPLETED },
    }),
    prisma.locker.update({
      where: { id: booking.lockerId },
      data: { status: LockerStatus.AVAILABLE },
    }),
    prisma.bookingLog.create({
      data: {
        bookingId: booking.id,
        lockerCode: booking.locker.code,
        actorEmail: booking.user.email,
        action: "RELEASED",
        details: "Released by student",
      },
    }),
  ]);

  res.json({ ok: true });
});

const extendSchema = z.object({
  hours: z.number().refine(n => [1, 2].includes(n), "Extension must be 1 or 2 hours.")
});

app.post("/api/bookings/:id/extend", authMiddleware(true), validateBody(extendSchema), async (req, res) => {
  await refreshStale();
  const userId = req.user.sub;
  const id = req.params.id;
  const hours = req.body.hours;

  const booking = await prisma.booking.findFirst({
    where: { id, userId, status: BookingStatus.ACTIVE },
    include: { locker: true, user: true },
  });
  if (!booking) {
    return res.status(404).json({ error: "No active booking found." });
  }

  const newOtp = generateOtp();
  const newEnds = new Date(booking.endsAt.getTime() + hours * 60 * 60 * 1000);
  const maxEnd = new Date(booking.startsAt.getTime() + 8 * 60 * 60 * 1000);
  if (newEnds > maxEnd) {
    return res.status(400).json({
      error: "Total booking time cannot exceed 8 hours from the original start.",
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.update({
      where: { id: booking.id },
      data: { endsAt: newEnds, otpCode: newOtp },
    });
    await tx.bookingLog.create({
      data: {
        bookingId: b.id,
        lockerCode: booking.locker.code,
        actorEmail: booking.user.email,
        action: "EXTENDED",
        details: `Extended by ${hours}h; new OTP issued`,
      },
    });
    return b;
  });

  res.json({
    booking: {
      id: updated.id,
      lockerCode: booking.locker.code,
      location: booking.locker.location,
      startsAt: booking.startsAt.toISOString(),
      endsAt: updated.endsAt.toISOString(),
      otpCode: updated.otpCode,
      qrPayload: `${updated.id}:${booking.accessToken}`,
      note: updated.note,
    },
  });
});

app.get(
  "/api/admin/overview",
  authMiddleware(true),
  requireAdmin,
  async (_req, res) => {
    await refreshStale();
    const lockers = await prisma.locker.findMany();
    const activeBookings = await prisma.booking.count({
      where: { status: BookingStatus.ACTIVE },
    });
    const completedBookings = await prisma.booking.count({
      where: { status: BookingStatus.COMPLETED },
    });

    const byLocation = {};
    for (const l of lockers) {
      byLocation[l.location] ??= { total: 0, available: 0, occupied: 0, maintenance: 0 };
      byLocation[l.location].total += 1;
      if (l.status === LockerStatus.AVAILABLE) byLocation[l.location].available += 1;
      if (l.status === LockerStatus.OCCUPIED) byLocation[l.location].occupied += 1;
      if (l.status === LockerStatus.MAINTENANCE) byLocation[l.location].maintenance += 1;
    }

    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLogs = await prisma.bookingLog.count({
      where: { createdAt: { gte: last24h } },
    });

    res.json({
      lockerCounts: {
        total: lockers.length,
        available: lockers.filter((l) => l.status === LockerStatus.AVAILABLE).length,
        occupied: lockers.filter((l) => l.status === LockerStatus.OCCUPIED).length,
        maintenance: lockers.filter((l) => l.status === LockerStatus.MAINTENANCE).length,
      },
      bookings: {
        active: activeBookings,
        completed: completedBookings,
      },
      eventsLast24h: recentLogs,
      byLocation: Object.entries(byLocation).map(([location, v]) => ({
        location,
        ...v,
      })),
    });
  }
);

app.get(
  "/api/admin/logs",
  authMiddleware(true),
  requireAdmin,
  async (req, res) => {
    await refreshStale();
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const logs = await prisma.bookingLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    const bookingIds = [
      ...new Set(logs.map((l) => l.bookingId).filter(Boolean)),
    ];
    const bookings =
      bookingIds.length === 0
        ? []
        : await prisma.booking.findMany({
            where: { id: { in: bookingIds } },
            include: { user: true },
          });
    const byId = Object.fromEntries(bookings.map((b) => [b.id, b]));
    res.json({
      logs: logs.map((l) => ({
        ...l,
        studentId: l.bookingId
          ? byId[l.bookingId]?.user?.studentId ?? null
          : null,
      })),
    });
  }
);

app.get(
  "/api/admin/logs/export",
  authMiddleware(true),
  requireAdmin,
  async (_req, res) => {
    await refreshStale();
    const logs = await prisma.bookingLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 2000,
    });
    const header = "time,locker,action,actor,details\n";
    const body = logs
      .map((l) =>
        [
          l.createdAt.toISOString(),
          l.lockerCode,
          l.action,
          l.actorEmail ?? "",
          (l.details ?? "").replaceAll('"', "'"),
        ]
          .map((c) => `"${String(c)}"`)
          .join(",")
      )
      .join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.send(header + body);
  }
);

const maintenanceSchema = z.object({
  code: z.string().min(1, "Locker code is required").transform(s => s.trim()),
  maintenance: z.boolean()
});

app.post(
  "/api/admin/lockers/maintenance",
  authMiddleware(true),
  requireAdmin,
  validateBody(maintenanceSchema),
  async (req, res) => {
    await refreshStale();
    const { code, maintenance } = req.body;
    const locker = await prisma.locker.findUnique({ where: { code } });
    if (!locker) {
      return res.status(404).json({ error: "Locker not found." });
    }

    if (maintenance) {
      const active = await prisma.booking.findFirst({
        where: {
          lockerId: locker.id,
          status: BookingStatus.ACTIVE,
        },
      });
      if (active) {
        return res.status(409).json({
          error: "Cannot mark maintenance while the locker has an active booking.",
        });
      }
      await prisma.$transaction([
        prisma.locker.update({
          where: { id: locker.id },
          data: { status: LockerStatus.MAINTENANCE },
        }),
        prisma.bookingLog.create({
          data: {
            lockerCode: code,
            actorEmail: req.user.email,
            action: "MAINTENANCE_ON",
            details: "Marked unavailable for maintenance",
          },
        }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.locker.update({
          where: { id: locker.id },
          data: { status: LockerStatus.AVAILABLE },
        }),
        prisma.bookingLog.create({
          data: {
            lockerCode: code,
            actorEmail: req.user.email,
            action: "MAINTENANCE_OFF",
            details: "Returned locker to available pool",
          },
        }),
      ]);
    }

    const updated = await prisma.locker.findUnique({ where: { id: locker.id } });
    res.json({
      locker: {
        code: updated.code,
        location: updated.location,
        status: mapLockerStatus(updated.status),
      },
    });
  }
);

const forceReleaseSchema = z.object({
  lockerCode: z.string().min(1, "Locker code is required").transform(s => s.trim())
});

app.post(
  "/api/admin/bookings/force-release",
  authMiddleware(true),
  requireAdmin,
  validateBody(forceReleaseSchema),
  async (req, res) => {
    await refreshStale();
    const code = req.body.lockerCode;
    const locker = await prisma.locker.findUnique({ where: { code } });
    if (!locker) {
      return res.status(404).json({ error: "Locker not found." });
    }
    const booking = await prisma.booking.findFirst({
      where: { lockerId: locker.id, status: BookingStatus.ACTIVE },
      include: { user: true },
    });
    if (!booking) {
      return res.status(404).json({ error: "No active booking for that locker." });
    }

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.COMPLETED },
      }),
      prisma.locker.update({
        where: { id: locker.id },
        data: { status: LockerStatus.AVAILABLE },
      }),
      prisma.bookingLog.create({
        data: {
          bookingId: booking.id,
          lockerCode: code,
          actorEmail: req.user.email,
          action: "FORCE_RELEASED",
          details: `Admin override; student ${booking.user?.email ?? booking.userId}`,
        },
      }),
    ]);

    res.json({ ok: true });
  }
);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found." });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server error." });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
