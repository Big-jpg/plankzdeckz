// app/faq/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about fittings, adapters, LED bulb safety, local pickup, production timing, shipping status, and customisation at Lumenform Studio.",
};

const faqs = [
  {
    question: "What fitting do I need?",
    answer:
      "Choose B22 if your bulb has two side pins and pushes in before twisting. Choose E27 if the bulb screws in with a threaded base. Choose Clipsal No. 530 if your light is a round batten holder fixed directly to the ceiling. If none of those descriptions feel certain, select Other / not sure.",
  },
  {
    question: "What if I do not know my fixture type?",
    answer:
      "Select Other / not sure during product configuration and add a short fixture note. A clear photo of the socket or ceiling holder can be used to confirm compatibility before production. Do not dismantle wiring or fixed electrical parts to identify the fitting.",
  },
  {
    question: "Are adapters included?",
    answer:
      "Yes. One selected mechanical fitting adapter is included with each standard shade at no extra cost. The adapter supports the shade on the selected fitting type; it does not alter wiring, electrical contacts, or the certified fixture already installed in the home.",
  },
  {
    question: "Can I request a custom size?",
    answer:
      "Yes. Custom size, colour, material, and form requests can be submitted through the custom design process. The request is reviewed for scale, material suitability, fitting compatibility, and production practicality before the final price and timing are confirmed.",
  },
  {
    question: "What bulbs are safe?",
    answer:
      "Use modern LED bulbs only. The bulb must also remain within the wattage and temperature limits of your existing fitting. LED-only use applies to every Lumenform shade, material, colour, and finish.",
  },
  {
    question: "Can I use incandescent or halogen bulbs?",
    answer:
      "No. Incandescent, halogen, heat lamp, appliance, or other high-temperature bulbs must not be used. High heat can deform printed materials, reduce product lifespan, and create an unsafe condition.",
  },
  {
    question: "Is shipping available?",
    answer:
      "No. Lumenform is currently local pickup only. Shipping remains stubbed in the site model and is not available at checkout. If shipping is introduced later, additional delivery terms, costs, and packaging requirements will need to be confirmed first.",
  },
  {
    question: "How long does production take?",
    answer:
      "Standard catalogue shades are typically ready within 3–5 business days. Custom work commonly takes 5–10 business days after the design, fitting, and price are confirmed. Unclear fixture details can pause production until compatibility is reviewed.",
  },
  {
    question: "What happens after I order?",
    answer:
      "The order is reviewed for adapter choice, product details, LED-only acknowledgement, and any fixture or customisation notes. The shade is then produced and prepared in the studio. When complete, you receive an email with local pickup instructions and available collection times.",
  },
];

export default function FaqPage() {
  return (
    <>
      <section className="bg-warm-black py-16 text-warm-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">
            Customer support
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">FAQ</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ivory/70">
            Practical answers about fitting adapters, safe bulbs, custom requests, production
            timing, and the current local pickup-only model.
          </p>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {faqs.map((faq) => (
              <article
                key={faq.question}
                className="rounded-2xl border border-charcoal/10 bg-ivory/35 p-6"
              >
                <h2 className="text-lg font-semibold text-charcoal">{faq.question}</h2>
                <p className="mt-3 text-sm leading-relaxed text-charcoal/70">{faq.answer}</p>
              </article>
            ))}
          </div>

          <section className="mt-10 rounded-2xl border border-amber/30 bg-amber/5 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-charcoal">Still unsure?</h2>
            <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
              If the fitting, size, safety requirement, or pickup process is unclear, contact the
              studio before ordering or select Other / not sure when configuring the shade.
              Compatibility can be confirmed before production starts.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/fitting-guide"
                className="inline-flex justify-center rounded-lg bg-charcoal px-6 py-3 text-sm font-semibold text-warm-white transition-colors hover:bg-charcoal/90"
              >
                View fitting guide
              </Link>
              <Link
                href="/contact"
                className="inline-flex justify-center rounded-lg border border-charcoal/15 px-6 py-3 text-sm font-semibold text-charcoal transition-colors hover:border-charcoal/30"
              >
                Contact the studio
              </Link>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
