// app/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Story | PLANKZ DECKZ",
  description: "The PLANKZ DECKZ story: coastal handmade skateboards from reclaimed timber and repurposed materials.",
};

const sections = [{'title': 'Reclaimed by design', 'text': 'The material story matters. Boards are shaped around available timber character rather than hidden behind mass-production sameness.'}, {'title': 'Coastal workshop feel', 'text': 'The visual identity is Australian beach lifestyle: weathered timber, teal water, coral sunsets, warm grain, and handmade edges.'}, {'title': 'Local pickup model', 'text': 'Deckz are built locally and handed over by arrangement so details can be checked directly before the board leaves the workshop.'}, {'title': 'One of a kind', 'text': 'Every board varies in grain, tone, repair marks, and finish. That variation is the product, not a defect.'}];

export default function Page() {
  return (
    <main className="bg-warm-white">
      <section className="border-b border-charcoal/10 bg-weathered-grey/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">PLANKZ DECKZ</p>
          <h1 className="mt-4 font-display text-4xl tracking-wide text-brand-gold sm:text-6xl">Our Story</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-charcoal/75">PLANKZ DECKZ builds one-of-a-kind skate and longboard deckz from reclaimed timber, offcuts, and repurposed material that would otherwise be wasted.</p>
        </div>
      </section>
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <article key={section.title} className="rounded-3xl border border-charcoal/10 bg-ivory/80 p-6 shadow-sm">
              <h2 className="font-display text-2xl tracking-wide text-brand-gold">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-charcoal/70">{section.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-3xl bg-charcoal p-8 text-warm-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-2xl tracking-wide text-brand-gold">Hand-Crafted Skateboard Deckz — Recycled. Reclaimed. One of a Kind.</p>
            <p className="mt-2 text-sm text-warm-white/70">Custom local pickup builds from repurposed landfill materials.</p>
          </div>
          <Link href="/custom" className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-charcoal hover:bg-primary/90">
            Start a custom deck
          </Link>
        </div>
      </section>
    </main>
  );
}
