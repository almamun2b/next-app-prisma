import { execSync } from "node:child_process";

/** Applies migrations to the test database once before the integration suite. */
export default function setup() {
  if (!process.env.DATABASE_URL?.includes("test")) {
    throw new Error("Integration tests require a DATABASE_URL pointing to a *test* database.");
  }
  execSync("pnpm exec prisma migrate deploy", { stdio: "inherit", env: process.env });
}
