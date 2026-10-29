import "./setup";
import { expect, test } from "@playwright/test";
import {
  pool,
  randomUUID,
  resetDatabase,
  createBoard,
  createTee,
  verifiedItems,
  mockStripe,
  paidSession,
  mockCheckoutLines,
} from "./fixtures";
import {
  reserveCart,
  attachStripeSession,
  getCheckoutAttempt,
  isBoardHeld,
  releaseCart,
} from "@/server/cart/holds";
import { finalizeCheckout, reconcileCheckoutAttempt } from "@/server/commerce/checkout";
import { refreshOrderRefunds } from "@/server/commerce/refunds";
import { updateOrderPickupStatus } from "@/server/notifications/pickup";
import { NextRequest } from "next/server";
import { POST as createCheckoutSession } from "@/app/api/checkout/create-session/route";
import { POST as stripeWebhook } from "@/app/api/webhooks/stripe/route";
import { readFile } from "node:fs/promises";
import path from "node:path";

test.beforeEach(async () => {
  await resetDatabase();
  mockStripe();
});
test.afterEach(async () => {
  await pool.query(
    "DROP TRIGGER IF EXISTS fixture_fail_stock ON products; DROP FUNCTION IF EXISTS fixture_fail_stock()",
  );
});

test("concurrent checkout attempts for one unique deck create one reservation", async () => {
  const product = await createBoard();
  const items = verifiedItems([product]);
  const results = await Promise.allSettled([
    reserveCart(items, randomUUID(), "cart-a"),
    reserveCart(items, randomUUID(), "cart-b"),
  ]);
  expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
  expect((await pool.query("SELECT * FROM board_checkout_holds")).rowCount).toBe(1);
  expect((await pool.query("SELECT * FROM checkout_attempts")).rowCount).toBe(1);
  expect((await pool.query("SELECT stock_quantity FROM products")).rows[0].stock_quantity).toBe(1);
});

test("a pending market reconciliation blocks a new checkout even if the product remains published", async () => {
  const product = await createBoard();
  await pool.query(
    `INSERT INTO market_sales(id,payment_reference,items,total_amount,sold_at,operator_email)
     VALUES($1,'unverified market receipt',$2::jsonb,27500,now(),'fixture-operator@example.test')`,
    [
      randomUUID(),
      JSON.stringify([{ productId: product.id, quantity: 1, size: null, lineAmount: 27500 }]),
    ],
  );
  expect(
    (await pool.query("SELECT publication_status FROM products WHERE id=$1", [product.id])).rows[0]
      .publication_status,
  ).toBe("published");
  await expect(
    reserveCart(verifiedItems([product]), randomUUID(), "pending-market-sale"),
  ).rejects.toThrow("market sale is reconciled");
  expect((await pool.query("SELECT * FROM checkout_attempts")).rowCount).toBe(0);
  expect((await pool.query("SELECT * FROM board_checkout_holds")).rowCount).toBe(0);
  expect(
    (await pool.query("SELECT stock_quantity FROM products WHERE id=$1", [product.id])).rows[0]
      .stock_quantity,
  ).toBe(1);
});

test("uppercase and lowercase checkout UUID headers reuse one attempt and canonical Stripe creation key", async () => {
  const product = await createBoard();
  const token = randomUUID().toLowerCase();
  const stripe = mockStripe();
  const { session } = paidSession(verifiedItems([product]), token);
  const openSession = {
    ...session,
    status: "open",
    payment_status: "unpaid",
    url: "https://checkout.example.invalid/fixture",
  };
  const creationKeys: string[] = [];
  let retrievals = 0;
  Object.assign(stripe.checkout.sessions, {
    create: async (_: unknown, options: { idempotencyKey: string }) => {
      creationKeys.push(options.idempotencyKey);
      return openSession;
    },
    retrieve: async () => {
      retrievals++;
      return openSession;
    },
  });
  const input = {
    items: [
      {
        handle: product.handle,
        productType: "board",
        unitPrice: product.price,
        currency: "AUD",
        quantity: 1,
      },
    ],
  };
  const request = (header: string) =>
    new NextRequest("http://127.0.0.1/api/checkout/create-session", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": header },
      body: JSON.stringify(input),
    });
  expect((await createCheckoutSession(request(token.toUpperCase()))).status).toBe(200);
  expect((await createCheckoutSession(request(token))).status).toBe(200);
  expect(creationKeys).toEqual([token]);
  expect(retrievals).toBe(1);
  expect((await pool.query("SELECT id FROM checkout_attempts")).rows).toEqual([{ id: token }]);
  expect((await pool.query("SELECT hold_token FROM board_checkout_holds")).rows).toEqual([
    { hold_token: token },
  ]);
});

