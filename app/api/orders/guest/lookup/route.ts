// app/api/orders/guest/lookup/route.ts
// Guest order confirmation lookup by Stripe checkout session or email + order ID.

import { NextResponse, type NextRequest } from "next/server";
import {
  getOrderByCheckoutSession,
  getOrderById,
  type OrderWithItems,
} from "@/server/db/contracts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface LookupSuccessResponse {
  status: "found";
  order: OrderWithItems;
}

interface LookupPendingResponse {
  status: "pending";
  message: string;
}

interface LookupErrorResponse {
  status: "error";
  error: string;
}

type LookupResponse = LookupSuccessResponse | LookupPendingResponse | LookupErrorResponse;

function normaliseEmail(value: string | null): string | null {
  const trimmed = value?.trim().toLowerCase();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export async function GET(request: NextRequest): Promise<NextResponse<LookupResponse>> {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("session_id")?.trim() ?? "";
  const orderId = searchParams.get("order_id")?.trim() ?? "";
  const email = normaliseEmail(searchParams.get("email"));

  if (sessionId) {
    const order = await getOrderByCheckoutSession(sessionId);

    if (!order) {
      return NextResponse.json(
        {
          status: "pending",
          message: "Payment succeeded, but the order confirmation has not finished syncing yet.",
        },
        { status: 202 },
      );
    }

    return NextResponse.json({ status: "found", order }, { status: 200 });
  }

  if (!orderId || !email) {
    return NextResponse.json(
      {
        status: "error",
        error: "Provide either session_id, or both order_id and email.",
      },
      { status: 400 },
    );
  }

  const order = await getOrderById(orderId);

  if (!order || order.email.toLowerCase() !== email) {
    return NextResponse.json(
      { status: "error", error: "Order not found for that email and order ID." },
      { status: 404 },
    );
  }

  return NextResponse.json({ status: "found", order }, { status: 200 });
}
