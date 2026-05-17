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

const coastlineCruiserItem = {
  productId: "board-coastline-cruiser-001",
  variantId: null,
  handle: "coastline-cruiser-jarrah-marri",
  title: "Coastline Cruiser 001",
  variantTitle: "One-of-a-kind board",
  imageUrl: "",
  unitPrice: 950,
  currency: "AUD",
  quantity: 1,
  productType: "board",
  selectedSize: null,
  material: "Recycled jarrah and marri hardwood pallet timber",
  colour: "Jarrah red-brown",
  metadata: {
    availability_status: "available",
    board_style: "cruiser",
    board_shape: "Kicktail cruiser",
    timber_species: "Jarrah / Marri",
  },
};

const logoTeeItem = {
  productId: "merch-og-plankz-logo-tee",
  variantId: null,
  handle: "og-plankz-logo-tee",
  title: "OG Plankz Logo Tee",
  variantTitle: "Size M",
  imageUrl: "",
  unitPrice: 45,
  currency: "AUD",
  quantity: 2,
  productType: "merch",
  selectedSize: "M",
  material: "Cotton tee placeholder",
  colour: "Washed white",
  metadata: {
    merch_kind: "tee",
    selected_size: "M",
  },
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

test.describe("PLANKZ DECKZ smoke coverage", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear());
  });

  test("home page loads", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: /Hand-Crafted Skateboard Deckz/i,
      }),
    ).toBeVisible();
    await expect(page.getByText("Recycled. Reclaimed. One of a Kind.")).toBeVisible();
  });

  test("shop catalogue loads", async ({ page }) => {
    await page.goto("/shop");

    await expect(
      page.getByRole("heading", { name: /One-off recycled hardwood boards and coastal merch/i }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Coastline Cruiser 001" })).toBeVisible();
  });

  test("board detail loads without configuration controls", async ({ page }) => {
    await page.goto("/products/coastline-cruiser-jarrah-marri");

    await expect(page.getByRole("heading", { name: "Coastline Cruiser 001" })).toBeVisible();
    await expect(page.getByText("No configuration required")).toBeVisible();
    await expect(page.getByText("Local pickup only")).toBeVisible();
    await expect(page.getByRole("button", { name: /Add one-of-a-kind board to cart/i })).toBeEnabled();
  });

  test("add board to cart", async ({ page }) => {
    await page.route("**/api/boards/availability?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ available: true, message: "Board is available." }),
      });
    });

    await page.goto("/products/coastline-cruiser-jarrah-marri");

    await page.getByRole("button", { name: /Add one-of-a-kind board to cart/i }).click();

    await expect(page.getByText("Coastline Cruiser 001 added to cart")).toBeVisible();
    await expect(page.getByRole("button", { name: "Cart, 1 items" })).toBeVisible();
  });

  test("merch requires a size before add to cart", async ({ page }) => {
    await page.goto("/products/og-plankz-logo-tee");

    await expect(page.getByRole("heading", { name: "OG Plankz Logo Tee" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Add merch to cart/i })).toBeDisabled();

    await page.getByRole("button", { name: "M" }).click();
    await expect(page.getByRole("button", { name: /Add merch to cart/i })).toBeEnabled();
  });

  test("checkout rejects empty cart", async ({ request }) => {
    await expectCheckoutValidationError(request, { items: [] }, "items", /Cart must contain at least one item/i);
  });

  test("checkout rejects board quantity above one", async ({ request }) => {
    await expectCheckoutValidationError(
      request,
      {
        items: [{ ...coastlineCruiserItem, quantity: 2 }],
      },
      "quantity",
      /One-of-a-kind boards must have quantity 1/i,
    );
  });

  test("checkout rejects sold boards", async ({ request }) => {
    await expectCheckoutValidationError(
      request,
      {
        items: [
          {
            ...coastlineCruiserItem,
            productId: "board-sunset-pintail-003",
            handle: "sunset-pintail-sheoak-jarrah",
            title: "Sunset Pintail 003",
            unitPrice: 900,
            material: "Recycled sheoak and jarrah hardwood pallet timber",
          },
        ],
      },
      "inStock",
      /currently out of stock/i,
    );
  });

  test("checkout rejects merch without required size", async ({ request }) => {
    await expectCheckoutValidationError(
      request,
      {
        items: [{ ...logoTeeItem, selectedSize: null, variantTitle: null }],
      },
      "selectedSize",
      /A merch size is required/i,
    );
  });

  test("custom design form submits", async ({ page }) => {
    await page.route("**/api/custom-design-requests", async (route) => {
      expect(route.request().method()).toBe("POST");

      const body = route.request().postDataJSON() as Record<string, unknown>;
      expect(body.name).toBe("Smoke Tester");
      expect(body.adapter_type).toBe("Cruiser");
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
    await page.getByLabel(/Intended use/i).fill("Cruiser deck");
    await page.getByLabel(/Board type/i).selectOption("Cruiser");
    await page.getByLabel(/Desired shade style/i).fill("Coastal cruiser with clear timber finish");
    await page.getByLabel(/Dimensions if known/i).fill("32 in x 9 in");
    await page.getByLabel(/Colour\/material preference/i).fill("Jarrah and marri reclaimed timber");
    await page.getByLabel(/Notes/i).fill("Smoke-test submission for Plankz custom workflow.");
    await page.getByLabel(/reference photos should be emailed separately/i).check();
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
