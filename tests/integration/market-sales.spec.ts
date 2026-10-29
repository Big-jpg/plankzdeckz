import "./setup";
import { expect, test } from "@playwright/test";
import type Stripe from "stripe";
import { createBoard, createTee, mockStripe, pool, randomUUID, resetDatabase } from "./fixtures";
import { dismissMarketSale, recordMarketSale } from "@/server/commerce/market-sales";
import { parseMarketSaleInput } from "@/server/commerce/market-sale-input";

const operator = "operator@example.test";
const paymentId = () => `pi_${randomUUID().replaceAll("-", "")}`;
function marketInput(productIds: string[], reference = paymentId()) {
  return parseMarketSaleInput({
    requestId: randomUUID(),
    paymentReference: reference,
    soldAt: "2026-01-01T01:00:00Z",
    items: productIds.map((productId) => ({
      productId,
      quantity: 1,
      size: null,
      lineAmount: 27500,
    })),
  });
}
function mockPayment(amount = 27500, paymentMethodType = "card_present") {
  const stripe = mockStripe();
  Object.assign(stripe.paymentIntents, {
    retrieve: async (id: string) =>
      ({
        id,
        status: "succeeded",
        currency: "aud",
        amount,
        amount_received: amount,
        metadata: {},
        latest_charge: {
          id: "ch_fixture",
          amount_refunded: 0,
          payment_method_details: { type: paymentMethodType },
        },
      }) as unknown as Stripe.PaymentIntent,
  });
  return stripe;
}
async function stock(id: string) {
  return (
    await pool.query(
      "SELECT stock_quantity,availability_status,revision FROM products WHERE id=$1",
      [id],
    )
  ).rows[0];
}
async function count(
  table: "orders" | "order_items" | "inventory_adjustments" | "order_notifications",
) {
  return Number((await pool.query(`SELECT COUNT(*)::text AS count FROM ${table}`)).rows[0].count);
}

test.beforeEach(async () => {
  await resetDatabase();
});

test("market sale records the paid order, lines and inventory audit once without requiring customer email", async () => {
  mockPayment();
  const board = await createBoard({ publicationStatus: "draft" });
  const input = marketInput([board.id]);
  const sale = await recordMarketSale(input, operator);
  expect(sale.status).toBe("reconciled");
  expect(sale.stripe_payment_intent_id).toBe(input.paymentReference);
  const retry = await recordMarketSale(input, operator);
  expect(retry.order_id).toBe(sale.order_id);
  expect(await stock(board.id)).toMatchObject({
    stock_quantity: 0,
    availability_status: "sold",
    revision: 1,
  });
  expect(await count("orders")).toBe(1);
  expect(await count("order_items")).toBe(1);
  expect(await count("inventory_adjustments")).toBe(1);
  expect(await count("order_notifications")).toBe(0);
  expect(
    (
      await pool.query("SELECT channel,pickup_status,email FROM orders WHERE id=$1", [
        sale.order_id,
      ])
    ).rows[0],
  ).toMatchObject({ channel: "market", pickup_status: "collected", email: null });
});

test("unknown payment references survive review and corrected references can be reconciled", async () => {
  mockPayment();
  const board = await createBoard({ publicationStatus: "draft" });
  const input = marketInput([board.id], "unknown receipt reference");
  const pending = await recordMarketSale(input, operator);
  expect(pending.status).toBe("needs_review");
  expect(pending.stripe_payment_intent_id).toBeNull();
  expect(await count("orders")).toBe(0);
  expect((await stock(board.id)).stock_quantity).toBe(1);
  const corrected = await recordMarketSale(
    { ...input, paymentReference: paymentId(), expectedRevision: pending.revision },
    operator,
    true,
  );
  expect(corrected.status).toBe("reconciled");
  expect(await count("orders")).toBe(1);
});

