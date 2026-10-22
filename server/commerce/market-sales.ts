import "server-only";
import type Stripe from "stripe";
import { pool, queryOne, queryRows } from "@/server/db/client";
import { getStripeClient } from "@/server/stripe/client";
import { deliverOrderNotifications, enqueueOrderNotification } from "@/server/notifications/orders";
import { refreshOrderRefunds } from "@/server/commerce/refunds";
import {
  assertMarketPayment,
  assertMarketStock,
  type MarketSaleInput,
  type MarketSaleItem,
  type MarketStockProduct,
} from "./market-sale-input";

export interface MarketSaleRecord {
  id: string;
  payment_reference: string;
  stripe_payment_intent_id: string | null;
  items: MarketSaleItem[];
  total_amount: number;
  sold_at: string;
  operator_email: string;
  customer_email: string | null;
  status: "needs_review" | "reconciled" | "dismissed";
  error: string | null;
  resolution_note: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  order_id: string | null;
  revision: number;
  created_at: string;
  updated_at: string;
}

export class MarketSaleConflict extends Error {}

export async function getMarketSale(id: string): Promise<MarketSaleRecord | null> {
  return queryOne<MarketSaleRecord>("SELECT * FROM market_sales WHERE id=$1", [id]);
}

export async function getMarketSales(page = 1): Promise<MarketSaleRecord[]> {
  return queryRows<MarketSaleRecord>(
    "SELECT * FROM market_sales ORDER BY (status='needs_review') DESC,created_at DESC LIMIT 50 OFFSET $1",
    [(page - 1) * 50],
  );
}

async function savePending(
  input: MarketSaleInput,
  operator: string,
  retry: boolean,
): Promise<MarketSaleRecord> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const existing = await client.query<MarketSaleRecord>(
      "SELECT * FROM market_sales WHERE id=$1 FOR UPDATE",
      [input.requestId],
    );
    let sale = existing.rows[0];
    if (sale && sale.status !== "needs_review") {
      await client.query("COMMIT");
      return sale;
    }
    // Publication uses the same product locks before checking pending market sales.
    const productIds = [
      ...new Set([...input.items, ...(sale?.items ?? [])].map((item) => item.productId)),
    ].sort();
    await client.query("SELECT id FROM products WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE", [
      productIds,
    ]);
    if (sale) {
      if (!retry) {
        if (
          sale.payment_reference !== input.paymentReference ||
          sale.total_amount !== input.totalAmount ||
          sale.customer_email !== input.customerEmail ||
          new Date(sale.sold_at).toISOString() !== input.soldAt ||
          sale.items.length !== input.items.length ||
          sale.items.some((item, index) => {
            const other = input.items[index];
            return (
              item.productId !== other.productId ||
              item.size !== other.size ||
              item.quantity !== other.quantity ||
              item.lineAmount !== other.lineAmount
            );
          })
        )
          throw new MarketSaleConflict(
            "This request identifier already belongs to another sale. Reload the form.",
          );
      } else {
        if (sale.revision !== input.expectedRevision)
          throw new MarketSaleConflict(
            "Another operator changed this sale. Reload before retrying.",
          );
        const result = await client.query<MarketSaleRecord>(
          `UPDATE market_sales SET payment_reference=$2,items=$3::jsonb,total_amount=$4,sold_at=$5,
           customer_email=$6,operator_email=$7,error='Awaiting Stripe verification.',revision=revision+1,updated_at=now()
           WHERE id=$1 RETURNING *`,
          [
            input.requestId,
            input.paymentReference,
            JSON.stringify(input.items),
            input.totalAmount,
            input.soldAt,
            input.customerEmail,
            operator,
          ],
        );
        sale = result.rows[0];
      }
    } else {
      if (retry) throw new MarketSaleConflict("Market sale not found.");
      const result = await client.query<MarketSaleRecord>(
        `INSERT INTO market_sales(id,payment_reference,items,total_amount,sold_at,operator_email,customer_email,error)
         VALUES($1,$2,$3::jsonb,$4,$5,$6,$7,'Awaiting Stripe verification.')
         ON CONFLICT(id) DO NOTHING RETURNING *`,
        [
          input.requestId,
          input.paymentReference,
          JSON.stringify(input.items),
          input.totalAmount,
          input.soldAt,
          operator,
          input.customerEmail,
        ],
      );
      sale = result.rows[0];
      if (!sale)
        throw new MarketSaleConflict(
          "This sale is being recorded by another request. Retry from the saved sale.",
        );
    }
    await client.query("COMMIT");
    return sale;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function verifiedPayment(reference: string, amount: number): Promise<Stripe.PaymentIntent> {
  const stripe = getStripeClient();
  let payment: Stripe.PaymentIntent;
  if (/^pi_[A-Za-z0-9]+$/.test(reference)) {
    payment = await stripe.paymentIntents.retrieve(reference, { expand: ["latest_charge"] });
  } else if (/^ch_[A-Za-z0-9]+$/.test(reference)) {
    const charge = await stripe.charges.retrieve(reference);
    const id =
      typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
    if (!id) throw new Error("This charge has no supported Stripe payment reference.");
    payment = await stripe.paymentIntents.retrieve(id, { expand: ["latest_charge"] });
  } else
    throw new Error(
      "Use a Stripe payment intent (pi_) or charge (ch_) reference from the business Dashboard.",
    );
  const charge = payment.latest_charge;
  assertMarketPayment(
    {
      ...payment,
      paymentMethodType:
        charge && typeof charge !== "string" ? charge.payment_method_details?.type : undefined,
    },
    amount,
  );
  if (payment.metadata.source === "plankz_deckz" || payment.metadata.hold_token)
    throw new Error("This payment belongs to an online checkout. Reconcile its checkout instead.");
  return payment;
}

