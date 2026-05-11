// app/custom/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Custom Design",
  description:
    "Request a custom parametric lighting object designed for your space, fitting, and aesthetic requirements.",
};

export default function CustomPage() {
  return (
    <>
      <section className="bg-warm-black py-16 text-warm-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Custom Design
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ivory/70">
            For spaces that call for a particular proportion, fitting, or
            atmosphere, Lumenform can develop a lighting object around your
            requirements.
          </p>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">
            <div className="prose prose-charcoal max-w-none text-charcoal/80">
              <p className="text-lg leading-relaxed">
                Custom work begins with the space itself: the existing fitting,
                the ceiling height, the surrounding materials, the desired light
                quality, and the visual character you want the object to carry.
                From there, a parametric design system can be adjusted to produce
                a piece that feels intentional rather than improvised.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-charcoal">
                What can be customised
              </h2>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  "Form and silhouette",
                  "Diameter and height",
                  "Pattern density and aperture",
                  "Light diffusion and translucency",
                  "Colour and material character",
                  "Fitting adapter type",
                  "Pendant, batten, or wall-mounted arrangements",
                  "Multi-shade compositions",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-lg border border-charcoal/10 bg-ivory/30 px-4 py-3 text-sm text-charcoal/70"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-charcoal">
                The Design Process
              </h2>

              <div className="mt-5 space-y-5 text-sm leading-relaxed text-charcoal/70">
                <p>
                  <strong className="text-charcoal">
                    1. Share the space.
                  </strong>{" "}
                  Describe the room, the existing fitting, the approximate scale,
                  and the kind of atmosphere you want to create. Photos are useful,
                  particularly of the ceiling mount, pendant, or surrounding
                  materials.
                </p>

                <p>
                  <strong className="text-charcoal">
                    2. Establish the design direction.
                  </strong>{" "}
                  The request is reviewed for fitting compatibility, scale,
                  material suitability, and whether the intended form is practical
                  for production and daily use.
                </p>

                <p>
                  <strong className="text-charcoal">
                    3. Develop the form.
                  </strong>{" "}
                  Using parametric modelling, the design is adjusted through
                  geometry, proportion, density, and light behaviour. Where useful,
                  preview images or rendered studies can be provided before the
                  piece is produced.
                </p>

                <p>
                  <strong className="text-charcoal">
                    4. Confirm and produce.
                  </strong>{" "}
                  Once the design, fitting, and price are confirmed, the piece is
                  prepared in the studio. Typical turnaround is 5-10 business days
                  depending on complexity.
                </p>

                <p>
                  <strong className="text-charcoal">
                    5. Collect locally.
                  </strong>{" "}
                  Custom orders are currently collected by appointment, with
                  fitting guidance provided where required.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-charcoal/10 bg-ivory/50 p-6">
              <h2 className="text-xl font-semibold text-charcoal">Pricing</h2>

              <p className="mt-4 text-sm leading-relaxed text-charcoal/70">
                Custom designs generally start from $60 AUD depending on size,
                geometry, material selection, and development effort. A $30 design
                fee applies and is credited toward the final purchase price if the
                piece proceeds.
              </p>

              <p className="mt-4 text-sm leading-relaxed text-charcoal/70">
                The required fitting adapter is included in the final price.
                Larger, multi-shade, or highly specific works may be quoted
                individually before production begins.
              </p>
            </div>

            <div className="rounded-xl border border-charcoal/10 bg-ivory/50 p-6">
              <h3 className="text-lg font-semibold text-charcoal">
                Request a custom design
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
                Share the practical details first: the fitting, the space, the
                approximate size, and the visual direction. The more context you
                provide, the better the initial design response will be.
              </p>

              <form className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="mt-1 w-full rounded-lg border border-charcoal/20 bg-warm-white px-3 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="mt-1 w-full rounded-lg border border-charcoal/20 bg-warm-white px-3 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal">
                    Describe the space and design direction
                  </label>
                  <textarea
                    placeholder="Tell us about the room, the fitting, the approximate dimensions, and the kind of light or form you are looking for..."
                    rows={5}
                    className="mt-1 w-full rounded-lg border border-charcoal/20 bg-warm-white px-3 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal">
                    Fitting type, if known
                  </label>
                  <select className="mt-1 w-full rounded-lg border border-charcoal/20 bg-warm-white px-3 py-2.5 text-sm text-charcoal focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal">
                    <option value="">Select...</option>
                    <option value="B22">B22 bayonet</option>
                    <option value="E27">E27 Edison screw</option>
                    <option value="clipsal-530">Clipsal No. 530</option>
                    <option value="other">Other / not sure</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="w-full rounded-lg bg-charcoal px-6 py-3 text-sm font-semibold text-warm-white transition-colors hover:bg-charcoal/90"
                >
                  Submit request
                </button>

                <p className="text-center text-xs leading-relaxed text-charcoal/40">
                  Form is not yet functional. Contact Lumenform directly in the
                  meantime.
                </p>
              </form>
            </div>
          </div>

          <div className="mt-12 border-t border-charcoal/10 pt-8">
            <p className="text-sm text-charcoal/60">
              Prefer to discuss directly?{" "}
              <Link
                href="/contact"
                className="text-charcoal underline underline-offset-2"
              >
                Get in touch
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}