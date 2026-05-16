// app/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Box, MapPin, Repeat, Ruler, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "PLANKZ DECKZ",
  description:
    "Hand-crafted skateboard deckz made from recycled and reclaimed timber. One-of-a-kind boards, custom builds, merch, and local pickup.",
};

const processSteps = [
  {
    step: "01",
    title: "Reclaim timber",
    desc: "Hardwood pallets and offcuts are recovered before they become landfill.",
  },
  {
    step: "02",
    title: "Read the grain",
    desc: "Each blank is selected for colour, contrast, history, and strength.",
  },
  {
    step: "03",
    title: "Shape the deck",
    desc: "Cruiser, surfskate, and longboard profiles are cut, laminated, and refined by hand.",
  },
  {
    step: "04",
    title: "Finish for flow",
    desc: "Sanding, sealing, resin detail, hardware fit-up, and ride-ready inspection complete the build.",
  },
  {
    step: "05",
    title: "Local pickup",
    desc: "Completed boards are handed over locally with direct builder-to-rider context.",
  },
];

const values = [
  {
    icon: Repeat,
    title: "Recycled and reclaimed",
    desc: "Repurposed landfill materials become premium one-off deckz rather than disposable waste.",
  },
  {
    icon: Sparkles,
    title: "One of a kind",
    desc: "No two timber runs, resin details, or grain patterns are identical.",
  },
  {
    icon: Ruler,
    title: "Built by hand",
    desc: "Surf-inspired shapes, longboard proportions, and custom requests are handled directly.",
  },
  {
    icon: MapPin,
    title: "Local pickup model",
    desc: "High-value deckz are built for local collection so handover remains personal and controlled.",
  },
  {
    icon: Box,
    title: "Boards plus merch",
    desc: "Deckz anchor the brand, with tees, flannos, stickers, hats, beanies, and wares to follow.",
  },
  {
    icon: ArrowRight,
    title: "Custom designer ready",
    desc: "The flagship configurator will let riders specify shape, dimensions, and resin inlay direction.",
  },
];

