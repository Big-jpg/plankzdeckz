import Module from "node:module";

// Next.js supplies this marker at bundling time. These isolated server tests run in Node.
const loader = Module as unknown as { _load(request: string, ...args: unknown[]): unknown };
const originalLoad = loader._load;
loader._load = function (request, ...args) {
  if (request === "server-only") return {};
  return originalLoad.call(this, request, ...args);
};

const value = process.env.LOCAL_TEST_DATABASE_URL;
if (!value) throw new Error("No isolated commerce database was supplied.");
const url = new URL(value);
if (
  !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
  url.pathname !== "/plankz_commerce_test"
) {
  throw new Error(
    "Refusing integration mutations outside the isolated loopback commerce database.",
  );
}
process.env.DATABASE_URL = value;
