// app/admin/orders/[id]/page.tsx
// Admin-Lite order detail view.

import Link from "next/link";
import { notFound } from "next/navigation";
import { PickupStatusControl } from "@/components/admin/status-controls";
import { getOrderById } from "@/server/db/contracts";
import { getOrderOperations } from "@/server/commerce/admin-orders";
import { OrderNotifications } from "@/components/admin/order-notifications";
import { PaymentReconcileControl } from "@/components/admin/payment-reconcile-control";
import { isUuid } from "@/server/commerce/market-sale-input";

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
    timeZone: "Australia/Perth",
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
  if (!isUuid(id)) notFound();
  const [order, operations] = await Promise.all([getOrderById(id), getOrderOperations(id)]);

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
          <Field label="Sales channel" value={labelFor(operations?.channel ?? "online")} />
          <Field label="Recorded by" value={operations?.operator_email} />
          <Field
            label="Sale date"
            value={operations?.sold_at ? formatDate(operations.sold_at) : undefined}
          />
          <Field
            label="Reconciliation"
            value={labelFor(operations?.reconciliation_status ?? null)}
          />
          <Field label="Payment reference" value={operations?.payment_reference} />
          <Field label="Refund status" value={labelFor(operations?.refund_status ?? null)} />
          <Field
            label="Refunded amount"
            value={formatCurrency(operations?.refunded_amount ?? 0, order.currency)}
          />
          <Field
            label="Refund status checked"
            value={
              operations?.refund_checked_at
                ? formatDate(operations.refund_checked_at)
                : "Not refreshed yet"
            }
          />
          <Field label="Fulfilment method" value={labelFor(order.fulfilment_method)} />
          <Field label="Pickup status" value={labelFor(order.pickup_status)} />
          <Field label="Stripe checkout session" value={order.stripe_checkout_session_id} />
          <Field label="Stripe payment intent" value={order.stripe_payment_intent_id} />
          <Field label="Updated" value={formatDate(order.updated_at)} />
        </div>
      </div>

      {operations?.channel !== "market" && (
        <PickupStatusControl id={order.id} currentStatus={order.pickup_status} />
      )}

      <section className="rounded-2xl border border-charcoal/10 bg-white p-6">
        <h3 className="text-xl font-semibold">Refunds and stock</h3>
        {operations?.refund_sync_error && (
          <p role="alert" className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            {operations.refund_sync_error}
          </p>
        )}
        <p className="mt-3 text-sm leading-6 text-charcoal/70">
          Initiate refunds in the authorized Stripe Dashboard workflow. A refund does not restore
          stock. Confirm a physical return and record an explicit stock adjustment in product
          administration before offering it for sale again.
        </p>
        {order.stripe_payment_intent_id && (
          <a
            className="mt-3 inline-block text-sm font-semibold underline"
            href={`https://dashboard.stripe.com/${process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ? "test/" : ""}payments/${encodeURIComponent(order.stripe_payment_intent_id)}`}
            target="_blank"
            rel="noreferrer"
          >
            Open payment in Stripe
          </a>
        )}
        <PaymentReconcileControl orderId={order.id} />
      </section>

      <OrderNotifications orderId={order.id} />

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
                  <Field
                    label="Line total"
                    value={formatCurrency(item.total_amount, order.currency)}
                  />
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
