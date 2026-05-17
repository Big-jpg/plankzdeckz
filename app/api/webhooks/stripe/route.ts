// app/api/webhooks/stripe/route.ts
// Stripe webhook endpoint for idempotent order persistence.

import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import {
  createOrderFromStripeSession,
  createOrderItem,
  markStripeEventProcessed,
  recordStripeEvent,
} from "@/server/db/contracts";
import { onOrderCreated, onPaymentConfirmed } from "@/server/hooks/buyer-events";
import { getStripeClient, getStripeWebhookSecret } from "@/server/stripe/client";

export const runtime = "nodejs";

type WebhookResponse = {
  received: boolean;
  processed?: boolean;
  duplicate?: boolean;
  ignored?: boolean;
  error?: string;
};

function stripeObjectId(value: string | Stripe.PaymentIntent | null): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function metadataString(
  metadata: Stripe.Metadata | null | undefined,
  key: string,
  fallback: string | null = null,
): string | null {
  const value = metadata?.[key];
  return value && value.trim().length > 0 ? value : fallback;
}

function parseMetadataJson(
  metadata: Stripe.Metadata | null | undefined,
  key: string,
): Record<string, unknown> {
  const value = metadata?.[key];
  if (!value) return {};

  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function productMetadataFromLineItem(lineItem: Stripe.LineItem): Stripe.Metadata | null {
  const product = lineItem.price?.product;

  if (!product || typeof product === "string" || product.deleted) {
    return null;
  }

  return product.metadata;
}

function lineItemTitle(lineItem: Stripe.LineItem): string {
  if (lineItem.description && lineItem.description.trim().length > 0) return lineItem.description;

  const product = lineItem.price?.product;
  if (product && typeof product !== "string" && !product.deleted && product.name) {
    return product.name;
  }

  return "PLANKZ DECKZ item";
}

function checkoutEmail(session: Stripe.Checkout.Session): string | null {
  return session.customer_details?.email ?? session.customer_email ?? null;
}

function checkoutBuyerName(session: Stripe.Checkout.Session): string | null {
  return session.customer_details?.name ?? null;
}

function checkoutPhone(session: Stripe.Checkout.Session): string | null {
  return session.customer_details?.phone ?? null;
}

function productTypeFromMetadata(metadata: Stripe.Metadata | null): "board" | "merch" {
  return metadataString(metadata, "product_type") === "merch" ? "merch" : "board";
}

function boardStyleFromMetadata(metadata: Stripe.Metadata | null): "cruiser" | "surfskate" | "longboard" | null {
  const boardStyle = metadataString(metadata, "board_style") ?? metadataString(metadata, "board_type");
  return boardStyle === "cruiser" || boardStyle === "surfskate" || boardStyle === "longboard"
    ? boardStyle
    : null;
}

function lineItemVariantTitle(metadata: Stripe.Metadata | null): string | null {
  const merchSize = metadataString(metadata, "merch_size");
  if (merchSize) return `Size ${merchSize}`;

  const boardType = metadataString(metadata, "board_type");
  return boardType ? `Board type: ${boardType}` : null;
}

function simplifiedLineItemMetadata(
  metadata: Stripe.Metadata | null,
  lineItem: Stripe.LineItem,
): Record<string, unknown> {
  return {
    ...parseMetadataJson(metadata, "item_metadata"),
    stripe_line_item_id: lineItem.id,
    stripe_price_id: lineItem.price?.id ?? null,
    stripe_product_id:
      typeof lineItem.price?.product === "string"
        ? lineItem.price.product
        : lineItem.price?.product?.id,
    handle: metadataString(metadata, "handle"),
    product_type: metadataString(metadata, "product_type"),
    board_name: metadataString(metadata, "board_name"),
    board_type: metadataString(metadata, "board_type"),
    board_shape: metadataString(metadata, "board_shape"),
    timber_species: metadataString(metadata, "timber_species"),
    dimensions: metadataString(metadata, "dimensions"),
    merch_item: metadataString(metadata, "merch_item"),
    merch_size: metadataString(metadata, "merch_size"),
    local_pickup_only: true,
  };
}

async function persistCheckoutSessionOrder(session: Stripe.Checkout.Session): Promise<void> {
  const email = checkoutEmail(session);

  if (!email) {
    throw new Error(`Stripe checkout session ${session.id} did not include a customer email.`);
  }

  const stripe = getStripeClient();
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ["data.price.product"],
  });

  const order = await createOrderFromStripeSession({
    email,
    buyer_name: checkoutBuyerName(session),
    phone: checkoutPhone(session),
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: stripeObjectId(session.payment_intent),
    status: session.payment_status === "paid" ? "paid" : "pending",
    fulfilment_method: "local_pickup",
    subtotal_amount:
      session.amount_subtotal ??
      lineItems.data.reduce((total, lineItem) => total + (lineItem.amount_subtotal ?? 0), 0),
    total_amount:
      session.amount_total ??
      lineItems.data.reduce((total, lineItem) => total + (lineItem.amount_total ?? 0), 0),
    currency: (session.currency ?? lineItems.data[0]?.currency ?? "aud").toUpperCase(),
  });

  if (!order) {
    throw new Error(`Order procedure returned no row for Stripe checkout session ${session.id}.`);
  }

  if (!order.is_new) {
    return;
  }

  for (const lineItem of lineItems.data) {
    const metadata = productMetadataFromLineItem(lineItem);

    await createOrderItem({
      order_id: order.id,
      shopify_product_id: metadataString(metadata, "product_id"),
      shopify_variant_id: metadataString(metadata, "variant_id"),
      title: lineItemTitle(lineItem),
      variant_title: lineItemVariantTitle(metadata),
      quantity: lineItem.quantity ?? 1,
      unit_amount: lineItem.price?.unit_amount ?? 0,
      total_amount: lineItem.amount_total ?? 0,
      image_url: metadataString(metadata, "image_url"),
      product_type: productTypeFromMetadata(metadata),
      board_style: boardStyleFromMetadata(metadata),
      merch_size: metadataString(metadata, "merch_size"),
      customisation_notes: null,
      material: metadataString(metadata, "material") ?? metadataString(metadata, "timber_species"),
      colour: metadataString(metadata, "colour"),
      metadata: simplifiedLineItemMetadata(metadata, lineItem),
    });
  }

  await onPaymentConfirmed({
    order_id: order.id,
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: stripeObjectId(session.payment_intent),
    email,
    phone: checkoutPhone(session),
    amount_total: session.amount_total,
    currency: (session.currency ?? lineItems.data[0]?.currency ?? "aud").toUpperCase(),
    payment_status: session.payment_status,
  });

  await onOrderCreated({
    order_id: order.id,
    email,
    phone: checkoutPhone(session),
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: stripeObjectId(session.payment_intent),
    status: order.status,
    total_amount:
      session.amount_total ??
      lineItems.data.reduce((total, lineItem) => total + (lineItem.amount_total ?? 0), 0),
    currency: (session.currency ?? lineItems.data[0]?.currency ?? "aud").toUpperCase(),
    item_count: lineItems.data.length,
  });
}

