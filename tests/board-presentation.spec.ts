import { expect, test } from "@playwright/test";
import { PUBLIC_CATALOGUE } from "../lib/public-catalogue";

const board = PUBLIC_CATALOGUE.find((item) => item.handle === "board-1")!;

test("catalogue cards change photos without leaving the catalogue", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/shop?category=boards");
  const card = page.locator('[data-catalogue-card="board-1"]');
  const photo = card.locator(".pc-card-link img");
  await expect(photo).toHaveAttribute("alt", board.images[0].alt);
  await card.getByRole("button", { name: "Next photo of Board 01", exact: true }).click();
  await expect(photo).toHaveAttribute("alt", board.images[1].alt);
  await card.getByRole("link", { name: "View Board 01", exact: true }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(photo).toHaveAttribute("alt", board.images[0].alt);
  await expect(page).toHaveURL(/\/shop\?category=boards$/);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/shop\/board-1\?category=boards$/);
  await expect(page.locator("main .pc-board-description")).toHaveText(board.description);
});

for (const width of [360, 1440]) {
  test(`expanded photos share navigation and restore focus at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/shop/board-1");
    const expand = page.getByRole("button", { name: "Expand photos of Board 01", exact: true });
    await expect
      .poll(() =>
        page
          .locator("[data-gallery-image]")
          .evaluate((image) => (image as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
    await page.screenshot({
      path: `C:/Users/rossf/Documents/plankzd/reference-review/board-detail-${width}.png`,
      fullPage: true,
    });
    await expand.click();
    const modal = page.getByRole("dialog", { name: "Full-size photos of Board 01", exact: true });
    await expect(modal).toBeVisible();
    await modal.getByRole("button", { name: "Next full-size photo", exact: true }).click();
    await expect(modal.locator("[data-expanded-image]")).toHaveAttribute(
      "alt",
      board.images[1].alt,
    );
    await page.keyboard.press("End");
    await expect(modal.locator("[data-expanded-image]")).toHaveAttribute(
      "alt",
      board.images.at(-1)!.alt,
    );
    await modal.getByRole("button", { name: "Show full-size photo 1", exact: true }).click();
    await expect(modal.locator("[data-expanded-image]")).toHaveAttribute(
      "alt",
      board.images[0].alt,
    );
    await expect
      .poll(() =>
        modal
          .locator("[data-expanded-image]")
          .evaluate((image) => (image as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
    await page.screenshot({
      path: `C:/Users/rossf/Documents/plankzd/reference-review/board-expanded-${width}.png`,
    });
    const last = modal.getByRole("button", {
      name: `Show full-size photo ${board.images.length}`,
      exact: true,
    });
    await last.focus();
    await page.keyboard.press("Tab");
    await expect(
      modal.getByRole("button", { name: "Close full-size photos", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(last).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(modal).toBeHidden();
    await expect(expand).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}

test("board metadata contains supplied timber only and keeps missing content unpublished", async ({
  page,
  request,
}) => {
  await page.goto("/shop/board-3");
  await expect(page.locator(".pc-board-facts")).toContainText("Jarrah and Marri");
  await expect(page.locator(".pc-board-facts")).not.toContainText(
    /Canadian Maple|116.8|Abec 7|Clear Grip/,
  );
  for (const handle of ["board-2", "board-7", "board-11"]) {
    expect((await request.get(`/shop/${handle}`)).status()).toBe(404);
  }
  await page.goto("/gallery");
  const collection = page.getByRole("region", { name: "The board collection", exact: true });
  await expect(collection.locator("[data-catalogue-card]")).toHaveCount(5);
  await expect(
    collection.locator('[data-catalogue-card="board-1"] .pc-board-description'),
  ).toHaveText(board.description);
  await expect(
    collection.locator('[data-catalogue-card="board-1"] .pc-logo-overlay'),
  ).toHaveAttribute("src", /plankz-og-logo/);
});

test("a failed catalogue photo keeps navigation usable", async ({ page }) => {
  await page.route("**/_next/image?*", async (route) => {
    const imageUrl = new URL(route.request().url()).searchParams.get("url");
    if (imageUrl === board.images[0].url) await route.abort();
    else await route.continue();
  });
  await page.goto("/shop?category=boards");
  const card = page.locator('[data-catalogue-card="board-1"]');
  await expect(card.getByText("Photo unavailable", { exact: true })).toBeVisible();
  await card.getByRole("button", { name: "Next photo of Board 01", exact: true }).click();
  await expect(card.locator(".pc-card-link img")).toHaveAttribute("alt", board.images[1].alt);
  await expect
    .poll(() =>
      card
        .locator(".pc-card-link img")
        .evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
});

test("touch navigation changes catalogue and full-size photos without following the card link", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const session = await context.newCDPSession(page);
  async function swipe(selector: string) {
    const frame = page.locator(selector);
    await frame.scrollIntoViewIfNeeded();
    const box = await frame.boundingBox();
    expect(box).not.toBeNull();
    const y = box!.y + box!.height * 0.5;
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: box!.x + box!.width * 0.75, y, id: 1 }],
    });
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: box!.x + box!.width * 0.25, y, id: 1 }],
    });
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  }
  try {
    await page.goto("/shop?category=boards");
    const card = page.locator('[data-catalogue-card="board-1"]');
    // Prove hydration before sending continuous touch input.
    await card.getByRole("button", { name: "Next photo of Board 01", exact: true }).click();
    await expect(card.locator(".pc-card-link img")).toHaveAttribute("alt", board.images[1].alt);
    await swipe('[data-catalogue-card="board-1"] .pc-card-frame');
    await expect(card.locator(".pc-card-link img")).toHaveAttribute("alt", board.images[2].alt);
    await expect(page).toHaveURL(/\/shop\?category=boards$/);
    await card.getByRole("link", { name: "View Board 01", exact: true }).click();
    await page.getByRole("button", { name: "Expand photos of Board 01", exact: true }).click();
    await swipe(".pc-lightbox-frame");
    await expect(page.locator("[data-expanded-image]")).toHaveAttribute("alt", board.images[1].alt);
  } finally {
    await session.detach();
    await context.close();
  }
});
