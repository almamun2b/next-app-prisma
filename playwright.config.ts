import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3000);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${String(PORT)}`;
// Use a preinstalled Chromium when the bundled revision isn't downloaded (e.g. sandboxes).
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

/**
 * E2E against the production build. Run `pnpm build` first (CI does);
 * the web server is started automatically unless one is already running.
 */
export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Deterministic screenshots / contrast checks (CSS honours reduced motion).
    contextOptions: { reducedMotion: "reduce" },
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      testMatch: /public\.spec\.ts/,
    },
  ],
  webServer: {
    command: "pnpm start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { PORT: String(PORT) },
  },
});
