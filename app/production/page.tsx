// app/production/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Clock, MailCheck, PackageCheck, PauseCircle, Printer } from "lucide-react";

export const metadata: Metadata = {
  title: "Production & Turnaround",
  description:
    "How Lumenform Studio produces made-to-order shades, confirms fitting details, and prepares local pickup orders.",
};

const processSteps = [
  {
    title: "Order received",
    text: "Your order is reviewed for product selection, adapter choice, colour, material, and any fixture or customisation notes.",
  },
  {
    title: "Fitting checked",
    text: "If B22, E27, or Clipsal No. 530 is selected, production can usually proceed. If Other / not sure is selected, production may pause until fixture details are confirmed.",
  },
  {
    title: "Studio production",
    text: "The shade and selected adapter are prepared in the studio. Timing depends on print duration, finishing requirements, current workload, and material availability.",
  },
  {
    title: "Ready for pickup",
    text: "Once complete, you receive an email with collection instructions and available appointment times for local pickup.",
  },
];

const timingRows = [
  ["Standard catalogue shade", "Usually 3–5 business days"],
  ["Custom size, colour, or material request", "Usually 5–10 business days after confirmation"],
  ["Complex or experimental form", "Quoted individually before production"],
  ["Unconfirmed fitting details", "Paused until fixture notes or photos are reviewed"],
];

export default function ProductionPage() {
  return (
    <>
      <section className="bg-warm-black py-16 text-warm-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">
            Studio workflow
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Production &amp; Turnaround
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ivory/70">
            Most Lumenform pieces are made after an order is placed. The process is intentionally
            small-batch so fitting, material, and local pickup details can be handled correctly.
          </p>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <section className="rounded-2xl border border-charcoal/10 bg-ivory/40 p-6 sm:p-8">
              <Printer className="h-6 w-6 text-charcoal/50" />
              <h2 className="mt-4 text-xl font-semibold text-charcoal">
                Made to order, not warehouse stock
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-charcoal/70">
                <p>
                  Lumenform operates as a small studio practice. Rather than holding large
                  quantities of finished inventory, shades are generally prepared after purchase so
                  the selected adapter, finish, and any customer notes are applied to that specific
                  order.
                </p>
                <p>
                  Lead times are estimates, not guaranteed dispatch dates. They can change if a
                  fitting needs clarification, a material is unavailable, or the piece requires
                  additional finishing time.
                </p>
              </div>
            </section>

            <aside className="rounded-2xl border border-charcoal/10 bg-warm-white p-6">
              <Clock className="h-6 w-6 text-charcoal/50" />
              <h2 className="mt-4 text-lg font-semibold text-charcoal">Typical timing</h2>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                Standard shades are typically ready within 3–5 business days. Custom work commonly
                takes 5–10 business days after the design, price, and fitting have been confirmed.
              </p>
            </aside>
          </div>

          <section className="mt-10 rounded-2xl border border-charcoal/10 bg-warm-white p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-charcoal">What happens after you order</h2>
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-4">
              {processSteps.map((step, index) => (
                <article
                  key={step.title}
                  className="rounded-xl border border-charcoal/10 bg-ivory/30 p-5"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-charcoal text-xs font-semibold text-warm-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-charcoal">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{step.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-2xl border border-charcoal/10 bg-ivory/40 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-charcoal">Turnaround guide</h2>
            <div className="mt-5 overflow-hidden rounded-xl border border-charcoal/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-warm-white text-charcoal">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Order type</th>
                    <th className="px-4 py-3 font-semibold">Expected timing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal/10 bg-warm-white text-charcoal/70">
                  {timingRows.map(([label, timing]) => (
                    <tr key={label}>
                      <td className="px-4 py-3 font-medium text-charcoal">{label}</td>
                      <td className="px-4 py-3">{timing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-amber/30 bg-amber/5 p-6">
              <PauseCircle className="h-6 w-6 text-amber" />
              <h2 className="mt-4 text-lg font-semibold text-charcoal">
                When production may pause
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                Production may pause when the fitting is unclear, when a requested size or form
                needs feasibility review, or when the order appears unsafe for the intended use.
                This prevents producing a shade that does not fit the customer’s actual fixture.
              </p>
            </section>

            <section className="rounded-2xl border border-charcoal/10 bg-warm-white p-6">
              <MailCheck className="h-6 w-6 text-charcoal/50" />
              <h2 className="mt-4 text-lg font-semibold text-charcoal">Collection notification</h2>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                When the order is finished, you receive an email confirming that it is ready. Pickup
                is arranged by appointment; public checkout shipping remains stubbed and
                unavailable.
              </p>
            </section>
          </div>

          <div className="mt-10 rounded-2xl border border-charcoal/10 bg-ivory/40 p-6">
            <PackageCheck className="h-6 w-6 text-charcoal/50" />
            <h2 className="mt-4 text-lg font-semibold text-charcoal">Before production starts</h2>
            <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
              If you need to change a fitting choice, pickup contact detail, or custom note, contact
              the studio as early as possible. Once production has materially commenced,
              cancellation or refund options may be limited for made-to-order or personalised work.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex justify-center rounded-lg bg-charcoal px-6 py-3 text-sm font-semibold text-warm-white transition-colors hover:bg-charcoal/90"
              >
                Contact the studio
              </Link>
              <Link
                href="/returns"
                className="inline-flex justify-center rounded-lg border border-charcoal/15 px-6 py-3 text-sm font-semibold text-charcoal transition-colors hover:border-charcoal/30"
              >
                Read returns placeholder
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