test("one checkout can reserve multiple unique decks and associate the same Stripe session", async () => {
  const products = await Promise.all([createBoard(), createBoard()]);
  const token = randomUUID();
  await reserveCart(verifiedItems(products), token, "two-decks");
  await attachStripeSession(token, "cs_test_two_decks");
  const holds = await pool.query("SELECT stripe_session_id FROM board_checkout_holds");
  expect(holds.rows).toEqual([
    { stripe_session_id: "cs_test_two_decks" },
    { stripe_session_id: "cs_test_two_decks" },
  ]);
});

test("reversed multideck carts do not deadlock or leave partial reservations", async () => {
  const products = await Promise.all([createBoard(), createBoard()]);
  const results = await Promise.allSettled([
    reserveCart(verifiedItems(products), randomUUID(), "first-order"),
    reserveCart(verifiedItems([...products].reverse()), randomUUID(), "reverse-order"),
  ]);
  expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
  const holds = await pool.query("SELECT DISTINCT hold_token FROM board_checkout_holds");
  expect(holds.rowCount).toBe(1);
  expect((await pool.query("SELECT * FROM board_checkout_holds")).rowCount).toBe(2);
});

test("merchandise reservations account for stock already reserved by another checkout", async () => {
  const tee = await createTee(2);
  await reserveCart(verifiedItems([tee], 2), randomUUID(), "all-tees");
  await expect(reserveCart(verifiedItems([tee]), randomUUID(), "one-more-tee")).rejects.toThrow(
    "Insufficient unreserved stock",
  );
  expect(
    (await pool.query("SELECT SUM(quantity)::integer AS quantity FROM merch_checkout_holds"))
      .rows[0].quantity,
  ).toBe(2);
});

test("a stale catalogue cart is rejected under the row lock without persisting a reservation", async () => {
  const board = await createBoard();
  const items = verifiedItems([board]);
  await pool.query("UPDATE products SET price_amount=price_amount+100 WHERE id=$1", [board.id]);
  await expect(reserveCart(items, randomUUID(), "stale-price")).rejects.toThrow(
    "A product changed",
  );
  expect((await pool.query("SELECT * FROM checkout_attempts")).rowCount).toBe(0);
  expect((await pool.query("SELECT * FROM board_checkout_holds")).rowCount).toBe(0);
});

test("an idempotent checkout retry retains one hold and cannot substitute another cart", async () => {
  const board = await createBoard();
  const token = randomUUID();
  const items = verifiedItems([board]);
  await reserveCart(items, token, "same-cart");
  await reserveCart(items, token, "same-cart");
  await expect(reserveCart(items, token, "different-cart")).rejects.toThrow("another cart");
  expect((await pool.query("SELECT * FROM board_checkout_holds")).rowCount).toBe(1);
});

