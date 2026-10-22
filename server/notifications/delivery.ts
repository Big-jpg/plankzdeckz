export const NOTIFICATION_KINDS = [
  "order_confirmed",
  "pickup_ready",
  "pickup_collected",
  "pickup_cancelled",
] as const;

export type OrderNotificationKind = (typeof NOTIFICATION_KINDS)[number];

export interface NotificationLease {
  id: string;
  order_id: string;
  kind: OrderNotificationKind;
  lease_token: string;
}

export interface NotificationOrder {
  id: string;
  email: string | null;
  total_amount: number;
  currency: string;
  fulfilment_method: string;
  pickup_status: string;
  items: Array<{
    title: string;
    variant_title: string | null;
    quantity: number;
    total_amount: number;
  }>;
}

export interface NotificationMessage {
  to: string;
  subject: string;
  text: string;
  messageId: string;
}

export class NotificationDeliveryError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "NotificationDeliveryError";
  }
}

export function notificationErrorCode(error: unknown): string {
  if (error instanceof NotificationDeliveryError) return error.code;
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error.code === "ETIMEDOUT" || error.code === "ESOCKET")
  )
    return "smtp_connection_failed";
  // SMTP errors can contain recipient addresses, credentials or server responses.
  return "smtp_delivery_failed";
}

export function buildOrderNotification(
  notification: NotificationLease,
  order: NotificationOrder,
): NotificationMessage {
  const recipient = order.email?.trim();
  if (!recipient || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(recipient)) {
    throw new NotificationDeliveryError("invalid_recipient");
  }
  const money = (amount: number) =>
    new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: order.currency.toUpperCase(),
    }).format(amount / 100);
  const descriptions: Record<OrderNotificationKind, [string, string]> = {
    order_confirmed: [
      "Order confirmed",
      "Your payment has been confirmed and your order recorded.",
    ],
    pickup_ready: [
      "Order ready for collection",
      "Your order is ready for collection. Please use the collection arrangements agreed with PLANKZ DECKZ.",
    ],
    pickup_collected: [
      "Order collected",
      "Your order has been recorded as collected. Thank you for shopping with PLANKZ DECKZ.",
    ],
    pickup_cancelled: [
      "Collection cancelled",
      "The collection arrangement for your order has been cancelled. This does not confirm a payment refund. Contact PLANKZ DECKZ to arrange the next step.",
    ],
  };
  const [subject, introduction] = descriptions[notification.kind];
  const items = order.items.map(
    (item) =>
      `${item.quantity} × ${item.title}${item.variant_title ? ` (${item.variant_title})` : ""} — ${money(item.total_amount)}`,
  );
  const collectionNote =
    notification.kind === "order_confirmed" && order.fulfilment_method === "local_pickup"
      ? order.pickup_status === "collected"
        ? "Your order has been recorded as collected."
        : order.pickup_status === "ready"
          ? "Your order is ready for collection using the agreed arrangements."
          : order.pickup_status === "pending"
            ? "We will contact you when your order is ready for collection."
            : "Please contact PLANKZ DECKZ to confirm collection arrangements."
      : "";
  return {
    to: recipient,
    subject: `PLANKZ DECKZ — ${subject} (${order.id})`,
    text: [
      introduction,
      `Order: ${order.id}`,
      ...items,
      `Total: ${money(order.total_amount)}`,
      collectionNote,
    ]
      .filter(Boolean)
      .join("\n\n"),
    messageId: `<order-notification-${notification.id}@plankzdeckz.com>`,
  };
}

export interface NotificationDeliveryDependencies {
  claim(orderId: string, excludedIds: string[]): Promise<NotificationLease | null>;
  loadOrder(orderId: string): Promise<NotificationOrder | null>;
  send(message: NotificationMessage): Promise<void>;
  complete(lease: NotificationLease, errorCode: string | null): Promise<void>;
}

/** A bounded request-time attempt. Leases make interrupted attempts recoverable. */
export async function deliverNotificationBatch(
  orderId: string,
  dependencies: NotificationDeliveryDependencies,
): Promise<void> {
  const attempted: string[] = [];
  for (let index = 0; index < 4; index++) {
    const lease = await dependencies.claim(orderId, attempted);
    if (!lease) return;
    attempted.push(lease.id);
    let errorCode: string | null = null;
    try {
      const order = await dependencies.loadOrder(orderId);
      if (!order) throw new NotificationDeliveryError("order_missing");
      const expectedPickupState = {
        pickup_ready: "ready",
        pickup_collected: "collected",
        pickup_cancelled: "cancelled",
      }[lease.kind as "pickup_ready" | "pickup_collected" | "pickup_cancelled"];
      if (expectedPickupState && order.pickup_status !== expectedPickupState) {
        throw new NotificationDeliveryError("pickup_state_changed");
      }
      await dependencies.send(buildOrderNotification(lease, order));
    } catch (error) {
      errorCode = notificationErrorCode(error);
    }
    await dependencies.complete(lease, errorCode);
  }
}
