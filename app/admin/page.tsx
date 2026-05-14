// app/admin/page.tsx
// Admin-Lite dashboard overview.

import Link from "next/link";
import {
  getAdminDashboardOverview,
  getCustomDesignRequestsAdmin,
  getRecentOrdersAdmin,
} from "@/server/db/contracts";

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

export default async function AdminDashboardPage() {
  const [overview, recentOrders, customRequests] = await Promise.all([
    getAdminDashboardOverview(),
    getRecentOrdersAdmin(5, 0),
    getCustomDesignRequestsAdmin(5, 0, null),
  ]);

  const cards = [
    {
      label: "Recent orders",
      value: Number(overview?.recent_orders_count ?? 0),
      description: "Orders created in the last 30 days.",
      href: "/admin/orders",
    },
    {
      label: "Pending pickups",
      value: Number(overview?.pending_pickups_count ?? 0),
      description: "Local pickup orders still pending or ready.",
      href: "/admin/orders",
    },
    {
      label: "New custom requests",
      value: Number(overview?.new_custom_requests_count ?? 0),
      description: "Custom design requests awaiting first review.",
      href: "/admin/custom-requests",
    },
  ];

  return (
    <div className="space-y-10">
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-charcoal/5"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-charcoal/50">
              {card.label}
            </p>
            <p className="mt-4 font-serif text-5xl font-semibold text-charcoal">{card.value}</p>
            <p className="mt-3 text-sm leading-6 text-charcoal/65">{card.description}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-serif text-2xl font-semibold text-charcoal">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-charcoal underline">
              View all
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-charcoal/60">No orders found.</p>
            ) : (
              recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block rounded-xl border border-charcoal/10 bg-ivory/40 p-4 transition hover:border-amber"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-charcoal">
                        {order.buyer_name ?? order.email}
                      </p>
                      <p className="mt-1 text-xs text-charcoal/50">{order.id}</p>
                    </div>
                    <p className="text-sm font-semibold text-charcoal">
                      {formatCurrency(order.total_amount, order.currency)}
                    </p>
                  </div>
                  <p className="mt-3 text-sm text-charcoal/60">
                    {statusLabel(order.status)} · pickup {statusLabel(order.pickup_status)} ·{" "}
                    {formatDate(order.created_at)}
                  </p>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-serif text-2xl font-semibold text-charcoal">Custom requests</h2>
            <Link
              href="/admin/custom-requests"
              className="text-sm font-semibold text-charcoal underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {customRequests.length === 0 ? (
              <p className="text-sm text-charcoal/60">No custom requests found.</p>
            ) : (
              customRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-xl border border-charcoal/10 bg-ivory/40 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-charcoal">{request.name ?? request.email}</p>
                      <p className="mt-1 text-xs text-charcoal/50">{request.email}</p>
                    </div>
                    <span className="rounded-full bg-charcoal/5 px-3 py-1 text-xs font-semibold text-charcoal/70">
                      {statusLabel(request.status)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-charcoal/60">
                    {request.fixture_type ?? "Fixture not supplied"} ·{" "}
                    {request.adapter_type ?? "Adapter not supplied"} ·{" "}
                    {formatDate(request.created_at)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