test("wall-clock expiry retains stock until Stripe confirms an unpaid expired session", async () => {
  const product = await createBoard();
  const items = verifiedItems([product]);
  const token = randomUUID();
  await reserveCart(items, token, "expired-clock");
  await attachStripeSession(token, "cs_test_still_open");
  await pool.query("UPDATE board_checkout_holds SET expires_at=now()-interval '1 day'");
  expect(await isBoardHeld(product.id)).toBe(true);
  await expect(reserveCart(items, randomUUID(), "racing-late-customer")).rejects.toThrow(
    "reserved",
  );
  const stripe = mockStripe();
  const { session } = paidSession(items, token, "cs_test_still_open");
  Object.assign(stripe.checkout.sessions, {
    retrieve: async () => ({ ...session, status: "open", payment_status: "unpaid" }),
  });
  expect(await reconcileCheckoutAttempt(token)).toBe("open");
  expect(await isBoardHeld(product.id)).toBe(true);
  Object.assign(stripe.checkout.sessions, {
    retrieve: async () => ({ ...session, status: "expired", payment_status: "unpaid" }),
  });
  expect(await reconcileCheckoutAttempt(token)).toBe("expired");
  expect(await isBoardHeld(product.id)).toBe(false);
  await reserveCart(items, randomUUID(), "after-confirmed-expiry");
});

test("an authoritative Stripe session search proving absence releases its old reservation", async () => {
  const board = await createBoard();
  const token = randomUUID();
  const items = verifiedItems([board]);
  await reserveCart(items, token, "failed-session");
  await pool.query("UPDATE checkout_attempts SET creation_requested_at=now()-interval '3 minutes'");
  Object.assign(mockStripe().checkout.sessions, { list: () => (async function* () {})() });
  expect(await reconcileCheckoutAttempt(token)).toBe("failed");
  expect((await getCheckoutAttempt(token))?.status).toBe("failed");
  expect(await isBoardHeld(board.id)).toBe(false);
  await reserveCart(items, randomUUID(), "replacement-session");
});

test("a verified payment atomically records complete order items, stock and confirmation", async () => {
  const products = await Promise.all([createBoard(), createTee(2)]);
  const items = verifiedItems(products);
  const token = randomUUID();
  await reserveCart(items, token, "paid-mixed-cart");
  const { session, lines } = paidSession(items, token);
  mockCheckoutLines(mockStripe(), lines);
  await attachStripeSession(token, session.id);
  const orderId = await finalizeCheckout(session);
  expect((await pool.query("SELECT * FROM orders WHERE id=$1", [orderId])).rows[0]).toMatchObject({
    status: "paid",
    total_amount: 31000,
  });
  expect(
    (await pool.query("SELECT * FROM order_items WHERE order_id=$1", [orderId])).rowCount,
  ).toBe(2);
  expect(
    (
      await pool.query("SELECT stock_quantity, availability_status FROM products WHERE id=$1", [
        products[0].id,
      ])
    ).rows[0],
  ).toEqual({ stock_quantity: 0, availability_status: "sold" });
  expect(
    (await pool.query("SELECT stock_by_size FROM products WHERE id=$1", [products[1].id])).rows[0]
      .stock_by_size,
  ).toEqual({ S: 1 });
  expect((await pool.query("SELECT * FROM board_checkout_holds")).rowCount).toBe(0);
  expect((await pool.query("SELECT * FROM merch_checkout_holds")).rowCount).toBe(0);
  expect(
    (await pool.query("SELECT status,last_error_code FROM order_notifications")).rows[0],
  ).toEqual({ status: "failed", last_error_code: "smtp_not_configured" });
});

test("duplicate concurrent paid deliveries cannot duplicate orders, items or stock consumption", async () => {
  const board = await createBoard();
  const items = verifiedItems([board]);
  const token = randomUUID();
  await reserveCart(items, token, "duplicate-payment");
  const { session, lines } = paidSession(items, token);
  mockCheckoutLines(mockStripe(), lines);
  await attachStripeSession(token, session.id);
  const ids = await Promise.all([finalizeCheckout(session), finalizeCheckout(session)]);
  expect(new Set(ids).size).toBe(1);
  for (const table of [
    "orders",
    "order_items",
    "storefront_inventory_events",
    "order_notifications",
  ]) {
    expect((await pool.query(`SELECT * FROM ${table}`)).rowCount).toBe(1);
  }
  expect((await pool.query("SELECT stock_quantity FROM products")).rows[0].stock_quantity).toBe(0);
  await releaseCart(token, "expired");
  expect((await getCheckoutAttempt(token))?.status).toBe("paid");
});

