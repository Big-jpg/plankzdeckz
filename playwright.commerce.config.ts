import { defineConfig } from "@playwright/test";

const connection = process.env.LOCAL_TEST_DATABASE_URL;
if (!connection)
  throw new Error(
    "Run node scripts/test-commerce.mjs, or set an isolated LOCAL_TEST_DATABASE_URL.",
  );
const url = new URL(connection);
if (
  !["postgres:", "postgresql:"].includes(url.protocol) ||
  !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
  url.pathname !== "/plankz_commerce_test"
) {
  throw new Error("Commerce integration tests require a loopback plankz_commerce_test database.");
}
process.env.DATABASE_URL = connection;
process.env.NEXT_PUBLIC_SALES_ENABLED = "true";
process.env.STRIPE_SECRET_KEY = "sk_test_isolated_mock_only";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_isolated_mock_only";
for (const key of [
  "EMAIL_SERVER_HOST",
  "EMAIL_SERVER_PORT",
  "EMAIL_SERVER_USER",
  "EMAIL_SERVER_PASSWORD",
  "EMAIL_FROM",
])
  process.env[key] = "";

export default defineConfig({
  testDir: "./tests/integration",
  workers: 1,
  fullyParallel: false,
  timeout: 30_000,
  retries: 0,
  reporter: "list",
});
