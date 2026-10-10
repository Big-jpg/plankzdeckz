import { expect, test, type Page } from "@playwright/test";
import { PUBLIC_CATALOGUE, PUBLIC_CATALOGUE_CATEGORIES } from "../lib/public-catalogue";

async function expectClosedCatalogue(page: Page) {
  const main = page.locator("main");
  await expect(main.getByText("Online sales are currently closed", { exact: true })).toBeVisible();
  await expect(main).not.toContainText(/\$\s*\d|£\s*\d|€\s*\d|in stock|sold out|available soon/i);
  await expect(
    main.getByRole("button", { name: /add to cart|buy|checkout|quantity|choose size/i }),
  ).toHaveCount(0);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
}

test("public catalogue contains the reviewed 18 sets and serves all 54 selected photos", async ({
  request,
}) => {
  expect(PUBLIC_CATALOGUE).toHaveLength(18);
  expect(PUBLIC_CATALOGUE.flatMap((item) => item.images)).toHaveLength(54);
  expect(PUBLIC_CATALOGUE.every((item) => item.purchasable === false)).toBe(true);
  for (const item of PUBLIC_CATALOGUE) {
    for (const image of item.images) {
      const response = await request.get(image.url);
      expect(response.status(), image.url).toBe(200);
      expect(response.headers()["content-type"]).toContain("image/webp");
      expect(image.alt.trim().length).toBeGreaterThan(0);
    }
  }
});

for (const width of [360, 390, 768, 1440]) {
  test(`browse, filter and gallery navigation work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400 && /catalogue-photos|_next\/image/.test(response.url())) {
        errors.push(`Image response ${response.status()}: ${response.url()}`);
      }
    });

    await page.goto("/shop", { waitUntil: "domcontentloaded" });
    await expectClosedCatalogue(page);
    await expect(page.locator("[data-catalogue-card]")).toHaveCount(18);
    await expect(page.locator("#boards")).toHaveCount(1);
    await expect(page.locator("#merch")).toHaveCount(1);

    const categoryNav = page.getByRole("navigation", { name: "Catalogue categories" });
    await categoryNav.getByRole("link", { name: /^Hats/ }).click();
    await expect(page).toHaveURL(/\/shop\?category=hats#catalogue$/);
    await expect(page.locator("[data-catalogue-card]")).toHaveCount(5);
    await expect(categoryNav.getByRole("link", { name: /^Hats/ })).toHaveAttribute(
      "aria-current",
      "page",
    );

    const hat = PUBLIC_CATALOGUE.find((item) => item.handle === "hat-beige")!;
    const card = page.locator('[data-catalogue-card="hat-beige"] a');
    await card.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/shop\/hat-beige\?category=hats$/);
    await expectClosedCatalogue(page);
    await expect(
      page.getByRole("heading", { name: hat.title, exact: true, level: 1 }),
    ).toBeVisible();
    const gallery = page.getByRole("region", { name: `Photos of ${hat.title}` });
    const photo = gallery.locator("[data-gallery-image]");
    const thumbnails = gallery.locator(".pc-gallery-thumbnails img");
    await expect(thumbnails).toHaveCount(hat.images.length);
    await expect
      .poll(() =>
        thumbnails.evaluateAll((images) =>
          images.every(
            (image) =>
              (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0,
          ),
        ),
      )
      .toBe(true);
    await expect(photo).toHaveAttribute("alt", hat.images[0].alt);
    await gallery.getByRole("button", { name: "Next photo", exact: true }).click();
    await expect(photo).toHaveAttribute("alt", hat.images[1].alt);
    await gallery.focus();
    await page.keyboard.press("ArrowRight");
    await expect(photo).toHaveAttribute("alt", hat.images[2].alt);
    await gallery.getByRole("button", { name: "Previous photo", exact: true }).click();
    await expect(photo).toHaveAttribute("alt", hat.images[1].alt);
    const firstThumb = gallery.getByRole("button", {
      name: `Show photo 1: ${hat.images[0].alt}`,
      exact: true,
    });
    await firstThumb.click();
    await expect(firstThumb).toHaveAttribute("aria-pressed", "true");
    await expect(
      gallery.getByRole("link", { name: "Open larger photo 1 in a new tab", exact: true }),
    ).toHaveAttribute("href", hat.images[0].url);
    await expect
      .poll(() =>
        photo.evaluate(
          (image) =>
            (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0,
        ),
      )
      .toBe(true);
    await expectClosedCatalogue(page);

    await page.getByRole("link", { name: "Back to hats", exact: true }).click();
    await expect(page.locator("[data-catalogue-card]")).toHaveCount(5);
    await page
      .getByRole("navigation", { name: "Catalogue categories" })
      .getByRole("link", { name: /^All / })
      .click();
    await expect(page.locator("[data-catalogue-card]")).toHaveCount(18);
    expect(errors).toEqual([]);
  });
}

test("category browsing and every detail photo remain accessible without JavaScript", async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(60_000);
  const context = await browser.newContext({
    baseURL,
    reducedMotion: "reduce",
    javaScriptEnabled: false,
    viewport: { width: 390, height: 900 },
  });
  const page = await context.newPage();
  await page.goto("/shop", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-catalogue-card]")).toHaveCount(18);
  for (const category of PUBLIC_CATALOGUE_CATEGORIES) {
    await page
      .getByRole("navigation", { name: "Catalogue categories" })
      .getByRole("link", { name: new RegExp(`^${category.title}`) })
      .click();
    await expect(page).toHaveURL(new RegExp(`category=${category.key}#catalogue$`));
    await expect(page.locator("[data-catalogue-card]")).toHaveCount(
      PUBLIC_CATALOGUE.filter((item) => item.category === category.key).length,
    );
  }
  await page.goto("/shop/board-1", { waitUntil: "domcontentloaded" });
  const board = PUBLIC_CATALOGUE.find((item) => item.handle === "board-1")!;
  const thumbnails = page.locator(".pc-gallery-thumbnails img");
  await expect(thumbnails).toHaveCount(board.images.length);
  await expect
    .poll(() =>
      thumbnails.evaluateAll((images) =>
        images.every(
          (image) =>
            (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0,
        ),
      ),
    )
    .toBe(true);
  const links = page.locator(".pc-gallery-fallback a");
  await expect(links).toHaveCount(board.images.length);
  for (let index = 0; index < board.images.length; index += 1) {
    await expect(links.nth(index)).toHaveAttribute("href", board.images[index].url);
    await expect(links.nth(index)).toBeVisible();
  }
  await context.close();
});