test("failure after partial stock work rolls back everything and a webhook retry completes once", async () => {
  const first = await createBoard();
  const second = await createBoard();
  const items = verifiedItems([first, second]);
  const token = randomUUID();
  await reserveCart(items, token, "retry-after-transaction-failure");
  const { session, lines } = paidSession(items, token);
  mockCheckoutLines(mockStripe(), lines);
  await attachStripeSession(token, session.id);
  await pool.query(
    "INSERT INTO stripe_events(stripe_event_id,event_type,payload) VALUES('evt_test_retry','checkout.session.completed','{}')",
  );
  // The injected exception occurs after the first item's inventory mutation.
  await pool.query(`CREATE FUNCTION fixture_fail_stock() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN IF NEW.id = '${second.id}'::uuid THEN RAISE EXCEPTION 'isolated injected stock failure'; END IF; RETURN NEW; END $$;
    CREATE TRIGGER fixture_fail_stock BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION fixture_fail_stock()`);
  await expect(finalizeCheckout(session, "evt_test_retry")).rejects.toThrow(
    "isolated injected stock failure",
  );
  for (const table of [
    "orders",
    "order_items",
    "storefront_inventory_events",
    "order_notifications",
  ]) {
    expect((await pool.query(`SELECT * FROM ${table}`)).rowCount).toBe(0);
  }
  expect(
    (await pool.query("SELECT stock_quantity FROM products")).rows.map((row) => row.stock_quantity),
  ).toEqual([1, 1]);
  expect((await pool.query("SELECT * FROM board_checkout_holds")).rowCount).toBe(2);
  expect((await pool.query("SELECT processed FROM stripe_events")).rows[0].processed).toBe(false);
  await pool.query(
    "DROP TRIGGER fixture_fail_stock ON products; DROP FUNCTION fixture_fail_stock()",
  );
  await finalizeCheckout(session, "evt_test_retry");
  expect((await pool.query("SELECT * FROM orders")).rowCount).toBe(1);
  expect((await pool.query("SELECT * FROM order_items")).rowCount).toBe(2);
  expect((await pool.query("SELECT processed FROM stripe_events")).rows[0].processed).toBe(true);
});

test("a forged Stripe amount cannot write an order or consume a reservation", async () => {
  const board = await createBoard();
  const items = verifiedItems([board]);
  const token = randomUUID();
  await reserveCart(items, token, "amount-mismatch");
  const { session, lines } = paidSession(items, token);
  mockCheckoutLines(mockStripe(), lines);
  await expect(finalizeCheckout({ ...session, amount_total: 100 })).rejects.toThrow(
    "amount or currency",
  );
  expect((await pool.query("SELECT * FROM orders")).rowCount).toBe(0);
  expect(await isBoardHeld(board.id)).toBe(true);
});

test("an uncertain unlinked attempt is recovered from Stripe session search without creating another payment", async () => {
  const board = await createBoard();
  const items = verifiedItems([board]);
  const token = randomUUID();
  await reserveCart(items, token, "uncertain-create");
  await pool.query("UPDATE checkout_attempts SET status='needs_review',stripe_params='{}'");
  const { session } = paidSession(items, token);
  let creates = 0;
  Object.assign(mockStripe().checkout.sessions, {
    create: async () => {
      creates++;
      throw new Error("Recovery must not create sessions");
    },
    list: () =>
      (async function* () {
        yield { ...session, status: "open", payment_status: "unpaid" };
      })(),
  });
  expect(await reconcileCheckoutAttempt(token)).toBe("open");
  expect(creates).toBe(0);
  expect((await getCheckoutAttempt(token))?.stripe_session_id).toBe(session.id);
  expect(await isBoardHeld(board.id)).toBe(true);
});

