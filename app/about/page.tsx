// app/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "About Lumenform Studio; the maker, the process, and the philosophy.",
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-warm-black py-16 text-warm-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            About Lumenform Studio
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ivory/70">
            Contemporary lighting objects, designed and made locally.
          </p>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-charcoal max-w-none space-y-6 text-charcoal/80">
            <p className="text-lg leading-relaxed">
              Lumenform Studio is a small-batch lighting design practice focused on sculptural
              lampshades and contemporary lighting objects. Each piece is developed and produced
              locally using digitally driven fabrication methods that allow for precision,
              flexibility, and highly individual forms.
            </p>

            <h2 className="text-xl font-semibold text-charcoal">The Maker</h2>
            <p className="leading-relaxed">
              Founded by a designer-maker with a background in computational design, systems
              engineering, and industrial fabrication, Lumenform exists at the intersection of
              mathematics, material, and light. The studio operates from a dedicated workshop in
              Western Australia where every object is produced, assembled, and refined in-house.
            </p>

            <h2 className="text-xl font-semibold text-charcoal">The Process</h2>
            <p className="leading-relaxed">
              Each piece begins as a parametric model — a living design system governed by geometry,
              proportion, curvature, density, and light diffusion. Rather than creating a single
              static form, these systems allow subtle variations and adaptations to emerge naturally
              while preserving the intent of the original design.
            </p>

            <p className="leading-relaxed">
              Materials are selected for both optical behaviour and tactile quality, producing
              surfaces that interact with light in ways traditional shade construction often cannot.
              The resulting forms possess a softness, translucency, and geometric complexity that
              would be difficult or prohibitively expensive to manufacture through conventional
              methods.
            </p>

            <h2 className="text-xl font-semibold text-charcoal">The Philosophy</h2>
            <p className="leading-relaxed">
              Lumenform was founded on the belief that contemporary manufacturing should be local,
              adaptable, and transparent. Traditional homewares production often relies on offshore
              tooling, large inventory commitments, and long supply chains. Lumenform instead
              embraces responsive, small-batch production where objects can evolve over time rather
              than remain fixed.
            </p>

            <p className="leading-relaxed">
              This approach allows designs to be refined, customised, and replaced without the waste
              and inertia associated with mass production. The goal is not to imitate glass, fabric,
              or metal, but to explore an emerging design language shaped by computation, light, and
              modern fabrication techniques.
            </p>

            <h2 className="text-xl font-semibold text-charcoal">Safety and Compatibility</h2>

            <p className="leading-relaxed">
              All Lumenform shades are designed exclusively for LED bulbs. Every piece is tested for
              compatibility with low-heat lighting applications and ships with the required fitting
              adapter included in the purchase price, supporting B22, E27, and Clipsal No. 530
              fittings.
            </p>
          </div>

          <div className="mt-12 border-t border-charcoal/10 pt-8">
            <Link
              href="/custom"
              className="inline-flex items-center gap-2 rounded-lg bg-charcoal px-6 py-3 text-sm font-semibold text-warm-white transition-colors hover:bg-charcoal/90"
            >
              Request a custom design
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
