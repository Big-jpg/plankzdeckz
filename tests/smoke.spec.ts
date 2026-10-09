import { expect, test } from "@playwright/test";

test("admin product writes require an allowed session", async ({ request }) => {
  const response = await request.post("/api/admin/products", { data: {} });
  expect([401, 403]).toContain(response.status());
});

test("photo-only writes require an allowed admin session", async ({ request }) => {
  const response = await request.patch("/api/admin/products/00000000-0000-0000-0000-000000000001", {
    data: { images: [] },
  });
  expect([401, 403]).toContain(response.status());
});

test("photo-review handles have no commerce product page", async ({ request }) => {
  expect((await request.get("/products/photo-review-jacket-olive")).status()).toBe(404);
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
