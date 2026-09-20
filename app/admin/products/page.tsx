import Link from "next/link";
import { getAdminProducts } from "@/lib/catalogue";
import { recordToInput } from "@/server/catalogue/product-input";
import { ProductQuickActions } from "@/components/admin/product-quick-actions";
export const dynamic = "force-dynamic";
export default async function AdminProductsPage() {
  const products = await getAdminProducts();
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-copper">Catalogue</p>
          <h2 className="font-display text-4xl text-charcoal">Products</h2>
          <p className="mt-2 text-charcoal/70">
            Add a finished deck or manage the OG tee. Drafts stay off the shop.
          </p>
        </div>
        <Link
          className="rounded-full bg-charcoal px-5 py-3 font-bold text-white"
          href="/admin/products/new"
        >
          Add product
        </Link>
      </div>
      <div className="overflow-hidden rounded-2xl border border-charcoal/15 bg-white">
        {products.length === 0 ? (
          <p className="p-8 text-charcoal/70">No products yet. Add a draft to begin.</p>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/10 p-5 last:border-0"
            >
              <div>
                <Link
                  href={`/admin/products/${product.id}`}
                  className="font-bold text-charcoal underline-offset-4 hover:underline"
                >
                  {product.title}
                </Link>
                <p className="text-sm text-charcoal/60">{product.handle}</p>
              </div>
              <div className="flex items-center gap-5 text-sm">
                <span>{product.product_type === "board" ? "Deck" : "Wares"}</span>
                <span>
                  {product.product_type === "board"
                    ? product.availability_status
                    : Object.values(product.stock_by_size).reduce((a, b) => a + b, 0) + " in stock"}
                </span>
                <strong>
                  {new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(
                    product.price_amount / 100,
                  )}
                </strong>
              </div>
              <ProductQuickActions id={product.id} initial={recordToInput(product)} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
