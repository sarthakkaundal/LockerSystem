import { prisma } from "./prisma.js";
import { BookingStatus, LockerStatus } from "@prisma/client";
import crypto from "crypto";

export function generateOtp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function generateAccessToken() {
  return crypto.randomBytes(24).toString("hex");
}

export async function expireStaleBookings() {
  const now = new Date();
  const stale = await prisma.booking.findMany({
    where: { status: BookingStatus.ACTIVE, endsAt: { lt: now } },
    include: { locker: true },
  });

  for (const b of stale) {
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: b.id },
        data: { status: BookingStatus.COMPLETED },
      }),
      prisma.locker.update({
        where: { id: b.lockerId },
        data: { status: LockerStatus.AVAILABLE },
      }),
      prisma.bookingLog.create({
        data: {
          bookingId: b.id,
          lockerCode: b.locker.code,
          actorEmail: null,
          action: "EXPIRED",
          details: "Booking ended automatically when time ran out.",
        },
      }),
    ]);
  }
}

export function mapLockerStatus(s) {
  if (s === LockerStatus.AVAILABLE) return "Available";
  if (s === LockerStatus.OCCUPIED) return "Occupied";
  if (s === LockerStatus.MAINTENANCE) return "Maintenance";
  return s;
}