export async function recordMarketSale(
  input: MarketSaleInput,
  operator: string,
  retry = false,
): Promise<MarketSaleRecord> {
  const sale = await savePending(input, operator, retry);
  if (sale.status !== "needs_review") return sale;
  let payment: Stripe.PaymentIntent;
  try {
    payment = await verifiedPayment(sale.payment_reference, sale.total_amount);
  } catch (error) {
    const message =
      error instanceof Error && !(error as { type?: string }).type?.startsWith("Stripe")
        ? error.message
        : "Stripe could not verify this payment. Check the reference and retry.";
    await pool.query(
      "UPDATE market_sales SET error=$2,updated_at=now() WHERE id=$1 AND status='needs_review' AND revision=$3",
      [sale.id, message, sale.revision],
    );
    return (await getMarketSale(sale.id))!;
  }

  const client = await pool.connect();
  let reconciled: MarketSaleRecord;
  try {
    await client.query("BEGIN");
    const locked = await client.query<MarketSaleRecord>(
      "SELECT * FROM market_sales WHERE id=$1 FOR UPDATE",
      [sale.id],
    );
    const current = locked.rows[0];
    if (current.status !== "needs_review" || current.revision !== sale.revision) {
      await client.query("COMMIT");
      return current;
    }
    const duplicate = await client.query<{ id: string }>(
      "SELECT id FROM orders WHERE stripe_payment_intent_id=$1",
      [payment.id],
    );
    if (duplicate.rowCount)
      throw new Error(
        "This Stripe payment is already linked to an order. Open the existing order; stock was not changed.",
      );
    const onlineAttempt = await client.query(
      `SELECT a.id FROM checkout_attempts a JOIN stripe_events e
       ON e.payload#>>'{data,object,metadata,hold_token}'=a.id::text
       WHERE e.payload#>>'{data,object,payment_intent}'=$1
       OR e.payload#>>'{data,object,payment_intent,id}'=$1 LIMIT 1`,
      [payment.id],
    );
    if (onlineAttempt.rowCount)
      throw new Error(
        "This payment is associated with an online checkout. Reconcile that checkout instead.",
      );
    const ids = [...new Set(sale.items.map((item) => item.productId))].sort();
    const products = await client.query<
      MarketStockProduct & {
        title: string;
        board_style: string | null;
        timber_species: string[];
        image_urls: string[];
      }
    >("SELECT * FROM products WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE", [ids]);
    const byId = new Map(products.rows.map((product) => [product.id, product]));
    const held = await client.query(
      `SELECT product_id FROM board_checkout_holds WHERE product_id=ANY($1::uuid[])
       UNION ALL SELECT product_id FROM merch_checkout_holds WHERE product_id=ANY($1::uuid[])`,
      [ids],
    );
    if (held.rowCount)
      throw new Error(
        "A product has an unresolved online checkout. Reconcile or expire that checkout before recording the market sale.",
      );
    for (const item of sale.items) {
      const product = byId.get(item.productId);
      if (!product)
        throw new Error("A selected product no longer exists. Correct this sale before retrying.");
      assertMarketStock(product, item);
    }
    const order = await client.query<{ id: string }>(
      `INSERT INTO orders(email,stripe_payment_intent_id,status,fulfilment_method,subtotal_amount,total_amount,currency,
       pickup_status,channel,operator_email,sold_at,reconciliation_status,payment_reference)
       VALUES($1,$2,'paid','market_collection',$3,$3,'AUD','collected','market',$4,$5,'reconciled',$6) RETURNING id`,
      [
        sale.customer_email,
        payment.id,
        sale.total_amount,
        operator,
        sale.sold_at,
        sale.payment_reference,
      ],
    );
    const orderId = order.rows[0].id;
    for (const item of sale.items) {
      const product = byId.get(item.productId)!;
      const before =
        product.product_type === "board"
          ? product.stock_quantity
          : product.stock_by_size[item.size!];
      await client.query(
        `INSERT INTO order_items(order_id,shopify_product_id,title,variant_title,quantity,unit_amount,total_amount,
         image_url,product_type,board_style,merch_size,material,metadata)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb)`,
        [
          orderId,
          product.id,
          product.title,
          item.size ? `Size ${item.size}` : null,
          item.quantity,
          Math.round(item.lineAmount / item.quantity),
          item.lineAmount,
          product.image_urls[0] ?? null,
          product.product_type,
          product.board_style,
          item.size,
          product.timber_species.join(" / "),
          JSON.stringify({
            product_id: product.id,
            market_sale_id: sale.id,
            actual_line_amount: item.lineAmount,
          }),
        ],
      );
      if (product.product_type === "board") {
        await client.query(
          "UPDATE products SET stock_quantity=0,availability_status='sold',revision=revision+1,updated_at=now() WHERE id=$1",
          [product.id],
        );
      } else {
        await client.query(
          "UPDATE products SET stock_by_size=jsonb_set(stock_by_size,ARRAY[$2],to_jsonb($3::integer)),revision=revision+1,updated_at=now() WHERE id=$1",
          [product.id, item.size, before - item.quantity],
        );
      }
      await client.query(
        `INSERT INTO inventory_adjustments(product_id,variant_key,quantity_delta,before_quantity,after_quantity,reason,operator_email,order_id)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          product.id,
          item.size ?? "",
          -item.quantity,
          before,
          before - item.quantity,
          `Market sale ${sale.id}`,
          operator,
          orderId,
        ],
      );
      if (item.size) product.stock_by_size[item.size] = before - item.quantity;
    }
    const result = await client.query<MarketSaleRecord>(
      `UPDATE market_sales SET status='reconciled',stripe_payment_intent_id=$2,order_id=$3,error=NULL,
       operator_email=$4,revision=revision+1,updated_at=now() WHERE id=$1 RETURNING *`,
      [sale.id, payment.id, orderId, operator],
    );
    reconciled = result.rows[0];
    await enqueueOrderNotification(
      client,
      orderId,
      "order_confirmed",
      `order-confirmed:${orderId}`,
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    const code = (error as { code?: string }).code;
    const message =
      code === "23505"
        ? "This Stripe payment has already been reconciled. Find its existing order before making changes."
        : error instanceof Error
          ? error.message
          : "The sale could not be reconciled. Stock was not changed.";
    await pool.query(
      "UPDATE market_sales SET error=$2,updated_at=now() WHERE id=$1 AND status='needs_review' AND revision=$3",
      [sale.id, message, sale.revision],
    );
    return (await getMarketSale(sale.id))!;
  } finally {
    client.release();
  }
  // Re-read refunds after persistence to cover a refund event that preceded order creation.
  await refreshOrderRefunds(payment.id).catch(() => undefined);
  if (reconciled.order_id) await deliverOrderNotifications(reconciled.order_id);
  return reconciled;
}

export async function dismissMarketSale(
  id: string,
  revision: number,
  reason: string,
  operator: string,
): Promise<MarketSaleRecord> {
  const result = await queryOne<MarketSaleRecord>(
    `UPDATE market_sales SET status='dismissed',resolution_note=$3,resolved_by=$4,resolved_at=now(),
     revision=revision+1,updated_at=now() WHERE id=$1 AND revision=$2 AND status='needs_review' RETURNING *`,
    [id, revision, reason, operator],
  );
  if (!result)
    throw new MarketSaleConflict(
      "The sale changed or has already been resolved. Reload before continuing.",
    );
  return result;
}