export async function POST(request: NextRequest): Promise<NextResponse<WebhookResponse>> {
  const stripe = getStripeClient();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { received: false, error: "Missing Stripe signature header." },
      { status: 400 },
    );
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, getStripeWebhookSecret());
  } catch (error) {
    return NextResponse.json(
      {
        received: false,
        error: error instanceof Error ? error.message : "Invalid Stripe webhook signature.",
      },
      { status: 400 },
    );
  }

  const eventRecord = await recordStripeEvent(event.id, event.type, JSON.parse(rawBody));

  if (!eventRecord) {
    return NextResponse.json(
      { received: false, error: "Stripe event could not be recorded." },
      { status: 500 },
    );
  }

  if (!eventRecord.is_new && eventRecord.processed) {
    return NextResponse.json({ received: true, duplicate: true, processed: true });
  }

  if (event.type !== "checkout.session.completed") {
    await markStripeEventProcessed(event.id);
    return NextResponse.json({ received: true, ignored: true, processed: true });
  }

  try {
    await persistCheckoutSessionOrder(event.data.object as Stripe.Checkout.Session);
    await markStripeEventProcessed(event.id);
  } catch (error) {
    return NextResponse.json(
      {
        received: true,
        processed: false,
        error: error instanceof Error ? error.message : "Stripe webhook processing failed.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true, processed: true });
}
