// app/materials/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Materials | PLANKZ DECKZ",
  description:
    "The PLANKZ DECKZ timber story: recycled hardwood pallets rescued from landfill and rebuilt into one-of-a-kind skateboard and longboard deckz.",
};

const materialSections = [
  {
    title: "Rescued hardwood pallets",
    text: "The material story starts with hardwood pallets that were otherwise headed for landfill or waste streams. Useful timber is recovered, broken down, inspected, and given a second life as rideable craft.",
  },
  {
    title: "The timber leads",
    text: "The workshop does not force every board into sameness. Grain, colour, scar marks, nail history, knots, and density guide how each deck is laid out, laminated, shaped, and finished.",
  },
  {
    title: "Hardwoods with character",
    text: "Reclaimed pallet stock can include mixed Australian and imported hardwoods, with each batch varying in tone, grain, and working behaviour. That variation is treated as a feature, not a defect.",
  },
  {
    title: "Sustainability by practice",
    text: "PLANKZ DECKZ is built around reuse before replacement. Rescuing timber from landfill reduces waste while producing boards that carry a visible material history no new blank can copy.",
  },
];

export default function Page() {
  return (
    <main className="bg-warm-white">
      <section className="border-b border-charcoal/10 bg-weathered-gray/35 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal">Reclaimed timber</p>
          <h1 className="mt-4 font-display text-4xl tracking-wide text-amber sm:text-6xl">
            The Timber Story
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-charcoal/75">
            PLANKZ DECKZ boards are made from recycled hardwood pallets that would otherwise be
            discarded. The goal is simple: rescue timber with character, respect what it already
            carries, then turn it into a strong, finished, one-of-a-kind deck.
          </p>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {materialSections.map((section) => (
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
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl bg-charcoal p-8 text-warm-white">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-coral">
              Material-led craft
            </p>
            <blockquote className="mt-4 font-display text-3xl leading-tight tracking-wide text-amber sm:text-4xl">
              We let the wood do the talking, then we make it better.
            </blockquote>
            <p className="mt-5 text-sm leading-7 text-warm-white/72">
              Every deck starts as recovered timber and ends as a board that shows its grain,
              contrast, repairs, and handmade finish honestly.
            </p>
          </div>
          <div className="rounded-3xl border border-teal/25 bg-teal/10 p-8">
            <h2 className="font-display text-2xl tracking-wide text-amber">Why it matters</h2>
            <p className="mt-3 text-sm leading-7 text-charcoal/72">
              Mass-manufactured boards are designed to be repeatable. PLANKZ DECKZ boards are
              designed to be individual: recycled, reclaimed, shaped by hand, and made from timber
              with a previous life.
            </p>
            <Link
              href="/process"
              className="mt-6 inline-flex rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-warm-white hover:bg-warm-black"
            >
              See how boards are made
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
