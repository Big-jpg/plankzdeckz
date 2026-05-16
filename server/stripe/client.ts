// server/stripe/client.ts
// PLANKZ DECKZ — Server-side Stripe client helpers.

import "server-only";

import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is required for Stripe checkout.");
  }

  stripeClient ??= new Stripe(secretKey, {
    appInfo: {
      name: "PLANKZ DECKZ",
    },
  });

  return stripeClient;
}

export function getStripeWebhookSecret(): string {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is required for Stripe webhooks.");
  }

  return webhookSecret;
}
