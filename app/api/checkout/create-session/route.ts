// app/api/checkout/create-session/route.ts
// Creates a Stripe Checkout session from a server-validated PLANKZ DECKZ cart.

import { createHash } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { validateCartForCheckout, type VerifiedCartItem } from "@/server/cart/validation";
import { onCheckoutStarted } from "@/server/hooks/buyer-events";
import { getStripeClient } from "@/server/stripe/client";

export const runtime = "nodejs";

interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

interface CheckoutErrorResponse {
  error: string;
  details?: unknown;
}

const METADATA_VALUE_LIMIT = 500;

type CheckoutSessionCreateParams = NonNullable<
  Parameters<ReturnType<typeof getStripeClient>["checkout"]["sessions"]["create"]>[0]
>;
type CheckoutLineItem = NonNullable<CheckoutSessionCreateParams["line_items"]>[number];

function truncateMetadataValue(value: string): string {
  return value.length > METADATA_VALUE_LIMIT
    ? `${value.slice(0, METADATA_VALUE_LIMIT - 1)}…`
    : value;
}

function metadataValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return truncateMetadataValue(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  return truncateMetadataValue(JSON.stringify(value));
}

function uniqueJoined(values: Array<string | null>): string {
  return truncateMetadataValue(
    Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])).join(
      " | ",
    ),
  );
}

function absoluteImageUrl(imageUrl: string | null): string[] | undefined {
  if (!imageUrl) return undefined;

  try {
    const parsed = new URL(imageUrl);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? [imageUrl] : undefined;
  } catch {
    return undefined;
  }
}

function cartFingerprint(items: VerifiedCartItem[]): string {
  return createHash("sha256")
    .update(
      JSON.stringify(
        items.map((item) => ({
          handle: item.handle,
          variantId: item.variantId,
          quantity: item.quantity,
          productType: item.productType,
          selectedSize: item.selectedSize,
          selectedAdapter: item.selectedAdapter,
          colour: item.colour,
          fixtureNotes: item.fixtureNotes,
          customisationNotes: item.customisationNotes,
        })),
      ),
    )
    .digest("hex")
    .slice(0, 32);
}

function buildLineItemMetadata(
  item: VerifiedCartItem,
  index: number,
): Stripe.MetadataParam | undefined {
  return {
    line_item_index: String(index),
    product_id: metadataValue(item.productId),
    variant_id: metadataValue(item.variantId),
    handle: metadataValue(item.handle),
    product_type: metadataValue(item.productType),
    selected_size: metadataValue(item.selectedSize),
    selected_adapter: metadataValue(item.selectedAdapter),
    bulb_type_confirmed: metadataValue(item.bulbTypeConfirmed),
    fixture_notes: metadataValue(item.fixtureNotes),
    customisation_notes: metadataValue(item.customisationNotes),
    material: metadataValue(item.material),
    colour: metadataValue(item.colour),
    image_url: metadataValue(item.imageUrl),
    item_metadata: metadataValue(item.metadata),
  };
}

function buildSessionMetadata(items: VerifiedCartItem[]): Stripe.MetadataParam {
  return {
    source: "plankz_deckz",
    checkout_payload_version: "phase_2_catalogue_merch_v1",
    item_count: String(items.length),
    product_types: uniqueJoined(items.map((item) => item.productType)),
    selected_sizes: uniqueJoined(items.map((item) => item.selectedSize)),
    selected_adapters: uniqueJoined(items.map((item) => item.selectedAdapter)),
    materials: uniqueJoined(items.map((item) => item.material)),
    colours: uniqueJoined(items.map((item) => item.colour)),
    fixture_notes: uniqueJoined(items.map((item) => item.fixtureNotes)),
    customisation_notes: uniqueJoined(items.map((item) => item.customisationNotes)),
    cart_fingerprint: cartFingerprint(items),
  };
}

function buildLineItems(items: VerifiedCartItem[]): CheckoutLineItem[] {
  return items.map((item, index) => ({
    quantity: item.quantity,
    price_data: {
      currency: item.currency.toLowerCase(),
      unit_amount: item.unitAmount,
      product_data: {
        name: item.title,
        description: item.variantTitle ?? undefined,
        images: absoluteImageUrl(item.imageUrl),
        metadata: buildLineItemMetadata(item, index),
      },
    },
  }));
}

function checkoutBaseUrl(request: NextRequest): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<CheckoutSessionResponse | CheckoutErrorResponse>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = await validateCartForCheckout(
    body && typeof body === "object" ? body : { items: undefined },
    { requireLedAcknowledgement: true },
  );

  if (!validation.valid) {
    return NextResponse.json(
      {
        error: "Cart validation failed.",
        details: validation.errors,
      },
      { status: 422 },
    );
  }

  const baseUrl = checkoutBaseUrl(request);
  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: buildLineItems(validation.verifiedItems),
    metadata: buildSessionMetadata(validation.verifiedItems),
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout/cancel`,
    allow_promotion_codes: false,
    billing_address_collection: "auto",
    phone_number_collection: { enabled: true },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Stripe did not return a checkout URL." }, { status: 502 });
  }

  await onCheckoutStarted({
    stripe_checkout_session_id: session.id,
    item_count: validation.verifiedItems.length,
    subtotal_amount: session.amount_subtotal ?? Math.round(validation.verifiedSubtotal * 100),
    total_amount: session.amount_total ?? Math.round(validation.verifiedSubtotal * 100),
    currency: validation.currency,
    selected_adapters: Array.from(
      new Set(validation.verifiedItems.map((item) => item.selectedAdapter)),
    ),
    cart_fingerprint: cartFingerprint(validation.verifiedItems),
  });

  return NextResponse.json({ sessionId: session.id, url: session.url }, { status: 200 });
}
