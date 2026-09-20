import Link from "next/link";
import { getAdminProducts } from "@/lib/catalogue";
import { getAdminDashboardOverview, getRecentOrdersAdmin } from "@/server/db/contracts";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [overview, recentOrders, products] = await Promise.all([
    getAdminDashboardOverview(),
    getRecentOrdersAdmin(5, 0),
    getAdminProducts(),
  ]);
  const cards = [
    {
      label: "Published products",
      value: products.filter((product) => product.publication_status === "published").length,
      href: "/admin/products",
    },
    {
      label: "Drafts",
      value: products.filter((product) => product.publication_status === "draft").length,
      href: "/admin/products",
    },
    {
      label: "Pending pickups",
      value: Number(overview?.pending_pickups_count ?? 0),
      href: "/admin/orders",
    },
  ];

  return (
    <div className="space-y-9">
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-charcoal/10 bg-white p-6 hover:border-copper"
          >
            <p className="text-xs font-bold uppercase tracking-[.18em] text-charcoal/60">
              {card.label}
            </p>
            <p className="mt-4 font-display text-5xl text-charcoal">{card.value}</p>
          </Link>
        ))}
      </div>
      <section className="rounded-2xl border border-charcoal/10 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-3xl">Recent orders</h2>
          <Link href="/admin/orders" className="font-semibold underline">
            View all
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="mt-5 text-charcoal/60">No orders yet.</p>
        ) : (
          <div className="mt-5 divide-y divide-charcoal/10">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex flex-wrap justify-between gap-3 py-4 hover:text-copper"
              >
                <span>{order.buyer_name ?? order.email}</span>
                <span>
                  {new Intl.NumberFormat("en-AU", {
                    style: "currency",
                    currency: order.currency,
                  }).format(order.total_amount / 100)}{" "}
                  · {order.pickup_status.replaceAll("_", " ")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
