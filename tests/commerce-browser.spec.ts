import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { expect, test, type Page } from "@playwright/test";
import type { ProductInput } from "@/server/catalogue/product-input";
import type { MerchKind } from "@/lib/types";
import type { CartItem, CartState } from "@/lib/cart-types";

const databaseUrl = process.env.COMMERCE_BROWSER_DATABASE_URL;
const enabled = Boolean(databaseUrl) && process.env.NEXT_PUBLIC_SALES_ENABLED === "true";
const appUrl = process.env.PLAYWRIGHT_BASE_URL;
const loopback = new Set(["127.0.0.1", "localhost", "[::1]"]);
if (databaseUrl) {
  const target = new URL(databaseUrl);
  if (!loopback.has(target.hostname) || target.pathname !== "/plankz_commerce_browser")
    throw new Error(
      "Refusing browser fixture writes outside the isolated loopback commerce browser database.",
    );
}
if (enabled && (!appUrl || !loopback.has(new URL(appUrl).hostname)))
  throw new Error("Commerce browser acceptance requires an explicitly supplied loopback app URL.");

test.skip(
  !enabled,
  "Requires isolated COMMERCE_BROWSER_DATABASE_URL and an enabled local commerce server.",
);
test.describe.configure({ mode: "serial" });

let database: Pool;
const adminToken = randomUUID();
const memberToken = randomUUID();
const fixturePrefix = `browser-${randomUUID().slice(0, 8)}`;
const imageUrl = "https://commerce-fixture.public.blob.vercel-storage.com/isolated-fixture.svg";
const simulatedImage = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="#ede7db"/><rect x="250" y="100" width="300" height="400" rx="100" fill="#a8794d"/><text x="400" y="550" text-anchor="middle" font-family="sans-serif" font-size="22">Isolated fixture · simulated image bytes</text></svg>`;

function product(kind: "board" | MerchKind, suffix: string): ProductInput {
  const board = kind === "board";
  return {
    revision: 0,
    handle: `${fixturePrefix}-${suffix}`,
    title: `Fixture ${suffix} ${fixturePrefix}`,
    description:
      "Isolated commerce acceptance fixture. Image URL persistence is tested; image bytes are simulated.",
    productType: board ? "board" : "merch",
    merchKind: board ? null : kind,
    priceAmount: board ? 27500 : 3500,
    publicationStatus: "draft",
    images: [{ url: imageUrl, alt: "Simulated fixture image for isolated acceptance" }],
    boardStyle: board ? "cruiser" : null,
    boardShape: board ? "Fixture cruiser" : "",
    timberSpecies: board ? ["Fixture timber"] : [],
    lengthCm: board ? 75 : null,
    widthCm: board ? 22 : null,
    thicknessCm: board ? 1.2 : null,
    availabilityStatus: "available",
    stockQuantity: board ? 1 : 0,
    stockBySize: board
      ? {}
      : kind === "tee" || kind === "jacket"
        ? { XS: 2, XXL: 0 }
        : { "One size": 4 },
    fitNotes: "Fixture fit",
    salesUnitLabel: board
      ? ""
      : kind === "bearings"
        ? "Set of eight bearings"
        : kind === "sticker"
          ? "Pack of five stickers"
          : `One ${kind}`,
    adjustmentReason: "Isolated acceptance fixture stock",
  };
}

async function seedSession(email: string, token: string) {
  const user = await database.query<{ id: string }>(
    "INSERT INTO users(email,email_verified,name) VALUES($1,now(),'Isolated acceptance operator') ON CONFLICT(email) DO UPDATE SET email_verified=now() RETURNING id",
    [email],
  );
  await database.query(
    "INSERT INTO sessions(session_token,user_id,expires) VALUES($1,$2,now()+interval '1 hour')",
    [token, user.rows[0].id],
  );
}

async function stubImages(page: Page) {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    const isFixture =
      url.href.startsWith(imageUrl) ||
      (url.pathname === "/_next/image" && url.searchParams.get("url") === imageUrl);
    if (isFixture)
      return route.fulfill({ status: 200, contentType: "image/svg+xml", body: simulatedImage });
    if (url.origin !== new URL(appUrl!).origin) return route.abort();
    return route.continue();
  });
}

test.beforeAll(async () => {
  database = new Pool({ connectionString: databaseUrl, max: 3 });
  await seedSession("commerce-admin@example.test", adminToken);
  await seedSession(`${fixturePrefix}-member@example.test`, memberToken);
});
test.beforeEach(async ({ page }) => {
  await page.context().addCookies([
    {
      name: "authjs.session-token",
      value: adminToken,
      url: appUrl!,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  await stubImages(page);
  // This random session exists only in the guarded fixture database. Confirm the app uses it before mutations.
  const admin = await page.request.get("/admin/products", { maxRedirects: 0 });
  expect(
    admin.status(),
    "The local app must authenticate against the guarded fixture database",
  ).toBe(200);
  expect(await admin.text()).toContain("commerce-admin@example.test");
  const shop = await page.request.get("/shop");
  expect(await shop.text(), "This suite requires commerce enabled on the local server").toContain(
    "Available products",
  );
});
test.afterAll(async () => {
  if (database) {
    await database.query("DELETE FROM sessions WHERE session_token=ANY($1::text[])", [
      [adminToken, memberToken],
    ]);
    await database.end();
  }
});

test("authenticated HTTP product lifecycle persists and publishes all commerce categories", async ({
  page,
}, testInfo) => {
  const inputs: Array<ProductInput & { id: string; revision: number }> = [];
  for (const kind of [
    "board",
    "tee",
    "hat",
    "jacket",
    "bearings",
    "sticker",
    "truck",
    "wheel",
  ] as const) {
    const valid = product(kind, kind);
    const draft = {
      ...valid,
      description: "",
      priceAmount: 0,
      images: [],
      stockQuantity: 0,
      stockBySize:
        kind === "board" ? {} : kind === "tee" || kind === "jacket" ? {} : { "One size": 0 },
    };
    const createdResponse = await page.request.post("/api/admin/products", { data: draft });
    expect(createdResponse.status(), await createdResponse.text()).toBe(201);
    const created = (await createdResponse.json()) as { id: string; revision: number };
    const hiddenDraft = await page.request.get(`/products/${valid.handle}`);
    // A streamed Next.js not-found response can retain HTTP 200 after its loading shell.
    expect([200, 404]).toContain(hiddenDraft.status());
    const hiddenDraftHtml = await hiddenDraft.text();
    expect(hiddenDraftHtml).toContain("Product Not Found");
    expect(hiddenDraftHtml).not.toContain(valid.title);
    const invalidPublish = await page.request.put(`/api/admin/products/${created.id}`, {
      data: { ...draft, publicationStatus: "published", revision: created.revision },
    });
    expect(invalidPublish.status()).toBe(400);
    const publishedResponse = await page.request.put(`/api/admin/products/${created.id}`, {
      data: { ...valid, publicationStatus: "published", revision: created.revision },
    });
    expect(publishedResponse.status(), await publishedResponse.text()).toBe(200);
    const published = (await publishedResponse.json()) as { revision: number };
    const persisted = (
      await database.query(
        "SELECT publication_status,price_amount,image_details,stock_quantity,stock_by_size,metadata FROM products WHERE id=$1",
        [created.id],
      )
    ).rows[0];
    expect(persisted).toMatchObject({
      publication_status: "published",
      price_amount: valid.priceAmount,
      image_details: valid.images,
      stock_quantity: valid.stockQuantity,
      stock_by_size: valid.stockBySize,
    });
    if (kind !== "board") expect(persisted.metadata.sales_unit_label).toBe(valid.salesUnitLabel);
    const detail = await page.request.get(`/products/${valid.handle}`);
    expect(detail.status()).toBe(200);
    expect(await detail.text()).toContain(valid.title);
    expect(await detail.text()).toContain(kind === "board" ? "$275.00" : "$35.00");
    inputs.push({
      ...valid,
      publicationStatus: "published",
      id: created.id,
      revision: published.revision,
    });
  }
  await page.goto("/shop#available-products");
  const available = page.locator("#available-products");
  await expect(available.getByRole("heading", { name: "Available products" })).toBeVisible();
  for (const input of inputs)
    await expect(available.getByRole("link", { name: new RegExp(input.title) })).toBeVisible();
  await available.screenshot({
    path: testInfo.outputPath("enabled-available-products-simulated-images.png"),
  });
  await testInfo.attach("Enabled shop — simulated image bytes, real local product records", {
    path: testInfo.outputPath("enabled-available-products-simulated-images.png"),
    contentType: "image/png",
  });
  const tee = inputs.find((input) => input.merchKind === "tee")!;
  await page.goto(`/products/${tee.handle}`);
  await expect(page.getByRole("button", { name: "XXL", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "XS", exact: true }).click();
  await expect(page.getByRole("button", { name: "Add merch to cart", exact: true })).toBeEnabled();
});

test("WARES preset fills an unsaved draft and leaves stock, unit and photos unresolved", async ({
  page,
}) => {
  await page.goto("/admin/products/new");
  const editor = page.getByRole("region", { name: "Product editor", exact: true });
  await expect(editor.getByRole("heading", { name: "Add product", exact: true })).toBeVisible();
  const presets = editor.getByRole("combobox", {
    name: "Start from the supplied WARES list",
    exact: true,
  });
  await expect(presets).toBeEnabled();
  await presets.selectOption("puente-trucks");
  await expect(presets).toBeDisabled();
  await expect(editor.getByRole("textbox", { name: "Name", exact: true })).toHaveValue(
    "7-inch PUENTE Trucks",
  );
  const handle = `${fixturePrefix}-preset-trucks`;
  await editor.getByRole("textbox", { name: "URL handle", exact: true }).fill(handle);
  await editor.getByRole("button", { name: "Next", exact: true }).click();
  await expect(editor.getByRole("spinbutton", { name: "Price (AUD)", exact: true })).toHaveValue(
    "100",
  );
  await expect(editor.getByRole("textbox", { name: "Unit or pack sold", exact: true })).toHaveValue(
    "",
  );
  await expect(editor.getByRole("spinbutton", { name: "Stock quantity", exact: true })).toHaveValue(
    "",
  );
  const saveResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/admin/products") && response.request().method() === "POST",
  );
  await editor.getByRole("button", { name: "Save draft", exact: true }).click();
  const response = await saveResponse;
  expect(response.status(), await response.text()).toBe(201);
  const saved = await response.json();
  await page.waitForURL(`**/admin/products/${saved.id}`);
  await expect(
    editor.getByRole("combobox", { name: "Start from the supplied WARES list", exact: true }),
  ).toHaveCount(0);
  const stored = (
    await database.query(
      "SELECT publication_status,price_amount,image_details,stock_by_size,metadata FROM products WHERE id=$1",
      [saved.id],
    )
  ).rows[0];
  expect(stored).toMatchObject({
    publication_status: "draft",
    price_amount: 10000,
    image_details: [],
    stock_by_size: {},
    metadata: { sales_unit_label: "" },
  });
});

test("editor saves update their revision and stale photo edits cannot resurrect a sold deck", async ({
  page,
}, testInfo) => {
  const input = { ...product("board", "editor"), publicationStatus: "published" as const };
  const createdResponse = await page.request.post("/api/admin/products", { data: input });
  expect(createdResponse.status()).toBe(201);
  const created = (await createdResponse.json()) as { id: string; revision: number };
  await page.goto(`/admin/products/${created.id}`);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page
    .getByLabel(/^Description/)
    .fill("Updated through the real authenticated product editor.");
  const updateResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith(`/api/admin/products/${created.id}`) &&
      response.request().method() === "PUT",
  );
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  expect((await updateResponse).status()).toBe(200);
  await expect(page.getByRole("status").filter({ hasText: "Saved." })).toBeVisible();
  const updated = (
    await database.query("SELECT revision,description FROM products WHERE id=$1", [created.id])
  ).rows[0];
  expect(updated.revision).toBe(created.revision + 1);
  expect(updated.description).toContain("real authenticated product editor");
  const stale = await page.request.put(`/api/admin/products/${created.id}`, {
    data: { ...input, revision: created.revision },
  });
  expect(stale.status()).toBe(409);

  // Simulate the committed stock/revision effect of a completed sale without contacting Stripe.
  await database.query(
    "UPDATE products SET availability_status='sold',stock_quantity=0,revision=revision+1,updated_at=now() WHERE id=$1",
    [created.id],
  );
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByLabel("Description for photo 1").fill("Updated alt text after simulated sale");
  const photoResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith(`/api/admin/products/${created.id}`) &&
      response.request().method() === "PATCH",
  );
  await page.getByRole("button", { name: "Save photos only", exact: true }).click();
  expect((await photoResponse).status()).toBe(200);
  const sold = (
    await database.query(
      "SELECT availability_status,stock_quantity,image_details FROM products WHERE id=$1",
      [created.id],
    )
  ).rows[0];
  expect(sold).toMatchObject({
    availability_status: "sold",
    stock_quantity: 0,
    image_details: [{ url: imageUrl, alt: "Updated alt text after simulated sale" }],
  });
  await page.screenshot({
    path: testInfo.outputPath("admin-photos-after-simulated-sale.png"),
    fullPage: true,
  });
  await testInfo.attach("Authenticated photo editor after simulated sale", {
    path: testInfo.outputPath("admin-photos-after-simulated-sale.png"),
    contentType: "image/png",
  });
});

test("an authenticated non-admin cannot mutate products, orders or market sales", async ({
  browser,
}) => {
  const member = await browser.newContext({ baseURL: appUrl });
  try {
    await member.addCookies([
      {
        name: "authjs.session-token",
        value: memberToken,
        url: appUrl!,
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
    const session = await member.request.get("/api/auth/session");
    expect((await session.json()).user.email).toContain("-member@example.test");
    expect(
      (
        await member.request.post("/api/admin/products", { data: product("board", "forbidden") })
      ).status(),
    ).toBe(403);
    for (const path of [
      "/api/admin/market-sales",
      `/api/admin/orders/${randomUUID()}/pickup-status`,
      `/api/admin/orders/${randomUUID()}/reconcile`,
    ])
      expect((await member.request.post(path, { data: {} })).status()).toBe(403);
    expect(
      (await member.request.put(`/api/admin/products/${randomUUID()}`, { data: {} })).status(),
    ).toBe(403);
    expect(
      (
        await database.query("SELECT id FROM products WHERE handle=$1", [
          `${fixturePrefix}-forbidden`,
        ])
      ).rowCount,
    ).toBe(0);
  } finally {
    await member.close();
  }
});

test("confirmation requires a paid order and consumes only its purchased cart quantities once", async ({
  page,
}) => {
  const orderId = randomUUID();
  const sessionId = `cs_test_${randomUUID()}`;
  const purchasedId = randomUUID();
  const unrelatedId = randomUUID();
  const item: CartItem = {
    productId: purchasedId,
    variantId: null,
    handle: `${fixturePrefix}-cart-tee`,
    title: "Isolated confirmation tee",
    variantTitle: "Size S",
    imageUrl: "",
    unitPrice: 35,
    currency: "AUD",
    quantity: 5,
    productType: "merch",
    selectedSize: "S",
    material: "Fixture cotton",
    colour: "",
    metadata: {},
  };
  const cart: CartState = {
    items: [
      item,
      { ...item, selectedSize: "M", variantTitle: "Size M", quantity: 2 },
      {
        ...item,
        productId: unrelatedId,
        handle: `${fixturePrefix}-cart-board`,
        title: "Unrelated fixture board",
        productType: "board",
        selectedSize: undefined,
        variantTitle: "",
        quantity: 1,
      },
    ],
  };
  const readCart = async () =>
    page.evaluate(
      () => JSON.parse(localStorage.getItem("plankz_cart_v2") ?? "null") as CartState | null,
    );
  const quantities = (value: CartState | null) =>
    value?.items.map((line) => ({
      productId: line.productId,
      size: line.selectedSize ?? null,
      quantity: line.quantity,
    }));
  await database.query(
    `INSERT INTO orders(id,email,stripe_checkout_session_id,status,fulfilment_method,subtotal_amount,total_amount,currency)
    VALUES($1,'confirmation-fixture@example.test',$2,'paid','local_pickup',7000,7000,'AUD')`,
    [orderId, sessionId],
  );
  try {
    await database.query(
      `INSERT INTO order_items(order_id,shopify_product_id,title,variant_title,quantity,unit_amount,total_amount,product_type,merch_size,metadata)
      VALUES($1,$2,'Isolated confirmation tee','Size S',2,3500,7000,'merch','S',$3::jsonb)`,
      [orderId, purchasedId, JSON.stringify({ product_id: purchasedId })],
    );
    await page.goto("/shop");
    await page.evaluate(
      (value) => localStorage.setItem("plankz_cart_v2", JSON.stringify(value)),
      cart,
    );
    await page.goto(`/checkout/success?session_id=cs_test_unknown_${randomUUID()}`);
    await expect(
      page.getByRole("heading", { level: 1, name: "Order confirmation pending", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Cart, 8 items", exact: true })).toBeVisible();
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    expect(quantities(await readCart())).toEqual(quantities(cart));

    await page.goto(`/checkout/success?session_id=${encodeURIComponent(sessionId)}`);
    await expect(
      page.getByRole("heading", { level: 1, name: "Order confirmed", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Cart, 6 items", exact: true })).toBeVisible();
    const remaining = [
      { productId: purchasedId, size: "S", quantity: 3 },
      { productId: purchasedId, size: "M", quantity: 2 },
      { productId: unrelatedId, size: null, quantity: 1 },
    ];
    await expect.poll(async () => quantities(await readCart())).toEqual(remaining);
    expect(
      await page.evaluate((id) => localStorage.getItem(`plankz_order_cleared:${id}`), orderId),
    ).toBe("true");
    await page.reload();
    await expect(
      page.getByRole("heading", { level: 1, name: "Order confirmed", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Cart, 6 items", exact: true })).toBeVisible();
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    expect(quantities(await readCart())).toEqual(remaining);
  } finally {
    await database.query(
      "DELETE FROM orders WHERE id=$1 AND email='confirmation-fixture@example.test'",
      [orderId],
    );
  }
});
