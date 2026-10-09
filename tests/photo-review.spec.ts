import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type APIResponse, type Page } from "@playwright/test";
import type { PhotoReviewItem } from "@/lib/photo-review";

const productionCheck = process.env.PHOTO_REVIEW_TEST_MODE === "production";
const manifestPath = join(process.cwd(), ".photo-intake", "display-catalogue.json");
const items: PhotoReviewItem[] = existsSync(manifestPath)
  ? (JSON.parse(readFileSync(manifestPath, "utf8")) as { items: PhotoReviewItem[] }).items
  : [];

async function expectDisplayOnly(page: Page) {
  const display = page.locator("[data-photo-review]:visible");
  await expect(display).toBeVisible();
  await expect(display).not.toContainText(/(?:AUD|USD|[$€£])\s*\d/);
  await expect(display).not.toContainText(/\b(?:in stock|out of stock|sold out|available soon)\b/i);
  await expect(
    display.getByRole("button", { name: /add.*cart|buy|quantity|select size/i }),
  ).toHaveCount(0);
  await expect(
    display.locator('input, select, [itemtype*="Product"], [itemtype*="Offer"]'),
  ).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  const structuredData = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(structuredData.join(" ")).not.toMatch(/"(?:Product|Offer)"/);
}

async function expectImageDecoded(image: ReturnType<Page["locator"]>) {
  await image.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0),
    )
    .toBe(true);
}

async function expectNoReviewContent(response: APIResponse) {
  // A notFound() reached after streaming begins can have HTTP 200 in Next.js.
  expect([200, 404]).toContain(response.status());
  const html = await response.text();
  expect(html).not.toContain("data-photo-review");
  if (response.headers()["x-robots-tag"]?.includes("noindex")) return;
  expect(html).toMatch(/name="robots" content="[^"]*noindex/);
}

test("photo review rejects unknown handles and unsafe image names", async ({ request }) => {
  await expectNoReviewContent(await request.get("/photo-review/photo-review-missing"));
  for (const path of [
    "/photo-review/images/not-a-derivative.webp",
    "/photo-review/images/0123456789ab-1600.png",
  ]) {
    expect((await request.get(path)).status()).toBe(404);
  }
});

test("photo review is unavailable without a reviewed local manifest", async ({ request }) => {
  test.skip(productionCheck, "Production has an unconditional route boundary.");
  const backupPath = `${manifestPath}.test-backup`;
  const hadManifest = existsSync(manifestPath);
  expect(existsSync(backupPath)).toBe(false);
  if (hadManifest) renameSync(manifestPath, backupPath);
  try {
    await expectNoReviewContent(await request.get("/photo-review"));
  } finally {
    if (hadManifest) renameSync(backupPath, manifestPath);
  }
});

test("production rejects photo pages and private image bytes", async ({ request }) => {
  test.skip(
    !productionCheck,
    "Set PHOTO_REVIEW_TEST_MODE=production against a production-mode server.",
  );
  for (const path of [
    "/photo-review",
    `/photo-review/${items[0]?.handle ?? "photo-review-board-1"}`,
    items[0]?.images[0].url ?? "/photo-review/images/0123456789ab-1600.webp",
  ]) {
    expect((await request.get(path)).status()).toBe(404);
  }
});

test("unreviewable display manifests fail closed without commerce fields", async ({ request }) => {
  test.skip(productionCheck || items.length === 0, "Requires the private local manifest.");
  const original = readFileSync(manifestPath);
  const first = items[0];
  const invalid = [
    { items: [{ ...first, price: 1 }] },
    { items: [{ ...first, purchasable: true }] },
    { items: [{ ...first, category: "unknown" }] },
    { items: [first, first] },
    { items: [{ ...first, images: [{ ...first.images[0], alt: "" }] }] },
    {
      items: [
        { ...first, images: [{ ...first.images[0], url: "https://example.com/photo.webp" }] },
      ],
    },
  ];
  try {
    for (const manifest of invalid) {
      writeFileSync(manifestPath, JSON.stringify(manifest));
      await expectNoReviewContent(await request.get("/photo-review"));
    }
  } finally {
    writeFileSync(manifestPath, original);
  }
});

