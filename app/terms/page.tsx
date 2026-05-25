// app/terms/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms | PLANKZ DECKZ",
  description: "Terms and conditions for PLANKZ DECKZ orders and custom skateboard deck builds.",
};

const sections = [{'title': 'Handmade products', 'text': 'Each board may vary in timber character, finish, and small handmade details. Product images and placeholders are indicative.'}, {'title': 'Custom orders', 'text': 'PLANKZ DECKZ may confirm or decline a custom request depending on material availability, safety, timing, or feasibility.'}, {'title': 'Local pickup', 'text': 'Orders are currently pickup-only. Shipping is not available unless separately agreed in writing.'}, {'title': 'Liability', 'text': 'Customers are responsible for using boards appropriately, maintaining hardware, wearing protective gear, and riding within safe conditions.'}];

export default function Page() {
  return (
    <main className="bg-warm-white">
      <section className="border-b border-charcoal/10 bg-ivory/45 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal">PLANKZ DECKZ</p>
          <h1 className="mt-4 font-display text-4xl tracking-wide text-charcoal sm:text-6xl">Terms & Conditions</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-charcoal/75">These terms describe the Phase 0 store shell for handmade, recycled-material skateboard and longboard deckz sold with local pickup.</p>
        </div>
      </section>
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <article key={section.title} className="rounded-3xl border border-charcoal/10 bg-ivory/80 p-6 shadow-sm">
              <h2 className="font-display text-2xl tracking-wide text-charcoal">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-charcoal/70">{section.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-3xl bg-charcoal p-8 text-warm-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-2xl tracking-wide text-amber/90">Hand-Crafted Skateboard Deckz — Recycled. Reclaimed. One of a Kind.</p>
            <p className="mt-2 text-sm text-warm-white/70">Custom local pickup builds from repurposed landfill materials.</p>
          </div>
          <Link href="/custom" className="inline-flex rounded-full bg-amber px-5 py-3 text-sm font-semibold text-charcoal hover:bg-amber/90">
            Start a custom deck
          </Link>
        </div>
      </section>
    </main>
  );
}
