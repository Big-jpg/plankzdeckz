// app/checkout/success/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, Clock, MapPin, Package } from "lucide-react";
import { CheckoutSuccessCartClear } from "@/components/checkout-success-cart-clear";
import { GuestOrderLookupForm } from "@/components/guest-order-lookup-form";
import { getOrderByCheckoutSession, type OrderWithItems } from "@/server/db/contracts";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your order has been confirmed.",
};

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    paid: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-indigo-100 text-indigo-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-800"}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function pickupBadge(status: string) {
  const styles: Record<string, string> = {
    pending: "border-yellow-200 bg-yellow-50 text-yellow-700",
    ready: "border-green-200 bg-green-50 text-green-700",
    collected: "border-charcoal/10 bg-charcoal/5 text-charcoal/70",
    cancelled: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status] || "border-gray-200 bg-gray-50 text-gray-600"}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function OrderConfirmationDetails({ order }: { order: OrderWithItems }) {
  return (
    <div className="mt-8 space-y-6 text-left">
      <div className="rounded-xl border border-charcoal/10 bg-warm-white p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {statusBadge(order.status)}
          <span className="text-xs text-charcoal/50">Order {order.id}</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-charcoal/50">Total</p>
            <p className="mt-0.5 text-lg font-semibold text-charcoal">
              {formatCurrency(order.total_amount, order.currency)}
            </p>
            {order.subtotal_amount !== order.total_amount && (
              <p className="text-xs text-charcoal/50">
                Subtotal: {formatCurrency(order.subtotal_amount, order.currency)}
              </p>
            )}
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-charcoal/50">
              Fulfilment
            </p>
            <div className="mt-1 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-charcoal/40" />
              <span className="text-sm text-charcoal">
                {order.fulfilment_method === "local_pickup"
                  ? "Local pickup"
                  : order.fulfilment_method}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 border-t border-charcoal/10 pt-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-charcoal/50">Placed</p>
            <p className="text-sm text-charcoal">{formatDate(order.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-charcoal/50">Pickup status</p>
            <div className="mt-1">{pickupBadge(order.pickup_status)}</div>
          </div>
          <div>
            <p className="text-xs text-charcoal/50">Email</p>
            <p className="text-sm text-charcoal">{order.email}</p>
          </div>
          {order.buyer_name && (
            <div>
              <p className="text-xs text-charcoal/50">Name</p>
              <p className="text-sm text-charcoal">{order.buyer_name}</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-charcoal/10 bg-warm-white p-6">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-charcoal">
          <Package className="h-4 w-4" />
          Items ({order.items.length})
        </h2>

        <div className="divide-y divide-charcoal/10">
          {order.items.map((item) => (
            <div key={item.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-charcoal">{item.title}</p>
                  {item.variant_title && (
                    <p className="text-xs text-charcoal/60">{item.variant_title}</p>
                  )}
                </div>
                <p className="shrink-0 text-sm font-medium text-charcoal">
                  {formatCurrency(item.total_amount, order.currency)}
                </p>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal/60">
                <span>Qty: {item.quantity}</span>
                <span>
                  Type: <span className="font-medium text-charcoal/80">{item.product_type}</span>
                </span>
                {item.material && <span>Material: {item.material}</span>}
                {item.colour && <span>Colour: {item.colour}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PendingConfirmation() {
  return (
    <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-5 text-left">
      <div className="flex items-start gap-3">
        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-yellow-700" />
        <div>
          <h2 className="text-sm font-semibold text-yellow-900">Confirmation still syncing</h2>
          <p className="mt-2 text-sm leading-relaxed text-yellow-800">
            Stripe has returned successfully, but the order record is not visible yet. This is
            usually a short webhook delay. Use the lookup below with your checkout session or the
            order ID from your confirmation email if this page does not update.
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const order = sessionId ? await getOrderByCheckoutSession(sessionId) : null;

  return (
    <section className="bg-warm-white py-24 sm:py-32">
      {sessionId && <CheckoutSuccessCartClear />}
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-charcoal/10 bg-ivory/30 p-10">
          <CheckCircle className="mx-auto h-16 w-16 text-green-700" />

          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
            Order confirmed
          </h1>

          <p className="mt-4 text-base leading-relaxed text-charcoal/60">
            Thank you for your order. Your board or merch has been confirmed for local pickup and
            preparation will begin shortly.
          </p>

          {order ? <OrderConfirmationDetails order={order} /> : <PendingConfirmation />}

          <div className="mt-8 rounded-lg border border-charcoal/10 bg-warm-white p-5 text-left">
            <h2 className="text-sm font-semibold text-charcoal">What happens next</h2>

            <div className="mt-4 space-y-3 text-sm leading-relaxed text-charcoal/60">
              <p>
                <strong className="text-charcoal">1.</strong> Your order is reviewed for pickup timing and
                item availability confirmation.
              </p>

              <p>
                <strong className="text-charcoal">2.</strong> The board or merch is prepared and packed for
                local collection.
              </p>

              <p>
                <strong className="text-charcoal">3.</strong> You will receive another email once
                the order is ready for collection.
              </p>
            </div>
          </div>

          <GuestOrderLookupForm initialSessionId={sessionId ?? ""} />

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-lg bg-charcoal px-6 py-3 text-sm font-semibold text-warm-white transition-colors hover:bg-charcoal/90"
            >
              Continue browsing
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-charcoal/20 px-6 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-charcoal/5"
            >
              Return home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
