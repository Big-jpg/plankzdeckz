// app/custom/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { CustomDesignRequestForm } from "@/components/custom-design-request-form";
import { CheckCircle2, Ruler, ShieldCheck, SlidersHorizontal } from "lucide-react";

export const metadata: Metadata = {
  title: "Custom Designer | PLANKZ DECKZ",
  description:
    "Request a custom PLANKZ DECKZ skateboard, cruiser, surfskate, or longboard build from reclaimed timber and recycled material.",
};

const customOptions = [
  "Cruiser, longboard, surfskate, or display build",
  "Deck length, width, concave, and stance notes",
  "Reclaimed timber character and grain direction",
  "Weathered grey, warm timber, teal, or coral finish cues",
  "Grip, clear coat, resin, or art direction",
  "Hardware compatibility notes",
  "Local pickup timing",
  "One-off experimental deckz",
];

const designSteps = [
  {
    title: "Share the ride or display intent",
    text: "Describe whether the deck is for cruising, carving, wall display, a gift, or an experimental reclaimed-material build. Reference images and rider context help set direction.",
  },
  {
    title: "Confirm feasibility",
    text: "The request is reviewed for available timber, structural suitability, finish direction, hardware assumptions, timing, and whether the build should be ride-ready or display-only.",
  },
  {
    title: "Set direction and price",
    text: "The build direction, expected production window, and price are confirmed before irreversible work proceeds. Larger or unusual builds may require an individual quote.",
  },
  {
    title: "Build the deck",
    text: "The deck is shaped, finished, checked, and prepared in the workshop. Typical timing depends on material availability, finish work, and current build queue.",
  },
  {
    title: "Collect locally",
    text: "Custom work is currently collected by appointment. Shipping remains stubbed and unavailable unless explicitly introduced in a later phase.",
  },
];

export default function CustomPage() {
  return (
    <>
      <section className="bg-charcoal py-16 text-warm-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Custom Designer
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-wide text-brand-gold sm:text-6xl">
            Custom Deckz
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ivory/75">
            Start a one-of-a-kind PLANKZ build shaped around reclaimed timber, coastal finish cues,
            rider intent, and local pickup timing.
          </p>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <section className="rounded-2xl border border-charcoal/10 bg-ivory/60 p-6 sm:p-8">
              <SlidersHorizontal className="h-6 w-6 text-primary" />
              <h2 className="mt-4 font-display text-2xl tracking-wide text-brand-gold">
                What can be customised
              </h2>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {customOptions.map((item) => (
                  <div
                    key={item}
                    className="rounded-lg border border-charcoal/10 bg-warm-white px-4 py-3 text-sm text-charcoal/70"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <aside className="rounded-2xl border border-primary/30 bg-primary/10 p-6">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-lg font-semibold text-charcoal">Use remains fixed</h2>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                Customisation can change size, finish, artwork, timber direction, and intended ride
                style. It does not remove the need to inspect the board, use suitable hardware, and
                ride within safe conditions.
              </p>
              <Link
                href="/faq"
                className="mt-4 inline-flex text-sm font-semibold text-charcoal underline underline-offset-4"
              >
                Read board care FAQs
              </Link>
            </aside>
          </div>

          <section className="mt-10 rounded-2xl border border-charcoal/10 bg-warm-white p-6 sm:p-8">
            <h2 className="font-display text-2xl tracking-wide text-brand-gold">
              The custom build process
            </h2>
            <div className="mt-6 space-y-5">
              {designSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex gap-4 rounded-xl border border-charcoal/10 bg-ivory/40 p-5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-charcoal text-xs font-semibold text-warm-white">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-charcoal">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-charcoal/10 bg-ivory/60 p-6">
              <Ruler className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-lg font-semibold text-charcoal">Requesting a custom size</h2>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                Provide approximate length, width, stance, ride style, rider context, hardware notes,
                and whether the deck is intended to be ridden or displayed. If unsure, describe the
                closest board you like and send a reference photo by email.
              </p>
            </section>

            <section className="rounded-2xl border border-charcoal/10 bg-warm-white p-6">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-lg font-semibold text-charcoal">Pricing and timing</h2>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                Custom pricing depends on board size, material availability, finish complexity,
                hardware assumptions, and development effort. The build is confirmed before work
                proceeds.
              </p>
            </section>
          </div>

          <section className="mt-10 rounded-2xl border border-charcoal/10 bg-ivory/60 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-charcoal">Request a custom deck</h2>
            <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
              Share the practical details first: intended use, board type, approximate size, timber or
              finish preference, and the visual direction. The more context you provide, the better the
              initial build response will be.
            </p>
            <CustomDesignRequestForm />
          </section>

          <div className="mt-12 border-t border-charcoal/10 pt-8">
            <p className="text-sm text-charcoal/60">
              Prefer to discuss directly?{" "}
              <Link href="/contact" className="text-charcoal underline underline-offset-2">
                Get in touch
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
