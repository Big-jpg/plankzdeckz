import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminProducts } from "@/lib/catalogue";
import { MarketSaleDismiss, MarketSaleForm } from "@/components/admin/market-sale-form";
import { isUuid } from "@/server/commerce/market-sale-input";
import { getMarketSale } from "@/server/commerce/market-sales";

export const dynamic = "force-dynamic";

export default async function MarketSaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const sale = await getMarketSale(id);
  if (!sale) notFound();
  const products = sale.status === "needs_review" ? await getAdminProducts() : [];
  return (
    <div className="space-y-6">
      <Link className="text-sm underline" href="/admin/market-sales">
        Back to market sales
      </Link>
      <section className="rounded-2xl border border-charcoal/10 bg-white p-6">
        <h2 className="font-serif text-3xl font-semibold">Market sale</h2>
        <p className="mt-3 break-all text-sm">{sale.id}</p>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-charcoal/60">Payment reference</dt>
            <dd className="break-all font-semibold">{sale.payment_reference}</dd>
          </div>
          <div>
            <dt className="text-charcoal/60">Status</dt>
            <dd className="font-semibold">{sale.status.replaceAll("_", " ")}</dd>
          </div>
          <div>
            <dt className="text-charcoal/60">Operator</dt>
            <dd>{sale.operator_email}</dd>
          </div>
          <div>
            <dt className="text-charcoal/60">Total</dt>
            <dd>
              {new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(
                sale.total_amount / 100,
              )}
            </dd>
          </div>
        </dl>
        {sale.order_id && (
          <Link
            className="mt-5 inline-block font-semibold underline"
            href={`/admin/orders/${sale.order_id}`}
          >
            Open reconciled order
          </Link>
        )}
        {sale.error && sale.status === "needs_review" && (
          <p role="status" className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            {sale.error} Stock has not been changed by this record.
          </p>
        )}
        {sale.status === "dismissed" && (
          <p className="mt-5 text-sm">
            Dismissed by {sale.resolved_by}: {sale.resolution_note}
          </p>
        )}
      </section>
      {sale.status === "needs_review" && (
        <>
          <MarketSaleForm
            key={`${sale.id}:${sale.revision}`}
            initial={sale}
            requestId={sale.id}
            defaultSoldAt={sale.sold_at}
            products={products.map((product) => ({
              id: product.id,
              title: product.title,
              productType: product.product_type,
              publicationStatus: product.publication_status,
              stockQuantity: product.stock_quantity,
              stockBySize: product.stock_by_size,
              priceAmount: product.price_amount,
            }))}
          />
          <MarketSaleDismiss sale={sale} />
        </>
      )}
    </div>
  );
}
