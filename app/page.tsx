// app/page.tsx
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  ArrowRight,
  Box,
  Lightbulb,
  MapPin,
  Repeat,
  Ruler,
  Sparkles,
} from "lucide-react";

import { getProducts } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Lumenform Studio",
  description:
    "Contemporary lighting objects designed and produced locally. Parametric forms for B22, E27, and Clipsal fittings.",
};

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-warm-black text-warm-white">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="h-full w-full bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[length:24px_24px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber">
              Lumenform Studio
            </p>

            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Contemporary lighting objects for the fittings you already own.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ivory/75 sm:text-xl">
              Parametrically developed shades and sculptural forms designed for
              domestic interiors, supplied with compatible B22, E27, and Clipsal
              fitting adapters.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg bg-amber px-6 py-3 text-sm font-semibold text-warm-black transition-colors hover:bg-amber/90"
              >
                Shop collection
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/custom"
                className="inline-flex items-center gap-2 rounded-lg border border-ivory/20 px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-ivory/10"
              >
                Request custom work
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap gap-6 text-sm text-ivory/55">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Designed and produced locally
              </div>

              <div className="flex items-center gap-2">
                <Box className="h-4 w-4" />
                Lightweight domestic shipping
              </div>

              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Customisable geometry and fittings
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collection */}
      <section className="bg-warm-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
              Studio Collection
            </h2>

            <p className="mt-4 text-base leading-relaxed text-charcoal/65">
              A rotating collection of contemporary lighting objects developed
              through computational geometry, material experimentation, and small-
              batch production.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {products.slice(0, 8).map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.handle}`}
                className="group overflow-hidden rounded-xl border border-charcoal/10 bg-ivory/30 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-charcoal/5"
              >
                <div className="relative aspect-square overflow-hidden bg-ivory/40">
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>

                <div className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-charcoal/40">
                    {product.category}
                  </p>

                  <h3 className="mt-1 text-sm font-medium text-charcoal">
                    {product.title}
                  </h3>

                  <div className="mt-3 flex items-end justify-between gap-3">
                    <p className="text-sm font-semibold text-charcoal">
                      ${product.price}{" "}
                      <span className="text-xs font-normal text-charcoal/45">
                        {product.currency}
                      </span>
                    </p>

                    <span className="text-xs font-medium text-charcoal/40 transition-colors group-hover:text-charcoal/70">
                      View piece
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-medium text-charcoal transition-colors hover:text-amber"
            >
              View full collection
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="border-t border-charcoal/5 bg-ivory py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
              The Process
            </h2>

            <p className="mt-4 text-base leading-relaxed text-charcoal/65">
              Each order moves through a small studio workflow from fitting
              selection through to local collection or dispatch.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                step: "01",
                title: "Choose a piece",
                desc: "Browse the studio collection or request a custom-developed form.",
              },
              {
                step: "02",
                title: "Confirm the fitting",
                desc: "Select B22, E27, Clipsal No. 530, or provide fitting details.",
              },
              {
                step: "03",
                title: "Review and prepare",
                desc: "The order is checked for fitting compatibility and production requirements.",
              },
              {
                step: "04",
                title: "Studio production",
                desc: "The piece is produced, finished, and prepared for dispatch or collection.",
              },
              {
                step: "05",
                title: "Delivery or pickup",
                desc: "Receive the finished object through local collection or domestic shipping.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-charcoal text-sm font-semibold text-warm-white">
                  {item.step}
                </div>

                <h3 className="mt-4 text-sm font-semibold text-charcoal">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-warm-black py-16 text-warm-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              A Different Production Model
            </h2>

            <p className="mt-4 text-base leading-relaxed text-ivory/70">
              Lumenform is built around localised, responsive production rather
              than mass inventory and offshore tooling.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Lightbulb,
                title: "Adaptable forms",
                desc: "Parametric geometry allows proportion, density, and light behaviour to evolve without redesigning from the beginning.",
              },
              {
                icon: Repeat,
                title: "Iterative production",
                desc: "Objects can be refined, adjusted, or replaced without expensive tooling or long manufacturing cycles.",
              },
              {
                icon: Ruler,
                title: "Lightweight construction",
                desc: "The resulting forms are lightweight, durable, and practical for domestic installation and shipping.",
              },
              {
                icon: MapPin,
                title: "Local fabrication",
                desc: "Designed and produced locally with shorter supply chains and direct oversight of the finished object.",
              },
              {
                icon: Box,
                title: "Efficient packaging",
                desc: "Minimal, paper-based packaging systems reduce unnecessary waste while protecting the object in transit.",
              },
              {
                icon: Sparkles,
                title: "Custom development",
                desc: "Specific fittings, dimensions, and spatial requirements can be incorporated into custom-developed works.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-ivory/10 bg-white/2 p-6"
              >
                <item.icon className="h-6 w-6 text-amber" />

                <h3 className="mt-4 text-base font-semibold">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-ivory/70">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-charcoal/5 bg-ivory py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
            Need something more specific?
          </h2>

          <p className="mt-4 text-base leading-relaxed text-charcoal/65">
            Custom work can be developed around existing fittings, room scale,
            spatial constraints, and particular aesthetic requirements.
          </p>

          <div className="mt-8">
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