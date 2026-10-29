import { NextResponse, type NextRequest } from "next/server";
import { checkAdminAuth } from "@/lib/admin-auth";
import {
  deliverOrderNotifications,
  getOrderNotificationStatuses,
} from "@/server/notifications/orders";

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
  try {
    await deliverOrderNotifications(id);
    const notifications = await getOrderNotificationStatuses(id);
    return NextResponse.json({ ok: true, notifications });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Email status is unavailable. Refresh before retrying." },
      { status: 503 },
    );
  }
}
