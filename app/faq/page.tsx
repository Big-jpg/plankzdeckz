// app/faq/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ | PLANKZ DECKZ",
  description:
    "Frequently asked questions about PLANKZ DECKZ finished boards, local pickup, and board care.",
};

const faqs = [
  {
    question: "How much does a PLANKZ DECKZ board cost?",
    answer:
      "Each finished board has its own price on its product page. The checkout price is checked against the current listing before payment begins.",
  },
  {
    question: "Is every board really one of a kind?",
    answer:
      "Yes. Each board is built from reclaimed hardwood pallet timber, so the grain, colour, strip layout, marks, and finish variation are unique to that deck. Once a one-off board is sold, it cannot be reproduced exactly.",
  },
  {
    question: "Can I design a board on the site?",
    answer:
      "The shop currently sells completed boards only. Each listing shows the exact rideable board available for pickup.",
  },
  {
    question: "Is shipping available?",
    answer:
      "Not yet. PLANKZ DECKZ is local pickup only at this stage. Pickup is arranged after order confirmation in the Perth, Western Australia area.",
  },
  {
    question: "How should I care for the board?",
    answer:
      "Keep the board dry where practical, avoid leaving it in harsh sun or wet conditions for long periods, inspect the deck and hardware before riding, and clean it with a dry or lightly damp cloth rather than aggressive chemicals.",
  },
  {
    question: "What makes these different from mass-manufactured boards?",
    answer:
      "The boards are handmade from recycled hardwood pallets instead of anonymous production blanks. The reclaimed timber, visible grain, individual layout, local workshop process, and one-off finish are central to the product.",
  },
  {
    question: "Are trucks and wheels included?",
    answer:
      "Yes. Boards in the shop are complete, rideable builds. Check the individual product photos and details for the exact hardware.",
  },
  {
    question: "Can I inspect the finished board at pickup?",
    answer:
      "Yes. Local pickup is arranged so the board can be checked at handover, including finish, timber character, dimensions, and hardware.",
  },
];

export default function Page() {
  return (
    <main className="bg-warm-white">
      <section className="border-b border-charcoal/10 bg-weathered-gray/35 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal">Questions</p>
          <h1 className="mt-4 font-display text-4xl tracking-wide text-amber sm:text-6xl">FAQ</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-charcoal/75">
            Practical answers for finished boards, reclaimed timber variation, board care, and the
            current local-pickup-only fulfilment model.
          </p>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
          {faqs.map((item) => (
            <article
              key={item.question}
              className="rounded-3xl border border-charcoal/10 bg-ivory/85 p-6 shadow-sm"
            >
              <h2 className="font-display text-2xl tracking-wide text-amber">{item.question}</h2>
              <p className="mt-3 text-sm leading-7 text-charcoal/72">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-3xl bg-charcoal p-8 text-warm-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-2xl tracking-wide text-amber">
              Need a specific answer?
            </p>
            <p className="mt-2 text-sm leading-7 text-warm-white/70">
              Send the product name and your question, or ask about pickup arrangements.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex rounded-full bg-teal px-5 py-3 text-sm font-semibold text-charcoal hover:bg-teal/90"
          >
            Contact PLANKZ DECKZ
          </Link>
        </div>
      </section>
    </main>
  );
}