for (const rejectionType of [
  "StripeAuthenticationError",
  "StripePermissionError",
  "StripeInvalidRequestError",
]) {
  test(`Stripe timeout followed by typed ${rejectionType} retains the uncertain reservation`, async () => {
    const product = await createBoard();
    const token = randomUUID();
    const input = {
      items: [
        {
          handle: product.handle,
          productType: "board",
          unitPrice: product.price,
          currency: "AUD",
          quantity: 1,
        },
      ],
    };
    const stripe = mockStripe();
    let calls = 0;
    Object.assign(stripe.checkout.sessions, {
      create: async () => {
        calls++;
        if (calls === 1)
          throw Object.assign(new Error("Simulated timeout after possible remote creation"), {
            type: "StripeConnectionError",
          });
        throw Object.assign(new Error("Simulated typed rejection on retry"), {
          type: rejectionType,
        });
      },
    });
    const request = () =>
      new NextRequest("http://127.0.0.1/api/checkout/create-session", {
        method: "POST",
        headers: { "content-type": "application/json", "idempotency-key": token },
        body: JSON.stringify(input),
      });
    expect((await createCheckoutSession(request())).status).toBe(502);
    expect((await createCheckoutSession(request())).status).toBe(502);
    expect(calls).toBe(2);
    expect((await getCheckoutAttempt(token))?.status).toBe("needs_review");
    expect(await isBoardHeld(product.id)).toBe(true);
    expect(
      (await pool.query("SELECT stock_quantity FROM products WHERE id=$1", [product.id])).rows[0]
        .stock_quantity,
    ).toBe(1);
  });
}

function signedWebhookRequest(stripe: ReturnType<typeof mockStripe>, event: object) {
  const payload = JSON.stringify(event);
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: process.env.STRIPE_WEBHOOK_SECRET!,
  });
  return new NextRequest("http://127.0.0.1/api/webhooks/stripe", {
    method: "POST",
    headers: { "stripe-signature": signature },
    body: payload,
  });
}

test("signed webhook processing rejects invalid signatures before writes and deduplicates valid events", async () => {
  const product = await createBoard();
  const items = verifiedItems([product]);
  const token = randomUUID();
  await reserveCart(items, token, "signed-webhook");
  const { session, lines } = paidSession(items, token);
  const stripe = mockStripe();
  mockCheckoutLines(stripe, lines);
  Object.assign(stripe.checkout.sessions, { retrieve: async () => session });
  const event = {
    id: "evt_signed_fixture",
    object: "event",
    type: "checkout.session.completed",
    data: { object: session },
    livemode: false,
  };
  const invalid = new NextRequest("http://127.0.0.1/api/webhooks/stripe", {
    method: "POST",
    headers: { "stripe-signature": "t=1,v1=invalid" },
    body: JSON.stringify(event),
  });
  expect((await stripeWebhook(invalid)).status).toBe(400);
  expect((await pool.query("SELECT * FROM stripe_events")).rowCount).toBe(0);
  expect((await pool.query("SELECT * FROM orders")).rowCount).toBe(0);
  expect((await stripeWebhook(signedWebhookRequest(stripe, event))).status).toBe(200);
  const duplicate = await stripeWebhook(signedWebhookRequest(stripe, event));
  expect(duplicate.status).toBe(200);
  expect(await duplicate.json()).toMatchObject({ processed: true, duplicate: true });
  expect((await pool.query("SELECT * FROM stripe_events")).rowCount).toBe(1);
  expect((await pool.query("SELECT * FROM orders")).rowCount).toBe(1);
  expect((await pool.query("SELECT * FROM order_items")).rowCount).toBe(1);
  expect(
    (await pool.query("SELECT stock_quantity FROM products WHERE id=$1", [product.id])).rows[0]
      .stock_quantity,
  ).toBe(0);
});

