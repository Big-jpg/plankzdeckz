// server/stripe/reservations.ts
// Detect one-of-a-kind boards currently held by active Stripe Checkout sessions.

import "server-only";

import type Stripe from "stripe";
import { getStripeClient } from "./client";

// Lookback window for active sessions. Sessions now expire after 30 minutes,
// so 1 hour provides a generous safety buffer.
const ACTIVE_SESSION_LOOKBACK_SECONDS = 60 * 60 * 1;

function splitMetadataList(value: string | undefined): string[] {
  if (!value) return [];

  const trimmed = value.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((entry): entry is string => typeof entry === "string");
      }
    } catch {
      // Fall back to pipe-delimited parsing below.
    }
  }

  return trimmed
    .split("|")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function metadataBoardHandles(metadata: Stripe.Metadata | null | undefined): string[] {
  return splitMetadataList(metadata?.board_handles);
}

function isActiveCheckoutSession(session: Stripe.Checkout.Session, nowSeconds: number): boolean {
  if (session.status && session.status !== "open") return false;
  if (typeof session.expires_at === "number" && session.expires_at <= nowSeconds) return false;
  return true;
}

export async function findBoardHandlesInActiveCheckoutSessions(
  handles: string[],
): Promise<Set<string>> {
  const requestedHandles = new Set(handles.map((handle) => handle.trim()).filter(Boolean));
  const reservedHandles = new Set<string>();

  if (requestedHandles.size === 0) return reservedHandles;

  const stripe = getStripeClient();
  const nowSeconds = Math.floor(Date.now() / 1000);
  const createdAfter = nowSeconds - ACTIVE_SESSION_LOOKBACK_SECONDS;

  const sessions = await stripe.checkout.sessions.list({
    limit: 100,
    created: { gte: createdAfter },
  });

  for (const session of sessions.data) {
    if (!isActiveCheckoutSession(session, nowSeconds)) continue;

    for (const handle of metadataBoardHandles(session.metadata)) {
      if (requestedHandles.has(handle)) {
        reservedHandles.add(handle);
      }
    }
  }

  return reservedHandles;
}
