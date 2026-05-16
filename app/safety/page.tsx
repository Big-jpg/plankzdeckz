// app/safety/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Safety | PLANKZ DECKZ",
  description: "Board safety and use guidance for PLANKZ DECKZ handmade skateboard and longboard deckz.",
};

const sections = [{'title': 'Inspect before riding', 'text': 'Check deck condition, trucks, wheels, fasteners, grip, and any visible damage before each ride.'}, {'title': 'Ride within limits', 'text': 'Use appropriate protective gear, ride in safe areas, and do not exceed the intended use discussed for the build.'}, {'title': 'Reclaimed material', 'text': 'Recovered timber can carry unique grain and marks. Structural suitability must be confirmed for the intended use.'}, {'title': 'Display builds', 'text': 'If a board is made as wall art or display, do not treat it as a ride-ready deck unless explicitly confirmed.'}];

export default function Page() {
  return (
    <main className="bg-warm-white">
      <section className="border-b border-charcoal/10 bg-weathered-grey/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">PLANKZ DECKZ</p>
          <h1 className="mt-4 font-display text-4xl tracking-wide text-brand-gold sm:text-6xl">Safety & Use</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-charcoal/75">Handmade reclaimed timber deckz require normal skateboard judgement, inspection, and maintenance before riding.</p>
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
