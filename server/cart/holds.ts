import "server-only";
import { randomUUID } from "node:crypto";
import type Stripe from "stripe";
import { pool } from "@/server/db/client";
import type { VerifiedCartItem } from "./validation";

export async function reserveCart(items: VerifiedCartItem[]): Promise<string> {
  const token = randomUUID();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const ids = [...new Set(items.map((item) => item.productId))].sort();
    const locked = await client.query<{
      id: string;
      publication_status: string;
      price_amount: number;
      product_type: string;
      availability_status: string;
      stock_quantity: number;
      stock_by_size: Record<string, number>;
    }>(
      `SELECT id,publication_status,price_amount,product_type,availability_status,stock_quantity,stock_by_size
       FROM products WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE`,
      [ids],
    );
    const byId = new Map(locked.rows.map((row) => [row.id, row]));
    for (const item of items) {
      const product = byId.get(item.productId);
      if (
        !product ||
        product.publication_status !== "published" ||
        product.price_amount !== item.unitAmount
      )
        throw new Error("A product changed. Please refresh your cart.");
      if (item.productType === "board") {
        if (product.availability_status !== "available" || product.stock_quantity !== 1)
          throw new Error("This deck is no longer available.");
        const result = await client.query(
          `INSERT INTO board_checkout_holds(product_id,hold_token,expires_at)
          VALUES ($1,$2,now()+interval '31 minutes')
          ON CONFLICT(product_id) DO UPDATE SET hold_token=EXCLUDED.hold_token,
            stripe_session_id=NULL,expires_at=EXCLUDED.expires_at
          WHERE board_checkout_holds.expires_at<=now()
          RETURNING product_id`,
          [item.productId, token],
        );
        if (!result.rowCount) throw new Error("This deck is held in another checkout.");
      } else {
        const size = item.selectedSize;
        if (!size) throw new Error("Select a tee size.");
        const held = await client.query<{ quantity: string }>(
          `SELECT COALESCE(SUM(quantity),0)::text AS quantity
          FROM merch_checkout_holds WHERE product_id=$1 AND size=$2 AND expires_at>now()`,
          [item.productId, size],
        );
        if ((product.stock_by_size[size] ?? 0) - Number(held.rows[0].quantity) < item.quantity)
          throw new Error(`Size ${size} is no longer available in that quantity.`);
        await client.query(
          `INSERT INTO merch_checkout_holds
          (hold_token,product_id,size,quantity,expires_at)
          VALUES ($1,$2,$3,$4,now()+interval '31 minutes')`,
          [token, item.productId, size, item.quantity],
        );
      }
    }
    await client.query("COMMIT");
    return token;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
export async function attachStripeSession(token: string, sessionId: string) {
  await Promise.all([
    pool.query("UPDATE board_checkout_holds SET stripe_session_id=$2 WHERE hold_token=$1", [
      token,
      sessionId,
    ]),
    pool.query("UPDATE merch_checkout_holds SET stripe_session_id=$2 WHERE hold_token=$1", [
      token,
      sessionId,
    ]),
  ]);
}
export async function releaseCart(token: string) {
  await Promise.all([
    pool.query("DELETE FROM board_checkout_holds WHERE hold_token=$1", [token]),
    pool.query("DELETE FROM merch_checkout_holds WHERE hold_token=$1", [token]),
  ]);
}
export async function isBoardHeld(productId: string): Promise<boolean> {
  const result = await pool.query(
    "SELECT 1 FROM board_checkout_holds WHERE product_id=$1 AND expires_at>now()",
    [productId],
  );
  return (result.rowCount ?? 0) > 0;
}
export async function applyPaidInventory(
  session: Stripe.Checkout.Session,
  lineItems: Stripe.LineItem[],
) {
  if (session.payment_status !== "paid") return;
  const token = session.metadata?.hold_token;
  if (!token) throw new Error("Checkout hold token missing.");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const item of lineItems) {
      const product = item.price?.product;
      if (!product || typeof product === "string" || product.deleted)
        throw new Error("Product metadata missing.");
      const productId = product.metadata.product_id;
      const kind = product.metadata.product_type;
      const size = kind === "merch" ? product.metadata.merch_size : "";
      const quantity = item.quantity ?? 1;
      const existing = await client.query(
        `INSERT INTO storefront_inventory_events
        (stripe_session_id,product_id,variant_key,quantity) VALUES ($1,$2,$3,$4)
        ON CONFLICT DO NOTHING RETURNING product_id`,
        [session.id, productId, size, quantity],
      );
      if (!existing.rowCount) continue;
      if (kind === "board") {
        const result = await client.query(
          `UPDATE products SET availability_status='sold',
          stock_quantity=0,updated_at=now() WHERE id=$1 AND product_type='board'
          AND availability_status='available' AND stock_quantity=1
          AND EXISTS(SELECT 1 FROM board_checkout_holds WHERE product_id=$1 AND hold_token=$2)
          RETURNING id`,
          [productId, token],
        );
        if (!result.rowCount) throw new Error("Paid board could not be marked sold.");
      } else {
        const result = await client.query(
          `UPDATE products SET stock_by_size=jsonb_set(stock_by_size,
          ARRAY[$2],to_jsonb((stock_by_size->>$2)::integer-$3::integer)),updated_at=now()
          WHERE id=$1 AND product_type='merch'
          AND (stock_by_size->>$2)::integer >= $3
          AND EXISTS(SELECT 1 FROM merch_checkout_holds WHERE product_id=$1 AND hold_token=$4 AND size=$2)
          RETURNING id`,
          [productId, size, quantity, token],
        );
        if (!result.rowCount) throw new Error("Paid tee stock could not be updated.");
      }
    }
    await client.query("DELETE FROM board_checkout_holds WHERE hold_token=$1", [token]);
    await client.query("DELETE FROM merch_checkout_holds WHERE hold_token=$1", [token]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
