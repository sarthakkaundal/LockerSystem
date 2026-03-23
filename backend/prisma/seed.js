import { PrismaClient, LockerStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const lockers = [
  { code: "L-101", location: "Library Block", status: LockerStatus.AVAILABLE },
  { code: "L-102", location: "Library Block", status: LockerStatus.AVAILABLE },
  { code: "L-103", location: "Library Block", status: LockerStatus.MAINTENANCE },
  { code: "L-201", location: "CSE Block", status: LockerStatus.AVAILABLE },
  { code: "L-202", location: "CSE Block", status: LockerStatus.AVAILABLE },
  { code: "L-203", location: "CSE Block", status: LockerStatus.AVAILABLE },
  { code: "L-301", location: "Admin Block", status: LockerStatus.AVAILABLE },
  { code: "L-302", location: "Admin Block", status: LockerStatus.AVAILABLE },
];

async function main() {
  await prisma.bookingLog.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.locker.deleteMany();
  await prisma.user.deleteMany();

  for (const l of lockers) {
    await prisma.locker.create({ data: l });
  }

  const studentHash = await bcrypt.hash("password123", 10);
  const adminHash = await bcrypt.hash("admin123", 10);

  await prisma.user.create({
    data: {
      email: "student@university.edu",
      passwordHash: studentHash,
      role: Role.STUDENT,
      studentId: "12300561",
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@university.edu",
      passwordHash: adminHash,
      role: Role.ADMIN,
      studentId: "ADMIN001",
    },
  });

  console.log("Seed: lockers + student@university.edu / password123, admin@university.edu / admin123");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