test("Stripe outage, amount mismatch and online card payments leave review records without consuming stock", async () => {
  const stripe = mockPayment();
  const board = await createBoard({ publicationStatus: "draft" });
  const input = marketInput([board.id]);
  Object.assign(stripe.paymentIntents, {
    retrieve: async () => {
      throw new Error("Simulated Stripe outage");
    },
  });
  const outage = await recordMarketSale(input, operator);
  expect(outage.status).toBe("needs_review");
  mockPayment(27499);
  const mismatch = await recordMarketSale(
    { ...input, expectedRevision: outage.revision },
    operator,
    true,
  );
  expect(mismatch.error).toContain("totals");
  mockPayment(27500, "card");
  const online = await recordMarketSale(
    { ...input, expectedRevision: mismatch.revision },
    operator,
    true,
  );
  expect(online.error).toContain("contactless");
  expect(await count("orders")).toBe(0);
  expect(await count("inventory_adjustments")).toBe(0);
  expect((await stock(board.id)).stock_quantity).toBe(1);
});

test("a second record cannot claim an already reconciled Stripe payment", async () => {
  mockPayment();
  const first = await createBoard({ publicationStatus: "draft" });
  const second = await createBoard({ publicationStatus: "draft" });
  const reference = paymentId();
  const sale = await recordMarketSale(marketInput([first.id], reference), operator);
  expect(sale.status).toBe("reconciled");
  const duplicate = await recordMarketSale(marketInput([second.id], reference), operator);
  expect(duplicate.status).toBe("needs_review");
  expect(duplicate.error).toContain("already linked");
  expect(duplicate.stripe_payment_intent_id).toBeNull();
  expect((await stock(second.id)).stock_quantity).toBe(1);
  expect(await count("orders")).toBe(1);
});

test("a failure after an earlier item mutation rolls back order, items, stock, audit and email enqueue", async () => {
  mockPayment(55000);
  const first = await createBoard({ publicationStatus: "draft" });
  const second = await createBoard({ publicationStatus: "draft", title: "Failure fixture" });
  await pool.query(`CREATE FUNCTION commerce_test_market_failure() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN IF NEW.title='Failure fixture' AND NEW.stock_quantity=0 THEN RAISE EXCEPTION 'Injected stock failure'; END IF; RETURN NEW; END $$`);
  await pool.query(
    "CREATE TRIGGER commerce_test_market_failure BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION commerce_test_market_failure()",
  );
  const input = { ...marketInput([first.id, second.id]), customerEmail: "buyer@example.test" };
  let pending;
  try {
    pending = await recordMarketSale(input, operator);
    expect(pending.status).toBe("needs_review");
    for (const table of [
      "orders",
      "order_items",
      "inventory_adjustments",
      "order_notifications",
    ] as const)
      expect(await count(table)).toBe(0);
    expect((await stock(first.id)).stock_quantity).toBe(1);
    expect((await stock(second.id)).stock_quantity).toBe(1);
  } finally {
    await pool.query("DROP TRIGGER commerce_test_market_failure ON products");
    await pool.query("DROP FUNCTION commerce_test_market_failure()");
  }
  const retried = await recordMarketSale(
    { ...input, expectedRevision: pending!.revision },
    operator,
    true,
  );
  expect(retried.status).toBe("reconciled");
  expect(await count("orders")).toBe(1);
  expect(await count("order_items")).toBe(2);
  expect(await count("inventory_adjustments")).toBe(2);
  expect(await count("order_notifications")).toBe(1);
});

test("unresolved checkout holds block market inventory even after their local expiry", async () => {
  mockPayment();
  const board = await createBoard({ publicationStatus: "draft" });
  const token = randomUUID();
  await pool.query(
    "INSERT INTO checkout_attempts(id,request_hash,items,expected_amount,currency,status) VALUES($1,'fixture','[]',27500,'AUD','open')",
    [token],
  );
  await pool.query(
    "INSERT INTO board_checkout_holds(product_id,hold_token,expires_at) VALUES($1,$2,now()-interval '1 hour')",
    [board.id, token],
  );
  const sale = await recordMarketSale(marketInput([board.id]), operator);
  expect(sale.status).toBe("needs_review");
  expect(sale.error).toContain("unresolved online checkout");
  expect((await stock(board.id)).stock_quantity).toBe(1);
  expect(await count("orders")).toBe(0);
});

