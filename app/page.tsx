// app/page.tsx
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Lightbulb, Layers, MapPin, Repeat, Ruler } from "lucide-react";
import { getProducts } from "@/lib/catalogue";

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-warm-black text-warm-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Custom lampshades designed for the lights you already own.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-ivory/80 sm:text-xl">
              Parametric lighting objects with included B22, E27, and Clipsal-compatible adapters.
            </p>
            <p className="mt-3 text-base font-medium tracking-wide text-amber">
              Lightweight. Local. Customisable.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg bg-amber px-6 py-3 text-sm font-semibold text-warm-black transition-colors hover:bg-amber/90"
              >
                Shop lampshades
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/fitting-guide"
                className="inline-flex items-center gap-2 rounded-lg border border-ivory/30 px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-ivory/10"
              >
                Choose your fitting
              </Link>
              <Link
                href="/custom"
                className="inline-flex items-center gap-2 rounded-lg border border-ivory/30 px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-ivory/10"
              >
                Request a custom design
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product Gallery */}
      <section className="bg-warm-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
              Designed Lighting Objects
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-charcoal/60">
              Each shade is parametrically generated and 3D printed to order. Browse the collection
              or request a custom form.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {products.slice(0, 8).map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.handle}`}
                className="group relative overflow-hidden rounded-xl bg-ivory/50 p-4 transition-all hover:shadow-lg hover:shadow-charcoal/5"
              >
                <div className="relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <div className="mt-3">
                  <h3 className="text-sm font-medium text-charcoal">{product.title}</h3>
                  <p className="mt-1 text-sm text-charcoal/50">
                    ${product.price} {product.currency}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-medium text-charcoal transition-colors hover:text-amber"
            >
              View all products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="border-t border-charcoal/5 bg-ivory py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-charcoal/60">
              From design selection to local pickup in five simple steps.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                step: "01",
                title: "Choose a design",
                desc: "Browse the collection or request a custom parametric form.",
              },
              {
                step: "02",
                title: "Select your adapter",
                desc: "B22, E27, Clipsal No. 530, or provide your fitting details.",
              },
              {
                step: "03",
                title: "Confirm LED bulb",
                desc: "All shades are designed for LED bulbs only. Confirm your bulb type.",
              },
              {
                step: "04",
                title: "Purchase",
                desc: "Secure checkout. Adapter included in the price at no extra cost.",
              },
              {
                step: "05",
                title: "Local pickup",
                desc: "Collect your shade locally. Shipping coming soon.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-charcoal text-sm font-semibold text-warm-white">
                  {item.step}
                </div>
                <h3 className="mt-4 text-sm font-semibold text-charcoal">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why 3D Printed Section */}
      <section className="bg-warm-black py-16 text-warm-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Why 3D Printed Shades?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ivory/70">
              Parametric manufacturing enables forms impossible with traditional materials — at a
              fraction of the cost and lead time.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Layers,
                title: "Custom geometry",
                desc: "Every shade is generated from parametric models. Modify curves, density, aperture, and form to suit your space.",
              },
              {
                icon: Lightbulb,
                title: "Low-cost experimentation",
                desc: "Try a new look without committing to expensive glass, metal, or fabric. Replace or iterate affordably.",
              },
              {
                icon: Repeat,
                title: "Rapid iteration",
                desc: "Design to finished object in days, not weeks. Adjust and reprint without tooling costs.",
              },
              {
                icon: Ruler,
                title: "Lightweight replacement",
                desc: "Printed shades weigh a fraction of traditional materials. Easy to install, easy to swap.",
              },
              {
                icon: MapPin,
                title: "Local production",
                desc: "Made locally, collected locally. No international shipping delays or carbon-heavy logistics.",
              },
              {
                icon: Layers,
                title: "Sustainable materials",
                desc: "PLA is plant-derived and biodegradable. PETG is fully recyclable. Minimal waste in production.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-ivory/10 p-6">
                <item.icon className="h-6 w-6 text-amber" />
                <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ivory/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-charcoal/5 bg-ivory py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
            Need something unique?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-charcoal/60">
            We design custom parametric shades for specific spaces, fittings, and aesthetic
            requirements. Share your vision and we will generate a form to match.
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
