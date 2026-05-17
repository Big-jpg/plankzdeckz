// app/process/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Process | PLANKZ DECKZ",
  description:
    "How PLANKZ DECKZ boards are made: sourcing recycled pallets, selecting timber, laminating, shaping, finishing, and preserving one-of-a-kind character.",
};

const processSteps = [
  {
    title: "1. Source the pallets",
    text: "Usable hardwood pallets are recovered before they become waste. Each batch is assessed for timber quality, structural suitability, grain, colour, and the story visible in the material.",
  },
  {
    title: "2. Select the timber",
    text: "Boards are planned around the timber available. Pieces are selected for strength, contrast, grain direction, and visual rhythm so the finished deck feels deliberate rather than random.",
  },
  {
    title: "3. Laminate the blank",
    text: "Selected strips are prepared and laminated into a board blank. This is where reclaimed pallet timber starts becoming a coherent deck while retaining the variation that makes it unique.",
  },
  {
    title: "4. Shape the deck",
    text: "The blank is cut, shaped, refined, and balanced for the intended board style, whether that direction is cruiser, longboard, surfskate, wall piece, or a custom one-off build.",
  },
  {
    title: "5. Finish by hand",
    text: "Edges, surfaces, timber transitions, and final finish are worked by hand. The aim is a clean, durable result without sanding away the reclaimed character that gives the board its identity.",
  },
  {
    title: "6. Confirm the handover",
    text: "Once the deck is ready, pickup is arranged locally in the Perth, Western Australia area so the finished board can be checked directly before it leaves the workshop.",
  },
];

export default function Page() {
  return (
    <main className="bg-warm-white">
      <section className="border-b border-charcoal/10 bg-weathered-gray/35 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal">Workshop process</p>
          <h1 className="mt-4 font-display text-4xl tracking-wide text-amber sm:text-6xl">
            How Boards Are Made
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-charcoal/75">
            Every PLANKZ DECKZ board is built from reclaimed hardwood pallet timber and shaped by
            hand. The process is controlled, but not generic: the timber decides part of the final
            direction, which is why every deck is one of a kind.
          </p>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
          {processSteps.map((step) => (
            <article
              key={step.title}
              className="rounded-3xl border border-charcoal/10 bg-ivory/85 p-6 shadow-sm"
            >
              <h2 className="font-display text-2xl tracking-wide text-amber">{step.title}</h2>
              <p className="mt-3 text-sm leading-7 text-charcoal/72">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-coral/30 bg-coral/15 p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-charcoal/60">
              One-of-a-kind by design
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-wide text-amber">
              No two reclaimed boards come out the same.
            </h2>
            <p className="mt-4 text-sm leading-7 text-charcoal/72">
              A finished PLANKZ DECKZ board may show different hardwood species, contrasting strips,
              timber scars, colour shifts, and natural marks from its previous life. Those details are
              part of the value. They are the difference between a handmade reclaimed deck and a
              mass-manufactured blank.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-warm-white hover:bg-warm-black"
              >
                View available deckz
              </Link>
              <Link
                href="/pickup"
                className="inline-flex rounded-full border border-charcoal/15 px-5 py-3 text-sm font-semibold text-charcoal hover:border-teal hover:bg-teal/10"
              >
                Local pickup details
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
