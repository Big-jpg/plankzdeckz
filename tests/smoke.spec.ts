import { expect, test } from "@playwright/test";

test("checkout rejects an empty cart before contacting Stripe", async ({ request }) => {
  const response = await request.post("/api/checkout/create-session", { data: { items: [] } });
  expect(response.status()).toBe(422);
  const body = await response.json();
  expect(body.details).toEqual(
    expect.arrayContaining([expect.objectContaining({ field: "items" })]),
  );
});

test("admin product writes require an allowed session", async ({ request }) => {
  const response = await request.post("/api/admin/products", { data: {} });
  expect([401, 403]).toContain(response.status());
});

test("the paused custom designer redirects to the shop", async ({ request }) => {
  const response = await request.get("/custom-designer", { maxRedirects: 0 });
  expect([302, 307, 308]).toContain(response.status());
  expect(response.headers().location).toContain("/shop");
});

test("admin pages remain protected", async ({ request }) => {
  const response = await request.get("/admin/products", { maxRedirects: 0 });
  expect([302, 307, 308]).toContain(response.status());
  expect(response.headers().location).toContain("/login");
});
