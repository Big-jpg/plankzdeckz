// app/pickup/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Local Pickup | PLANKZ DECKZ",
  description:
    "Local pickup details for PLANKZ DECKZ handmade skateboard and longboard deck orders in the Perth, Western Australia area.",
};

const pickupSteps = [
  {
    title: "1. Order confirmation",
    text: "After checkout or custom-order confirmation, PLANKZ DECKZ will confirm the order details, contact information, board notes, and expected pickup timing.",
  },
  {
    title: "2. Perth-area arrangement",
    text: "Pickup is arranged locally in the Perth, Western Australia area. Exact pickup details are provided directly after the order is confirmed, not published as a walk-in address.",
  },
  {
    title: "3. Direct handover",
    text: "The handover gives you a chance to inspect the deck, finish, timber character, hardware assumptions, and any custom details before taking the board home.",
  },
  {
    title: "4. No shipping yet",
    text: "Shipping is not currently available. The local-pickup model keeps fulfilment controlled while PLANKZ DECKZ continues building one-off reclaimed timber boards and merch locally.",
  },
];

export default function Page() {
  return (
    <main className="bg-warm-white">
      <section className="border-b border-charcoal/10 bg-weathered-gray/35 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal">Western Australia</p>
          <h1 className="mt-4 font-display text-4xl tracking-wide text-amber sm:text-6xl">
            Local Pickup
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-charcoal/75">
            PLANKZ DECKZ currently operates on a local-pickup-only model. Finished boards and
            confirmed orders are handed over by arrangement in the Perth, Western Australia area
            after the order details have been confirmed.
          </p>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {pickupSteps.map((step) => (
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
        <div className="mx-auto max-w-5xl rounded-3xl border border-teal/25 bg-teal/10 p-8">
          <h2 className="font-display text-3xl tracking-wide text-amber">Before pickup</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-charcoal/72">
            Bring any order notes or confirmation details, and inspect the finished deck before
            leaving. If you have questions about care, hardware, intended riding use, or display,
            raise them during the handover or contact PLANKZ DECKZ in advance.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/faq"
              className="inline-flex rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-warm-white hover:bg-warm-black"
            >
              Read pickup FAQs
            </Link>
            <Link
              href="/contact"
              className="inline-flex rounded-full border border-charcoal/15 px-5 py-3 text-sm font-semibold text-charcoal hover:border-coral hover:bg-coral/10"
            >
              Arrange contact
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