test.describe("reviewed local photographs", () => {
  test.skip(
    productionCheck || items.length === 0,
    "Requires the reviewed private intake manifest in development.",
  );

  for (const width of [360, 390, 768, 1440]) {
    test(`display layout and keyboard gallery at ${width}px`, async ({ page }, testInfo) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(() => {
        const state = window as typeof window & { photoReviewCls: number };
        state.photoReviewCls = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
            if (!shift.hadRecentInput) state.photoReviewCls += shift.value;
          }
        }).observe({ type: "layout-shift", buffered: true });
      });
      const failures: string[] = [];
      page.on("pageerror", (error) => failures.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") failures.push(message.text());
      });
      page.on("response", (response) => {
        if (response.url().includes("/photo-review/images/") && !response.ok()) {
          failures.push(`${response.status()} ${response.url()}`);
        }
      });

      expect((await page.goto("/photo-review"))?.status()).toBe(200);
      await expectDisplayOnly(page);
      await expectImageDecoded(page.locator("[data-photo-review]:visible img").first());
      const initialPayload = await page.evaluate(() => ({
        cls: (window as typeof window & { photoReviewCls: number }).photoReviewCls,
        images: performance
          .getEntriesByType("resource")
          .filter((entry) => entry.name.includes("/photo-review/images/"))
          .map((entry) => {
            const resource = entry as PerformanceResourceTiming;
            return {
              url: new URL(entry.name).pathname,
              encodedBodyBytes: resource.encodedBodySize,
              transferBytes: resource.transferSize,
              durationMs: resource.duration,
            };
          }),
      }));
      writeFileSync(
        testInfo.outputPath(`payload-${width}.json`),
        JSON.stringify(initialPayload, null, 2),
      );
      for (const category of new Set(items.map((item) => item.category))) {
        await expect(page.locator(`section#${category}`)).toBeVisible();
      }
      for (const item of items) {
        const card = page.locator(`a[href="/photo-review/${item.handle}"]`);
        await expect(card).toContainText(item.title);
        await expect(card.locator("img")).toHaveAttribute("alt", item.images[0].alt);
        await expect(card.locator("img")).toHaveAttribute(
          "src",
          item.images[0].url.replace(/-1600\.webp$/, "-800.webp"),
        );
        await expectImageDecoded(card.locator("img"));
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: testInfo.outputPath(`photo-review-${width}.png`),
        fullPage: true,
      });
      await page.screenshot({ path: testInfo.outputPath(`photo-review-viewport-${width}.png`) });
      const indexCls = await page.evaluate(
        () => (window as typeof window & { photoReviewCls: number }).photoReviewCls,
      );
      expect(indexCls).toBeLessThanOrEqual(0.1);

      const item = items.find((entry) => entry.images.length > 1) ?? items[0];
      await page.goto(`/photo-review/${item.handle}`);
      await expectDisplayOnly(page);
      const gallery = page.locator("[data-photo-gallery]:visible");
      const mainImage = gallery.locator("img").first();
      await expect(mainImage).toHaveAttribute("alt", item.images[0].alt);
      if (item.images.length > 1) {
        const secondPhoto = gallery.getByRole("button").nth(1);
        await secondPhoto.focus();
        await expect(secondPhoto).toBeFocused();
        await secondPhoto.press("Enter");
        await expect(secondPhoto).toHaveAttribute("aria-pressed", "true");
        await expect(mainImage).toHaveAttribute("src", item.images[1].url);
        await expect(mainImage).toHaveAttribute("alt", item.images[1].alt);
      }
      await expectImageDecoded(mainImage);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: testInfo.outputPath(`photo-detail-${width}.png`),
        fullPage: true,
      });
      const detailPayload = await page.evaluate(() => ({
        cls: (window as typeof window & { photoReviewCls: number }).photoReviewCls,
        images: performance
          .getEntriesByType("resource")
          .filter((entry) => entry.name.includes("/photo-review/images/"))
          .map((entry) => {
            const resource = entry as PerformanceResourceTiming;
            return {
              url: new URL(entry.name).pathname,
              encodedBodyBytes: resource.encodedBodySize,
              transferBytes: resource.transferSize,
              durationMs: resource.duration,
            };
          }),
      }));
      expect(detailPayload.cls).toBeLessThanOrEqual(0.1);
      writeFileSync(
        testInfo.outputPath(`detail-payload-${width}.json`),
        JSON.stringify({ indexCls, ...detailPayload }, null, 2),
      );
      expect(failures).toEqual([]);
    });
  }

  test("touch gallery selects the requested photograph", async ({ browser }, testInfo) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });
    try {
      const page = await context.newPage();
      const item = items.find((entry) => entry.category === "jackets") ?? items[0];
      await page.goto(`/photo-review/${item.handle}`);
      await expectDisplayOnly(page);
      const gallery = page.locator("[data-photo-gallery]:visible");
      const thumbnail = gallery.getByRole("button").nth(1);
      await thumbnail.tap();
      await expect(thumbnail).toHaveAttribute("aria-pressed", "true");
      await expect(gallery.locator("img").first()).toHaveAttribute("src", item.images[1].url);
      await expectImageDecoded(gallery.locator("img").first());
      await page.screenshot({
        path: testInfo.outputPath("photo-jacket-touch-390.png"),
        fullPage: true,
      });
    } finally {
      await context.close();
    }
  });

  test("every item and view matches the reviewed manifest without purchase controls", async ({
    page,
    request,
  }) => {
    test.setTimeout(180_000);
    for (const item of items) {
      expect((await page.goto(`/photo-review/${item.handle}`))?.status()).toBe(200);
      await expectDisplayOnly(page);
      await expect(
        page.locator("[data-photo-review]:visible").getByRole("heading", { level: 1 }),
      ).toHaveText(item.title);
      if (item.category === "jackets") {
        await expect(page.locator("[data-photo-review]:visible")).toContainText(
          "Not available for sale",
        );
      }
      const gallery = page.locator("[data-photo-gallery]:visible");
      const mainImage = gallery.locator("img").first();
      for (const [index, image] of item.images.entries()) {
        if (item.images.length > 1) await gallery.getByRole("button").nth(index).click();
        await expect(mainImage).toHaveAttribute("src", image.url);
        await expect(mainImage).toHaveAttribute("alt", image.alt);
        await expectImageDecoded(mainImage);
        const response = await request.get(image.url);
        expect(response.status()).toBe(200);
        expect(response.headers()["content-type"]).toBe("image/webp");
        expect(response.headers()["cache-control"]).toContain("no-store");
        expect(response.headers()["x-content-type-options"]).toBe("nosniff");
      }
    }
  });
});
