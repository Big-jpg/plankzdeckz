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
    title: "Built with rider context",
    desc: "Shape, timber, finish, and handover stay connected to how the board will actually be used.",
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
      <section className="coastal-wash plankz-watermark relative overflow-hidden text-warm-white">
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,rgba(19,35,33,0.34))]" />
        <div className="thin-wood-trim absolute inset-x-0 bottom-0 h-1 opacity-70" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-[4.5rem] sm:px-6 sm:py-28 lg:grid-cols-[1fr_0.88fr] lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-teal/90">
              PLANKZ DECKZ · Australia
            </p>

            <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[0.95] tracking-[0.08em] text-warm-white sm:text-7xl lg:text-8xl">
              Hand-Crafted Skateboard Deckz
            </h1>

            <p className="mt-7 max-w-2xl text-xl font-semibold leading-relaxed text-amber/92 sm:text-2xl">
              Recycled. Reclaimed. One of a Kind.
            </p>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ivory/75 sm:text-lg">
              Custom-built longboard, cruiser, and surfskate deckz shaped from repurposed timber with a
              coastal, handmade, Australian beach-lifestyle identity.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-amber px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-warm-black transition-colors hover:bg-amber/90"
              >
                Shop deckz and merch
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/custom"
                className="inline-flex items-center gap-2 rounded-full border border-ivory/28 bg-ivory/5 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-ivory/12"
              >
                Commission a build
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 text-sm text-ivory/64">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-teal/90" />
                Local pickup
              </div>
              <div className="flex items-center gap-2">
                <Repeat className="h-4 w-4 text-teal/90" />
                Reclaimed timber
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal/90" />
                One-off builds
              </div>
            </div>
          </div>

          <div className="relative min-h-[340px] overflow-hidden rounded-[2rem] border border-ivory/12 bg-sand/8 shadow-[0_28px_70px_rgba(0,0,0,0.22)] sm:min-h-[420px]">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#7ecfc0_0%,#9fded5_34%,#f4efe6_35%,#ead8b8_54%,#a87445_55%,#7a5335_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_26%_20%,rgba(255,248,237,0.35),transparent_28%),linear-gradient(180deg,transparent,rgba(19,35,33,0.18))]" />
            <div className="absolute inset-x-0 top-[34%] h-14 bg-[radial-gradient(ellipse_at_center,rgba(255,248,237,0.86)_0_18%,transparent_19%)] bg-[length:190px_58px] opacity-70" />
            <div className="absolute bottom-16 left-1/2 h-16 w-[78%] -translate-x-1/2 rotate-[-6deg] rounded-full bg-[linear-gradient(90deg,#7a5335,#d9c3a2,#4b2d1d,#e7c994,#203a49)] shadow-xl shadow-charcoal/30" />
            <div className="absolute bottom-24 left-[20%] h-3 w-3 rounded-full bg-teal/90 shadow-[270px_0_0_#7ecfc0]" />
            <div className="absolute bottom-6 left-6 right-6 rounded-3xl border border-warm-white/20 bg-warm-black/58 p-5 backdrop-blur-sm sm:left-8 sm:right-8">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-coral/85">
                Coastal imagery placeholder
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ivory/76">
                Replace with Plankz board photography on sand, limestone, timber, or sunset coast.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-warm-white/86 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-teal">The drop</p>
            <h2 className="mt-3 font-display text-4xl tracking-[0.08em] text-charcoal sm:text-5xl">
              Reclaimed timber ride craft
            </h2>
            <p className="mt-4 text-base leading-relaxed text-charcoal/66">
              The current catalogue separates one-off recycled hardwood boards from repeatable merch,
              with sold boards retained as visible craft evidence in the gallery.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredDeckz.map((title, index) => (
              <div
                key={title}
                className="group overflow-hidden rounded-[1.75rem] border border-charcoal/8 bg-ivory/70 shadow-[0_16px_45px_rgba(19,35,33,0.045)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(19,35,33,0.08)]"
              >
                <div className="woodgrain-soft relative aspect-[4/3]">
                  <div className="absolute inset-x-8 top-1/2 h-10 -translate-y-1/2 rotate-[-8deg] rounded-full bg-[linear-gradient(90deg,#7a5335,#d9c3a2,#203a49,#a87445)] shadow-md" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(126,207,192,0.18),transparent_28%),radial-gradient(circle_at_82%_78%,rgba(245,160,160,0.14),transparent_24%)]" />
                  <span className="absolute left-4 top-4 rounded-full bg-warm-black/70 px-3 py-1 text-xs font-bold text-ivory">
                    0{index + 1}
                  </span>
                </div>
                <div className="p-5 sm:p-6">
                  <h3 className="font-display text-2xl tracking-[0.08em] text-charcoal">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/58">
                    Browse the live catalogue for one-off boards, merch drops, and sold-board references.
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-charcoal transition-colors hover:text-copper"
            >
              View shop
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="woodgrain-soft border-y border-charcoal/5 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-teal">Build flow</p>
            <h2 className="mt-3 font-display text-4xl tracking-[0.08em] text-charcoal sm:text-5xl">
              From landfill-bound timber to one-off deckz
            </h2>
            <p className="mt-4 text-base leading-relaxed text-charcoal/66">
              We let the wood do the talking, then make it better: select, shape, finish, and hand over
              locally.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {processSteps.map((item) => (
              <div key={item.step} className="text-center sm:text-left lg:text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-copper/20 bg-warm-white/65 text-sm font-bold text-copper shadow-sm sm:mx-0 lg:mx-auto">
                  {item.step}
                </div>
                <h3 className="mt-5 text-base font-bold text-charcoal">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-warm-black py-20 text-warm-white sm:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(126,207,192,0.12),transparent_24rem),radial-gradient(circle_at_92%_20%,rgba(245,160,160,0.07),transparent_24rem)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-coral/88">Brand position</p>
            <h2 className="mt-3 font-display text-4xl tracking-[0.08em] text-warm-white sm:text-5xl">
              Coastal, recycled, handmade
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ivory/72">
              PLANKZ DECKZ is not a mass-manufactured board catalogue. It is a local lifestyle brand built
              around craftsmanship, recovered materials, and individual ride objects.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((item) => (
              <div key={item.title} className="border-l border-ivory/12 pl-5">
                <item.icon className="h-6 w-6 text-teal/90" />
                <h3 className="mt-5 text-base font-bold text-ivory">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ivory/66">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-warm-white/90 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-teal">Custom work</p>
          <h2 className="mt-3 font-display text-4xl tracking-[0.08em] text-charcoal sm:text-5xl">
            Want a deck shaped around your ride?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-charcoal/66">
            Commissioned builds remain supported by the existing custom infrastructure while the public
            browsing experience stays simple, curated, and product-led.
          </p>
          <div className="mt-8">
            <Link
              href="/custom"
              className="inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-warm-white transition-colors hover:bg-charcoal/90"
            >
              Start a build conversation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
