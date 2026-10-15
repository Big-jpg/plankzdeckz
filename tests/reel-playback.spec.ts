import { expect, test, type Page } from "@playwright/test";

const reelSelector = "figure[data-reel-policy]";
const reelCount = 6;

// These checks intentionally cover a narrow mobile viewport without changing the global suite.
test.use({ viewport: { width: 390, height: 844 }, reducedMotion: "no-preference" });

async function openHome(page: Page) {
  await page.goto("/");
  await expect(page.locator(reelSelector)).toHaveCount(reelCount);
  await expect(page.locator(`${reelSelector}[data-reel-policy='pending']`)).toHaveCount(0);
}

function trackVideoRequests(page: Page) {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (/\/media\/reels\/.*\.(mp4|m4v)(?:\?|$)/.test(request.url())) {
      requests.push(request.url());
    }
  });
  return requests;
}

test("server-rendered home contains posters, not eager video elements", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBeTruthy();
  const html = await response.text();
  expect(html).toContain('alt="Coastal Plankz Deckz board and workshop reel"');
  expect(html).not.toMatch(/<video\b/i);
});

test("reduced motion never requests a reel, including the priority hero", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const requests = trackVideoRequests(page);
  await openHome(page);
  await page.locator(reelSelector).last().scrollIntoViewIfNeeded();

  await expect(page.locator(`${reelSelector}[data-reel-policy='poster']`)).toHaveCount(reelCount);
  await expect(page.locator(`${reelSelector} video`)).toHaveCount(0);
  expect(requests).toEqual([]);
});

test("Save-Data keeps every reel poster-only", async ({ page }) => {
  await page.addInitScript(() => {
    const connection = Object.assign(new EventTarget(), { saveData: true });
    Object.defineProperty(navigator, "connection", { configurable: true, value: connection });
  });
  const requests = trackVideoRequests(page);
  await openHome(page);
  await page.locator(reelSelector).last().scrollIntoViewIfNeeded();

  await expect(page.locator(`${reelSelector}[data-reel-policy='poster']`)).toHaveCount(reelCount);
  await expect(page.locator(`${reelSelector} video`)).toHaveCount(0);
  expect(requests).toEqual([]);
});

test("reels load on entry, pause off-screen, and resume on return", async ({ page }) => {
  await openHome(page);
  const first = page.locator(reelSelector).first();
  const last = page.locator(reelSelector).last();
  await expect(last.locator("video")).toHaveCount(0);

  await first.scrollIntoViewIfNeeded();
  const firstVideo = first.locator("video");
  await expect(firstVideo).toHaveJSProperty("paused", false);

  await last.scrollIntoViewIfNeeded();
  await expect(last.locator("video")).toHaveJSProperty("paused", false);
  await expect(firstVideo).toHaveJSProperty("paused", true);

  await first.scrollIntoViewIfNeeded();
  await expect(firstVideo).toHaveJSProperty("paused", false);
  await expect(last.locator("video")).toHaveJSProperty("paused", true);
});

test("visibility changes pause and resume an in-view reel", async ({ page }) => {
  await openHome(page);
  const first = page.locator(reelSelector).first();
  await first.scrollIntoViewIfNeeded();
  const video = first.locator("video");
  await expect(video).toHaveJSProperty("paused", false);

  // Simulate tab visibility deterministically; real-device backgrounding remains a manual check.
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(video).toHaveJSProperty("paused", true);

  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(video).toHaveJSProperty("paused", false);
});

test("blocked autoplay does not replace the poster at canplay", async ({ page }) => {
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = function () {
      return Promise.reject(new DOMException("Autoplay blocked for test", "NotAllowedError"));
    };
  });
  await openHome(page);
  const first = page.locator(reelSelector).first();
  await first.scrollIntoViewIfNeeded();
  const video = first.locator("video");
  await expect(video).toHaveCount(1);
  await video.evaluate((element) => element.dispatchEvent(new Event("canplay")));

  await expect(video).toHaveCSS("opacity", "0");
  await expect(first.locator("img")).toBeVisible();
});

test("enabling reduced motion stops and removes existing videos", async ({ page }) => {
  await openHome(page);
  const first = page.locator(reelSelector).first();
  await first.scrollIntoViewIfNeeded();
  await expect(first.locator("video")).toHaveJSProperty("paused", false);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(`${reelSelector}[data-reel-policy='poster']`)).toHaveCount(reelCount);
  await expect(page.locator(`${reelSelector} video`)).toHaveCount(0);
  await expect(first.locator("img")).toBeVisible();
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("all reels retain a visible poster fallback", async ({ page }) => {
    await page.goto("/");
    const reels = page.locator(reelSelector);
    await expect(reels).toHaveCount(reelCount);
    await expect(page.locator(`${reelSelector} video`)).toHaveCount(0);

    for (let index = 0; index < reelCount; index += 1) {
      const reel = reels.nth(index);
      await reel.scrollIntoViewIfNeeded();
      await expect(reel.locator("img")).toBeVisible();
      await expect(reel).toHaveCSS("opacity", "1");
    }
  });
});