test("refund-before-order and a failed refresh remain visible until successful refund reconciliation", async () => {
  const product = await createBoard();
  const items = verifiedItems([product]);
  const token = randomUUID();
  await reserveCart(items, token, "refund-before-order");
  const { session, lines } = paidSession(items, token);
  const stripe = mockStripe();
  mockCheckoutLines(stripe, lines);
  Object.assign(stripe.checkout.sessions, { retrieve: async () => session });
  Object.assign(stripe.refunds, {
    list: () =>
      (async function* () {
        throw new Error("Simulated refund API outage");
      })(),
  });
  const earlyRefund = {
    id: "evt_refund_before_order",
    object: "event",
    type: "refund.created",
    data: { object: { id: "re_early", payment_intent: session.payment_intent } },
    livemode: false,
  };
  expect((await stripeWebhook(signedWebhookRequest(stripe, earlyRefund))).status).toBe(200);
  expect((await pool.query("SELECT * FROM orders")).rowCount).toBe(0);
  const completion = {
    id: "evt_order_after_refund",
    object: "event",
    type: "checkout.session.completed",
    data: { object: session },
    livemode: false,
  };
  expect((await stripeWebhook(signedWebhookRequest(stripe, completion))).status).toBe(200);
  const order = (await pool.query("SELECT * FROM orders")).rows[0];
  expect(order.refund_sync_error).toContain("could not be refreshed");
  expect(order.refund_checked_at).toBeNull();
  expect(order.status).toBe("paid");
  Object.assign(stripe.refunds, {
    list: () =>
      (async function* () {
        yield { id: "re_early", amount: 27500, status: "succeeded", created: 1 };
      })(),
  });
  await refreshOrderRefunds(session.payment_intent as string);
  const refreshed = (
    await pool.query(
      "SELECT refund_status,refunded_amount,refund_sync_error,refund_checked_at FROM orders",
    )
  ).rows[0];
  expect(refreshed).toMatchObject({
    refund_status: "full",
    refunded_amount: 27500,
    refund_sync_error: null,
  });
  expect(refreshed.refund_checked_at).not.toBeNull();
  expect(
    (await pool.query("SELECT stock_quantity FROM products WHERE id=$1", [product.id])).rows[0]
      .stock_quantity,
  ).toBe(0);
});

test("the upgrade migration refuses pre-existing reservations before altering commerce tables", async () => {
  const schema = `fixture_upgrade_${randomUUID().replaceAll("-", "")}`;
  const client = await pool.connect();
  try {
    await client.query(`CREATE SCHEMA ${schema}`);
    await client.query(`SET search_path TO ${schema}`);
    await client.query(
      "CREATE TABLE board_checkout_holds(product_id uuid); CREATE TABLE merch_checkout_holds(product_id uuid)",
    );
    await client.query("INSERT INTO board_checkout_holds VALUES($1)", [randomUUID()]);
    const migration = await readFile(
      path.join(process.cwd(), "db/migrations/003_commerce_completion.sql"),
      "utf8",
    );
    await expect(client.query(migration)).rejects.toThrow(
      "Resolve every existing Stripe reservation",
    );
    await client.query("ROLLBACK");
    expect((await client.query("SELECT * FROM board_checkout_holds")).rowCount).toBe(1);
  } finally {
    await client.query("ROLLBACK");
    await client.query("RESET search_path");
    await client.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    client.release();
  }
});

test("a fresh creation request and a creation timestamp race cannot be released by stale absence proof", async () => {
  const product = await createBoard();
  const token = randomUUID();
  await reserveCart(verifiedItems([product]), token, "fresh-request");
  await pool.query("UPDATE checkout_attempts SET creation_requested_at=now()");
  await expect(reconcileCheckoutAttempt(token)).rejects.toThrow("in progress");
  await pool.query("UPDATE checkout_attempts SET creation_requested_at=now()-interval '3 minutes'");
  Object.assign(mockStripe().checkout.sessions, {
    list: () =>
      (async function* () {
        await pool.query("UPDATE checkout_attempts SET creation_requested_at=now()");
      })(),
  });
  await expect(reconcileCheckoutAttempt(token)).rejects.toThrow("in progress");
  expect(await isBoardHeld(product.id)).toBe(true);
});

