// app/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Box, MapPin, Repeat, Ruler, Sparkles } from "lucide-react";
import { ScrollReel } from "@/components/scroll-reel";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "PLANKZ DECKZ",
  description:
    "Hand-crafted skateboard deckz made from recycled and reclaimed timber. One-of-a-kind boards, custom builds, merch, and local pickup.",
};

const processSteps = [
  {
    step: "01",
    title: "Pallet recovery",
    desc: "Hardwood pallets and raw offcuts are recovered, de-nailed, and assessed before they become landfill.",
    reel: {
      label: "Raw timber recovery",
      webmSrc: "/media/reels/pallet-recovery-raw-timber.webm",
      mp4Src: "/media/reels/pallet-recovery-raw-timber.mp4",
      posterSrc: "/media/reels/pallet-recovery-raw-timber-poster.jpg",
      slideFrom: "left" as const,
    },
  },
  {
    step: "02",
    title: "Grain selection",
    desc: "Each blank is sorted for colour, contrast, grain direction, history, and board-strength potential.",
    reel: {
      label: "Sorting the grain",
      webmSrc: "/media/reels/grain-selection-sorting.webm",
      mp4Src: "/media/reels/grain-selection-sorting.mp4",
      posterSrc: "/media/reels/grain-selection-sorting-poster.jpg",
      slideFrom: "right" as const,
    },
  },
  {
    step: "03",
    title: "Lamination",
    desc: "Selected timber is prepared, glued, and pressed into a stable blank ready for the final deck profile.",
    reel: {
      label: "Glue-up and press prep",
      webmSrc: "/media/reels/lamination-gluing.webm",
      mp4Src: "/media/reels/lamination-gluing.mp4",
      posterSrc: "/media/reels/lamination-gluing-poster.jpg",
      slideFrom: "left" as const,
    },
  },
  {
    step: "04",
    title: "Shaping and sanding",
    desc: "Cruiser, surfskate, and longboard profiles are cut, refined, sanded, and checked by hand.",
    reel: {
      label: "Hand-shaped deck profile",
      webmSrc: "/media/reels/shaping-sanding.webm",
      mp4Src: "/media/reels/shaping-sanding.mp4",
      posterSrc: "/media/reels/shaping-sanding-poster.jpg",
      slideFrom: "right" as const,
    },
  },
  {
    step: "05",
    title: "Finish and handover",
    desc: "Sanding, sealing, hardware fit-up, and ride-ready inspection lead into a local builder-to-rider handover.",
    reel: {
      label: "Finish and local handover",
      webmSrc: "/media/reels/finish-handover.webm",
      mp4Src: "/media/reels/finish-handover.mp4",
      posterSrc: "/media/reels/finish-handover-poster.jpg",
      slideFrom: "left" as const,
    },
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

          <ScrollReel
            webmSrc="/media/reels/coastal-board-workshop.webm"
            mp4Src="/media/reels/coastal-board-workshop.mp4"
            posterSrc="/media/reels/coastal-board-workshop-poster.jpg"
            alt="Placeholder loop for coastal board and workshop footage"
            eyebrow="Coastal workshop reel"
            label="Recovered timber, ride-ready craft"
            caption="Placeholder footage until the real Plankz Deckz coastal, board, and workshop cuts are available."
            slideFrom="right"
            priority
            className="min-h-[340px] bg-sand/8 sm:min-h-[420px]"
            mediaClassName="aspect-[4/3] min-h-[340px] sm:min-h-[420px]"
          />
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

          <div className="mt-14 space-y-8">
            {processSteps.map((item, index) => (
              <article
                key={item.step}
                className="grid grid-cols-1 items-center gap-6 rounded-[2rem] border border-charcoal/8 bg-warm-white/54 p-4 shadow-[0_18px_50px_rgba(19,35,33,0.055)] backdrop-blur-sm sm:p-5 lg:grid-cols-2 lg:gap-8"
              >
                <div className={cn(index % 2 === 1 && "lg:order-2")}>
                  <ScrollReel
                    webmSrc={item.reel.webmSrc}
                    mp4Src={item.reel.mp4Src}
                    posterSrc={item.reel.posterSrc}
                    alt={`Placeholder loop for ${item.title.toLowerCase()}`}
                    eyebrow={`Step ${item.step}`}
                    label={item.reel.label}
                    caption="Evidence loop placeholder for the final Plankz Deckz workshop footage."
                    slideFrom={item.reel.slideFrom}
                    className="rounded-[1.6rem] border-charcoal/10 shadow-[0_18px_45px_rgba(19,35,33,0.12)]"
                    mediaClassName="aspect-[16/10] min-h-[15rem] sm:min-h-[18rem]"
                  />
                </div>

                <div className="px-2 py-4 sm:px-5 lg:px-7">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-copper/20 bg-warm-white/72 text-sm font-bold text-copper shadow-sm">
                    {item.step}
                  </div>
                  <h3 className="mt-6 font-display text-3xl tracking-[0.08em] text-charcoal sm:text-4xl">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-charcoal/66">{item.desc}</p>
                  <div className="mt-6 h-px w-28 bg-[linear-gradient(90deg,rgba(168,116,69,0.55),rgba(126,207,192,0.28),transparent)]" />
                </div>
              </article>
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
