// app/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, MapPin, Repeat, Ruler, Sparkles } from "lucide-react";
import { PaletteSection } from "@/components/palette-section";
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
    title: "pallet recovery",
    reel: {
      mp4Src: "/media/reels/02-pallet-recovery.mp4",
      posterSrc: "/media/reels/02-pallet-recovery-poster.jpg",
      slideFrom: "left" as const,
    },
  },
  {
    step: "02",
    title: "grain selection",
    reel: {
      mp4Src: "/media/reels/03-grain-selection.mp4",
      posterSrc: "/media/reels/03-grain-selection-poster.jpg",
      slideFrom: "right" as const,
    },
  },
  {
    step: "03",
    title: "lamination",
    reel: {
      mp4Src: "/media/reels/04-lamination.mp4",
      posterSrc: "/media/reels/04-lamination-poster.jpg",
      slideFrom: "left" as const,
    },
  },
  {
    step: "04",
    title: "shaping and sanding",
    reel: {
      mp4Src: "/media/reels/05-shaping.mp4",
      posterSrc: "/media/reels/05-shaping-poster.jpg",
      slideFrom: "right" as const,
    },
  },
  {
    step: "05",
    title: "finish and handover",
    reel: {
      mp4Src: "/media/reels/06-finish-coastal.mp4",
      posterSrc: "/media/reels/06-finish-coastal-poster.jpg",
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
    icon: ArrowRight,
    title: "Built with rider context",
    desc: "Shape, timber, finish, and handover stay connected to how the board will actually be used.",
  },
];

export default function HomePage() {
  return (
    <>
      <PaletteSection
        palette="dark"
        className="coastal-wash plankz-watermark relative overflow-hidden text-warm-white"
      >
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,rgba(19,35,33,0.42))]" />
        <div className="thin-wood-trim absolute inset-x-0 bottom-0 h-1 opacity-70" />

        <div className="relative mx-auto grid min-h-[calc(100svh-5rem)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:px-8 lg:py-28">
          <div className="z-10 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-teal/90">
              PLANKZ DECKZ · Australia
            </p>

            <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[0.95] tracking-[0.08em] text-warm-white sm:text-7xl lg:text-8xl">
              Recycled. Reclaimed. One of a Kind.
            </h1>

            <p className="mt-7 max-w-xl text-base leading-relaxed text-ivory/78 sm:text-lg">
              Handmade skate deckz from reclaimed Australian hardwood.
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
          </div>

          <div className="relative z-0 w-full min-w-0 justify-self-center lg:justify-self-end">
            <ScrollReel
              mp4Src="/media/reels/01-hero-coastal.mp4"
              posterSrc="/media/reels/01-hero-coastal-poster.jpg"
              alt="Coastal Plankz Deckz board and workshop reel"
              slideFrom="right"
              priority
              className="mx-auto w-full max-w-[42rem] rounded-[2rem] border-ivory/12 bg-sand/8 shadow-[0_32px_90px_rgba(0,0,0,0.32)] lg:mx-0 lg:max-w-none"
              mediaClassName="aspect-[4/3] min-h-[18rem] sm:min-h-[28rem] lg:min-h-[34rem]"
            />
          </div>
        </div>
      </PaletteSection>

      <PaletteSection
        palette="sand"
        className="relative overflow-hidden py-24 text-charcoal sm:py-32 lg:py-40"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(126,207,192,0.16),transparent_26rem),radial-gradient(circle_at_86%_16%,rgba(168,116,69,0.1),transparent_28rem)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-teal">Build flow</p>
            <h2 className="mt-3 font-display text-4xl tracking-[0.08em] text-charcoal sm:text-5xl">
              From landfill-bound timber to one-off deckz
            </h2>
          </div>
        </div>

        <div className="relative z-10 mt-16 space-y-10 sm:mt-20 sm:space-y-14 lg:mt-24 lg:space-y-20">
          {processSteps.map((item, index) => (
            <div
              key={item.step}
              className={cn(
                "flex w-full overflow-x-clip px-0 sm:px-6 lg:px-8",
                index % 2 === 1 ? "justify-end" : "justify-start",
              )}
            >
              <ScrollReel
                mp4Src={item.reel.mp4Src}
                posterSrc={item.reel.posterSrc}
                alt={`Plankz Deckz ${item.title} reel`}
                slideFrom={item.reel.slideFrom}
                className="w-full rounded-none border-0 shadow-[0_36px_100px_rgba(19,35,33,0.18)] sm:w-[78vw] sm:rounded-[2.4rem] lg:w-[75vw] lg:max-w-[78rem]"
                mediaClassName="aspect-[16/9] min-h-[17rem] sm:min-h-[28rem] lg:min-h-[34rem]"
              />
            </div>
          ))}
        </div>
      </PaletteSection>

      <PaletteSection
        palette="dark"
        className="relative overflow-hidden bg-warm-black py-24 text-warm-white sm:py-32"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(126,207,192,0.12),transparent_24rem),radial-gradient(circle_at_92%_20%,rgba(245,160,160,0.07),transparent_24rem)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-coral/88">Brand position</p>
            <h2 className="mt-3 font-display text-4xl tracking-[0.08em] text-warm-white sm:text-5xl">
              Coastal, recycled, handmade
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ivory/72">
              A local lifestyle brand built around recovered materials, hand-shaped craft, and individual ride
              objects.
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
      </PaletteSection>
    </>
  );
}
