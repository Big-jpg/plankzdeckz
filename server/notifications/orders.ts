import type { PoolClient } from "pg";
import { pool } from "@/server/db/client";
import {
  deliverNotificationBatch,
  type NotificationLease,
  type NotificationOrder,
  type OrderNotificationKind,
} from "./delivery";
import { sendOrderEmail } from "./smtp";

export type { OrderNotificationKind } from "./delivery";

/** Must be called on the client holding the order's business transaction. */
export async function enqueueOrderNotification(
  client: PoolClient,
  orderId: string,
  kind: OrderNotificationKind,
  dedupeKey: string,
): Promise<void> {
  await client.query(
    `INSERT INTO order_notifications (order_id, kind, dedupe_key)
     SELECT id, $2, $3 FROM orders WHERE id = $1 AND NULLIF(trim(email), '') IS NOT NULL
     ON CONFLICT (dedupe_key) DO NOTHING`,
    [orderId, kind, dedupeKey],
  );
}

export async function deliverOrderNotifications(orderId: string): Promise<void> {
  try {
    await deliverNotificationBatch(orderId, {
      async claim(id, excludedIds) {
        const result = await pool.query<NotificationLease>(
          `WITH next_notification AS (
             SELECT id FROM order_notifications
             WHERE order_id = $1 AND NOT (id = ANY($2::uuid[]))
               AND (status IN ('pending', 'failed') OR (status = 'sending' AND lease_until < now()))
             ORDER BY created_at, id FOR UPDATE SKIP LOCKED LIMIT 1
           )
           UPDATE order_notifications n
           SET status = 'sending', attempts = attempts + 1,
               lease_token = gen_random_uuid(), lease_until = now() + interval '2 minutes', updated_at = now()
           FROM next_notification WHERE n.id = next_notification.id
           RETURNING n.id, n.order_id, n.kind, n.lease_token`,
          [id, excludedIds],
        );
        return result.rows[0] ?? null;
      },
      async loadOrder(id) {
        const order = await pool.query<Omit<NotificationOrder, "items">>(
          `SELECT id, email, total_amount, currency, fulfilment_method, pickup_status FROM orders WHERE id = $1`,
          [id],
        );
        if (!order.rows[0]) return null;
        const items = await pool.query<NotificationOrder["items"][number]>(
          `SELECT title, variant_title, quantity, total_amount FROM order_items WHERE order_id = $1 ORDER BY created_at, id`,
          [id],
        );
        return { ...order.rows[0], items: items.rows };
      },
      send: sendOrderEmail,
      async complete(lease, errorCode) {
        await pool.query(
          `UPDATE order_notifications SET status = $3, last_error_code = $4,
             accepted_at = CASE WHEN $3 = 'accepted' THEN now() ELSE NULL END,
             lease_token = NULL, lease_until = NULL, updated_at = now()
           WHERE id = $1 AND lease_token = $2 AND status = 'sending'`,
          [
            lease.id,
            lease.lease_token,
            errorCode === "pickup_state_changed" ? "superseded" : errorCode ? "failed" : "accepted",
            errorCode,
          ],
        );
      },
    });
  } catch {
    // The committed order remains valid. An interrupted lease can be retried by an admin.
  }
}

export interface OrderNotificationStatus {
  id: string;
  kind: OrderNotificationKind;
  status: "pending" | "sending" | "accepted" | "failed" | "superseded";
  attempts: number;
  last_error_code: string | null;
  accepted_at: Date | null;
  lease_until: Date | null;
}

export async function getOrderNotificationStatuses(
  orderId: string,
): Promise<OrderNotificationStatus[]> {
  const result = await pool.query<OrderNotificationStatus>(
    `SELECT id, kind, status, attempts, last_error_code, accepted_at, lease_until
     FROM order_notifications WHERE order_id = $1 ORDER BY created_at, id`,
    [orderId],
  );
  return result.rows;
}
