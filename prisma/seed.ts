import "dotenv/config";
import { Role } from "../src/generated/prisma/enums";
import { hashPassword } from "../src/lib/password";
import prisma from "../src/lib/prisma";

/**
 * Seeds the administrator account from ADMIN_* env vars (idempotent upsert),
 * plus demo users outside production. Run with `pnpm db:seed`.
 */
const DEMO_NAMES = [
  "Ava Thompson",
  "Liam Carter",
  "Noah Patel",
  "Emma Rodriguez",
  "Olivia Chen",
  "Mason Brooks",
  "Sophia Nguyen",
  "Lucas Rivera",
  "Mia Johnson",
  "Ethan Kim",
  "Isabella Garcia",
  "James Wilson",
  "Amelia Hughes",
  "Benjamin Lee",
  "Harper Scott",
  "Elijah Adams",
  "Evelyn Turner",
  "Henry Morgan",
  "Abigail Ross",
  "Alexander Price",
  "Emily Ward",
  "Daniel Foster",
  "Ella Bennett",
  "Matthew Hayes",
  "Scarlett Reed",
];

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required to seed the administrator`);
  return value;
}

async function seedAdmin() {
  const email = requireEnv("ADMIN_EMAIL").toLowerCase();
  const passwordHash = await hashPassword(requireEnv("ADMIN_PASSWORD"));
  const name = process.env.ADMIN_NAME?.trim() ?? "System Admin";

  await prisma.user.upsert({
    where: { email },
    update: { role: Role.ADMIN, isActive: true },
    create: { email, name, passwordHash, role: Role.ADMIN, isActive: true },
  });
  console.info(`✔ Admin ready: ${email}`);
}

async function seedDemoUsers() {
  const passwordHash = await hashPassword("Demo@12345");
  const data = DEMO_NAMES.map((name, i) => ({
    name,
    email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    passwordHash,
    role: i % 8 === 0 ? Role.ADMIN : Role.USER,
    isActive: i % 6 !== 5,
    createdAt: new Date(Date.now() - i * 86_400_000),
  }));
  const { count } = await prisma.user.createMany({ data, skipDuplicates: true });
  console.info(`✔ Demo users inserted: ${count}`);
}

async function main() {
  await seedAdmin();
  if (process.env.NODE_ENV !== "production" && process.env.SEED_DEMO !== "false") {
    await seedDemoUsers();
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
