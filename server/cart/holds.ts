import "server-only";
import { pool } from "@/server/db/client";
import type { VerifiedCartItem } from "./validation";
import { canReserveLockedProduct } from "@/lib/sellability";
import { SALES_ENABLED, SALES_DISABLED_MESSAGE } from "@/lib/commerce-config";
import { isHatPricingFamily } from "@/lib/hat-pricing";

export interface CheckoutAttempt {
  id: string;
  request_hash: string;
  items: VerifiedCartItem[];
  expected_amount: number;
  currency: string;
  status: "creating" | "open" | "paid" | "expired" | "failed" | "needs_review";
  stripe_session_id: string | null;
  stripe_params: Record<string, unknown> | null;
  creation_requested_at: Date | null;
  created_at: Date;
}
export async function getCheckoutAttempt(token: string): Promise<CheckoutAttempt | null> {
  const result = await pool.query<CheckoutAttempt>("SELECT * FROM checkout_attempts WHERE id=$1", [
    token,
  ]);
  return result.rows[0] ?? null;
}
export async function reserveCart(
  items: VerifiedCartItem[],
  token: string,
  requestHash: string,
): Promise<string> {
  if (!SALES_ENABLED) throw new Error(SALES_DISABLED_MESSAGE);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const total = items.reduce((sum, item) => sum + item.totalAmount, 0);
    const inserted = await client.query(
      `INSERT INTO checkout_attempts(id,request_hash,items,expected_amount,currency)
       VALUES($1,$2,$3::jsonb,$4,'AUD') ON CONFLICT DO NOTHING RETURNING id`,
      [token, requestHash, JSON.stringify(items), total],
    );
    if (!inserted.rowCount) {
      const existing = await client.query<CheckoutAttempt>(
        "SELECT * FROM checkout_attempts WHERE id=$1 FOR UPDATE",
        [token],
      );
      if (existing.rows[0]?.request_hash !== requestHash)
        throw new Error("This checkout key belongs to another cart.");
      if (["expired", "failed", "paid"].includes(existing.rows[0].status))
        throw new Error("This checkout attempt is closed. Refresh your cart.");
      await client.query("COMMIT");
      return token;
    }
    const ids = [...new Set(items.map((item) => item.productId))].sort();
    const locked = await client.query(
      "SELECT * FROM products WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE",
      [ids],
    );
    const byId = new Map(locked.rows.map((row) => [row.id, row]));
    const familyQuantities = { trad: 0, cord: 0 };
    for (const item of items) {
      const product = byId.get(item.productId);
      const family = product?.metadata?.hat_pricing_family;
      if (
        product?.product_type === "merch" &&
        product.merch_kind === "hat" &&
        isHatPricingFamily(family)
      )
        familyQuantities[family] += item.quantity;
    }
    for (const item of items) {
      const product = byId.get(item.productId);
      const pending = await client.query(
        `SELECT 1 FROM market_sales WHERE status='needs_review'
        AND items @> jsonb_build_array(jsonb_build_object('productId',$1::text)) LIMIT 1`,
        [item.productId],
      );
      if (pending.rowCount)
        throw new Error("This product is unavailable while a market sale is reconciled.");
      if (!product || !canReserveLockedProduct(product, item))
        throw new Error("A product changed. Refresh your cart.");
      if (
        item.hatPricingFamily &&
        item.hatFamilyQuantity !== familyQuantities[item.hatPricingFamily]
      )
        throw new Error("Hat quantities changed. Refresh your cart.");
      if (item.productType === "board") {
        const held = await client.query("SELECT 1 FROM board_checkout_holds WHERE product_id=$1", [
          item.productId,
        ]);
        if (held.rowCount) throw new Error("This deck is reserved in another checkout.");
        await client.query(
          "INSERT INTO board_checkout_holds(product_id,hold_token,expires_at) VALUES($1,$2,now()+interval '36 minutes')",
          [item.productId, token],
        );
      } else {
        const size = item.selectedSize;
        if (!size) throw new Error("Select a product size.");
        const held = await client.query<{ quantity: string }>(
          "SELECT COALESCE(SUM(quantity),0)::text AS quantity FROM merch_checkout_holds WHERE product_id=$1 AND size=$2",
          [item.productId, size],
        );
        if ((product.stock_by_size[size] ?? 0) - Number(held.rows[0].quantity) < item.quantity)
          throw new Error("Insufficient unreserved stock.");
        await client.query(
          `INSERT INTO merch_checkout_holds(hold_token,product_id,size,quantity,expires_at)
          VALUES($1,$2,$3,$4,now()+interval '36 minutes')`,
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
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query<CheckoutAttempt>(
      "SELECT * FROM checkout_attempts WHERE id=$1 FOR UPDATE",
      [token],
    );
    const row = result.rows[0];
    if (!row || (row.stripe_session_id && row.stripe_session_id !== sessionId))
      throw new Error("Checkout session association conflict.");
    if (["expired", "failed"].includes(row.status))
      throw new Error("Checkout reservation is closed.");
    await client.query(
      "UPDATE checkout_attempts SET stripe_session_id=$2,status=CASE WHEN status='paid' THEN status ELSE 'open' END,updated_at=now() WHERE id=$1",
      [token, sessionId],
    );
    await client.query("UPDATE board_checkout_holds SET stripe_session_id=$2 WHERE hold_token=$1", [
      token,
      sessionId,
    ]);
    await client.query("UPDATE merch_checkout_holds SET stripe_session_id=$2 WHERE hold_token=$1", [
      token,
      sessionId,
    ]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
// Only after authoritative Stripe nonpayment or a definitive creation rejection.
export async function releaseCart(
  token: string,
  status: "expired" | "failed",
  expectedCreationRequestAt?: Date | null,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query<CheckoutAttempt & { creation_in_progress: boolean }>(
      `SELECT *,creation_requested_at > now()-interval '2 minutes' AS creation_in_progress
       FROM checkout_attempts WHERE id=$1 FOR UPDATE`,
      [token],
    );
    const attempt = result.rows[0];
    if (attempt && attempt.status !== "paid") {
      if (
        expectedCreationRequestAt !== undefined &&
        (attempt.creation_requested_at?.getTime() !== expectedCreationRequestAt?.getTime() ||
          attempt.creation_in_progress)
      )
        throw new Error(
          "A checkout creation request is still in progress; keep stock reserved and retry later.",
        );
      await client.query(
        "SELECT id FROM products WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE",
        [attempt.items.map((item) => item.productId)],
      );
      await client.query("DELETE FROM board_checkout_holds WHERE hold_token=$1", [token]);
      await client.query("DELETE FROM merch_checkout_holds WHERE hold_token=$1", [token]);
      await client.query(
        "UPDATE checkout_attempts SET status=$2,last_error=NULL,updated_at=now() WHERE id=$1",
        [token, status],
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
export async function isBoardHeld(productId: string): Promise<boolean> {
  const result = await pool.query("SELECT 1 FROM board_checkout_holds WHERE product_id=$1", [
    productId,
  ]);
  return Boolean(result.rowCount);
}