test("two physical sale records cannot consume the same unique deck twice", async () => {
  mockPayment();
  const board = await createBoard({ publicationStatus: "draft" });
  const sales = await Promise.all([
    recordMarketSale(marketInput([board.id]), operator),
    recordMarketSale(marketInput([board.id]), operator),
  ]);
  expect(sales.map((sale) => sale.status).sort()).toEqual(["needs_review", "reconciled"]);
  expect(await count("orders")).toBe(1);
  expect(await count("inventory_adjustments")).toBe(1);
  expect((await stock(board.id)).stock_quantity).toBe(0);
});

test("refund before manual recording remains traceable and does not restock delivered goods", async () => {
  const stripe = mockPayment();
  Object.assign(stripe.refunds, {
    list: () =>
      (async function* () {
        yield { id: "re_fixture", amount: 27500, status: "succeeded", created: 1 };
      })(),
  });
  const board = await createBoard({ publicationStatus: "draft" });
  const sale = await recordMarketSale(marketInput([board.id]), operator);
  expect(sale.status).toBe("reconciled");
  const order = (
    await pool.query("SELECT refund_status,refunded_amount,pickup_status FROM orders WHERE id=$1", [
      sale.order_id,
    ])
  ).rows[0];
  expect(order).toMatchObject({
    refund_status: "full",
    refunded_amount: 27500,
    pickup_status: "collected",
  });
  expect((await stock(board.id)).stock_quantity).toBe(0);
});

test("dismissal preserves an audited mistaken record without changing inventory", async () => {
  mockPayment();
  const board = await createBoard({ publicationStatus: "draft" });
  const input = marketInput([board.id], "mistaken duplicate reference");
  const pending = await recordMarketSale(input, operator);
  const dismissed = await dismissMarketSale(
    pending.id,
    pending.revision,
    "Duplicate record; physical stock and existing order checked.",
    operator,
  );
  expect(dismissed.status).toBe("dismissed");
  expect(dismissed.resolved_by).toBe(operator);
  expect(dismissed.resolution_note).toContain("Duplicate record");
  expect((await stock(board.id)).stock_quantity).toBe(1);
  expect(await count("orders")).toBe(0);
  await expect(
    dismissMarketSale(pending.id, pending.revision, "Stale duplicate dismissal", operator),
  ).rejects.toThrow("changed");
});

test("a manually discounted merchandise sale consumes its actual variant and records the exact payment total", async () => {
  mockPayment(6000);
  const tee = await createTee(3);
  await pool.query(
    "UPDATE products SET publication_status='draft',merch_sizes=ARRAY['S','M'],stock_by_size=$2::jsonb WHERE id=$1",
    [tee.id, JSON.stringify({ S: 3, M: 2 })],
  );
  const input = parseMarketSaleInput({
    requestId: randomUUID(),
    paymentReference: paymentId(),
    soldAt: "2026-01-01T01:00:00Z",
    items: [{ productId: tee.id, size: "S", quantity: 2, lineAmount: 6000 }],
  });
  const sale = await recordMarketSale(input, operator);
  expect(sale.status).toBe("reconciled");
  expect(
    (await pool.query("SELECT stock_by_size FROM products WHERE id=$1", [tee.id])).rows[0]
      .stock_by_size,
  ).toEqual({ S: 1, M: 2 });
  expect(
    (
      await pool.query(
        "SELECT quantity,unit_amount,total_amount FROM order_items WHERE order_id=$1",
        [sale.order_id],
      )
    ).rows[0],
  ).toMatchObject({ quantity: 2, unit_amount: 3000, total_amount: 6000 });
  expect(
    (
      await pool.query(
        "SELECT variant_key,quantity_delta,before_quantity,after_quantity FROM inventory_adjustments WHERE order_id=$1",
        [sale.order_id],
      )
    ).rows[0],
  ).toMatchObject({ variant_key: "S", quantity_delta: -2, before_quantity: 3, after_quantity: 1 });
});
