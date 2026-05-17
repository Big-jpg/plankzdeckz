// app/returns/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Returns | PLANKZ DECKZ",
  description: "Returns and refund guidance for handmade PLANKZ DECKZ custom and small-batch boards.",
};

const sections = [{'title': 'Custom work', 'text': 'Custom orders may not be returnable for change of mind once materials have been selected or build work has started.'}, {'title': 'Material variation', 'text': 'Natural grain, reclaimed marks, and tone variation are expected features of the product.'}, {'title': 'Issue review', 'text': 'If something is wrong, contact PLANKZ DECKZ promptly with photos and the order reference.'}, {'title': 'Pickup inspection', 'text': 'Where possible, inspect the board at local pickup before accepting handover.'}];

export default function Page() {
  return (
    <main className="bg-warm-white">
      <section className="border-b border-charcoal/10 bg-weathered-grey/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">PLANKZ DECKZ</p>
          <h1 className="mt-4 font-display text-4xl tracking-wide text-brand-gold sm:text-6xl">Returns & Refunds</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-charcoal/75">Because reclaimed timber deckz are handmade and often customised, returns need to account for agreed build details and material variation.</p>
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