const featuredDeckz = [
  "Reclaimed hardwood cruisers",
  "Surfskate-inspired outlines",
  "One-off longboard builds",
  "OG Plankz merch drops",
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-warm-black text-warm-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(126,207,192,0.24),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(245,160,160,0.22),transparent_28%),linear-gradient(135deg,rgba(19,35,33,0.96),rgba(32,58,73,0.94))]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(90deg,rgba(245,190,51,0.28)_0_12%,transparent_12%_18%,rgba(126,207,192,0.22)_18%_32%,transparent_32%_42%,rgba(245,160,160,0.18)_42%_54%,transparent_54%_100%)] opacity-70" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal">
              PLANKZ DECKZ · Australia
            </p>

            <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[0.95] tracking-[0.08em] text-amber sm:text-7xl lg:text-8xl">
              Hand-Crafted Skateboard Deckz
            </h1>

            <p className="mt-7 max-w-2xl text-xl font-semibold leading-relaxed text-ivory sm:text-2xl">
              Recycled. Reclaimed. One of a Kind.
            </p>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ivory/75 sm:text-lg">
              Custom-built longboard, cruiser, and surfskate deckz shaped from repurposed timber
              with a coastal, handmade, Australian beach-lifestyle identity.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-amber px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-warm-black transition-colors hover:bg-amber/90"
              >
                Shop deckz
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/custom"
                className="inline-flex items-center gap-2 rounded-full border border-ivory/25 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-ivory/10"
              >
                Custom designer
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap gap-6 text-sm text-ivory/65">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-teal" />
                Local pickup
              </div>
              <div className="flex items-center gap-2">
                <Repeat className="h-4 w-4 text-teal" />
                Reclaimed timber
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal" />
                One-off builds
              </div>
            </div>
          </div>

          <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] border border-ivory/15 bg-sand/10 shadow-2xl shadow-charcoal/40">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#7ecfc0_0%,#9fded5_36%,#f4efe6_37%,#ead8b8_54%,#a87445_55%,#7a5335_100%)]" />
            <div className="absolute inset-x-0 top-[34%] h-16 bg-[radial-gradient(ellipse_at_center,rgba(255,248,237,0.95)_0_18%,transparent_19%),linear-gradient(90deg,rgba(19,35,33,0.12)_0_4%,transparent_4%_9%)] bg-[length:180px_64px,48px_100%] opacity-80" />
            <div className="absolute bottom-12 left-1/2 h-16 w-[78%] -translate-x-1/2 rotate-[-6deg] rounded-full bg-[linear-gradient(90deg,#7a5335,#d9c3a2,#4b2d1d,#e7c994,#203a49)] shadow-xl shadow-charcoal/35" />
            <div className="absolute bottom-20 left-[20%] h-3 w-3 rounded-full bg-teal shadow-[270px_0_0_#7ecfc0]" />
            <div className="absolute bottom-6 left-8 right-8 rounded-2xl border border-warm-white/35 bg-warm-black/70 p-5 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-coral">
                Coastal imagery placeholder
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ivory/80">
                Replace with Plankz board photography on sand, limestone, timber, or sunset coast.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-warm-white/88 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal">The drop</p>
            <h2 className="mt-3 font-display text-4xl tracking-[0.08em] text-amber sm:text-5xl">
              Reclaimed timber ride craft
            </h2>
            <p className="mt-4 text-base leading-relaxed text-charcoal/68">
              Phase 0 keeps the commerce infrastructure intact while replacing the public shell with
              a Plankz-native coastal, recycled, handmade identity.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredDeckz.map((title, index) => (
              <div
                key={title}
                className="group overflow-hidden rounded-3xl border border-charcoal/10 bg-ivory shadow-sm shadow-charcoal/5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-charcoal/10"
              >
                <div className="relative aspect-[4/3] bg-[linear-gradient(135deg,#d8d4c8,#f4efe6)]">
                  <div className="absolute inset-x-8 top-1/2 h-10 -translate-y-1/2 rotate-[-8deg] rounded-full bg-[linear-gradient(90deg,#7a5335,#d9c3a2,#203a49,#a87445)] shadow-md" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(126,207,192,0.35),transparent_28%),radial-gradient(circle_at_82%_78%,rgba(245,160,160,0.26),transparent_24%)]" />
                  <span className="absolute left-4 top-4 rounded-full bg-warm-black/80 px-3 py-1 text-xs font-bold text-ivory">
                    0{index + 1}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-2xl tracking-[0.08em] text-charcoal">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
                    Placeholder shell content pending Phase 2 product catalogue restructuring.
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-charcoal transition-colors hover:text-amber"
            >
              View shop shell
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-charcoal/5 bg-ivory/95 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal">Build flow</p>
            <h2 className="mt-3 font-display text-4xl tracking-[0.08em] text-amber sm:text-5xl">
              From landfill-bound timber to one-off deckz
            </h2>
            <p className="mt-4 text-base leading-relaxed text-charcoal/68">
              We let the wood do the talking, then make it better: select, shape, finish, and hand
              over locally.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {processSteps.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-charcoal text-sm font-bold text-teal ring-4 ring-teal/20">
                  {item.step}
                </div>
                <h3 className="mt-5 text-base font-bold text-charcoal">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/62">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-warm-black py-16 text-warm-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-coral">Brand position</p>
            <h2 className="mt-3 font-display text-4xl tracking-[0.08em] text-amber sm:text-5xl">
              Coastal, recycled, handmade
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ivory/72">
              PLANKZ DECKZ is not a mass-manufactured board catalogue. It is a local lifestyle brand
              built around craftsmanship, recovered materials, and individual ride objects.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((item) => (
              <div key={item.title} className="rounded-3xl border border-ivory/10 bg-white/[0.03] p-6">
                <item.icon className="h-6 w-6 text-teal" />
                <h3 className="mt-5 text-base font-bold text-ivory">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ivory/68">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-charcoal/5 bg-warm-white/90 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal">Custom work</p>
          <h2 className="mt-3 font-display text-4xl tracking-[0.08em] text-amber sm:text-5xl">
            Want a deck shaped around your ride?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-charcoal/68">
            The current custom route remains connected to the existing infrastructure. Later phases
            will replace the old product-domain form with the Plankz custom board designer.
          </p>
          <div className="mt-8">
            <Link
              href="/custom"
              className="inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-warm-white transition-colors hover:bg-charcoal/90"
            >
              Open custom designer shell
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
