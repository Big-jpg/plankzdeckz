// components/guest-order-lookup-form.tsx

"use client";

import { useState } from "react";

type LookupOrderItem = {
  id: string;
  title: string;
  quantity: number;
  total_amount: number;
  product_type: string;
};

type LookupOrder = {
  id: string;
  email: string;
  status: string;
  total_amount: number;
  currency: string;
  pickup_status: string;
  items: LookupOrderItem[];
};

type LookupResponse =
  | { status: "found"; order: LookupOrder }
  | { status: "pending"; message: string }
  | { status: "error"; error: string };

interface GuestOrderLookupFormProps {
  initialSessionId?: string;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export function GuestOrderLookupForm({ initialSessionId = "" }: GuestOrderLookupFormProps) {
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<LookupResponse | null>(null);

  async function handleLookup(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLookupResult(null);
    setIsLoading(true);

    const params = new URLSearchParams();

    if (sessionId.trim()) {
      params.set("session_id", sessionId.trim());
    } else {
      params.set("order_id", orderId.trim());
      params.set("email", email.trim());
    }

    try {
      const response = await fetch(`/api/orders/guest/lookup?${params.toString()}`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      const payload = (await response.json()) as LookupResponse;
      setLookupResult(payload);
    } catch (error) {
      setLookupResult({
        status: "error",
        error: error instanceof Error ? error.message : "Order lookup failed.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-8 rounded-lg border border-charcoal/10 bg-warm-white p-5 text-left">
      <h2 className="text-sm font-semibold text-charcoal">Guest order lookup</h2>
      <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
        Use the Stripe checkout session from this confirmation URL, or enter the email address and
        order ID from your confirmation email.
      </p>

      <form className="mt-4 space-y-4" onSubmit={handleLookup}>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-charcoal/50">
            Checkout session
          </label>
          <input
            type="text"
            value={sessionId}
            onChange={(event) => setSessionId(event.target.value)}
            placeholder="cs_test_..."
            className="mt-1 w-full rounded-lg border border-charcoal/15 bg-ivory px-3 py-2 text-sm text-charcoal outline-none transition-colors focus:border-charcoal/40"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-charcoal/50">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              disabled={Boolean(sessionId.trim())}
              className="mt-1 w-full rounded-lg border border-charcoal/15 bg-ivory px-3 py-2 text-sm text-charcoal outline-none transition-colors focus:border-charcoal/40 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-charcoal/50">
              Order ID
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              placeholder="Order UUID"
              disabled={Boolean(sessionId.trim())}
              className="mt-1 w-full rounded-lg border border-charcoal/15 bg-ivory px-3 py-2 text-sm text-charcoal outline-none transition-colors focus:border-charcoal/40 disabled:opacity-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || (!sessionId.trim() && (!email.trim() || !orderId.trim()))}
          className="inline-flex items-center rounded-lg bg-charcoal px-4 py-2 text-sm font-semibold text-warm-white transition-colors hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:bg-charcoal/20 disabled:text-charcoal/40"
        >
          {isLoading ? "Looking up order..." : "Look up order"}
        </button>
      </form>

      {lookupResult?.status === "pending" && (
        <p className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
          {lookupResult.message}
        </p>
      )}

      {lookupResult?.status === "error" && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {lookupResult.error}
        </p>
      )}

      {lookupResult?.status === "found" && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-900">
          <p className="font-semibold">Order {lookupResult.order.id}</p>
          <p className="mt-1">
            {formatCurrency(lookupResult.order.total_amount, lookupResult.order.currency)} · Status:{" "}
            {lookupResult.order.status} · Pickup: {lookupResult.order.pickup_status}
          </p>
          <div className="mt-2 space-y-1 text-xs text-green-900/80">
            {lookupResult.order.items.map((item) => (
              <p key={item.id}>
                {item.quantity} × {item.title} — {item.product_type}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
