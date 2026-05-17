// app/our-story/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Story | PLANKZ DECKZ",
  description:
    "How PLANKZ DECKZ started: Blair and Corey, reclaimed pallet timber, coastal Western Australia, and handmade skateboard deckz since 2008.",
};

const storyCards = [
  {
    title: "Founded in 2008",
    text: "PLANKZ DECKZ started in Western Australia in 2008, shaped by co-founders Blair and Corey and a shared pull toward cruisers, timber, surf culture, and the kind of objects that carry a real story.",
  },
  {
    title: "Built first for mates",
    text: "The early boards were made for mates, not markets. What began as practical workshop builds evolved into a small brand because every deck carried the personality of the timber and the people around it.",
  },
  {
    title: "Woodworking experience",
    text: "With 20+ years of woodworking experience behind the tools, the boards are made with an understanding of grain, strength, finish, proportion, and the limits of reclaimed material.",
  },
  {
    title: "Pallet wood identity",
    text: "The pallet timber is not hidden. It is the identity. Every mark, colour shift, knot, repair, and contrast strip helps explain where the board came from and why no two deckz can be the same.",
  },
];

export default function Page() {
  return (
    <main className="bg-warm-white">
      <section className="border-b border-charcoal/10 bg-weathered-gray/35 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal">PLANKZ DECKZ</p>
          <h1 className="mt-4 font-display text-4xl tracking-wide text-amber sm:text-6xl">
            How It Started
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-charcoal/75">
            PLANKZ DECKZ is the story of two makers, reclaimed timber, coastal Western Australia,
            and a workshop habit that became a board brand. Blair and Corey started by building
            cruisers for mates; the boards kept getting better, the timber kept telling better
            stories, and the brand grew from there.
          </p>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {storyCards.map((section) => (
            <article
              key={section.title}
              className="rounded-3xl border border-charcoal/10 bg-ivory/85 p-6 shadow-sm"
            >
              <h2 className="font-display text-2xl tracking-wide text-amber">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-charcoal/72">{section.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-teal/25 bg-charcoal p-8 text-warm-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal">
            Recycle. Reclaim. Ride.
          </p>
          <blockquote className="mt-4 max-w-3xl font-display text-3xl leading-tight tracking-wide text-amber sm:text-4xl">
            We let the wood do the talking, then we make it better.
          </blockquote>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-warm-white/72">
            The result is a one-of-a-kind deck shaped for people who value craft, coastline,
            reuse, and the visible history of real timber over anonymous mass production.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/materials"
              className="inline-flex rounded-full bg-teal px-5 py-3 text-sm font-semibold text-charcoal hover:bg-teal/90"
            >
              Read the timber story
            </Link>
            <Link
              href="/process"
              className="inline-flex rounded-full border border-warm-white/20 px-5 py-3 text-sm font-semibold text-warm-white hover:border-amber hover:text-amber"
            >
              See the build process
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
