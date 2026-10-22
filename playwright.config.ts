// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3000);
const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL?.trim();
const baseURL = externalBaseURL || `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  testIgnore: "**/integration/**",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
      },
    },
  ],
  webServer: externalBaseURL
    ? undefined
    : {
        command: `pnpm dev --hostname 127.0.0.1 --port ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          AUTH_SECRET: "playwright-smoke-test-secret",
          NEXTAUTH_SECRET: "playwright-smoke-test-secret",
          NEXTAUTH_URL: baseURL,
          NEXT_PUBLIC_SITE_URL: baseURL,
          NEXT_PUBLIC_SALES_ENABLED: "false",
          DATABASE_URL: "postgresql://smoke_test@127.0.0.1:1/unconfigured_smoke",
          STRIPE_SECRET_KEY: "",
          STRIPE_WEBHOOK_SECRET: "whsec_smoke_not_a_real_endpoint",
          BLOB_READ_WRITE_TOKEN: "",
          EMAIL_SERVER_HOST: "",
          EMAIL_SERVER_PORT: "",
          EMAIL_SERVER_USER: "",
          EMAIL_SERVER_PASSWORD: "",
          EMAIL_FROM: "",
        },
      },
});
