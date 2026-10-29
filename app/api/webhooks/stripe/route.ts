import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { pool } from "@/server/db/client";
import { getStripeClient, getStripeWebhookSecret } from "@/server/stripe/client";
import { finalizeCheckout, reconcileCheckoutAttempt } from "@/server/commerce/checkout";
import { refreshOrderRefunds } from "@/server/commerce/refunds";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature)
    return NextResponse.json(
      { received: false, error: "Missing Stripe signature." },
      { status: 400 },
    );
  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(raw, signature, getStripeWebhookSecret());
  } catch {
    return NextResponse.json(
      { received: false, error: "Invalid Stripe signature or webhook configuration." },
      { status: 400 },
    );
  }
  try {
    const receipt = await pool.query<{ processed: boolean }>(
      `INSERT INTO stripe_events(stripe_event_id,event_type,payload)
      VALUES($1,$2,$3::jsonb) ON CONFLICT(stripe_event_id) DO UPDATE SET stripe_event_id=EXCLUDED.stripe_event_id RETURNING processed`,
      [event.id, event.type, raw],
    );
    if (receipt.rows[0].processed)
      return NextResponse.json({ received: true, processed: true, duplicate: true });
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const object = event.data.object as Stripe.Checkout.Session;
      if (object.metadata?.source !== "plankz_deckz") {
        await pool.query(
          "UPDATE stripe_events SET processed=true,processed_at=now() WHERE stripe_event_id=$1",
          [event.id],
        );
        return NextResponse.json({ received: true, processed: true, ignored: true });
      }
      const session = await getStripeClient().checkout.sessions.retrieve(object.id);
      if (session.payment_status === "paid") await finalizeCheckout(session, event.id);
      else {
        const token = session.metadata?.hold_token;
        if (!token || !/^[0-9a-f-]{36}$/i.test(token))
          throw new Error("Checkout association requires review.");
        await reconcileCheckoutAttempt(token);
        await pool.query(
          "UPDATE stripe_events SET processed=true,processed_at=now() WHERE stripe_event_id=$1",
          [event.id],
        );
      }
    } else if (
      ["charge.refunded", "refund.created", "refund.updated", "refund.failed"].includes(event.type)
    ) {
      const object = event.data.object as Stripe.Charge | Stripe.Refund;
      const reference = object.payment_intent;
      const id = typeof reference === "string" ? reference : reference?.id;
      if (id) await refreshOrderRefunds(id);
      await pool.query(
        "UPDATE stripe_events SET processed=true,processed_at=now() WHERE stripe_event_id=$1",
        [event.id],
      );
    } else
      await pool.query(
        "UPDATE stripe_events SET processed=true,processed_at=now() WHERE stripe_event_id=$1",
        [event.id],
      );
    return NextResponse.json({ received: true, processed: true });
  } catch {
    // Retryable failures stay unprocessed. Detailed references are available in admin.
    return NextResponse.json(
      {
        received: true,
        processed: false,
        error: "Payment processing requires retry or reconciliation.",
      },
      { status: 500 },
    );
  }
}
