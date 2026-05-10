// app/custom/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Custom Design",
  description:
    "Request a custom parametric lampshade designed for your specific space and fitting.",
};

export default function CustomPage() {
  return (
    <>
      <section className="bg-warm-black py-16 text-warm-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Custom Design</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ivory/70">
            Need a shade that does not exist in the collection? We design parametric lighting
            objects for specific spaces, fittings, and aesthetic requirements.
          </p>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-charcoal">What we can customise</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  "Form and silhouette",
                  "Diameter and height",
                  "Pattern density and aperture",
                  "Material and translucency",
                  "Colour",
                  "Fitting adapter type",
                  "Multi-shade configurations",
                  "Wall-mount and pendant variants",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-lg border border-charcoal/10 px-4 py-3 text-sm text-charcoal/70"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-charcoal">The process</h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-charcoal/70">
                <p>
                  <strong className="text-charcoal">1. Share your requirements.</strong> Describe
                  the space, the fitting, the aesthetic you are looking for. Photos of the existing
                  fixture are helpful.
                </p>
                <p>
                  <strong className="text-charcoal">2. We generate options.</strong> Using
                  parametric modelling, we produce 2–3 design variations for your review. Rendered
                  previews are provided before printing.
                </p>
                <p>
                  <strong className="text-charcoal">3. Confirm and produce.</strong> Once you
                  approve a design, we print and finish the shade. Typical turnaround is 5–10
                  business days depending on complexity.
                </p>
                <p>
                  <strong className="text-charcoal">4. Collect locally.</strong> All custom orders
                  are available for local pickup.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-charcoal">Pricing</h2>
              <p className="mt-4 text-sm leading-relaxed text-charcoal/70">
                Custom designs start from $120 AUD depending on size and complexity. A design fee of
                $30 applies and is credited toward the final purchase price. The fitting adapter is
                always included.
              </p>
            </div>

            {/* Placeholder form */}
            <div className="rounded-xl border border-charcoal/10 bg-ivory/50 p-6">
              <h3 className="text-lg font-semibold text-charcoal">Request a custom design</h3>
              <p className="mt-2 text-sm text-charcoal/60">
                Fill in the details below and we will get back to you within 2 business days.
              </p>
              <form className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal">Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="mt-1 w-full rounded-lg border border-charcoal/20 bg-warm-white px-3 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="mt-1 w-full rounded-lg border border-charcoal/20 bg-warm-white px-3 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal">
                    Describe your requirements
                  </label>
                  <textarea
                    placeholder="Tell us about the space, the fitting, the style you're after..."
                    rows={5}
                    className="mt-1 w-full rounded-lg border border-charcoal/20 bg-warm-white px-3 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal">
                    Fitting type (if known)
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
                <p className="text-center text-xs text-charcoal/40">
                  Form is not yet functional. Contact us directly in the meantime.
                </p>
              </form>
            </div>
          </div>

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
