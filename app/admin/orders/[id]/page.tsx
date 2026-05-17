// app/admin/orders/[id]/page.tsx
// Admin-Lite order detail view.

import Link from "next/link";
import { notFound } from "next/navigation";
import { PickupStatusControl } from "@/components/admin/status-controls";
import { getOrderById } from "@/server/db/contracts";

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
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function labelFor(value: string | null): string {
  if (!value) return "Not supplied";
  return value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " ");
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="rounded-xl border border-charcoal/10 bg-ivory/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-charcoal/45">{label}</p>
      <p className="mt-2 break-words text-sm font-medium text-charcoal">
        {value ?? "Not supplied"}
      </p>
    </div>
  );
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="text-sm font-semibold text-charcoal underline">
        Back to orders
      </Link>

      <div className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/45">
              Order detail
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-charcoal">{order.id}</h2>
            <p className="mt-2 text-sm text-charcoal/60">Created {formatDate(order.created_at)}</p>
          </div>
          <div className="rounded-xl bg-charcoal px-5 py-4 text-warm-white">
            <p className="text-xs uppercase tracking-[0.16em] text-warm-white/55">Total</p>
            <p className="mt-1 font-serif text-3xl font-semibold">
              {formatCurrency(order.total_amount, order.currency)}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Field label="Buyer name" value={order.buyer_name} />
          <Field label="Buyer email" value={order.email} />
          <Field label="Buyer phone" value={order.phone} />
          <Field label="Order status" value={labelFor(order.status)} />
          <Field label="Fulfilment method" value={labelFor(order.fulfilment_method)} />
          <Field label="Pickup status" value={labelFor(order.pickup_status)} />
          <Field label="Stripe checkout session" value={order.stripe_checkout_session_id} />
          <Field label="Stripe payment intent" value={order.stripe_payment_intent_id} />
          <Field label="Updated" value={formatDate(order.updated_at)} />
        </div>
      </div>

      <PickupStatusControl id={order.id} currentStatus={order.pickup_status} />

      <section className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm">
        <h3 className="font-serif text-2xl font-semibold text-charcoal">Order items</h3>
        <div className="mt-6 space-y-5">
          {order.items.length === 0 ? (
            <p className="text-sm text-charcoal/60">No order items found.</p>
          ) : (
            order.items.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-charcoal/10 bg-ivory/40 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-charcoal">{item.title}</h4>
                    <p className="mt-1 text-sm text-charcoal/60">
                      {item.variant_title ?? "Default variant"} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-charcoal">
                    {formatCurrency(item.total_amount, order.currency)}
                  </p>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <Field label="Item type" value={item.product_type} />
                  <Field label="Material" value={item.material} />
                  <Field label="Colour" value={item.colour} />
                  <Field label="Line total" value={formatCurrency(item.total_amount, order.currency)} />
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
