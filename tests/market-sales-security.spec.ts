import { expect, test } from "@playwright/test";

test("all market sale mutation endpoints independently require an admin session", async ({
  request,
}) => {
  const root = "/api/admin/market-sales";
  for (const path of [
    root,
    `${root}/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/reconcile`,
    `${root}/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/dismiss`,
  ]) {
    expect([401, 403]).toContain((await request.post(path, { data: {} })).status());
  }
});

test("market sale administration requires authentication", async ({ request }) => {
  const response = await request.get("/admin/market-sales", { maxRedirects: 0 });
  expect([302, 307, 308]).toContain(response.status());
  expect(response.headers().location).toContain("/login");
});
