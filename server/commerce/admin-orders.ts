import "server-only";
import { queryOne, queryRows } from "@/server/db/client";

export interface AdminOrderSummary {
  id: string;
  email: string | null;
  buyer_name: string | null;
  total_amount: number;
  currency: string;
  status: string;
  pickup_status: string;
  channel: string;
  refund_status: string;
  refunded_amount: number;
  reconciliation_status: string;
  payment_reference: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
}

export async function searchAdminOrders(
  search: string,
  channel: string,
  page: number,
): Promise<{ orders: AdminOrderSummary[]; total: number }> {
  const term = search.trim().slice(0, 255);
  const selectedChannel = channel === "online" || channel === "market" ? channel : "";
  const values = [term, selectedChannel];
  const filter = `WHERE ($1='' OR strpos(lower(concat_ws(' ',id::text,email,buyer_name,stripe_checkout_session_id,
    stripe_payment_intent_id,payment_reference)),lower($1))>0) AND ($2='' OR channel=$2)`;
  const [orders, count] = await Promise.all([
    queryRows<AdminOrderSummary>(
      `SELECT id,email,buyer_name,total_amount,currency,status,pickup_status,channel,
      refund_status,refunded_amount,reconciliation_status,payment_reference,stripe_payment_intent_id,created_at
      FROM orders ${filter} ORDER BY created_at DESC,id LIMIT 50 OFFSET $3`,
      [...values, (page - 1) * 50],
    ),
    queryOne<{ count: string }>(`SELECT COUNT(*)::text AS count FROM orders ${filter}`, values),
  ]);
  return { orders, total: Number(count?.count ?? 0) };
}

export async function getOrderOperations(id: string) {
  return queryOne<{
    channel: string;
    operator_email: string | null;
    sold_at: string | null;
    reconciliation_status: string;
    refund_status: string;
    refunded_amount: number;
    refund_details: unknown;
    refund_checked_at: string | null;
    refund_sync_error: string | null;
    payment_reference: string | null;
  }>(
    `SELECT channel,operator_email,sold_at,reconciliation_status,refund_status,refunded_amount,refund_details,refund_checked_at,refund_sync_error,payment_reference
     FROM orders WHERE id=$1`,
    [id],
  );
}
