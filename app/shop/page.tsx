import type { Metadata } from "next";
import Link from "next/link";
import { getAvailableBoards, getMerchProducts } from "@/lib/catalogue";
import type { Product } from "@/lib/types";
import { ProductVisual } from "@/components/product-visual";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Shop",
  description: "Shop finished one of a kind Plankz Deckz boards and the OG tee for local pickup.",
};
function Card({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.handle}`} className="group block">
      <ProductVisual
        productType={product.productType}
        title={product.title}
        images={product.images}
        className="aspect-[4/5] rounded-sm border-0 bg-[#eee3d2] shadow-none"
        imageClassName="object-cover p-0 transition-transform duration-300 group-hover:scale-[1.03] sm:p-0"
      />
      <div className="flex items-start justify-between gap-3 border-b border-[#3c2b20]/25 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#3f817a]">
            {product.productType === "board" ? "One of a kind complete deck" : "OG logo tee"}
          </p>
          <h3 className="mt-1 font-display text-3xl text-[#332619]">{product.title}</h3>
        </div>
        <span className="whitespace-nowrap font-bold text-[#332619]">
          {new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(
            product.price,
          )}
        </span>
      </div>
    </Link>
  );
}
export default async function ShopPage() {
  const [boards, wares] = await Promise.all([getAvailableBoards(), getMerchProducts()]);
  const tees = wares.filter((product) => product.inStock && product.merchKind === "tee");
  return (
    <main className="bg-[#f8f2e5] text-[#332619]">
      <header className="border-b border-[#332619]/15 px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[.3em] text-[#3f817a]">The shop</p>
          <h1 className="mt-4 font-display text-6xl sm:text-8xl">Deckz & wares.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8">
            Finished boards are individually photographed and sold once. The OG tee is stocked by
            size. Everything is collected locally by arrangement.
          </p>
        </div>
      </header>
      <section id="boards" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.3em] text-[#3f817a]">
              Ready to ride
            </p>
            <h2 className="mt-2 font-display text-5xl">Deckz</h2>
          </div>
          <Link href="/gallery" className="border-b border-[#332619] pb-1 font-bold">
            View sold board gallery →
          </Link>
        </div>
        {boards.length ? (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((product) => (
              <Card key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="border-y border-[#332619]/20 py-14 text-lg">
            New boards are in the workshop. Check back for the next finished drop.
          </p>
        )}
      </section>
      <section id="merch" className="scroll-mt-24 bg-[#e7d9c5] px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[.3em] text-[#3f817a]">Wear it out</p>
          <h2 className="mt-2 font-display text-5xl">Wares</h2>
          <p className="mt-4 mb-8 max-w-xl text-lg">
            The OG logo tee. Other wares will arrive when they are actually ready.
          </p>
          {tees.length ? (
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {tees.map((product) => (
                <Card key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="border-y border-[#332619]/20 py-10">
              The OG tee is being prepared for the shop.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
