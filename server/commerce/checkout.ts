import "server-only";
import type Stripe from "stripe";
import { pool } from "@/server/db/client";
import { getStripeClient } from "@/server/stripe/client";
import { getCheckoutAttempt, releaseCart, type CheckoutAttempt } from "@/server/cart/holds";
import { assertPaidSession } from "./payment-validation";
import { enqueueOrderNotification, deliverOrderNotifications } from "@/server/notifications/orders";
import { refreshOrderRefunds } from "./refunds";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function finalizeCheckout(
  session: Stripe.Checkout.Session,
  eventId?: string,
): Promise<string> {
  const token = session.metadata?.hold_token;
  if (session.metadata?.source !== "plankz_deckz" || !token || !uuid.test(token))
    throw new Error("Unknown Plankz checkout association.");
  const attempt = await getCheckoutAttempt(token);
  if (!attempt || (attempt.stripe_session_id && attempt.stripe_session_id !== session.id))
    throw new Error("Checkout reservation not found.");
  const stripe = getStripeClient();
  const lines: Stripe.LineItem[] = [];
  for await (const line of stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ["data.price.product"],
  }))
    lines.push(line);
  assertPaidSession(session, lines, attempt.items, attempt.expected_amount);
  const email = session.customer_details?.email ?? session.customer_email;
  if (!email) throw new Error("The paid checkout has no customer email.");
  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;
  if (!paymentIntent) throw new Error("The paid checkout has no payment reference.");
  const client = await pool.connect();
  let orderId: string;
  try {
    await client.query("BEGIN");
    const locked = await client.query<CheckoutAttempt>(
      "SELECT * FROM checkout_attempts WHERE id=$1 FOR UPDATE",
      [token],
    );
    const current = locked.rows[0];
    if (!current || (current.stripe_session_id && current.stripe_session_id !== session.id))
      throw new Error("Checkout session association changed.");
    const existing = await client.query<{ id: string }>(
      "SELECT id FROM orders WHERE stripe_checkout_session_id=$1",
      [session.id],
    );
    if (current.status === "paid") {
      if (!existing.rows[0]) throw new Error("Paid attempt is missing its order.");
      orderId = existing.rows[0].id;
    } else {
      if (["expired", "failed"].includes(current.status))
        throw new Error("Paid checkout requires manual investigation: reservation was closed.");
      if (existing.rowCount) throw new Error("Existing order requires consistency review.");
      await client.query(
        "SELECT id FROM products WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE",
        [current.items.map((item) => item.productId)],
      );
      const order = await client.query<{ id: string }>(
        `INSERT INTO orders(email,buyer_name,phone,stripe_checkout_session_id,stripe_payment_intent_id,
          status,fulfilment_method,subtotal_amount,total_amount,currency,payment_reference)
         VALUES($1,$2,$3,$4,$5,'paid','local_pickup',$6,$6,'AUD',$5) RETURNING id`,
        [
          email,
          session.customer_details?.name ?? null,
          session.customer_details?.phone ?? null,
          session.id,
          paymentIntent,
          current.expected_amount,
        ],
      );
      orderId = order.rows[0].id;
      for (const item of current.items) {
        const size = item.selectedSize ?? "";
        const line = lines.find((line) => {
          const product = line.price?.product;
          return (
            product &&
            typeof product !== "string" &&
            !product.deleted &&
            product.metadata.product_id === item.productId &&
            (product.metadata.merch_size ?? "") === size
          );
        })!;
        await client.query(
          `INSERT INTO order_items(order_id,shopify_product_id,title,variant_title,quantity,unit_amount,total_amount,
            image_url,product_type,board_style,merch_size,material,colour,metadata)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb)`,
          [
            orderId,
            item.productId,
            item.title,
            item.variantTitle,
            item.quantity,
            item.unitAmount,
            item.totalAmount,
            item.imageUrl,
            item.productType,
            item.catalogueProduct.productType === "board" ? item.catalogueProduct.boardStyle : null,
            item.selectedSize,
            item.material,
            item.colour,
            JSON.stringify({
              ...item.metadata,
              product_id: item.productId,
              handle: item.handle,
              stripe_line_item_id: line.id,
            }),
          ],
        );
        let changed;
        if (item.productType === "board") {
          changed = await client.query(
            `UPDATE products SET stock_quantity=0,availability_status='sold',revision=revision+1,updated_at=now()
            WHERE id=$1 AND product_type='board' AND stock_quantity=1 AND availability_status='available'
            AND EXISTS(SELECT 1 FROM board_checkout_holds WHERE product_id=$1 AND hold_token=$2) RETURNING id`,
            [item.productId, token],
          );
        } else {
          changed = await client.query(
            `UPDATE products SET stock_by_size=jsonb_set(stock_by_size,ARRAY[$2],to_jsonb((stock_by_size->>$2)::integer-$3::integer)),
            revision=revision+1,updated_at=now() WHERE id=$1 AND (stock_by_size->>$2)::integer >= $3
            AND EXISTS(SELECT 1 FROM merch_checkout_holds WHERE product_id=$1 AND hold_token=$4 AND size=$2 AND quantity=$3) RETURNING id`,
            [item.productId, size, item.quantity, token],
          );
        }
        if (changed.rowCount !== 1)
          throw new Error(
            "Paid stock could not be finalized; retry or investigate the reservation.",
          );
        await client.query(
          "INSERT INTO storefront_inventory_events(stripe_session_id,product_id,variant_key,quantity) VALUES($1,$2,$3,$4)",
          [session.id, item.productId, size, item.quantity],
        );
      }
      await client.query("DELETE FROM board_checkout_holds WHERE hold_token=$1", [token]);
      await client.query("DELETE FROM merch_checkout_holds WHERE hold_token=$1", [token]);
      await client.query(
        "UPDATE checkout_attempts SET status='paid',stripe_session_id=$2,last_error=NULL,updated_at=now() WHERE id=$1",
        [token, session.id],
      );
      await enqueueOrderNotification(
        client,
        orderId,
        "order_confirmed",
        `order:${orderId}:confirmed`,
      );
    }
    if (eventId)
      await client.query(
        "UPDATE stripe_events SET processed=true,processed_at=now() WHERE stripe_event_id=$1",
        [eventId],
      );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
  // Nonfinancial follow-up cannot reverse a successfully committed sale.
  await deliverOrderNotifications(orderId).catch(() => undefined);
  await refreshOrderRefunds(paymentIntent).catch(() => undefined);
  return orderId;
}

