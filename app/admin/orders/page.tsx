// app/admin/orders/page.tsx
// Admin-Lite orders list.

import Link from "next/link";
import { getRecentOrdersAdmin } from "@/server/db/contracts";

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

export default async function AdminOrdersPage() {
  const orders = await getRecentOrdersAdmin(200, 0, null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-charcoal">Orders</h2>
          <p className="mt-2 text-sm text-charcoal/60">
            Most recent first. Open an order to inspect board type, material, finish, and build
            notes.
          </p>
        </div>
        <p className="text-sm text-charcoal/50">Showing {orders.length} orders</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-charcoal/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-charcoal/10 text-left text-sm">
            <thead className="bg-ivory/70 text-xs uppercase tracking-[0.14em] text-charcoal/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Buyer</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Pickup</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/10">
              {orders.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-charcoal/60" colSpan={6}>
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
                        {order.buyer_name ?? "Unnamed buyer"}
                      </p>
                      <p className="mt-1 text-xs text-charcoal/55">{order.email}</p>
                    </td>
                    <td className="px-4 py-4 font-semibold text-charcoal">
                      {formatCurrency(order.total_amount, order.currency)}
                    </td>
                    <td className="px-4 py-4">{statusBadge(order.status)}</td>
                    <td className="px-4 py-4">{statusBadge(order.pickup_status)}</td>
                    <td className="px-4 py-4 text-charcoal/60">{formatDate(order.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
