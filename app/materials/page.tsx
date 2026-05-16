// app/materials/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Materials | PLANKZ DECKZ",
  description: "Reclaimed timber, recycled material, and weathered coastal finish notes for PLANKZ DECKZ.",
};

const sections = [{'title': 'Reclaimed timber', 'text': 'Boards use available timber and offcut material where practical, giving every deck a specific grain, mark, and recovery story.'}, {'title': 'Weathered grey', 'text': 'The shell palette references driftwood, aged fence boards, workshop dust, and coastal timber exposed to salt air.'}, {'title': 'Warm timber tones', 'text': 'Gold heading colour #f5be33 is used deliberately as a warm handmade accent, not the old brown-gold value from earlier notes.'}, {'title': 'Finish variation', 'text': 'Handmade and reclaimed materials mean small variation, surface evidence, and unique tone are expected.'}];

export default function Page() {
  return (
    <main className="bg-warm-white">
      <section className="border-b border-charcoal/10 bg-weathered-grey/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">PLANKZ DECKZ</p>
          <h1 className="mt-4 font-display text-4xl tracking-wide text-brand-gold sm:text-6xl">Materials & Finishes</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-charcoal/75">PLANKZ DECKZ is built around reclaimed timber character, recycled inputs, warm grain, weathered-grey backgrounds, teal water tones, and coral accent detail.</p>
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