test("a delayed paid event finalizes its existing hold even after the local expiry annotation", async () => {
  const product = await createBoard();
  const items = verifiedItems([product]);
  const token = randomUUID();
  await reserveCart(items, token, "delayed-paid-event");
  const { session, lines } = paidSession(items, token);
  await attachStripeSession(token, session.id);
  await pool.query("UPDATE board_checkout_holds SET expires_at=now()-interval '1 day'");
  mockCheckoutLines(mockStripe(), lines);
  await finalizeCheckout(session);
  expect(
    (await pool.query("SELECT stock_quantity FROM products WHERE id=$1", [product.id])).rows[0]
      .stock_quantity,
  ).toBe(0);
  expect((await getCheckoutAttempt(token))?.status).toBe("paid");
});

test("refund reconciliation reports partial and full refunds without automatically restocking", async () => {
  const board = await createBoard();
  const items = verifiedItems([board]);
  const token = randomUUID();
  await reserveCart(items, token, "refunded-order");
  const { session, lines } = paidSession(items, token);
  const stripe = mockStripe();
  mockCheckoutLines(stripe, lines);
  const id = await finalizeCheckout(session);
  Object.assign(stripe.refunds, {
    list: () =>
      (async function* () {
        yield { id: "re_partial", amount: 1000, status: "succeeded", created: 1 };
      })(),
  });
  await refreshOrderRefunds(session.payment_intent as string);
  expect(
    (await pool.query("SELECT refund_status,refunded_amount FROM orders WHERE id=$1", [id]))
      .rows[0],
  ).toEqual({ refund_status: "partial", refunded_amount: 1000 });
  Object.assign(stripe.refunds, {
    list: () =>
      (async function* () {
        yield { id: "re_full", amount: 27500, status: "succeeded", created: 2 };
      })(),
  });
  await refreshOrderRefunds(session.payment_intent as string);
  expect(
    (await pool.query("SELECT refund_status FROM orders WHERE id=$1", [id])).rows[0].refund_status,
  ).toBe("full");
  expect(
    (await pool.query("SELECT stock_quantity,availability_status FROM products")).rows[0],
  ).toEqual({ stock_quantity: 0, availability_status: "sold" });
});

function refundReadGate() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release: () => release() };
}

test("an older successful refund refresh cannot erase a newer failure warning", async () => {
  const product = await createBoard();
  const items = verifiedItems([product]);
  const token = randomUUID();
  await reserveCart(items, token, "refund-old-success-new-failure");
  const { session, lines } = paidSession(items, token);
  const stripe = mockStripe();
  mockCheckoutLines(stripe, lines);
  const orderId = await finalizeCheckout(session);
  const original = (
    await pool.query("SELECT refund_checked_at,refund_refresh_revision FROM orders WHERE id=$1", [
      orderId,
    ])
  ).rows[0];
  const olderEntered = refundReadGate();
  const finishOlder = refundReadGate();
  let reads = 0;
  Object.assign(stripe.refunds, {
    list: () =>
      (async function* () {
        if (++reads === 1) {
          olderEntered.release();
          await finishOlder.promise;
          return;
        }
        throw new Error("Simulated newer refund read failure");
      })(),
  });
  const older = refreshOrderRefunds(session.payment_intent as string);
  await olderEntered.promise;
  try {
    await expect(refreshOrderRefunds(session.payment_intent as string)).rejects.toThrow(
      "newer refund read failure",
    );
  } finally {
    finishOlder.release();
    await older;
  }
  const result = (
    await pool.query(
      "SELECT refund_sync_error,refund_checked_at,refund_refresh_revision FROM orders WHERE id=$1",
      [orderId],
    )
  ).rows[0];
  expect(result.refund_sync_error).toContain("could not be refreshed");
  expect(result.refund_checked_at.getTime()).toBe(original.refund_checked_at.getTime());
  expect(result.refund_refresh_revision).toBe(original.refund_refresh_revision + 2);
});

