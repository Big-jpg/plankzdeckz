// app/api/checkout/create-session/route.ts
// Creates a Stripe Checkout session from a server-validated PLANKZ DECKZ cart.

import { createHash } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { isBoardProduct, isMerchProduct } from "@/lib/types";
import { validateCartForCheckout, type VerifiedCartItem } from "@/server/cart/validation";
import { onCheckoutStarted } from "@/server/hooks/buyer-events";
import { getStripeClient } from "@/server/stripe/client";
import { findBoardHandlesInActiveCheckoutSessions } from "@/server/stripe/reservations";

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

function uniqueJoined(values: Array<string | null | undefined>): string {
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

function boardItems(items: VerifiedCartItem[]): VerifiedCartItem[] {
  return items.filter((item) => isBoardProduct(item.catalogueProduct));
}

function merchItems(items: VerifiedCartItem[]): VerifiedCartItem[] {
  return items.filter((item) => isMerchProduct(item.catalogueProduct));
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
          colour: item.colour,
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
  const commonMetadata: Stripe.MetadataParam = {
    line_item_index: String(index),
    product_id: metadataValue(item.productId),
    variant_id: metadataValue(item.variantId),
    handle: metadataValue(item.handle),
    product_type: metadataValue(item.productType),
    material: metadataValue(item.material),
    colour: metadataValue(item.colour),
    image_url: metadataValue(item.imageUrl),
    item_metadata: metadataValue(item.metadata),
  };

  if (isBoardProduct(item.catalogueProduct)) {
    return {
      ...commonMetadata,
      board_name: metadataValue(item.title),
      board_type: metadataValue(item.catalogueProduct.boardStyle),
      board_shape: metadataValue(item.catalogueProduct.boardShape),
      timber_species: metadataValue(item.catalogueProduct.timberSpecies.join(" / ")),
      dimensions: metadataValue(item.catalogueProduct.boardDimensions.display),
    };
  }

  return {
    ...commonMetadata,
    merch_item: metadataValue(item.title),
    merch_size: metadataValue(item.selectedSize),
  };
}

function buildSessionMetadata(items: VerifiedCartItem[]): Stripe.MetadataParam {
  const boards = boardItems(items);
  const merch = merchItems(items);

  return {
    source: "plankz_deckz",
    checkout_payload_version: "phase_3_cart_checkout_v1",
    local_pickup_only: "true",
    item_count: String(items.reduce((sum, item) => sum + item.quantity, 0)),
    product_types: uniqueJoined(items.map((item) => item.productType)),
    board_handles: uniqueJoined(boards.map((item) => item.handle)),
    board_names: uniqueJoined(boards.map((item) => item.title)),
    board_types: uniqueJoined(boards.map((item) => item.catalogueProduct.designFamily ?? item.material)),
    timber_species: uniqueJoined(
      boards.map((item) =>
        isBoardProduct(item.catalogueProduct)
          ? item.catalogueProduct.timberSpecies.join(" / ")
          : item.material,
      ),
    ),
    merch_items: uniqueJoined(merch.map((item) => item.title)),
    merch_sizes: uniqueJoined(merch.map((item) => item.selectedSize)),
    materials: uniqueJoined(items.map((item) => item.material)),
    colours: uniqueJoined(items.map((item) => item.colour)),
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

async function assertNoActiveBoardReservations(items: VerifiedCartItem[]): Promise<void> {
  const boardHandles = boardItems(items).map((item) => item.handle);
  const reservedHandles = await findBoardHandlesInActiveCheckoutSessions(boardHandles);

  if (reservedHandles.size > 0) {
    throw new Error(
      `Board${reservedHandles.size === 1 ? "" : "s"} ${Array.from(reservedHandles).join(", ")} already held in another active checkout session.`,
    );
  }
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

  try {
    await assertNoActiveBoardReservations(validation.verifiedItems);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "One or more boards are no longer available.",
      },
      { status: 409 },
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
    item_count: validation.verifiedItems.reduce((sum, item) => sum + item.quantity, 0),
    subtotal_amount: session.amount_subtotal ?? Math.round(validation.verifiedSubtotal * 100),
    total_amount: session.amount_total ?? Math.round(validation.verifiedSubtotal * 100),
    currency: validation.currency,
    board_handles: boardItems(validation.verifiedItems).map((item) => item.handle),
    merch_items: merchItems(validation.verifiedItems).map((item) => item.title),
    cart_fingerprint: cartFingerprint(validation.verifiedItems),
  });

  return NextResponse.json({ sessionId: session.id, url: session.url }, { status: 200 });
}
