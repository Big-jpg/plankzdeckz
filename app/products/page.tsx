// app/products/page.tsx
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getProducts, getCategories } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse the PLANKZ DECKZ collection of handmade recycled timber skateboard and longboard deckz.",
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "Shop PLANKZ DECKZ",
    description:
      "Browse handmade skateboard and longboard deckz built from reclaimed timber and recycled material.",
    url: "/products",
    images: [
      {
        url: "/og-product-placeholder.svg",
        width: 1200,
        height: 630,
        alt: "PLANKZ DECKZ catalogue Open Graph placeholder",
      },
    ],
  },
};

export default async function ProductsPage() {
  const products = await getProducts();
  const categories = getCategories();

  return (
    <>
      <section className="bg-warm-black py-16 text-warm-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Shop Lighting Objects
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ivory/70">
            Hand-crafted recycled timber deckz, made to order with the appropriate
            fitting adapter.
          </p>
        </div>
      </section>

      <section className="border-b border-charcoal/10 bg-warm-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-x-auto py-4 scrollbar-none">
            <span className="shrink-0 rounded-full bg-charcoal px-4 py-1.5 text-xs font-medium text-warm-white">
              All
            </span>

            {categories.map((cat) => (
              <span
                key={cat}
                className="shrink-0 cursor-pointer rounded-full border border-charcoal/20 px-4 py-1.5 text-xs font-medium text-charcoal/70 transition-colors hover:bg-charcoal/5"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm leading-relaxed text-charcoal/70">
              Each piece is developed as part of a small-batch studio collection. Minor variations
              in surface finish, translucency, and material character may occur between pieces.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.handle}`}
                className="group overflow-hidden rounded-xl border border-charcoal/10 bg-ivory/30 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-charcoal/5"
              >
                <div className="relative aspect-square overflow-hidden bg-ivory/50">
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>

                <div className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-charcoal/40">
                    {product.category}
                  </p>

                  <h3 className="mt-1 text-base font-medium text-charcoal">{product.title}</h3>

                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-charcoal/60">
                    {product.description}
                  </p>

                  <div className="mt-4 flex items-end justify-between gap-4">
                    <p className="text-sm font-semibold text-charcoal">
                      ${product.price}{" "}
                      <span className="text-xs font-normal text-charcoal/50">
                        {product.currency}
                      </span>
                    </p>

                    <span className="text-xs font-medium text-charcoal/40 transition-colors group-hover:text-charcoal/70">
                      View piece
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
