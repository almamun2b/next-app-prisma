import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx ./prisma/seed.ts",
  },
  datasource: {
    // `prisma generate` (postinstall) must work without a database URL,
    // so read it lazily instead of `env()` which throws when unset.
    url: process.env.DATABASE_URL ?? "",
  },
});
