export const PICKUP_STATUSES = ["pending", "ready", "collected", "cancelled"] as const;
export type PickupStatus = (typeof PICKUP_STATUSES)[number];

export function isPickupStatus(value: unknown): value is PickupStatus {
  return typeof value === "string" && PICKUP_STATUSES.includes(value as PickupStatus);
}

export function canTransitionPickup(
  order: {
    status: string;
    fulfilment_method: string;
    pickup_status: string;
    refund_status?: string;
  },
  next: PickupStatus,
) {
  if (order.status !== "paid" || order.fulfilment_method !== "local_pickup") return false;
  if (order.refund_status === "full" && next !== "cancelled") return false;
  if (order.pickup_status === next) return true;
  const transitions: Record<string, readonly PickupStatus[]> = {
    pending: ["ready", "cancelled"],
    ready: ["pending", "collected", "cancelled"],
    collected: [],
    cancelled: ["pending"],
  };
  return transitions[order.pickup_status]?.includes(next) ?? false;
}
