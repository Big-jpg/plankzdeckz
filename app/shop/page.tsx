// app/shop/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, PackageCheck, Ruler, Trees } from "lucide-react";
import { getBoardProducts, getMerchProducts } from "@/lib/catalogue";
import type { BoardProduct, MerchProduct } from "@/lib/types";
import { ProductVisual } from "@/components/product-visual";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shop | PLANKZ DECKZ",
  description:
    "Shop one-of-a-kind recycled hardwood boards and repeatable PLANKZ DECKZ merch from Western Australia.",
};

function formatPrice(product: BoardProduct | MerchProduct): string {
  return `$${product.price.toFixed(0)} ${product.currency}`;
}

function BoardCard({ board }: { board: BoardProduct }) {
  const sold = board.availabilityStatus === "sold";

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-charcoal/10 bg-warm-white/82 shadow-[0_16px_45px_rgba(19,35,33,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(19,35,33,0.08)]">
      <ProductVisual
        productType="board"
        title={board.title}
        images={board.images}
        className="h-72 rounded-none border-0 bg-ivory/45 shadow-none sm:h-80"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal/90">
              {board.boardShape}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-charcoal">{board.title}</h2>
          </div>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
              sold ? "bg-charcoal/8 text-charcoal/55" : "bg-teal/16 text-charcoal ring-1 ring-teal/30",
            )}
          >
            {sold ? "Sold" : "Available"}
          </span>
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-charcoal/68">{board.description}</p>

        <dl className="grid grid-cols-1 gap-3 text-sm text-charcoal/68 sm:grid-cols-2">
          <div className="border-l border-copper/20 pl-3">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/45">
              <Trees className="h-4 w-4" /> Timber
            </dt>
            <dd className="mt-1 font-medium text-charcoal">{board.timberSpecies.join(" / ")}</dd>
          </div>
          <div className="border-l border-copper/20 pl-3">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/45">
              <Ruler className="h-4 w-4" /> Size
            </dt>
            <dd className="mt-1 font-medium text-charcoal">{board.boardDimensions.display}</dd>
          </div>
        </dl>

        <div className="flex flex-col gap-4 border-t border-charcoal/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-2xl font-bold text-copper">{formatPrice(board)}</p>
          <Link
            href={`/products/${board.handle}`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-4 py-2 text-sm font-semibold text-warm-white transition hover:bg-charcoal/90"
          >
            {sold ? "View gallery piece" : "View board"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function MerchCard({ product }: { product: MerchProduct }) {
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-charcoal/10 bg-warm-white/82 shadow-[0_16px_45px_rgba(19,35,33,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(19,35,33,0.08)]">
      <ProductVisual
        productType="merch"
        title={product.title}
        images={product.images}
        className="h-60 rounded-none border-0 bg-ivory/45 shadow-none sm:h-72"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      <div className="space-y-4 p-5 sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral/90">
            Repeatable merch
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-charcoal">{product.title}</h2>
        </div>
        <p className="line-clamp-3 text-sm leading-6 text-charcoal/68">{product.description}</p>
        <div className="border-l border-copper/20 pl-3 text-sm text-charcoal/68">
          <span className="font-semibold text-charcoal">Sizes:</span> {product.sizes.join(" / ")}
        </div>
        <div className="flex flex-col gap-4 border-t border-charcoal/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-2xl font-bold text-copper">{formatPrice(product)}</p>
          <Link
            href={`/products/${product.handle}`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-4 py-2 text-sm font-semibold text-warm-white transition hover:bg-charcoal/90"
          >
            Select options
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function ShopPage() {
  const [boards, merch] = await Promise.all([getBoardProducts(), getMerchProducts()]);

  return (
    <main className="bg-warm-white/92">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,rgba(255,248,237,0.96),rgba(244,239,230,0.9)_48%,rgba(234,216,184,0.72))] py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_14%,rgba(126,207,192,0.16),transparent_22rem),radial-gradient(circle_at_88%_10%,rgba(245,160,160,0.08),transparent_20rem)]" />
        <div className="thin-wood-trim absolute inset-x-0 bottom-0 h-px opacity-70" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-teal">
              PLANKZ DECKZ catalogue
            </p>
            <h1 className="mt-5 font-display text-5xl font-bold tracking-tight text-charcoal sm:text-7xl">
              One-off recycled hardwood boards and coastal merch.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-charcoal/72 sm:text-lg">
              Boards are individual Western Australian craft pieces made from recycled hardwood pallet
              timber. Merch is repeatable and size-selectable where needed. All physical fulfilment is
              local pickup only.
            </p>
          </div>
          <div className="mt-10 grid gap-5 border-t border-charcoal/8 pt-8 sm:grid-cols-3">
            <div className="flex gap-3">
              <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
              <div>
                <p className="text-sm font-semibold text-charcoal">Boards are one-of-a-kind</p>
                <p className="mt-1 text-sm text-charcoal/60">Sold pieces move into the gallery.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Trees className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
              <div>
                <p className="text-sm font-semibold text-charcoal">Recycled WA hardwood</p>
                <p className="mt-1 text-sm text-charcoal/60">Jarrah, marri, karri, wandoo, and sheoak.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
              <div>
                <p className="text-sm font-semibold text-charcoal">Local pickup only</p>
                <p className="mt-1 text-sm text-charcoal/60">Built and handed over in Western Australia.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="boards" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal">
                One-of-a-kind boards
              </p>
              <h2 className="mt-3 font-display text-4xl font-bold text-charcoal">
                Handmade deckz, no duplicate runs.
              </h2>
            </div>
            <Link href="/gallery" className="text-sm font-semibold text-charcoal/70 underline underline-offset-4 transition-colors hover:text-copper">
              View sold-board gallery
            </Link>
          </div>
          <div className="mt-9 grid gap-8 lg:grid-cols-3">
            {boards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        </div>
      </section>

      <section id="merch" className="woodgrain-soft border-t border-charcoal/5 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-coral">Merch</p>
            <h2 className="mt-3 font-display text-4xl font-bold text-charcoal">
              Repeatable gear for the PLANKZ crew.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-charcoal/68">
              Tees and flannelette jumpers require size selection. Sticker packs are one size.
            </p>
          </div>
          <div className="mt-9 grid gap-8 md:grid-cols-3">
            {merch.map((product) => (
              <MerchCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
