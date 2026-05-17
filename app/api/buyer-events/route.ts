// app/api/buyer-events/route.ts
// Public buyer-event endpoint for client-side interactions that have no existing server route.

import { NextResponse, type NextRequest } from "next/server";
import { onBoardStyleSelected, onCartCreated } from "@/server/hooks/buyer-events";

export const runtime = "nodejs";

type ClientBuyerEventType = "cart_created" | "board_style_selected";

type BuyerEventResponse = {
  ok: boolean;
  eventId?: string | null;
  error?: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function optionalString(
  record: Record<string, unknown>,
  key: string,
  maxLength = 500,
): string | null {
  const value = record[key];
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (trimmed.length === 0) return null;

  return trimmed.slice(0, maxLength);
}

function optionalNumber(record: Record<string, unknown>, key: string): number | null {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function eventTypeFromBody(record: Record<string, unknown>): ClientBuyerEventType | null {
  const value = record.event_type ?? record.eventType;
  return value === "cart_created" || value === "board_style_selected" ? value : null;
}

export async function POST(request: NextRequest): Promise<NextResponse<BuyerEventResponse>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const record = asRecord(body);
  const payload = asRecord(record.payload);
  const eventType = eventTypeFromBody(record);

  if (!eventType) {
    return NextResponse.json(
      { ok: false, error: "Unsupported buyer event type." },
      { status: 422 },
    );
  }

  if (eventType === "board_style_selected") {
    const boardStyle = optionalString(payload, "board_style") ?? optionalString(payload, "boardStyle");

    if (!boardStyle) {
      return NextResponse.json(
        { ok: false, error: "board_style is required for board_style_selected events." },
        { status: 422 },
      );
    }

    const result = await onBoardStyleSelected({
      board_style: boardStyle,
      email: optionalString(payload, "email"),
      phone: optionalString(payload, "phone"),
      user_id: optionalString(payload, "user_id"),
      product_id: optionalString(payload, "product_id"),
      product_handle: optionalString(payload, "product_handle"),
      product_title: optionalString(payload, "product_title"),
    });

    return NextResponse.json({ ok: true, eventId: result.eventId });
  }

  const result = await onCartCreated({
    cart_id: optionalString(payload, "cart_id"),
    email: optionalString(payload, "email"),
    phone: optionalString(payload, "phone"),
    user_id: optionalString(payload, "user_id"),
    product_id: optionalString(payload, "product_id"),
    product_handle: optionalString(payload, "product_handle"),
    product_title: optionalString(payload, "product_title"),
    selected_board_style: optionalString(payload, "selected_board_style"),
    item_count: optionalNumber(payload, "item_count"),
    currency: optionalString(payload, "currency"),
    subtotal_amount: optionalNumber(payload, "subtotal_amount"),
  });

  return NextResponse.json({ ok: true, eventId: result.eventId });
}
