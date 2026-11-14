import { defineConfig, devices } from "@playwright/test";
import { availableParallelism } from "node:os";

const port = Number(process.env.BROWSER_TEST_PORT ?? 4177);
export default defineConfig({
  testDir: "tests/browser",
  fullyParallel: true,
  workers: availableParallelism(),
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 20_000,
  expect: {timeout: 5_000},
  reporter: "list",
  use: {baseURL: "http://127.0.0.1:" + port, trace: "retain-on-failure"},
  projects: [{name: "chromium", use: {...devices["Desktop Chrome"]}}],
  webServer: {
    command: "bun scripts/browser-reference-server.ts",
    url: "http://127.0.0.1:" + port,
    reuseExistingServer: false,
    timeout: 15_000,
  },
});
