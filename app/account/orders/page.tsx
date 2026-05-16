// app/account/orders/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-helpers";
import { getOrdersForEmail } from "@/server/db/contracts";
import { Package, ArrowRight, ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Order History",
  description: "View your PLANKZ DECKZ order history.",
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
    month: "short",
    day: "numeric",
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
    pending: "bg-yellow-50 text-yellow-700",
    ready: "bg-green-50 text-green-700",
    collected: "bg-charcoal/5 text-charcoal/70",
    cancelled: "bg-red-50 text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || "bg-gray-50 text-gray-600"}`}
    >
      Pickup: {status}
    </span>
  );
}

export default async function OrderHistoryPage() {
  const session = await requireAuth();
  const email = session.user?.email;

  if (!email) {
    return (
      <section className="bg-warm-white py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-charcoal/70">Unable to load orders. No email found in session.</p>
        </div>
      </section>
    );
  }

  const orders = await getOrdersForEmail(email);

  return (
    <>
      {/* Hero */}
      <section className="bg-warm-black py-16 text-warm-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Order History</h1>
          <p className="mt-3 text-base text-warm-white/70">
            View all your past orders and their current status.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-warm-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/account"
            className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-charcoal/60 transition-colors hover:text-charcoal"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Account
          </Link>

          {orders.length === 0 ? (
            <div className="rounded-xl border border-charcoal/10 bg-ivory p-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-charcoal/5">
                <Package className="h-7 w-7 text-charcoal/40" />
              </div>
              <h2 className="text-lg font-semibold text-charcoal">No orders yet</h2>
              <p className="mt-2 text-sm text-charcoal/60">
                When you make a purchase, your orders will appear here.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-charcoal px-4 py-2.5 text-sm font-medium text-warm-white transition-colors hover:bg-charcoal/90"
              >
                Browse Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="group block rounded-xl border border-charcoal/10 bg-ivory p-5 transition-all hover:border-charcoal/20 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {statusBadge(order.status)}
                        {pickupBadge(order.pickup_status)}
                      </div>
                      <p className="text-sm font-semibold text-charcoal mt-2">
                        {formatCurrency(order.total_amount, order.currency)}
                      </p>
                      <p className="text-xs text-charcoal/60 mt-0.5">
                        {formatDate(order.created_at)} &middot; {Number(order.item_count)} item
                        {Number(order.item_count) !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-charcoal/30 transition-colors group-hover:text-charcoal" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
