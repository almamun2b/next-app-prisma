import "dotenv/config";
import { Role } from "../src/generated/prisma/enums";
import { hashPassword } from "../src/lib/password";
import { prisma } from "../src/lib/prisma";
import { ADMIN, MEMBER } from "./fixtures";

/** Ensures deterministic accounts exist for the E2E run. */
export default async function globalSetup() {
  const [adminHash, memberHash] = await Promise.all([
    hashPassword(ADMIN.password),
    hashPassword(MEMBER.password),
  ]);
  await prisma.user.upsert({
    where: { email: ADMIN.email },
    update: { role: Role.ADMIN, isActive: true, passwordHash: adminHash },
    create: { email: ADMIN.email, name: "System Admin", role: Role.ADMIN, passwordHash: adminHash },
  });
  await prisma.user.upsert({
    where: { email: MEMBER.email },
    update: { role: Role.USER, isActive: true, name: MEMBER.name, passwordHash: memberHash },
    create: { email: MEMBER.email, name: MEMBER.name, role: Role.USER, passwordHash: memberHash },
  });
  await prisma.user.deleteMany({ where: { email: { startsWith: "e2e.created" } } });
  await prisma.$disconnect();
}
