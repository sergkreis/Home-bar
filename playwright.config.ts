import { defineConfig, devices } from "@playwright/test";

const configuredBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = configuredBaseURL ?? "http://127.0.0.1:8081";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  webServer: configuredBaseURL
    ? undefined
    : {
        command: "npm run web -- --port 8081",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 7"],
      },
    },
    {
      name: "desktop-chrome",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
