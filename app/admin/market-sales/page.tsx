import Link from "next/link";
import { randomUUID } from "node:crypto";
import { getAdminProducts } from "@/lib/catalogue";
import { MarketSaleForm } from "@/components/admin/market-sale-form";
import { getMarketSales } from "@/server/commerce/market-sales";

export const dynamic = "force-dynamic";

export default async function MarketSalesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: rawPage } = await searchParams;
  const page = /^\d+$/.test(rawPage ?? "") ? Math.max(1, Math.min(100_000, Number(rawPage))) : 1;
  const [products, sales] = await Promise.all([getAdminProducts(), getMarketSales(page)]);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-semibold">Market sales</h2>
        <p className="mt-2 text-sm leading-6 text-charcoal/70">
          Take contactless payment in the business Stripe app, then record it here. Saved sales
          needing review keep their products blocked from publication until resolved.
        </p>
      </div>
      <MarketSaleForm
        requestId={randomUUID()}
        defaultSoldAt={new Date().toISOString()}
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
      <section className="rounded-2xl border border-charcoal/10 bg-white p-6">
        <h3 className="text-xl font-semibold">Recorded sales</h3>
        {sales.length === 0 ? (
          <p className="mt-4 text-sm text-charcoal/60">No market sale records on this page.</p>
        ) : (
          <ul className="mt-4 divide-y divide-charcoal/10">
            {sales.map((sale) => (
              <li key={sale.id} className="py-4">
                <Link className="font-semibold underline" href={`/admin/market-sales/${sale.id}`}>
                  {sale.payment_reference}
                </Link>
                <p className="mt-1 text-sm">
                  {sale.status.replaceAll("_", " ")} ·{" "}
                  {new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(
                    sale.total_amount / 100,
                  )}{" "}
                  ·{" "}
                  {new Date(sale.sold_at).toLocaleString("en-AU", { timeZone: "Australia/Perth" })}
                </p>
                {sale.status === "needs_review" && (
                  <p className="mt-1 text-sm text-amber-900">
                    {sale.error ?? "Awaiting verification"}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
        <nav className="mt-5 flex gap-5 text-sm" aria-label="Market sales pages">
          {page > 1 && (
            <Link className="underline" href={`/admin/market-sales?page=${page - 1}`}>
              Previous page
            </Link>
          )}
          {sales.length === 50 && (
            <Link className="underline" href={`/admin/market-sales?page=${page + 1}`}>
              Next page
            </Link>
          )}
        </nav>
      </section>
    </div>
  );
}
