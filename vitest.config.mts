import react from "@vitejs/plugin-react";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "vitest/config";

// Test env (.env.test locally; CI provides real env vars which take precedence).
loadEnv({ path: ".env.test", quiet: true });

const serverOnlyStub = new URL("./tests/mocks/server-only.ts", import.meta.url).pathname;

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true, alias: { "server-only": serverOnlyStub } },
  test: {
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/generated/**", "src/app/**/page.tsx", "**/*.d.ts"],
      reporter: ["text", "html", "lcov"],
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "components",
          environment: "jsdom",
          include: ["src/**/*.test.tsx"],
          setupFiles: ["./tests/setup/dom.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          environment: "node",
          include: ["tests/integration/**/*.test.ts"],
          globalSetup: ["./tests/setup/integration-global.ts"],
          fileParallelism: false,
          testTimeout: 20_000,
          hookTimeout: 30_000,
        },
      },
    ],
  },
});
