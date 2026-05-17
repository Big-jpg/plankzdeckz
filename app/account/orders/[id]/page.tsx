// app/account/orders/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth-helpers";
import { getOrderById } from "@/server/db/contracts";
import { ChevronLeft, Package, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Order Detail",
  description: "View your order details.",
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
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    ready: "bg-green-50 text-green-700 border-green-200",
    collected: "bg-charcoal/5 text-charcoal/70 border-charcoal/10",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status] || "bg-gray-50 text-gray-600 border-gray-200"}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  const { id } = await params;
  const order = await getOrderById(id);

  // Order not found or doesn't belong to this user
  if (!order || order.email !== session.user?.email) {
    notFound();
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-warm-black py-16 text-warm-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Order Detail</h1>
          <p className="mt-3 text-base text-warm-white/70">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-warm-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/account/orders"
            className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-charcoal/60 transition-colors hover:text-charcoal"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Orders
          </Link>

          {/* Order summary card */}
          <div className="rounded-xl border border-charcoal/10 bg-ivory p-6 mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {statusBadge(order.status)}
              <span className="text-xs text-charcoal/50">Order {order.id.slice(0, 8)}…</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-charcoal/50 uppercase tracking-wider">
                  Total
                </p>
                <p className="text-lg font-semibold text-charcoal mt-0.5">
                  {formatCurrency(order.total_amount, order.currency)}
                </p>
                {order.subtotal_amount !== order.total_amount && (
                  <p className="text-xs text-charcoal/50">
                    Subtotal: {formatCurrency(order.subtotal_amount, order.currency)}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-charcoal/50 uppercase tracking-wider">
                  Fulfilment
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-charcoal/40" />
                  <span className="text-sm text-charcoal">
                    {order.fulfilment_method === "local_pickup"
                      ? "Local Pickup"
                      : order.fulfilment_method}
                  </span>
                </div>
              </div>
            </div>

            {/* Pickup status */}
            {order.fulfilment_method === "local_pickup" && (
              <div className="mt-4 pt-4 border-t border-charcoal/10">
                <p className="text-xs font-medium text-charcoal/50 uppercase tracking-wider mb-1">
                  Pickup Status
                </p>
                {pickupBadge(order.pickup_status)}
              </div>
            )}

            {/* Buyer info */}
            <div className="mt-4 pt-4 border-t border-charcoal/10 grid gap-2 sm:grid-cols-2">
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

          {/* Order items */}
          <div className="rounded-xl border border-charcoal/10 bg-ivory p-6">
            <h2 className="text-sm font-semibold text-charcoal mb-4 flex items-center gap-2">
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
                    <p className="text-sm font-medium text-charcoal shrink-0">
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
      </section>
    </>
  );
}
