// app/api/checkout/create-session/route.ts
// Creates a Stripe Checkout session from a server-validated PLANKZ DECKZ cart.

import { createHash } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { isBoardProduct, isMerchProduct } from "@/lib/types";
import { validateCartForCheckout, type VerifiedCartItem } from "@/server/cart/validation";
import { onCheckoutStarted } from "@/server/hooks/buyer-events";
import { getStripeClient } from "@/server/stripe/client";
import { reserveCart, attachStripeSession, getCheckoutAttempt } from "@/server/cart/holds";
import { pool } from "@/server/db/client";
import { reconcileOverdueStock } from "@/server/commerce/checkout";
import { SALES_ENABLED, SALES_DISABLED_CODE, SALES_DISABLED_MESSAGE } from "@/lib/commerce-config";

export const runtime = "nodejs";
export const maxDuration = 60;

interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

interface CheckoutErrorResponse {
  error: string;
  code?: string;
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
    board_types: uniqueJoined(
      boards.map((item) =>
        isBoardProduct(item.catalogueProduct) ? item.catalogueProduct.boardStyle : null,
      ),
    ),
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

export async function POST(
  request: NextRequest,
): Promise<NextResponse<CheckoutSessionResponse | CheckoutErrorResponse>> {
  if (!SALES_ENABLED) {
    return NextResponse.json(
      { error: SALES_DISABLED_MESSAGE, code: SALES_DISABLED_CODE },
      { status: 403 },
    );
  }

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

  let stripe: ReturnType<typeof getStripeClient>;
  try {
    stripe = getStripeClient();
  } catch {
    return NextResponse.json(
      { error: "Checkout is unavailable. Please try again later." },
      { status: 503 },
    );
  }

  const holdToken = request.headers.get("idempotency-key")?.trim().toLowerCase() ?? "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(holdToken))
    return NextResponse.json(
      { error: "A valid checkout Idempotency-Key is required." },
      { status: 400 },
    );
  const total = validation.verifiedItems.reduce((sum, item) => sum + item.totalAmount, 0);
  if (
    !Number.isSafeInteger(total) ||
    total < 50 ||
    total > 2_147_483_647 ||
    validation.currency.toUpperCase() !== "AUD"
  )
    return NextResponse.json(
      { error: "Checkout requires an AUD total of at least $0.50." },
      { status: 422 },
    );
  const requestHash = createHash("sha256").update(JSON.stringify(body)).digest("hex");
  try {
    await reconcileOverdueStock(validation.verifiedItems.map((item) => item.productId));
    await reserveCart(validation.verifiedItems, holdToken, requestHash);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Stock could not be reserved." },
      { status: 409 },
    );
  }
  const baseUrl = checkoutBaseUrl(request);
  const params: CheckoutSessionCreateParams = {
    mode: "payment",
    payment_method_types: ["card"],
    expires_at: Math.floor(Date.now() / 1000) + 35 * 60,
    line_items: buildLineItems(validation.verifiedItems),
    metadata: { ...buildSessionMetadata(validation.verifiedItems), hold_token: holdToken },
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout/cancel`,
    allow_promotion_codes: false,
    billing_address_collection: "auto",
    phone_number_collection: { enabled: true },
  };
  let session: Stripe.Checkout.Session;
  try {
    // Store exact creation parameters before the external request, including expiry.
    const prepared = await pool.query(
      `UPDATE checkout_attempts SET stripe_params=COALESCE(stripe_params,$2::jsonb),
      expires_at=COALESCE(expires_at,to_timestamp($3)),updated_at=now() WHERE id=$1 AND status IN ('creating','open','needs_review') RETURNING id`,
      [holdToken, JSON.stringify(params), params.expires_at],
    );
    if (!prepared.rowCount) throw new Error("Checkout reservation is closed.");
    const attempt = await getCheckoutAttempt(holdToken);
    if (!attempt?.stripe_params) throw new Error("Checkout attempt could not be recovered.");
    if (Date.now() - new Date(attempt.created_at).getTime() > 23 * 60 * 60 * 1000)
      return NextResponse.json(
        {
          error:
            "This checkout needs owner review. Start a new cart after the reservation is resolved.",
        },
        { status: 409 },
      );
    if (!attempt.stripe_session_id) {
      const claimed = await pool.query(
        `UPDATE checkout_attempts SET creation_requested_at=now(),updated_at=now()
        WHERE id=$1 AND status IN ('creating','open','needs_review')
          AND created_at>now()-interval '23 hours' RETURNING id`,
        [holdToken],
      );
      if (!claimed.rowCount) throw new Error("Checkout reservation is closed.");
    }
    session = attempt.stripe_session_id
      ? await stripe.checkout.sessions.retrieve(attempt.stripe_session_id)
      : await stripe.checkout.sessions.create(
          attempt.stripe_params as CheckoutSessionCreateParams,
          { idempotencyKey: holdToken },
        );
    await attachStripeSession(holdToken, session.id);
    if (!session.url || session.status !== "open")
      throw new Error("This checkout is no longer open.");
  } catch {
    // A rejection on retry is not evidence that an earlier request never created a session.
    await pool.query(
      `UPDATE checkout_attempts SET last_error='Session creation or association requires reconciliation',
        status=CASE WHEN status IN ('creating','open') THEN 'needs_review' ELSE status END,updated_at=now() WHERE id=$1`,
      [holdToken],
    );
    return NextResponse.json(
      {
        error:
          "Checkout could not be opened. Retry this checkout; its reservation is retained if payment status is uncertain.",
      },
      { status: 502 },
    );
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
