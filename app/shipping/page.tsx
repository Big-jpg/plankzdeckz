// app/shipping/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { PackageX, Truck, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping",
  description:
    "Current shipping status for Lumenform Studio orders. Shipping is stubbed and local pickup is currently required.",
};

export default function ShippingPage() {
  return (
    <>
      <section className="bg-warm-black py-16 text-warm-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">
            Fulfilment status
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Shipping</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ivory/70">
            Shipping is not currently available. Lumenform is operating as a local pickup-only
            studio while packaging, carrier, returns, and fulfilment processes remain under review.
          </p>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-amber/30 bg-amber/5 p-6 sm:p-8">
            <PackageX className="h-7 w-7 text-amber" />
            <h2 className="mt-4 text-xl font-semibold text-charcoal">Shipping remains stubbed</h2>
            <p className="mt-4 text-sm leading-relaxed text-charcoal/70">
              The checkout flow currently treats fulfilment as local pickup only. Shipping costs,
              delivery timeframes, carrier selection, transit cover, and shipped-return handling are
              not live customer options.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-charcoal/70">
              If shipping is introduced in a later phase, this page should be replaced with
              confirmed packaging standards, carrier terms, delivery pricing, damage-in-transit
              handling, and return shipping rules.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-charcoal/10 bg-ivory/40 p-6">
              <Truck className="h-6 w-6 text-charcoal/50" />
              <h2 className="mt-4 text-lg font-semibold text-charcoal">Current fulfilment</h2>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                Orders are produced locally and collected by appointment once ready. Collection
                details are provided after the order has been completed in the studio.
              </p>
              <Link
                href="/pickup"
                className="mt-4 inline-flex text-sm font-semibold text-charcoal underline underline-offset-4"
              >
                View local pickup instructions
              </Link>
            </section>

            <section className="rounded-2xl border border-charcoal/10 bg-warm-white p-6">
              <Wrench className="h-6 w-6 text-charcoal/50" />
              <h2 className="mt-4 text-lg font-semibold text-charcoal">
                Future shipping requirements
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                Before shipping becomes available, the studio should confirm packaging by product
                size, damage reporting, carrier liability, address validation, shipped returns, and
                whether any custom or oversized designs are excluded.
              </p>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
