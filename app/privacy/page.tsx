// app/privacy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy | PLANKZ DECKZ",
  description: "Privacy policy for PLANKZ DECKZ.",
};

const sections = [{'title': 'Information collected', 'text': 'Contact details, order details, custom request notes, and payment processing references may be stored where needed to operate the store.'}, {'title': 'How it is used', 'text': 'Information is used to respond, prepare orders, coordinate pickup, manage account access, and maintain basic operational records.'}, {'title': 'Payments', 'text': 'Payments are handled through Stripe. PLANKZ DECKZ does not store card numbers directly.'}, {'title': 'Contact', 'text': 'For privacy questions, email plankz.deckz@gmail.com.'}];

export default function Page() {
  return (
    <main className="bg-warm-white">
      <section className="border-b border-charcoal/10 bg-ivory/45 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal">PLANKZ DECKZ</p>
          <h1 className="mt-4 font-display text-4xl tracking-wide text-charcoal sm:text-6xl">Privacy</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-charcoal/75">PLANKZ DECKZ collects only the information needed to handle enquiries, custom deck requests, orders, payment processing, and pickup coordination.</p>
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
