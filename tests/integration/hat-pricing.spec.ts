import "./setup";
import { expect, test } from "@playwright/test";
import type Stripe from "stripe";
import { NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { HAT_PRICING, type HatPricingFamily } from "@/lib/hat-pricing";
import { getProductByHandle } from "@/lib/catalogue";
import type { MerchProduct } from "@/lib/types";
import { validateCartItems } from "@/server/cart/validation-core";
import { reserveCart, getCheckoutAttempt, attachStripeSession } from "@/server/cart/holds";
import { finalizeCheckout } from "@/server/commerce/checkout";
import { refreshOrderRefunds } from "@/server/commerce/refunds";
import { POST as validateCart } from "@/app/api/cart/validate/route";
import { POST as createCheckout } from "@/app/api/checkout/create-session/route";
import {
  pool,
  randomUUID,
  resetDatabase,
  mockStripe,
  paidSession,
  mockCheckoutLines,
} from "./fixtures";

test.beforeEach(async () => {
  await resetDatabase();
  mockStripe();
});

async function createHat(family: HatPricingFamily | null, stock = 10): Promise<MerchProduct> {
  const id = randomUUID();
  const handle = `hat-fixture-${id}`;
  await pool.query(
    `INSERT INTO products(id,handle,title,description,product_type,price_amount,currency,
      publication_status,availability_status,stock_quantity,merch_kind,merch_sizes,stock_by_size,metadata)
     VALUES($1,$2,'Isolated hat fixture','Isolated pricing fixture','merch',$3,'aud',
      'published','available',0,'hat',ARRAY['One size'],$4::jsonb,$5::jsonb)`,
    [
      id,
      handle,
      family ? HAT_PRICING[family].retailUnitAmount : 2500,
      JSON.stringify({ "One size": stock }),
      JSON.stringify({ sales_unit_label: "One fixture hat", hat_pricing_family: family }),
    ],
  );
  const product = await getProductByHandle(handle);
  if (!product || product.productType !== "merch") throw new Error("Missing isolated hat fixture.");
  return product;
}

function payload(lines: Array<[MerchProduct, number]>) {
  return {
    items: lines.map(([product, quantity]) => ({
      handle: product.handle,
      productType: "merch",
      unitPrice: product.price,
      currency: "AUD",
      quantity,
    })),
  };
}

function request(body: unknown, path: string, token?: string) {
  return new NextRequest(`http://127.0.0.1${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(token ? { "idempotency-key": token } : {}) },
    body: JSON.stringify(body),
  });
}

test("quote API reports catalogue outages without leaking errors and rejects malformed JSON", async () => {
  const product = await createHat("trad");
  const originalQuery = pool.query;
  pool.query = (() =>
    Promise.reject(new Error("fixture database detail must stay private"))) as typeof pool.query;
  try {
    const response = await validateCart(request(payload([[product, 2]]), "/api/cart/validate"));
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body).toMatchObject({
      valid: false,
      verifiedSubtotal: 0,
      discountAmount: 0,
      lineQuotes: [],
      errors: [{ field: "pricing", message: "Prices could not be confirmed. Try again shortly." }],
    });
    expect(JSON.stringify(body)).not.toContain("fixture database detail");
  } finally {
    pool.query = originalQuery;
  }
  const malformed = new NextRequest("http://127.0.0.1/api/cart/validate", {
    method: "POST",
    body: "{",
  });
  const response = await validateCart(malformed);
  expect(response.status).toBe(400);
  expect(await response.json()).toMatchObject({
    valid: false,
    errors: [{ field: "body", message: "Invalid JSON body." }],
  });
});

test("trusted family quotes match Stripe line amounts without enabling promotion stacking", async () => {
  const products = await Promise.all([createHat("trad"), createHat("trad"), createHat("cord")]);
  const body = payload([
    [products[0], 1],
    [products[1], 1],
    [products[2], 5],
  ]);
  Object.assign(body.items[0], {
    metadata: { hat_pricing_family: "cord" },
    hatPricingFamily: "cord",
  });
  const quotedResponse = await validateCart(request(body, "/api/cart/validate"));
  expect(quotedResponse.status).toBe(200);
  const quote = await quotedResponse.json();
  expect(quote).toMatchObject({
    valid: true,
    retailSubtotal: 250,
    verifiedSubtotal: 200,
    discountAmount: 50,
  });
  expect(quote.lineQuotes.map((line: { unitAmount: number }) => line.unitAmount)).toEqual([
    2250, 2250, 3100,
  ]);
  expect(quote).not.toHaveProperty("verifiedItems");
  const token = randomUUID();
  const verified = validateCartItems(body, products).verifiedItems;
  const { session } = paidSession(verified, token);
  let stripeParams: Stripe.Checkout.SessionCreateParams | undefined;
  const stripe = mockStripe();
  Object.assign(stripe.checkout.sessions, {
    create: async (params: Stripe.Checkout.SessionCreateParams) => {
      stripeParams = params;
      return {
        ...session,
        status: "open",
        payment_status: "unpaid",
        url: "https://checkout.example.invalid/isolated",
      };
    },
  });
  const response = await createCheckout(request(body, "/api/checkout/create-session", token));
  expect(response.status, await response.text()).toBe(200);
  expect(stripeParams?.allow_promotion_codes).toBe(false);
  expect(stripeParams?.discounts).toBeUndefined();
  expect(stripeParams?.line_items?.map((line) => line.price_data?.unit_amount)).toEqual([
    2250, 2250, 3100,
  ]);
  expect(stripeParams?.line_items?.map((line) => line.quantity)).toEqual([1, 1, 5]);
  const attempt = await getCheckoutAttempt(token);
  expect(attempt?.expected_amount).toBe(20000);
  expect(attempt?.items[0]).toMatchObject({
    unitAmount: 2250,
    retailUnitAmount: 2500,
    hatPricingFamily: "trad",
    hatFamilyQuantity: 2,
  });
  expect(attempt?.items[2].metadata).toMatchObject({
    retail_unit_amount: 4000,
    hat_pricing_family: "cord",
    hat_family_quantity: 5,
    hat_pricing_version: "2026-10-owner-tiers-v1",
  });
});

test("a changed family or retail price rejects stale quotes before any stock reservation", async () => {
  for (const change of ["family", "retail"] as const) {
    const product = await createHat("cord");
    const quoted = validateCartItems(payload([[product, 5]]), [product]).verifiedItems;
    if (change === "family")
      await pool.query(
        "UPDATE products SET metadata=metadata || '{\"hat_pricing_family\":null}'::jsonb WHERE id=$1",
        [product.id],
      );
    else await pool.query("UPDATE products SET price_amount=3500 WHERE id=$1", [product.id]);
    await expect(reserveCart(quoted, randomUUID(), `stale-${change}`)).rejects.toThrow(
      "product changed",
    );
  }
  expect((await pool.query("SELECT * FROM checkout_attempts")).rowCount).toBe(0);
  expect((await pool.query("SELECT * FROM merch_checkout_holds")).rowCount).toBe(0);
});

test("a price changed since the displayed quote requires review before holds or Stripe work", async () => {
  const product = await createHat("trad");
  const body = { ...payload([[product, 2]]), expectedTotalAmount: 4500 };
  await pool.query(
    "UPDATE products SET metadata=metadata || '{\"hat_pricing_family\":null}'::jsonb WHERE id=$1",
    [product.id],
  );
  const response = await createCheckout(
    request(body, "/api/checkout/create-session", randomUUID()),
  );
  expect(response.status).toBe(409);
  expect(await response.json()).toMatchObject({ code: "PRICE_CHANGED" });
  expect((await pool.query("SELECT * FROM checkout_attempts")).rowCount).toBe(0);
  expect((await pool.query("SELECT * FROM merch_checkout_holds")).rowCount).toBe(0);
  for (const expectedTotalAmount of ["5000", null, -1, 1.5]) {
    const invalid = await createCheckout(
      request({ ...body, expectedTotalAmount }, "/api/checkout/create-session", randomUUID()),
    );
    expect(invalid.status).toBe(422);
  }
});

test("retry cannot silently reopen a saved reservation with a different amount", async () => {
  const product = await createHat("trad");
  const body = { ...payload([[product, 2]]), expectedTotalAmount: 4500 };
  const quoted = validateCartItems(body, [product]).verifiedItems;
  const token = randomUUID();
  const requestHash = createHash("sha256").update(JSON.stringify(body)).digest("hex");
  await reserveCart(quoted, token, requestHash);
  // Simulate a durable quote from an earlier pricing policy while retaining its stock hold.
  const previousItems = [{ ...quoted[0], unitPrice: 22, unitAmount: 2200, totalAmount: 4400 }];
  await pool.query(
    "UPDATE checkout_attempts SET expected_amount=4400,items=$2::jsonb WHERE id=$1",
    [token, JSON.stringify(previousItems)],
  );
  const response = await createCheckout(request(body, "/api/checkout/create-session", token));
  expect(response.status).toBe(409);
  expect(await response.json()).toMatchObject({ code: "PRICE_CHANGED" });
  expect((await getCheckoutAttempt(token))?.expected_amount).toBe(4400);
  expect(
    (await pool.query("SELECT * FROM merch_checkout_holds WHERE hold_token=$1", [token])).rowCount,
  ).toBe(1);
});

test("locked family quantities reject a forged five-hat rate on a two-hat reservation", async () => {
  const product = await createHat("cord");
  const quoted = validateCartItems(payload([[product, 2]]), [product]).verifiedItems;
  const forged = [
    { ...quoted[0], hatFamilyQuantity: 5, unitAmount: 3100, unitPrice: 31, totalAmount: 6200 },
  ];
  await expect(reserveCart(forged, randomUUID(), "forged-tier")).rejects.toThrow(
    "Hat quantities changed",
  );
  expect((await pool.query("SELECT * FROM checkout_attempts")).rowCount).toBe(0);
  expect((await pool.query("SELECT * FROM merch_checkout_holds")).rowCount).toBe(0);
});

test("paid discounted snapshots finalize exactly once and partial refunds do not reprice or restock", async () => {
  const products = await Promise.all([createHat("cord"), createHat("cord")]);
  const quoted = validateCartItems(
    payload([
      [products[0], 2],
      [products[1], 3],
    ]),
    products,
  ).verifiedItems;
  const token = randomUUID();
  await reserveCart(quoted, token, "paid-discounted-cord");
  const { session, lines } = paidSession(quoted, token);
  await attachStripeSession(token, session.id);
  const stripe = mockStripe();
  mockCheckoutLines(stripe, lines);
  const orderId = await finalizeCheckout(session);
  expect(await finalizeCheckout(session)).toBe(orderId);
  const order = (
    await pool.query("SELECT total_amount,subtotal_amount FROM orders WHERE id=$1", [orderId])
  ).rows[0];
  expect(order).toEqual({ total_amount: 15500, subtotal_amount: 15500 });
  const savedLines = (
    await pool.query(
      "SELECT quantity,unit_amount,total_amount,metadata FROM order_items WHERE order_id=$1 ORDER BY quantity",
      [orderId],
    )
  ).rows;
  expect(savedLines).toMatchObject([
    {
      quantity: 2,
      unit_amount: 3100,
      total_amount: 6200,
      metadata: { retail_unit_amount: 4000, hat_pricing_family: "cord", hat_family_quantity: 5 },
    },
    {
      quantity: 3,
      unit_amount: 3100,
      total_amount: 9300,
      metadata: { retail_unit_amount: 4000, hat_pricing_family: "cord", hat_family_quantity: 5 },
    },
  ]);
  expect(
    (await pool.query("SELECT stock_by_size FROM products ORDER BY stock_by_size->>'One size'"))
      .rows,
  ).toEqual([{ stock_by_size: { "One size": 7 } }, { stock_by_size: { "One size": 8 } }]);
  Object.assign(stripe.refunds, {
    list: () =>
      (async function* () {
        yield { id: "re_one_paid_hat", amount: 3100, status: "succeeded", created: 1 };
      })(),
  });
  await refreshOrderRefunds(session.payment_intent as string);
  expect(
    (await pool.query("SELECT refunded_amount,refund_status FROM orders WHERE id=$1", [orderId]))
      .rows[0],
  ).toEqual({ refunded_amount: 3100, refund_status: "partial" });
  expect(
    (
      await pool.query(
        "SELECT quantity,unit_amount,total_amount,metadata FROM order_items WHERE order_id=$1 ORDER BY quantity",
        [orderId],
      )
    ).rows,
  ).toEqual(savedLines);
  expect(
    (await pool.query("SELECT stock_by_size FROM products ORDER BY stock_by_size->>'One size'"))
      .rows,
  ).toEqual([{ stock_by_size: { "One size": 7 } }, { stock_by_size: { "One size": 8 } }]);
  expect((await pool.query("SELECT * FROM storefront_inventory_events")).rowCount).toBe(2);
});

test("unexpected provider discounts and incorrect paid unit prices cannot finalize an order", async () => {
  const product = await createHat("trad");
  const quoted = validateCartItems(payload([[product, 2]]), [product]).verifiedItems;
  const token = randomUUID();
  await reserveCart(quoted, token, "unexpected-discount");
  const { session, lines } = paidSession(quoted, token);
  await attachStripeSession(token, session.id);
  const stripe = mockStripe();
  mockCheckoutLines(stripe, lines);
  await expect(finalizeCheckout({ ...session, amount_total: 4400 })).rejects.toThrow(
    "amount or currency",
  );
  const wrongLines = JSON.parse(JSON.stringify(lines)) as Stripe.LineItem[];
  wrongLines[0].price!.unit_amount = 2500;
  mockCheckoutLines(stripe, wrongLines);
  await expect(finalizeCheckout(session)).rejects.toThrow("items do not match");
  expect((await pool.query("SELECT * FROM orders")).rowCount).toBe(0);
  expect(
    (await pool.query("SELECT stock_by_size FROM products WHERE id=$1", [product.id])).rows[0]
      .stock_by_size,
  ).toEqual({ "One size": 10 });
  mockCheckoutLines(stripe, lines);
  await expect(finalizeCheckout(session)).resolves.toBeTruthy();
});