test("touch gallery changes the photo while jacket sales stay disabled", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  try {
    const page = await context.newPage();
    await page.goto("/shop/jacket-beige", { waitUntil: "domcontentloaded" });
    await expectClosedCatalogue(page);
    const jacket = PUBLIC_CATALOGUE.find((item) => item.handle === "jacket-beige")!;
    const gallery = page.getByRole("region", { name: `Photos of ${jacket.title}` });
    const photo = gallery.locator("[data-gallery-image]");

    // Static copy can render before hydration. Verify interaction before continuous touch events.
    await gallery.getByRole("button", { name: "Next photo", exact: true }).click();
    await expect(photo).toHaveAttribute("alt", jacket.images[1].alt);
    await gallery.getByRole("button", { name: "Previous photo", exact: true }).click();
    await expect(photo).toHaveAttribute("alt", jacket.images[0].alt);

    const frame = gallery.locator(".pc-gallery-frame");
    await frame.scrollIntoViewIfNeeded();
    const bounds = await frame.boundingBox();
    expect(bounds).not.toBeNull();
    const startX = bounds!.x + bounds!.width * 0.75;
    const endX = bounds!.x + bounds!.width * 0.25;
    const y = bounds!.y + bounds!.height * 0.5;
    const session = await context.newCDPSession(page);
    try {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: startX, y, id: 1 }],
      });
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: endX, y, id: 1 }],
      });
      await session.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      await expect(photo).toHaveAttribute("alt", jacket.images[1].alt);
      await expect(page.getByRole("heading", { name: "More jackets" })).toBeVisible();
    } finally {
      await session.detach();
    }
  } finally {
    await context.close();
  }
});

test("unknown public handles return 404", async ({ request }) => {
  expect((await request.get("/shop/not-a-catalogue-item")).status()).toBe(404);
});
