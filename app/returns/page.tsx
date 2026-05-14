// app/returns/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, Camera, FileText, RotateCcw } from "lucide-react";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description:
    "Returns and refunds placeholder guidance for made-to-order Lumenform Studio lighting objects.",
};

const assessmentItems = [
  "A product is materially defective.",
  "A product is damaged before collection.",
  "A product is substantially inconsistent with the listed description.",
  "The issue is reported within 14 days of receiving or collecting the order.",
];

const limitedItems = [
  "Change of mind after production has started.",
  "Incorrect adapter selection where fitting details were not supplied accurately.",
  "Damage caused by incandescent, halogen, or other high-temperature bulbs.",
  "Damage caused by electrical modification, unsuitable installation, or misuse.",
];

export default function ReturnsPage() {
  return (
    <>
      <section className="bg-warm-black py-16 text-warm-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">
            Policy placeholder
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Returns &amp; Refunds
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ivory/70">
            This page sets customer expectations while the studio remains small-batch and local
            pickup-only. It should be reviewed before expanding fulfilment or enabling shipping.
          </p>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-charcoal/10 bg-ivory/40 p-6 sm:p-8">
            <FileText className="h-6 w-6 text-charcoal/50" />
            <h2 className="mt-4 text-xl font-semibold text-charcoal">Made-to-order context</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-charcoal/70">
              <p>
                Lumenform products are generally prepared individually after order confirmation.
                Custom size, colour, fitting, or design requests may begin production shortly after
                the order is reviewed.
              </p>
              <p>
                Because of this made-to-order model, returns are generally assessed only where there
                is a material defect, pre-collection damage, or a significant mismatch against the
                listed product description.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-charcoal/10 bg-warm-white p-6">
              <RotateCcw className="h-6 w-6 text-charcoal/50" />
              <h2 className="mt-4 text-lg font-semibold text-charcoal">Usually assessed when</h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-charcoal/70">
                {assessmentItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-charcoal/10 bg-warm-white p-6">
              <AlertCircle className="h-6 w-6 text-charcoal/50" />
              <h2 className="mt-4 text-lg font-semibold text-charcoal">Usually limited when</h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-charcoal/70">
                {limitedItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-charcoal/40" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="mt-8 rounded-2xl border border-charcoal/10 bg-ivory/40 p-6 sm:p-8">
            <Camera className="h-6 w-6 text-charcoal/50" />
            <h2 className="mt-4 text-xl font-semibold text-charcoal">How to raise an issue</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-charcoal/70">
              <p>
                Contact the studio within 14 days of receiving or collecting the order. Include the
                order email address, a short description of the issue, and clear photographs of the
                product, fitting, and any relevant installation context.
              </p>
              <p>
                Refunds, repairs, or replacements are assessed case by case, with Australian
                Consumer Law rights preserved where they cannot be excluded.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex justify-center rounded-lg bg-charcoal px-6 py-3 text-sm font-semibold text-warm-white transition-colors hover:bg-charcoal/90"
              >
                Contact the studio
              </Link>
              <Link
                href="/terms"
                className="inline-flex justify-center rounded-lg border border-charcoal/15 px-6 py-3 text-sm font-semibold text-charcoal transition-colors hover:border-charcoal/30"
              >
                Read full terms
              </Link>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
