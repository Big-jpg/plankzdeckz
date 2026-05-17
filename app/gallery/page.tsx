// app/gallery/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Hammer, MapPin, Trees } from "lucide-react";
import { getSoldBoards } from "@/lib/catalogue";
import { ProductVisual } from "@/components/product-visual";

export const metadata: Metadata = {
  title: "Gallery | PLANKZ DECKZ",
  description:
    "Sold one-of-a-kind PLANKZ DECKZ boards retained as portfolio evidence of recycled hardwood craftsmanship.",
};

export default async function GalleryPage() {
  const soldBoards = await getSoldBoards();

  return (
    <main className="bg-warm-white">
      <section className="border-b border-charcoal/10 bg-charcoal py-16 text-warm-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-teal">
              Sold-board gallery
            </p>
            <h1 className="mt-5 font-display text-5xl font-bold tracking-tight sm:text-7xl">
              Finished one-off boards, archived for craft proof.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-ivory/75 sm:text-lg">
              Every board is unique. When a PLANKZ DECKZ board sells, it leaves the shop flow and
              remains here as a reference for timber selection, shaping language, and reclaimed WA
              hardwood character.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {soldBoards.length === 0 ? (
            <div className="rounded-3xl border border-charcoal/10 bg-ivory/60 p-10 text-center">
              <Hammer className="mx-auto h-10 w-10 text-charcoal/30" />
              <h2 className="mt-4 font-display text-3xl font-bold text-charcoal">
                No sold boards archived yet.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-charcoal/65">
                The gallery will populate once one-of-a-kind boards are marked sold in the catalogue.
              </p>
              <Link
                href="/shop#boards"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-warm-white"
              >
                Browse available boards <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-2">
              {soldBoards.map((board) => (
                <article
                  key={board.id}
                  className="overflow-hidden rounded-3xl border border-charcoal/10 bg-ivory/40 shadow-sm"
                >
                  <ProductVisual
                    productType="board"
                    title={board.title}
                    images={board.images}
                    className="h-80 rounded-none border-0"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="space-y-6 p-6 sm:p-8">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral">
                          Sold one-off
                        </p>
                        <h2 className="mt-2 font-display text-3xl font-bold text-charcoal">
                          {board.title}
                        </h2>
                      </div>
                      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-charcoal/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-charcoal/65">
                        <BadgeCheck className="h-4 w-4" /> Sold
                      </span>
                    </div>

                    <p className="text-sm leading-7 text-charcoal/70">{board.galleryNotes}</p>

                    <dl className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-warm-white/80 p-4">
                        <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/45">
                          <Trees className="h-4 w-4" /> Timber
                        </dt>
                        <dd className="mt-2 text-sm font-semibold text-charcoal">
                          {board.timberSpecies.join(" / ")}
                        </dd>
                      </div>
                      <div className="rounded-2xl bg-warm-white/80 p-4">
                        <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/45">
                          Shape
                        </dt>
                        <dd className="mt-2 text-sm font-semibold text-charcoal">{board.boardShape}</dd>
                      </div>
                      <div className="rounded-2xl bg-warm-white/80 p-4">
                        <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/45">
                          <MapPin className="h-4 w-4" /> Origin
                        </dt>
                        <dd className="mt-2 text-sm font-semibold text-charcoal">Western Australia</dd>
                      </div>
                    </dl>

                    <Link
                      href={`/products/${board.handle}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal underline underline-offset-4"
                    >
                      View full board specs <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
