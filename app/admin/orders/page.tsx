// app/admin/orders/page.tsx
// Admin-Lite orders list.

import Link from "next/link";
import { searchAdminOrders } from "@/server/commerce/admin-orders";
import { CheckoutRecovery } from "@/components/admin/checkout-recovery";

export const dynamic = "force-dynamic";

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
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Australia/Perth",
  });
}

function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).replaceAll("_", " ");
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
    ready: "bg-green-100 text-green-800",
    collected: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] ?? "bg-gray-100 text-gray-700"}`}
    >
      {statusLabel(status)}
    </span>
  );
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; channel?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = (params.q ?? "").slice(0, 255);
  const channel = params.channel === "online" || params.channel === "market" ? params.channel : "";
  const page = /^\d+$/.test(params.page ?? "")
    ? Math.max(1, Math.min(100_000, Number(params.page)))
    : 1;
  const { orders, total } = await searchAdminOrders(search, channel, page);
  const pageHref = (next: number) =>
    `/admin/orders?${new URLSearchParams({ q: search, channel, page: String(next) })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-charcoal">Orders</h2>
          <p className="mt-2 text-sm text-charcoal/60">
            Find online and market orders by order ID, buyer, checkout session, or Stripe payment
            reference.
          </p>
        </div>
        <p className="text-sm text-charcoal/50">
          {total} orders · Page {page}
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-3" action="/admin/orders">
        <label className="min-w-64 flex-1 text-sm font-medium">
          Search orders
          <input
            name="q"
            defaultValue={search}
            maxLength={255}
            className="mt-1 block w-full rounded-lg border border-charcoal/20 bg-white px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium">
          Sales channel
          <select
            name="channel"
            defaultValue={channel}
            className="mt-1 block rounded-lg border border-charcoal/20 bg-white px-3 py-2"
          >
            <option value="">All channels</option>
            <option value="online">Online</option>
            <option value="market">Market</option>
          </select>
        </label>
        <button className="rounded-lg bg-charcoal px-4 py-2 text-sm font-semibold text-white">
          Search
        </button>
        <Link className="px-2 py-2 text-sm font-semibold underline" href="/admin/market-sales">
          Record market sale
        </Link>
      </form>

      <CheckoutRecovery />

      <div className="overflow-hidden rounded-2xl border border-charcoal/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-charcoal/10 text-left text-sm">
            <thead className="bg-ivory/70 text-xs uppercase tracking-[0.14em] text-charcoal/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Buyer</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Channel / refund</th>
                <th className="px-4 py-3 font-semibold">Pickup</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/10">
              {orders.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-charcoal/60" colSpan={7}>
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="align-top transition hover:bg-ivory/50">
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold text-charcoal underline-offset-2 hover:underline"
                      >
                        {order.id.slice(0, 8)}
                      </Link>
                      <p className="mt-1 text-xs text-charcoal/45">{order.id}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-charcoal">
                        {order.buyer_name ??
                          (order.channel === "market" ? "Market customer" : "Unnamed buyer")}
                      </p>
                      <p className="mt-1 text-xs text-charcoal/55">
                        {order.email ?? "No email supplied"}
                      </p>
                    </td>
                    <td className="px-4 py-4 font-semibold text-charcoal">
                      {formatCurrency(order.total_amount, order.currency)}
                    </td>
                    <td className="px-4 py-4">{statusBadge(order.status)}</td>
                    <td className="px-4 py-4">
                      <p>{statusLabel(order.channel)}</p>
                      <p className="mt-1 text-xs text-charcoal/60">
                        {statusLabel(order.refund_status)}
                        {order.refunded_amount > 0
                          ? ` · ${formatCurrency(order.refunded_amount, order.currency)}`
                          : ""}
                      </p>
                    </td>
                    <td className="px-4 py-4">{statusBadge(order.pickup_status)}</td>
                    <td className="px-4 py-4 text-charcoal/60">{formatDate(order.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <nav aria-label="Order pages" className="flex gap-5 text-sm">
        {page > 1 && (
          <Link href={pageHref(page - 1)} className="underline">
            Previous page
          </Link>
        )}
        {page * 50 < total && (
          <Link href={pageHref(page + 1)} className="underline">
            Next page
          </Link>
        )}
      </nav>
    </div>
  );
}
