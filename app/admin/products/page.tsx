// app/admin/products/page.tsx
// Admin-Lite catalogue visibility page. Phase 8 intentionally has no product mutation path.

import Link from "next/link";
import { getProducts } from "@/lib/catalogue";

export const dynamic = "force-dynamic";

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-charcoal">Products</h2>
          <p className="mt-2 text-sm text-charcoal/60">
            Read-only catalogue visibility for operational checks. Product writes remain out of
            scope for Admin-Lite.
          </p>
        </div>
        <p className="text-sm text-charcoal/50">Showing {products.length} products</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-charcoal/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-charcoal/10 text-left text-sm">
            <thead className="bg-ivory/70 text-xs uppercase tracking-[0.14em] text-charcoal/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Availability</th>
                <th className="px-4 py-3 font-semibold">Adapters</th>
                <th className="px-4 py-3 font-semibold">Material / colours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/10">
              {products.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-charcoal/60" colSpan={6}>
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="align-top transition hover:bg-ivory/50">
                    <td className="px-4 py-4">
                      <Link
                        href={`/products/${product.handle}`}
                        className="font-semibold text-charcoal underline-offset-2 hover:underline"
                      >
                        {product.title}
                      </Link>
                      <p className="mt-1 text-xs text-charcoal/45">{product.handle}</p>
                      {product.shopifyProductId ? (
                        <p className="mt-1 break-all text-xs text-charcoal/45">
                          {product.shopifyProductId}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-charcoal/70">{product.category}</td>
                    <td className="px-4 py-4 font-semibold text-charcoal">
                      {formatCurrency(product.price, product.currency)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          product.inStock
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.inStock ? "In stock" : "Out of stock"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-charcoal/70">{product.adapters.join(", ")}</td>
                    <td className="px-4 py-4 text-charcoal/70">
                      <p>{product.material}</p>
                      <p className="mt-1 text-xs text-charcoal/50">{product.colours.join(", ")}</p>
                    </td>
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
