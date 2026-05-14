// app/api/admin/orders/[id]/pickup-status/route.ts
// Admin pickup status mutation endpoint. All writes go through stored procedures.

import { NextResponse, type NextRequest } from "next/server";
import { checkAdminAuth } from "@/lib/admin-auth";
import { getOrderById, updatePickupStatus } from "@/server/db/contracts";
import {
  onOrderCollected,
  onOrderReadyForPickup,
  onPickupRequested,
} from "@/server/hooks/buyer-events";

export const runtime = "nodejs";

const VALID_PICKUP_STATUSES = ["pending", "ready", "collected", "cancelled"] as const;

type PickupStatus = (typeof VALID_PICKUP_STATUSES)[number];

type PickupStatusResponse = {
  ok: boolean;
  orderId?: string;
  pickupStatus?: PickupStatus;
  previousPickupStatus?: string;
  error?: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function isPickupStatus(value: unknown): value is PickupStatus {
  return typeof value === "string" && VALID_PICKUP_STATUSES.includes(value as PickupStatus);
}

async function firePickupTransitionHook(params: {
  orderId: string;
  newStatus: PickupStatus;
  previousStatus: string;
  email: string;
  phone: string | null;
  userId: string | null;
}) {
  if (params.previousStatus === params.newStatus) return null;

  if (params.newStatus === "pending") {
    return onPickupRequested({
      order_id: params.orderId,
      email: params.email,
      phone: params.phone,
      user_id: params.userId,
      requested_by: "admin",
    });
  }

  if (params.newStatus === "ready") {
    return onOrderReadyForPickup({
      order_id: params.orderId,
      email: params.email,
      phone: params.phone,
      user_id: params.userId,
      pickup_status: params.newStatus,
    });
  }

  if (params.newStatus === "collected") {
    return onOrderCollected({
      order_id: params.orderId,
      email: params.email,
      phone: params.phone,
      user_id: params.userId,
      pickup_status: params.newStatus,
    });
  }

  return null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<PickupStatusResponse>> {
  const admin = await checkAdminAuth();

  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.reason }, { status: admin.status });
  }

  const { id } = await params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const record = asRecord(body);
  const pickupStatus = record.pickup_status ?? record.status;

  if (!isPickupStatus(pickupStatus)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid pickup status. Must be one of: pending, ready, collected, cancelled.",
      },
      { status: 422 },
    );
  }

  const existingOrder = await getOrderById(id);

  if (!existingOrder) {
    return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });
  }

  const previousPickupStatus = existingOrder.pickup_status;
  const updated = await updatePickupStatus(id, pickupStatus);

  if (!updated) {
    return NextResponse.json(
      { ok: false, error: "Pickup status was not updated." },
      { status: 500 },
    );
  }

  await firePickupTransitionHook({
    orderId: id,
    newStatus: pickupStatus,
    previousStatus: previousPickupStatus,
    email: existingOrder.email,
    phone: existingOrder.phone,
    userId: existingOrder.user_id,
  });

  return NextResponse.json({
    ok: true,
    orderId: id,
    pickupStatus,
    previousPickupStatus,
  });
}
