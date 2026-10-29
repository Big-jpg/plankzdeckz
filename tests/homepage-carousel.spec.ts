import { expect, test } from "@playwright/test";
import { getPublicCatalogueItems } from "../lib/public-catalogue";

const boards = getPublicCatalogueItems("boards").slice(0, 5);

test("featured photographs rotate, pause for interaction and resume only on request", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  const carousel = page.getByRole("region", { name: "Featured board photographs" });
  const image = carousel.locator("[data-homepage-slide] img");
  await expect(carousel.getByRole("button", { name: /^Show featured photograph/ })).toHaveCount(5);
  await expect(image).toHaveAttribute("alt", boards[0].images[0].alt);
  await expect(carousel.getByRole("button", { name: "Pause automatic rotation" })).toBeVisible();
  await page.clock.runFor(6100);
  await expect(image).toHaveAttribute("alt", boards[1].images[0].alt);

  await carousel.getByRole("button", { name: "Next featured photograph" }).click();
  await expect(image).toHaveAttribute("alt", boards[2].images[0].alt);
  await expect(carousel.getByRole("button", { name: "Resume automatic rotation" })).toBeVisible();
  await page.getByRole("heading", { level: 1 }).click();
  await page.clock.runFor(13000);
  await expect(image).toHaveAttribute("alt", boards[2].images[0].alt);

  await carousel.getByRole("button", { name: "Resume automatic rotation" }).click();
  await page.getByRole("heading", { level: 1 }).click();
  await page.clock.runFor(6100);
  await expect(image).toHaveAttribute("alt", boards[3].images[0].alt);
});

for (const width of [360, 768, 1440]) {
  test(`featured photographs support keyboard and responsive navigation at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const carousel = page.getByRole("region", { name: "Featured board photographs" });
    const image = carousel.locator("[data-homepage-slide] img");
    await carousel.focus();
    await page.keyboard.press("ArrowRight");
    await expect(image).toHaveAttribute("alt", boards[1].images[0].alt);
    await page.keyboard.press("End");
    await expect(image).toHaveAttribute("alt", boards[4].images[0].alt);
    await page.keyboard.press("ArrowRight");
    await expect(image).toHaveAttribute("alt", boards[0].images[0].alt);
    await carousel
      .getByRole("button", { name: `Show featured photograph 4: ${boards[3].title}` })
      .click();
    await expect(image).toHaveAttribute("alt", boards[3].images[0].alt);
    await expect(carousel.getByRole("link", { name: `View ${boards[3].title}` })).toHaveAttribute(
      "href",
      `/shop/${boards[3].handle}`,
    );
    await expect
      .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await expect(page.getByText("Board photographs · lifestyle images to follow")).toBeVisible();
    await expect(page.locator("header")).toContainText("HAND-CRAFTED SKATEBOARD DECKZ");
  });
}

test("reduced motion disables automatic rotation and missing images retain their detail link", async ({
  page,
}) => {
  await page.clock.install();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/_next/image*", async (route) => {
    const source = new URL(route.request().url()).searchParams.get("url");
    if (source === boards[0].images[0].url) await route.abort();
    else await route.continue();
  });
  await page.goto("/");
  const carousel = page.getByRole("region", { name: "Featured board photographs" });
  await expect(
    carousel.getByRole("button", { name: "Automatic rotation disabled for reduced motion" }),
  ).toBeDisabled();
  await expect(carousel.getByRole("status")).toContainText("Photograph unavailable");
  await page.clock.runFor(18000);
  await expect(carousel.getByRole("link", { name: `View ${boards[0].title}` })).toHaveAttribute(
    "href",
    `/shop/${boards[0].handle}`,
  );
  await carousel.getByRole("button", { name: "Next featured photograph" }).click();
  await expect(carousel.locator("[data-homepage-slide] img")).toHaveAttribute(
    "alt",
    boards[1].images[0].alt,
  );
});

test("featured photographs accept horizontal touch swipes", async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    baseURL,
    hasTouch: true,
    viewport: { width: 390, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  try {
    await page.goto("/");
    const carousel = page.getByRole("region", { name: "Featured board photographs" });
    const frame = carousel.locator("[data-homepage-slide]");
    await frame.scrollIntoViewIfNeeded();
    const bounds = await frame.boundingBox();
    expect(bounds).not.toBeNull();
    const y = bounds!.y + bounds!.height / 2;
    const session = await context.newCDPSession(page);
    try {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: bounds!.x + bounds!.width * 0.8, y, id: 1 }],
      });
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: bounds!.x + bounds!.width * 0.2, y, id: 1 }],
      });
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    } finally {
      await session.detach();
    }
    await expect(frame.locator("img")).toHaveAttribute("alt", boards[1].images[0].alt);
    await expect(
      carousel.getByRole("button", { name: `Show featured photograph 2: ${boards[1].title}` }),
    ).toHaveAttribute("aria-pressed", "true");
  } finally {
    await context.close();
  }
});
