import { NextResponse, type NextRequest } from "next/server";
import { checkAdminAuth } from "@/lib/admin-auth";
import {
  updateOrderPickupStatus,
  PickupTransitionError,
  isPickupStatus,
} from "@/server/notifications/pickup";
import { deliverOrderNotifications } from "@/server/notifications/orders";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await checkAdminAuth();
  if (!admin.ok)
    return NextResponse.json({ ok: false, error: admin.reason }, { status: admin.status });
  if (request.headers.get("origin") && request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json(
      { ok: false, error: "Request origin is not permitted." },
      { status: 403 },
    );
  }
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }
  const record =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};
  const status = record.pickup_status ?? record.status;
  if (!isPickupStatus(status)) {
    return NextResponse.json({ ok: false, error: "Invalid pickup status." }, { status: 422 });
  }
  try {
    const result = await updateOrderPickupStatus(id, status, admin.session.user?.id ?? null);
    await deliverOrderNotifications(id);
    return NextResponse.json({
      ok: true,
      orderId: id,
      pickupStatus: status,
      previousPickupStatus: result.previousStatus,
    });
  } catch (error) {
    if (error instanceof PickupTransitionError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      {
        ok: false,
        error: "Pickup status could not be updated. Refresh the order before retrying.",
      },
      { status: 503 },
    );
  }
}
