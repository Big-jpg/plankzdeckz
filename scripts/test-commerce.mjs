import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runtime = path.join(root, ".commerce-test-runtime");
const database = "plankz_commerce_test";
let postgres;
let connection;

function assertLocalDatabase(value) {
  const url = new URL(value);
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
    url.pathname !== `/${database}`
  ) {
    throw new Error(
      "LOCAL_TEST_DATABASE_URL must point to loopback and database plankz_commerce_test.",
    );
  }
  return url;
}

async function run(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: root,
    windowsHide: true,
    stdio: "inherit",
    ...options,
  });
  const [code] = await once(child, "exit");
  if (code !== 0) throw new Error(`${path.basename(command)} exited with status ${code}.`);
}

async function availablePort() {
  const server = net.createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function waitForDatabase(url) {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 500 });
    try {
      await client.connect();
      return client;
    } catch {
      await client.end().catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
  throw new Error("Isolated PostgreSQL did not start within twenty seconds.");
}

async function main() {
  await mkdir(runtime, { recursive: true });
  if (process.env.LOCAL_TEST_DATABASE_URL) {
    connection = assertLocalDatabase(process.env.LOCAL_TEST_DATABASE_URL).toString();
  } else {
    if (process.platform !== "win32" || process.arch !== "x64") {
      throw new Error(
        "Set LOCAL_TEST_DATABASE_URL to an isolated loopback PostgreSQL database, or install the ignored Windows x64 test runtime.",
      );
    }
    const native = path.join(runtime, "node_modules/@embedded-postgres/windows-x64/native/bin");
    const data = path.join(runtime, `data-${Date.now()}-${process.pid}`);
    // The downloaded package's hydration manifest is empty; no install scripts are needed.
    await run(path.join(native, "initdb.exe"), [
      "-D",
      data,
      "-U",
      "commerce_test",
      "--auth=trust",
      "--encoding=UTF8",
      "--locale=C",
    ]);
    const port = await availablePort();
    postgres = spawn(
      path.join(native, "postgres.exe"),
      ["-D", data, "-h", "127.0.0.1", "-p", String(port)],
      {
        cwd: root,
        windowsHide: true,
        stdio: ["ignore", "ignore", "pipe"],
      },
    );
    let startupErrors = "";
    postgres.stderr.on("data", (chunk) => {
      startupErrors = (startupErrors + chunk).slice(-4_000);
    });
    postgres.on("error", (error) => {
      process.stderr.write(`${error.message}\n`);
    });
    const adminUrl = `postgresql://commerce_test@127.0.0.1:${port}/postgres`;
    let admin;
    try {
      admin = await waitForDatabase(adminUrl);
    } catch (error) {
      process.stderr.write(startupErrors);
      throw error;
    }
    await admin.query(`CREATE DATABASE ${database}`);
    await admin.end();
    connection = `postgresql://commerce_test@127.0.0.1:${port}/${database}`;
  }
  assertLocalDatabase(connection);
  const client = await waitForDatabase(connection);
  try {
    const existing = await client.query("SELECT to_regclass('public.users') AS users");
    if (!existing.rows[0].users) {
      const migrations = [
        "001_initial_schema.sql",
        "002_storefront_catalogue.sql",
        "003_commerce_completion.sql",
        "004_order_notifications.sql",
        "005_market_sales.sql",
      ];
      for (const migration of migrations) {
        await client.query(await readFile(path.join(root, "db/migrations", migration), "utf8"));
      }
      for (const procedure of [
        "order_procedures.sql",
        "auth_procedures.sql",
        "pickup_procedures.sql",
      ]) {
        await client.query(await readFile(path.join(root, "db/procedures", procedure), "utf8"));
      }
    }
  } finally {
    await client.end();
  }
  await writeFile(
    path.join(runtime, "connection.json"),
    `${JSON.stringify({ url: connection, database, pid: postgres?.pid ?? null }, null, 2)}\n`,
  );
  process.stdout.write(`Isolated commerce database: ${connection}\n`);
  if (process.argv.includes("--serve")) {
    process.stdout.write(
      "Database remains available until this process is stopped. No application .env files were read.\n",
    );
    await new Promise((resolve) => {
      process.once("SIGINT", resolve);
      process.once("SIGTERM", resolve);
    });
    return;
  }
  const environment = {
    ...process.env,
    LOCAL_TEST_DATABASE_URL: connection,
    DATABASE_URL: connection,
    NEXT_PUBLIC_SALES_ENABLED: "true",
    STRIPE_SECRET_KEY: "sk_test_isolated_mock_only",
    STRIPE_WEBHOOK_SECRET: "whsec_isolated_mock_only",
    EMAIL_SERVER_HOST: "",
    EMAIL_SERVER_PORT: "",
    EMAIL_SERVER_USER: "",
    EMAIL_SERVER_PASSWORD: "",
    EMAIL_FROM: "",
  };
  await run(
    process.execPath,
    [
      "node_modules/@playwright/test/cli.js",
      "test",
      "--config=playwright.commerce.config.ts",
      ...process.argv.slice(2),
    ],
    { env: environment },
  );
}

try {
  await main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
} finally {
  if (postgres && postgres.exitCode === null) {
    postgres.kill();
    await Promise.race([
      once(postgres, "exit"),
      new Promise((resolve) => setTimeout(resolve, 5_000)),
    ]);
  }
}
