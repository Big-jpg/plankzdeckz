// app/api/buyer-events/route.ts
// Public buyer-event endpoint for client-side interactions that have no existing server route.

import { NextResponse, type NextRequest } from "next/server";
import { onAdapterSelected, onCartCreated } from "@/server/hooks/buyer-events";

export const runtime = "nodejs";

type ClientBuyerEventType = "cart_created" | "adapter_selected";

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
  return value === "cart_created" || value === "adapter_selected" ? value : null;
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

  if (eventType === "adapter_selected") {
    const adapterType =
      optionalString(payload, "adapter_type") ?? optionalString(payload, "adapterType");

    if (!adapterType) {
      return NextResponse.json(
        { ok: false, error: "adapter_type is required for adapter_selected events." },
        { status: 422 },
      );
    }

    const result = await onAdapterSelected({
      adapter_type: adapterType,
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
    selected_adapter: optionalString(payload, "selected_adapter"),
    item_count: optionalNumber(payload, "item_count"),
    currency: optionalString(payload, "currency"),
    subtotal_amount: optionalNumber(payload, "subtotal_amount"),
  });

  return NextResponse.json({ ok: true, eventId: result.eventId });
}
