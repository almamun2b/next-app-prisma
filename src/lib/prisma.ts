import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

/**
 * Single PrismaClient per process. In development the instance is cached on
 * `globalThis` so hot reloads don't exhaust the connection pool.
 *
 * Only repositories (`src/modules/<module>/<module>.repository.ts`) may import this.
 */
function createPrismaClient() {
  const connectionString = (process.env.DATABASE_URL ?? "").trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