export async function reconcileCheckoutAttempt(token: string) {
  const attempt = await getCheckoutAttempt(token);
  if (!attempt) throw new Error("Checkout attempt not found.");
  // PostgreSQL UUID lookup accepts either case; Stripe metadata uses the stored canonical ID.
  token = attempt.id;
  if (attempt.status === "paid") {
    const order = await pool.query<{ stripe_payment_intent_id: string }>(
      "SELECT stripe_payment_intent_id FROM orders WHERE stripe_checkout_session_id=$1",
      [attempt.stripe_session_id],
    );
    if (order.rows[0]?.stripe_payment_intent_id)
      await refreshOrderRefunds(order.rows[0].stripe_payment_intent_id);
    return "paid";
  }
  if (["expired", "failed"].includes(attempt.status)) return attempt.status;
  const stripe = getStripeClient();
  let session: Stripe.Checkout.Session;
  if (attempt.stripe_session_id)
    session = await stripe.checkout.sessions.retrieve(attempt.stripe_session_id);
  else {
    // Search is authoritative and never creates another payable session. Each creation
    // request records its start before calling Stripe; the route has a 60-second bound.
    if (
      attempt.creation_requested_at &&
      Date.now() - new Date(attempt.creation_requested_at).getTime() < 2 * 60 * 1000
    )
      throw new Error(
        "Checkout creation may still be in progress. Retry reconciliation after two minutes.",
      );
    let recovered: Stripe.Checkout.Session | undefined;
    for await (const candidate of stripe.checkout.sessions.list({
      created: { gte: Math.floor(new Date(attempt.created_at).getTime() / 1000) - 60 },
      limit: 100,
    })) {
      if (
        candidate.metadata?.hold_token === token &&
        candidate.metadata?.source === "plankz_deckz"
      ) {
        if (recovered)
          throw new Error(
            "Multiple Stripe sessions match this attempt; investigate before releasing stock.",
          );
        recovered = candidate;
      }
    }
    if (!recovered) {
      await releaseCart(token, "failed", attempt.creation_requested_at);
      return "failed";
    }
    session = recovered;
  }
  if (session.metadata?.hold_token !== token || session.metadata?.source !== "plankz_deckz")
    throw new Error("Stripe session does not match the attempt.");
  if (session.payment_status === "paid") {
    await finalizeCheckout(session);
    return "paid";
  }
  if (session.status === "expired" && session.payment_status === "unpaid") {
    await releaseCart(token, "expired");
    return "expired";
  }
  const { attachStripeSession } = await import("@/server/cart/holds");
  await attachStripeSession(token, session.id);
  return "open";
}

export async function reconcileOverdueStock(productIds: string[]) {
  const result = await pool.query<{ id: string }>(
    `SELECT DISTINCT a.id FROM checkout_attempts a
    WHERE a.status IN ('creating','open','needs_review') AND a.created_at<now()-interval '36 minutes'
    AND EXISTS(SELECT 1 FROM jsonb_array_elements(a.items) i WHERE i->>'productId'=ANY($1::text[])) LIMIT 20`,
    [productIds],
  );
  for (const attempt of result.rows) {
    try {
      await reconcileCheckoutAttempt(attempt.id);
    } catch {
      await pool.query(
        "UPDATE checkout_attempts SET last_error='Stripe reconciliation requires review',updated_at=now() WHERE id=$1",
        [attempt.id],
      );
    }
  }
}
