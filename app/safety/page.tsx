// app/safety/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ShieldCheck, ThermometerSun } from "lucide-react";

export const metadata: Metadata = {
  title: "LED Bulb Safety",
  description:
    "Safety guidance for Lumenform Studio lampshades, including LED-only bulb requirements and fitting adapter limitations.",
};

const safeUse = [
  "Use modern LED bulbs only.",
  "Keep the bulb within the wattage and temperature limits printed on your existing fixture.",
  "Use the supplied adapter only as a mechanical support for the shade.",
  "Ask a qualified electrician if the fitting, wiring, or installation environment appears damaged or unusual.",
];

const unsafeUse = [
  "Do not use incandescent bulbs.",
  "Do not use halogen bulbs.",
  "Do not use heat lamps, appliance bulbs, or other high-temperature bulbs.",
  "Do not modify wiring, sockets, or fixed electrical infrastructure to make a shade fit.",
];

export default function SafetyPage() {
  return (
    <>
      <section className="bg-warm-black py-16 text-warm-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">
            Product safety
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            LED Bulb Safety Note
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ivory/70">
            Lumenform shades are decorative lighting accessories designed for low-heat LED bulbs.
            The bulb limitation is part of the product, not an optional recommendation.
          </p>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-amber/30 bg-amber/5 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="mt-1 h-7 w-7 shrink-0 text-amber" />
              <div>
                <h2 className="text-xl font-semibold text-charcoal">Use LED bulbs only</h2>
                <p className="mt-3 text-sm leading-relaxed text-charcoal/75">
                  All Lumenform shades must be used with LED bulbs only. Incandescent, halogen, heat
                  lamp, appliance, or other high-temperature bulbs must not be used under any
                  circumstance. High heat can deform printed materials, shorten product life, and
                  create an unsafe installation condition.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-charcoal/10 bg-ivory/40 p-6">
              <CheckCircle2 className="h-6 w-6 text-charcoal/50" />
              <h2 className="mt-4 text-lg font-semibold text-charcoal">Safe use checklist</h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-charcoal/70">
                {safeUse.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-charcoal/10 bg-warm-white p-6">
              <ThermometerSun className="h-6 w-6 text-charcoal/50" />
              <h2 className="mt-4 text-lg font-semibold text-charcoal">Do not use</h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-charcoal/70">
                {unsafeUse.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-charcoal/40" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="mt-8 rounded-2xl border border-charcoal/10 bg-ivory/40 p-6 sm:p-8">
            <ShieldCheck className="h-6 w-6 text-charcoal/50" />
            <h2 className="mt-4 text-xl font-semibold text-charcoal">What the adapter does</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-charcoal/70">
              <p>
                The supplied fitting adapter is a mechanical support component. It helps the shade
                sit correctly on the compatible fitting type you select at checkout.
              </p>
              <p>
                The adapter does not alter wiring, electrical contacts, insulation, earthing, or the
                certified electrical infrastructure already installed in the room. If your fitting
                is loose, damaged, cracked, discoloured, overheating, or otherwise questionable,
                resolve that electrical issue before using any decorative shade.
              </p>
            </div>
          </section>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/fitting-guide"
              className="inline-flex justify-center rounded-lg bg-charcoal px-6 py-3 text-sm font-semibold text-warm-white transition-colors hover:bg-charcoal/90"
            >
              Choose a fitting adapter
            </Link>
            <Link
              href="/faq"
              className="inline-flex justify-center rounded-lg border border-charcoal/15 px-6 py-3 text-sm font-semibold text-charcoal transition-colors hover:border-charcoal/30"
            >
              Read safety FAQ
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
