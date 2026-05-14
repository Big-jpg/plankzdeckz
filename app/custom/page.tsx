// app/custom/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { CustomDesignRequestForm } from "@/components/custom-design-request-form";
import { CheckCircle2, Ruler, ShieldCheck, SlidersHorizontal } from "lucide-react";

export const metadata: Metadata = {
  title: "Custom Design",
  description:
    "Request a custom parametric lighting object designed for your space, fitting, dimensions, and aesthetic requirements.",
};

const customOptions = [
  "Form and silhouette",
  "Diameter and height",
  "Pattern density and aperture",
  "Light diffusion and translucency",
  "Colour and material character",
  "Fitting adapter type",
  "Pendant, batten, or wall-mounted arrangements",
  "Multi-shade compositions",
];

const designSteps = [
  {
    title: "Share the space",
    text: "Describe the room, the existing fitting, approximate dimensions, ceiling height where relevant, and the atmosphere you want to create. Photos of the fitting and surrounding space are useful.",
  },
  {
    title: "Confirm feasibility",
    text: "The request is reviewed for fitting compatibility, scale, material suitability, heat safety, and whether the intended form is practical to produce and use.",
  },
  {
    title: "Set direction and price",
    text: "The design direction, expected production window, and price are confirmed before production proceeds. Larger or unusual works may require an individual quote.",
  },
  {
    title: "Produce the piece",
    text: "The shade and adapter are prepared in the studio. Typical custom turnaround is 5–10 business days after the design, fitting, and price are confirmed.",
  },
  {
    title: "Collect locally",
    text: "Custom work is currently collected by appointment. Shipping remains stubbed and unavailable unless explicitly introduced in a later phase.",
  },
];

export default function CustomPage() {
  return (
    <>
      <section className="bg-warm-black py-16 text-warm-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">
            Customisation
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Custom Design</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ivory/70">
            For spaces that need a particular proportion, fitting, colour, or light behaviour,
            Lumenform can adapt a parametric lighting object around your requirements.
          </p>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <section className="rounded-2xl border border-charcoal/10 bg-ivory/40 p-6 sm:p-8">
              <SlidersHorizontal className="h-6 w-6 text-charcoal/50" />
              <h2 className="mt-4 text-xl font-semibold text-charcoal">What can be customised</h2>
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

            <aside className="rounded-2xl border border-amber/30 bg-amber/5 p-6">
              <ShieldCheck className="h-6 w-6 text-amber" />
              <h2 className="mt-4 text-lg font-semibold text-charcoal">Safety remains fixed</h2>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                Customisation can change size, form, colour, and material direction. It does not
                remove the LED-only limitation or the requirement for a compatible, safe fitting.
              </p>
              <Link
                href="/safety"
                className="mt-4 inline-flex text-sm font-semibold text-charcoal underline underline-offset-4"
              >
                Read safety note
              </Link>
            </aside>
          </div>

          <section className="mt-10 rounded-2xl border border-charcoal/10 bg-warm-white p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-charcoal">The customisation process</h2>
            <div className="mt-6 space-y-5">
              {designSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex gap-4 rounded-xl border border-charcoal/10 bg-ivory/30 p-5"
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
            <section className="rounded-2xl border border-charcoal/10 bg-ivory/40 p-6">
              <Ruler className="h-6 w-6 text-charcoal/50" />
              <h2 className="mt-4 text-lg font-semibold text-charcoal">Requesting a custom size</h2>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                Provide the approximate diameter, height, available clearance, and whether the shade
                is intended for a pendant, batten holder, lamp, or other fixture. If you do not know
                the exact size, describe the existing shade or send a photo for scale.
              </p>
            </section>

            <section className="rounded-2xl border border-charcoal/10 bg-warm-white p-6">
              <CheckCircle2 className="h-6 w-6 text-charcoal/50" />
              <h2 className="mt-4 text-lg font-semibold text-charcoal">Pricing and timing</h2>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                Custom designs generally start from $60 AUD depending on size, geometry, material,
                and development effort. A $30 design fee applies and is credited toward the final
                purchase price if the piece proceeds.
              </p>
            </section>
          </div>

          <section className="mt-10 rounded-2xl border border-charcoal/10 bg-ivory/50 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-charcoal">Request a custom design</h2>
            <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
              Share the practical details first: fitting type, room context, approximate size,
              colour or material preference, and the visual direction. The more context you provide,
              the better the initial design response will be.
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