test("an older failed refund refresh cannot overwrite a newer verified full refund", async () => {
  const product = await createBoard();
  const items = verifiedItems([product]);
  const token = randomUUID();
  await reserveCart(items, token, "refund-old-failure-new-success");
  const { session, lines } = paidSession(items, token);
  const stripe = mockStripe();
  mockCheckoutLines(stripe, lines);
  const orderId = await finalizeCheckout(session);
  const olderEntered = refundReadGate();
  const finishOlder = refundReadGate();
  let reads = 0;
  Object.assign(stripe.refunds, {
    list: () =>
      (async function* () {
        if (++reads === 1) {
          olderEntered.release();
          await finishOlder.promise;
          throw new Error("Simulated older refund read failure");
        }
        yield { id: "re_newer_verified", amount: 27500, status: "succeeded", created: 2 };
      })(),
  });
  const older = refreshOrderRefunds(session.payment_intent as string).then(
    () => null,
    (error: unknown) => error,
  );
  await olderEntered.promise;
  try {
    await refreshOrderRefunds(session.payment_intent as string);
  } finally {
    finishOlder.release();
  }
  expect(await older).toBeInstanceOf(Error);
  const result = (
    await pool.query(
      "SELECT refund_status,refunded_amount,refund_sync_error,refund_checked_at FROM orders WHERE id=$1",
      [orderId],
    )
  ).rows[0];
  expect(result).toMatchObject({
    refund_status: "full",
    refunded_amount: 27500,
    refund_sync_error: null,
  });
  expect(result.refund_checked_at).not.toBeNull();
  expect(
    (await pool.query("SELECT stock_quantity FROM products WHERE id=$1", [product.id])).rows[0]
      .stock_quantity,
  ).toBe(0);
});

test("pickup mutation and one deduplicated email intent commit together", async () => {
  const board = await createBoard();
  const items = verifiedItems([board]);
  const token = randomUUID();
  await reserveCart(items, token, "pickup-transition");
  const { session, lines } = paidSession(items, token);
  mockCheckoutLines(mockStripe(), lines);
  const id = await finalizeCheckout(session);
  await Promise.all([
    updateOrderPickupStatus(id, "ready", null),
    updateOrderPickupStatus(id, "ready", null),
  ]);
  expect(
    (
      await pool.query("SELECT pickup_status,pickup_revision::integer FROM orders WHERE id=$1", [
        id,
      ])
    ).rows[0],
  ).toEqual({ pickup_status: "ready", pickup_revision: 1 });
  expect(
    (await pool.query("SELECT * FROM order_notifications WHERE kind='pickup_ready'")).rowCount,
  ).toBe(1);
  expect(
    (await pool.query("SELECT * FROM buyer_events WHERE event_type='pickup_status_updated'"))
      .rowCount,
  ).toBe(1);
  await updateOrderPickupStatus(id, "collected", null);
  await expect(updateOrderPickupStatus(id, "ready", null)).rejects.toThrow("not permitted");
});

test("uppercase reconciliation recovers an unlinked payable session without releasing its stock", async () => {
  const board = await createBoard();
  const items = verifiedItems([board]);
  const token = randomUUID().toLowerCase();
  await reserveCart(items, token, "uppercase-recovery");
  const { session, lines } = paidSession(items, token);
  const stripe = mockStripe();
  const openSession = { ...session, status: "open", payment_status: "unpaid" };
  Object.assign(stripe.checkout.sessions, {
    list: () =>
      (async function* () {
        yield openSession;
      })(),
    retrieve: async () => session,
  });
  expect(await reconcileCheckoutAttempt(token.toUpperCase())).toBe("open");
  expect(await isBoardHeld(board.id)).toBe(true);
  expect(await getCheckoutAttempt(token)).toMatchObject({
    status: "open",
    stripe_session_id: session.id,
  });
  mockCheckoutLines(stripe, lines);
  expect(await reconcileCheckoutAttempt(token.toUpperCase())).toBe("paid");
  expect((await pool.query("SELECT * FROM orders")).rowCount).toBe(1);
  expect(
    (await pool.query("SELECT stock_quantity FROM products WHERE id=$1", [board.id])).rows[0]
      .stock_quantity,
  ).toBe(0);
});
