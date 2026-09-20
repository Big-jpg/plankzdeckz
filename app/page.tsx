import type { Metadata } from "next";
import Link from "next/link";
import { getAvailableBoards } from "@/lib/catalogue";
import { ProductVisual } from "@/components/product-visual";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Handcrafted one of a kind deckz",
  description:
    "Complete cruisers, surfskates and longboards made from reclaimed Australian timber. Shop finished boards for local pickup.",
};
export default async function HomePage() {
  const boards = await getAvailableBoards();
  const featured = boards[0];
  return (
    <main className="bg-[#f8f2e5] text-[#332619]">
      <section className="border-b border-[#332619]/15 px-5 py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.3em] text-[#3f817a]">
              Western Australian ride craft
            </p>
            <h1 className="mt-6 max-w-xl font-display text-[clamp(4rem,9vw,8rem)] leading-[.84] tracking-[.025em]">
              Reclaimed timber.
              <br />
              <span className="text-[#a26349]">Made to ride.</span>
            </h1>
            <p className="mt-8 max-w-lg text-lg leading-8">
              One of a kind complete cruisers, surfskates and longboards. Made by hand from
              reclaimed timber, ready for their next stretch of coast.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop#boards"
                className="rounded-full bg-[#332619] px-6 py-3 font-bold uppercase tracking-widest text-[#f8f2e5]"
              >
                Shop deckz →
              </Link>
              <Link
                href="/our-story"
                className="rounded-full border border-[#332619] px-6 py-3 font-bold uppercase tracking-widest"
              >
                Our story
              </Link>
            </div>
            <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-[#332619]/60">
              Finished boards · secure checkout · local pickup
            </p>
          </div>
          <div className="relative">
            {featured ? (
              <Link href={`/products/${featured.handle}`} aria-label={`View ${featured.title}`}>
                <ProductVisual
                  productType="board"
                  title={featured.title}
                  images={featured.images}
                  className="aspect-[4/3] rounded-sm border-0 bg-[#eadcc3] shadow-none"
                  imageClassName="object-cover p-0 sm:p-0"
                  priority
                />
                <div className="flex justify-between gap-4 border-b-2 border-[#332619] py-4">
                  <span className="font-display text-2xl">{featured.title}</span>
                  <span className="font-bold">
                    {new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(
                      featured.price,
                    )}
                  </span>
                </div>
              </Link>
            ) : (
              <div className="flex aspect-[4/3] items-end border border-[#332619]/15 bg-[#e7d6bd] p-8">
                <p className="max-w-md font-display text-5xl leading-none">
                  The next deck is being made. Come back for the first drop.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[.7fr_1.3fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.3em] text-[#3f817a]">
            The Plankz way
          </p>
          <h2 className="mt-4 font-display text-5xl">No two boards alike.</h2>
        </div>
        <div>
          <p className="max-w-2xl text-xl leading-9">
            We turn rescued timber into finished boards with their own grain, shape and feel. Each
            listing shows the exact board you can take home, from both sides and out in the world.
          </p>
          <Link
            href="/gallery"
            className="mt-6 inline-block border-b-2 border-[#332619] pb-1 font-bold uppercase tracking-widest"
          >
            Explore the gallery →
          </Link>
        </div>
      </section>
      <section className="bg-[#332619] px-5 py-16 text-[#f8f2e5]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.3em] text-[#8acac0]">
              Plankz wares
            </p>
            <h2 className="mt-4 font-display text-5xl">The OG tee.</h2>
            <p className="mt-3 max-w-md leading-7">
              The first piece of Plankz gear. Check the shop for available sizes.
            </p>
          </div>
          <Link
            href="/shop#merch"
            className="rounded-full border border-[#f8f2e5] px-6 py-3 font-bold uppercase tracking-widest"
          >
            Shop wares →
          </Link>
        </div>
      </section>
    </main>
  );
}
