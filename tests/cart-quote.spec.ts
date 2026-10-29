import { expect, test, type Route } from "@playwright/test";
import type { CartItem } from "../lib/cart-types";

test.skip(
  process.env.NEXT_PUBLIC_SALES_ENABLED !== "true",
  "Requires an enabled local commerce build.",
);

const item: CartItem = {
  productId: "quote-ui-fixture",
  variantId: null,
  handle: "quote-ui-trad-hat",
  title: "Isolated quote UI fixture",
  variantTitle: "One hat",
  imageUrl: "",
  unitPrice: 25,
  currency: "AUD",
  quantity: 2,
  productType: "merch",
  selectedSize: "One size",
  material: "",
  colour: "",
  metadata: null,
};

function quote(quantity: 2 | 3) {
  return {
    valid: true,
    errors: [],
    verifiedSubtotal: quantity === 2 ? 45 : 67.5,
    retailSubtotal: quantity === 2 ? 50 : 75,
    discountAmount: quantity === 2 ? 5 : 7.5,
    currency: "AUD",
    lineQuotes: [
      {
        handle: item.handle,
        selectedSize: "One size",
        quantity,
        retailUnitAmount: 2500,
        unitAmount: 2250,
        totalAmount: quantity === 2 ? 4500 : 6750,
      },
    ],
  };
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    (cartItem) => localStorage.setItem("plankz_cart_v2", JSON.stringify({ items: [cartItem] })),
    item,
  );
});

test("cart waits for authoritative totals and invalidates them when quantity changes", async ({
  page,
}) => {
  const waiting: Route[] = [];
  await page.route("**/api/cart/validate", (route) => {
    waiting.push(route);
  });
  await page.goto("/cart");
  const main = page.locator("main");
  const checkout = main.getByRole("button", { name: "Proceed to checkout" });
  await expect(checkout).toBeDisabled();
  await expect(main.getByRole("status")).toContainText("Confirming prices");
  await expect.poll(() => waiting.length).toBe(1);
  await waiting[0].fulfill({ json: quote(2) });
  await expect(checkout).toBeEnabled();
  await expect(main.locator("[data-cart-savings]")).toContainText("5.00 AUD");
  await expect(main.getByText("$45.00 AUD", { exact: true })).toBeVisible();

  await main.getByRole("button", { name: "Increase quantity" }).click();
  await expect(checkout).toBeDisabled();
  await expect(main.getByText("$45.00 AUD", { exact: true })).toHaveCount(0);
  await expect.poll(() => waiting.length).toBe(2);
  await waiting[1].fulfill({ json: quote(3) });
  await expect(checkout).toBeEnabled();
  await expect(main.locator("[data-cart-savings]")).toContainText("7.50 AUD");
  await expect(main.getByText("$67.50 AUD", { exact: true })).toBeVisible();
  await expect(main.getByText("$22.50 each", { exact: true })).toBeVisible();
});

test("a failed quote blocks checkout and provides a working retry", async ({ page }) => {
  let requests = 0;
  await page.route("**/api/cart/validate", async (route) => {
    requests += 1;
    if (requests === 1)
      await route.fulfill({
        status: 422,
        json: { valid: false, errors: [{ message: "Fixture stock requires review." }] },
      });
    else await route.fulfill({ json: quote(2) });
  });
  await page.goto("/cart");
  const main = page.locator("main");
  const checkout = main.getByRole("button", { name: "Proceed to checkout" });
  await expect(main.getByRole("alert")).toContainText("Fixture stock requires review.");
  await expect(checkout).toBeDisabled();
  await main.getByRole("button", { name: "Retry price check" }).click();
  await expect(checkout).toBeEnabled();
  await expect(main.getByRole("alert")).toHaveCount(0);
  await expect(main.getByText("$45.00 AUD", { exact: true })).toBeVisible();
});

test("mini-cart shares the verified total and savings", async ({ page }) => {
  await page.route("**/api/cart/validate", (route) => route.fulfill({ json: quote(2) }));
  await page.goto("/cart");
  await expect(
    page.locator("main").getByRole("button", { name: "Proceed to checkout" }),
  ).toBeEnabled();
  await page.locator("header").getByRole("button", { name: /^Cart/ }).click();
  const drawer = page.getByRole("dialog", { name: "Shopping cart" });
  await expect(drawer.getByText("$45.00 AUD", { exact: true })).toBeVisible();
  await expect(drawer.locator("[data-cart-savings]")).toContainText("5.00 AUD");
});

test("returning to an earlier quantity still requires a fresh quote", async ({ page }) => {
  const waiting: Route[] = [];
  await page.route("**/api/cart/validate", (route) => {
    waiting.push(route);
  });
  await page.goto("/cart");
  const main = page.locator("main");
  const checkout = main.getByRole("button", { name: "Proceed to checkout" });
  await expect.poll(() => waiting.length).toBe(1);
  await waiting[0].fulfill({ json: quote(2) });
  await expect(checkout).toBeEnabled();
  await main.getByRole("button", { name: "Increase quantity" }).click();
  await expect.poll(() => waiting.length).toBe(2);
  await main.getByRole("button", { name: "Decrease quantity" }).click();
  await expect(checkout).toBeDisabled();
  await expect(main.getByText("$45.00 AUD", { exact: true })).toHaveCount(0);
  await expect.poll(() => waiting.length).toBe(3);
  await waiting[2].fulfill({ json: quote(2) });
  await expect(checkout).toBeEnabled();
});

test("a changed checkout price refreshes the quote and requires another checkout click", async ({
  page,
}) => {
  let quoteRequests = 0;
  const checkoutRequests: Array<{ expectedTotalAmount: number; key: string | undefined }> = [];
  await page.route("**/api/cart/validate", async (route) => {
    quoteRequests += 1;
    const result = quote(2);
    if (quoteRequests > 1) {
      result.verifiedSubtotal = 50;
      result.discountAmount = 0;
      result.lineQuotes[0].unitAmount = 2500;
      result.lineQuotes[0].totalAmount = 5000;
    }
    await route.fulfill({ json: result });
  });
  await page.route("**/api/checkout/create-session", async (route) => {
    checkoutRequests.push({
      expectedTotalAmount: route.request().postDataJSON().expectedTotalAmount,
      key: route.request().headers()["idempotency-key"],
    });
    if (checkoutRequests.length === 1) {
      await route.fulfill({
        status: 409,
        json: {
          code: "PRICE_CHANGED",
          error: "Prices changed. Review your cart before checking out.",
        },
      });
    } else {
      await route.fulfill({
        status: 503,
        json: { error: "Isolated checkout test ends before payment." },
      });
    }
  });
  await page.goto("/cart");
  const main = page.locator("main");
  const checkout = main.getByRole("button", { name: "Proceed to checkout" });
  await expect(checkout).toBeEnabled();
  await checkout.click();
  await expect(
    main.getByText("Prices changed. Review your cart before checking out.", { exact: true }),
  ).toBeVisible();
  await expect(main.getByText("$50.00 AUD", { exact: true }).last()).toBeVisible();
  await expect(checkout).toBeEnabled();
  expect(checkoutRequests).toHaveLength(1);
  expect(checkoutRequests[0].expectedTotalAmount).toBe(4500);
  await expect(page).toHaveURL(/\/cart$/);
  await checkout.click();
  await expect(
    main.getByText("Isolated checkout test ends before payment.", { exact: true }),
  ).toBeVisible();
  expect(checkoutRequests).toHaveLength(2);
  expect(checkoutRequests[1].expectedTotalAmount).toBe(5000);
  expect(checkoutRequests[1].key).not.toBe(checkoutRequests[0].key);
});
