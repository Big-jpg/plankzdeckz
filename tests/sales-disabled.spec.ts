import { expect, test } from "@playwright/test";
import { CART_STORAGE_KEY } from "@/lib/cart-types";
import { SALES_DISABLED_CODE, SALES_DISABLED_MESSAGE } from "@/lib/commerce-config";

test("cart and checkout are closed for every handle before catalogue or payment work", async ({
  request,
}) => {
  const payloads = [
    { items: [] },
    {
      items: [
        {
          handle: "confirmed-board",
          productType: "board",
          quantity: 1,
          unitPrice: 275,
          currency: "AUD",
        },
      ],
    },
    {
      items: [
        {
          handle: "photo-review-forged-jacket",
          productType: "merch",
          selectedSize: "M",
          quantity: 1,
          unitPrice: 1,
          currency: "AUD",
        },
      ],
    },
  ];
  for (const data of payloads) {
    const validation = await request.post("/api/cart/validate", { data });
    expect(validation.status()).toBe(403);
    expect(await validation.json()).toMatchObject({
      valid: false,
      code: SALES_DISABLED_CODE,
      verifiedSubtotal: 0,
      itemCount: 0,
      errors: [{ handle: "", field: "sales", message: SALES_DISABLED_MESSAGE }],
    });
    const checkout = await request.post("/api/checkout/create-session", { data });
    expect(checkout.status()).toBe(403);
    expect(await checkout.json()).toEqual({
      code: SALES_DISABLED_CODE,
      error: SALES_DISABLED_MESSAGE,
    });
  }
});

test("sales closure precedes request parsing and board availability reads", async ({ request }) => {
  for (const endpoint of ["/api/cart/validate", "/api/checkout/create-session"]) {
    const response = await request.post(endpoint, {
      data: "{",
      headers: { "Content-Type": "application/json" },
    });
    expect(response.status()).toBe(403);
    expect((await response.json()).code).toBe(SALES_DISABLED_CODE);
  }
  const availability = await request.get("/api/boards/availability?handle=confirmed-board");
  expect(availability.status()).toBe(403);
  expect(await availability.json()).toEqual({
    available: false,
    message: SALES_DISABLED_MESSAGE,
  });
});

test("a stale cart has no purchase UI and the mobile menu has a usable focus boundary", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(
    ({ key }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          items: [
            {
              productId: "stale-board-id",
              handle: "stale-board",
              title: "Stale board",
              productType: "board",
              quantity: 1,
              unitPrice: 275,
              currency: "AUD",
            },
          ],
        }),
      );
    },
    { key: CART_STORAGE_KEY },
  );
  await page.goto("/cart");
  await expect(
    page.getByRole("heading", { name: "Browse the collection", level: 1 }),
  ).toBeVisible();
  await expect(page.getByText(SALES_DISABLED_MESSAGE, { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Cart/ })).toHaveCount(0);
  await expect(page.getByRole("dialog", { name: "Shopping cart" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /checkout|quantity|add.*cart/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "View deckz and wares" })).toHaveAttribute(
    "href",
    "/shop",
  );

  const mobileNavigation = page.getByRole("navigation", {
    name: "Mobile navigation",
    includeHidden: true,
  });
  const openMenu = page.getByRole("button", { name: "Open menu" });
  const menuBox = await openMenu.boundingBox();
  expect(menuBox?.width).toBeGreaterThanOrEqual(44);
  expect(menuBox?.height).toBeGreaterThanOrEqual(44);
  await expect(openMenu).toHaveAttribute("aria-expanded", "false");
  await expect(openMenu).toHaveAttribute("aria-controls", "mobile-navigation");
  await expect(mobileNavigation).toBeHidden();
  await openMenu.click();
  const closeMenu = page.getByRole("button", { name: "Close menu" });
  await expect(closeMenu).toHaveAttribute("aria-expanded", "true");
  const deckz = mobileNavigation.getByRole("link", { name: "Deckz" });
  await expect(deckz).toHaveAttribute("href", "/shop#boards");
  await expect(mobileNavigation.getByRole("link", { name: "Wares" })).toHaveAttribute(
    "href",
    "/shop#merch",
  );
  await deckz.focus();
  await page.keyboard.press("Escape");
  await expect(mobileNavigation).toBeHidden();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
});

test("the homepage links to the public photo catalogue without purchase controls", async ({
  page,
}) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /Explore deckz/ })).toHaveAttribute(
    "href",
    "/shop#boards",
  );
  await expect(page.getByRole("link", { name: /Explore wares/ })).toHaveAttribute(
    "href",
    "/shop#merch",
  );
  const photoLink = page.locator('main a[href^="/shop/"]').first();
  await expect(photoLink).toBeVisible();
  const photo = photoLink.locator("img");
  await expect(photo).toBeVisible();
  expect(decodeURIComponent((await photo.getAttribute("src")) ?? "")).toContain(
    "/catalogue-photos/",
  );
  await expect
    .poll(() => photo.evaluate((image) => (image as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  await expect(page.getByRole("button", { name: /cart|checkout|buy/i })).toHaveCount(0);
  await expect(page.getByRole("dialog", { name: "Shopping cart" })).toHaveCount(0);
  await expect(page.locator("main")).not.toContainText(/\$\s*\d/);
});
