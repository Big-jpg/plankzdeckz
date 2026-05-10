// app/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "About Lumenform Studio — the maker, the process, and the philosophy.",
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
            Parametric lighting objects, locally made.
          </p>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-charcoal max-w-none space-y-6 text-charcoal/80">
            <p className="text-lg leading-relaxed">
              Lumenform Studio is a small-batch lighting design practice specialising in 3D printed
              lampshades and parametric lighting objects. Every product is designed, generated, and
              manufactured locally using FDM additive manufacturing.
            </p>

            <h2 className="text-xl font-semibold text-charcoal">The Maker</h2>
            <p className="leading-relaxed">
              Founded by a designer-maker with a background in computational geometry and industrial
              design, Lumenform exists at the intersection of digital fabrication and domestic
              lighting. The studio operates from a dedicated workshop equipped with multiple FDM
              printers optimised for large-format, thin-wall printing.
            </p>

            <h2 className="text-xl font-semibold text-charcoal">The Process</h2>
            <p className="leading-relaxed">
              Each shade begins as a parametric model — a set of mathematical rules that define
              form, curvature, density, and aperture. These parameters can be adjusted to create
              unique variations without starting from scratch. The model is then sliced for FDM
              printing and produced in PLA or PETG, depending on the desired optical properties.
            </p>
            <p className="leading-relaxed">
              Print times range from 8 to 36 hours depending on complexity and scale.
              Post-processing is minimal by design — the layer lines and material texture are
              considered part of the aesthetic, not defects to be hidden.
            </p>

            <h2 className="text-xl font-semibold text-charcoal">The Philosophy</h2>
            <p className="leading-relaxed">
              Traditional lampshades rely on expensive tooling, imported materials, and long supply
              chains. Lumenform replaces this with local, on-demand production. If a design does not
              work in a space, it can be modified and reprinted in days rather than weeks. If a
              shade is damaged, replacement is affordable and fast.
            </p>
            <p className="leading-relaxed">
              The goal is not to replicate what already exists in fabric, glass, or metal — it is to
              explore forms that are only possible through additive manufacturing. Geometries that
              would be prohibitively expensive to mould or cast become trivial to print.
            </p>

            <h2 className="text-xl font-semibold text-charcoal">Safety and Compatibility</h2>
            <p className="leading-relaxed">
              All Lumenform shades are designed exclusively for LED bulbs. The materials used (PLA
              and PETG) have lower heat tolerance than glass or metal, making them unsuitable for
              incandescent or halogen bulbs. Every shade ships with a compatible fitting adapter —
              B22, E27, or Clipsal No. 530 — included in the purchase price.
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
