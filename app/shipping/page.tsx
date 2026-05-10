// app/shipping/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping",
  description: "Shipping information for Lumenform Studio.",
};

export default function ShippingPage() {
  return (
    <>
      <section className="bg-warm-black py-16 text-warm-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Shipping</h1>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-charcoal/10 bg-ivory/50 p-8 text-center">
            <Truck className="mx-auto h-10 w-10 text-charcoal/30" />
            <h2 className="mt-4 text-xl font-semibold text-charcoal">
              Shipping is not yet available
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-charcoal/60">
              All orders are currently available for local pickup only. We are working on safe
              packaging solutions for fragile 3D printed shades and plan to offer shipping in the
              future.
            </p>
            <div className="mt-8">
              <Link
                href="/pickup"
                className="inline-flex items-center gap-2 rounded-lg bg-charcoal px-6 py-3 text-sm font-semibold text-warm-white transition-colors hover:bg-charcoal/90"
              >
                View pickup information
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
