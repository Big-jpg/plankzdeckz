import "server-only";
import { pool } from "@/server/db/client";
import { getStripeClient } from "@/server/stripe/client";

export async function refreshOrderRefunds(paymentIntentId: string): Promise<void> {
  // Claim a generation before the external read; no database lock spans Stripe I/O.
  const claimed = await pool.query<{ refund_refresh_revision: number }>(
    `UPDATE orders SET refund_refresh_revision=refund_refresh_revision+1
     WHERE stripe_payment_intent_id=$1 RETURNING refund_refresh_revision`,
    [paymentIntentId],
  );
  if (!claimed.rowCount) return;
  const revision = claimed.rows[0].refund_refresh_revision;
  const startedAt = new Date().toISOString();
  try {
    const refunds = [];
    for await (const refund of getStripeClient().refunds.list({
      payment_intent: paymentIntentId,
      limit: 100,
    })) {
      refunds.push({
        id: refund.id,
        amount: refund.amount,
        status: refund.status,
        created: refund.created,
      });
    }
    const amount = refunds
      .filter((r) => r.status === "succeeded")
      .reduce((sum, r) => sum + r.amount, 0);
    const pending = refunds.some((r) => r.status === "pending" || r.status === "requires_action");
    const failed = refunds.some((r) => r.status === "failed" || r.status === "canceled");
    await pool.query(
      `UPDATE orders SET refunded_amount=GREATEST(refunded_amount,$2),
    refund_status=CASE WHEN GREATEST(refunded_amount,$2)>=total_amount THEN 'full'
      WHEN $3 THEN 'pending' WHEN GREATEST(refunded_amount,$2)>0 THEN 'partial'
      WHEN $4 THEN 'failed' ELSE 'none' END,
    refund_details=$5::jsonb,refund_checked_at=$6,refund_sync_error=NULL,updated_at=now()
    WHERE stripe_payment_intent_id=$1 AND refund_refresh_revision=$7`,
      [paymentIntentId, amount, pending, failed, JSON.stringify(refunds), startedAt, revision],
    );
  } catch (error) {
    await pool.query(
      `UPDATE orders SET refund_sync_error='Stripe refund status could not be refreshed. Use Refresh refund status.',updated_at=now()
      WHERE stripe_payment_intent_id=$1 AND refund_refresh_revision=$2`,
      [paymentIntentId, revision],
    );
    throw error;
  }
}
