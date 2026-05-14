// tests/smoke.spec.ts
import { expect, test, type APIRequestContext } from "@playwright/test";

type CheckoutErrorDetail = {
  handle: string;
  field: string;
  message: string;
};

type CheckoutErrorResponse = {
  error?: string;
  details?: CheckoutErrorDetail[];
};

const meridianBloomItem = {
  productId: "prod-01",
  variantId: null,
  handle: "meridian-bloom",
  title: "Meridian Bloom",
  variantTitle: null,
  imageUrl: "/products/product-01.png",
  unitPrice: 1,
  currency: "AUD",
  quantity: 1,
  selectedAdapter: "B22",
  bulbTypeConfirmed: true,
  fixtureNotes: null,
  customisationNotes: null,
  material: "PLA (polylactic acid), matte finish",
  colour: "Warm White",
  metadata: {},
};

async function expectCheckoutValidationError(
  request: APIRequestContext,
  payload: unknown,
  expectedField: string,
  expectedMessage: RegExp,
) {
  const response = await request.post("/api/checkout/create-session", {
    data: payload,
  });

  expect(response.status()).toBe(422);

  const body = (await response.json()) as CheckoutErrorResponse;
  expect(body.error).toBe("Cart validation failed.");
  expect(body.details ?? []).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        field: expectedField,
        message: expect.stringMatching(expectedMessage),
      }),
    ]),
  );
}

test.describe("Lumenform smoke coverage", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear());
  });

  test("home page loads", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: /Contemporary lighting objects for the fittings you already own/i,
      }),
    ).toBeVisible();
    await expect(page.getByText("Lightweight domestic delivery")).toBeVisible();
  });

  test("product catalogue loads", async ({ page }) => {
    await page.goto("/products");

    await expect(page.getByRole("heading", { name: /Shop Lighting Objects/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Meridian Bloom/i })).toBeVisible();
  });

  test("product detail loads", async ({ page }) => {
    await page.goto("/products/meridian-bloom");

    await expect(page.getByRole("heading", { name: "Meridian Bloom" })).toBeVisible();
    await expect(page.getByText("Fitting adapter *")).toBeVisible();
    await expect(page.getByText("LED bulbs only", { exact: true })).toBeVisible();
  });

  test("adapter selection required", async ({ page }) => {
    await page.goto("/products/meridian-bloom");

    await expect(
      page.getByRole("button", { name: "Select a fitting adapter to continue" }),
    ).toBeDisabled();
  });

  test("add to cart", async ({ page }) => {
    await page.goto("/products/meridian-bloom");

    await page.getByRole("button", { name: "B22" }).click();
    await page.getByRole("button", { name: /Add to cart/i }).click();

    await expect(page.getByText("Meridian Bloom added to cart")).toBeVisible();
    await expect(page.getByRole("button", { name: "Cart, 1 items" })).toBeVisible();
  });

  test("checkout rejects empty cart", async ({ request }) => {
    await expectCheckoutValidationError(
      request,
      { items: [], ledAcknowledged: true },
      "items",
      /Cart must contain at least one item/i,
    );
  });

  test("checkout rejects missing adapter", async ({ request }) => {
    await expectCheckoutValidationError(
      request,
      {
        items: [{ ...meridianBloomItem, selectedAdapter: "" }],
        ledAcknowledged: true,
      },
      "selectedAdapter",
      /Invalid adapter selection/i,
    );
  });

  test("checkout rejects missing LED acknowledgement", async ({ request }) => {
    await expectCheckoutValidationError(
      request,
      {
        items: [meridianBloomItem],
        ledAcknowledged: false,
      },
      "ledAcknowledged",
      /LED-only bulb acknowledgement is required before checkout/i,
    );
  });

  test("custom design form submits", async ({ page }) => {
    await page.route("**/api/custom-design-requests", async (route) => {
      expect(route.request().method()).toBe("POST");

      const body = route.request().postDataJSON() as Record<string, unknown>;
      expect(body.name).toBe("Smoke Tester");
      expect(body.adapter_type).toBe("B22");
      expect(body.upload_instruction_acknowledged).toBe(true);

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, requestId: "smoke-custom-001" }),
      });
    });

    await page.goto("/custom");

    await page.getByLabel(/Name/i).fill("Smoke Tester");
    await page.getByLabel(/Phone/i).fill("0400000000");
    await page.getByRole("textbox", { name: "Email *" }).fill("smoke@example.test");
    await page.getByLabel(/Fixture type/i).fill("Pendant");
    await page.getByLabel(/Adapter type/i).selectOption("B22");
    await page.getByLabel(/Desired shade style/i).fill("Warm ivory pleated shade");
    await page.getByLabel(/Dimensions if known/i).fill("220mm diameter x 180mm high");
    await page.getByLabel(/Colour\/material preference/i).fill("Warm ivory PLA");
    await page.getByLabel(/Notes/i).fill("Smoke-test submission for Phase 10 handoff.");
    await page.getByLabel(/fixture or room photos should be emailed separately/i).check();
    await page.getByRole("button", { name: "Submit request" }).click();

    await expect(page.getByText(/Your custom design request has been recorded/i)).toBeVisible();
    await expect(page.getByText("Request ID: smoke-custom-001")).toBeVisible();
  });

  test("admin page protected", async ({ page }) => {
    await page.goto("/admin");

    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fadmin/);
    await expect(page.getByRole("heading", { name: "Sign In", exact: true })).toBeVisible();
  });
});
