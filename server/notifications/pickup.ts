import { pool } from "@/server/db/client";
import { enqueueOrderNotification, type OrderNotificationKind } from "./orders";

import { canTransitionPickup, type PickupStatus } from "./pickup-state";
export { PICKUP_STATUSES, isPickupStatus, type PickupStatus } from "./pickup-state";

export class PickupTransitionError extends Error {
  constructor(
    message: string,
    public readonly status: 404 | 409,
  ) {
    super(message);
    this.name = "PickupTransitionError";
  }
}

export async function updateOrderPickupStatus(
  orderId: string,
  next: PickupStatus,
  operatorId: string | null,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query<{
      status: string;
      fulfilment_method: string;
      pickup_status: string;
      pickup_revision: string;
      refund_status: string;
    }>(
      `SELECT status, fulfilment_method, pickup_status, pickup_revision, refund_status FROM orders WHERE id = $1 FOR UPDATE`,
      [orderId],
    );
    const order = result.rows[0];
    if (!order) throw new PickupTransitionError("Order not found.", 404);
    if (!canTransitionPickup(order, next)) {
      throw new PickupTransitionError(
        "This pickup transition is not permitted. Refresh the paid local-pickup order and check its current status.",
        409,
      );
    }
    if (order.pickup_status === next) {
      await client.query("COMMIT");
      return { previousStatus: order.pickup_status };
    }
    const updated = await client.query<{ pickup_revision: string }>(
      `UPDATE orders SET pickup_status = $2, pickup_revision = pickup_revision + 1, updated_at = now()
       WHERE id = $1 RETURNING pickup_revision`,
      [orderId, next],
    );
    await client.query(
      `UPDATE pickup_requests SET status = $2, updated_at = now()
       WHERE id = (SELECT id FROM pickup_requests WHERE order_id = $1 ORDER BY created_at DESC, id DESC LIMIT 1)`,
      [orderId, next],
    );
    await client.query(
      `INSERT INTO buyer_events (user_id, event_type, event_data, order_id)
       VALUES ($1, 'pickup_status_updated', $2::jsonb, $3)`,
      [
        operatorId,
        JSON.stringify({ previous_status: order.pickup_status, pickup_status: next }),
        orderId,
      ],
    );
    const kinds: Partial<Record<PickupStatus, OrderNotificationKind>> = {
      ready: "pickup_ready",
      collected: "pickup_collected",
      cancelled: "pickup_cancelled",
    };
    const kind = kinds[next];
    if (kind) {
      await enqueueOrderNotification(
        client,
        orderId,
        kind,
        `pickup:${orderId}:${updated.rows[0].pickup_revision}`,
      );
    }
    await client.query("COMMIT");
    return { previousStatus: order.pickup_status };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
