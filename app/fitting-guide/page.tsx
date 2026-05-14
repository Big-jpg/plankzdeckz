// app/fitting-guide/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Camera, CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Fitting Guide",
  description:
    "Plain-language guide to choosing B22, E27, Clipsal No. 530, or Other / not sure fitting adapters for Lumenform Studio shades.",
};

const adapterCards = [
  {
    code: "B22",
    title: "B22 bayonet",
    plainName: "The push-and-twist bulb",
    chooseWhen:
      "Choose B22 if the bulb has two small side pins and locks into the socket by pushing in and twisting.",
    lookFor:
      "Two small metal pins on the side of the bulb base. The socket usually has two matching slots.",
    notThis: "Do not choose B22 if the bulb screws in with a continuous threaded base.",
  },
  {
    code: "E27",
    title: "E27 Edison screw",
    plainName: "The large screw-in bulb",
    chooseWhen:
      "Choose E27 if the bulb screws into the fitting like a bottle cap. This is the common large screw fitting.",
    lookFor:
      "A threaded metal base approximately 27mm wide. The bulb turns several times to tighten.",
    notThis:
      "Do not choose E27 if the bulb pushes in first and only turns a short distance to lock.",
  },
  {
    code: "530",
    title: "Clipsal No. 530 batten holder",
    plainName: "The ceiling-mounted round holder",
    chooseWhen:
      "Choose Clipsal No. 530 if the fitting is a round batten holder mounted directly to the ceiling, with the bulb pointing downward.",
    lookFor:
      "A white circular fitting sitting flat against the ceiling, often with a bayonet socket in the centre.",
    notThis:
      "Do not choose this for pendant cords, table lamps, or loose lamp holders hanging below the ceiling.",
  },
];

const decisionSteps = [
  "Look at how the bulb attaches to the fitting, not the shape of the shade you are replacing.",
  "If it pushes in and twists on two side pins, choose B22.",
  "If it screws in on a threaded base, choose E27.",
  "If the whole fitting is a round ceiling-mounted batten holder, choose Clipsal No. 530.",
  "If you are still unsure, choose Other / not sure and provide fixture notes or a photo before production.",
];

export default function FittingGuidePage() {
  return (
    <>
      <section className="bg-warm-black py-16 text-warm-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">
            Customer guide
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Fitting Guide</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ivory/70">
            Every Lumenform shade includes one mechanical fitting adapter. You do not need technical
            lighting knowledge to choose it: identify how your bulb connects, then select the
            matching option before adding the shade to cart.
          </p>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div className="rounded-2xl border border-charcoal/10 bg-ivory/40 p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-charcoal">Start with this quick check</h2>
              <div className="mt-6 space-y-4">
                {decisionSteps.map((step, index) => (
                  <div key={step} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-charcoal text-xs font-semibold text-warm-white">
                      {index + 1}
                    </span>
                    <p className="pt-1 text-sm leading-relaxed text-charcoal/70">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-2xl border border-amber/30 bg-amber/5 p-6">
              <HelpCircle className="h-6 w-6 text-amber" />
              <h2 className="mt-4 text-lg font-semibold text-charcoal">If you are unsure</h2>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                Select <strong className="text-charcoal">Other / not sure</strong>. Production can
                be paused until compatibility is confirmed, so the order is not made against an
                unsafe or incompatible fitting.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                A useful photo shows the socket or ceiling holder clearly, ideally with the bulb
                removed only if it is safe for you to do so.
              </p>
            </aside>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {adapterCards.map((adapter) => (
              <article
                key={adapter.code}
                className="rounded-2xl border border-charcoal/10 bg-warm-white p-6 shadow-sm shadow-charcoal/5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-charcoal text-sm font-bold text-warm-white">
                    {adapter.code}
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-charcoal">{adapter.title}</h2>
                    <p className="text-xs font-medium uppercase tracking-wide text-charcoal/40">
                      {adapter.plainName}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4 text-sm leading-relaxed text-charcoal/70">
                  <p>
                    <strong className="text-charcoal">Choose this when:</strong>{" "}
                    {adapter.chooseWhen}
                  </p>
                  <p>
                    <strong className="text-charcoal">Look for:</strong> {adapter.lookFor}
                  </p>
                  <p>
                    <strong className="text-charcoal">Not this:</strong> {adapter.notThis}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-charcoal/10 bg-ivory/40 p-6">
              <Camera className="h-6 w-6 text-charcoal/50" />
              <h2 className="mt-4 text-lg font-semibold text-charcoal">What to photograph</h2>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                Photograph the existing socket, pendant holder, or ceiling batten from below. If you
                know the brand or model, include it in your fixture notes. Do not dismantle any
                wiring or fixed electrical parts for a photo.
              </p>
            </div>

            <div className="rounded-2xl border border-charcoal/10 bg-ivory/40 p-6">
              <CheckCircle2 className="h-6 w-6 text-charcoal/50" />
              <h2 className="mt-4 text-lg font-semibold text-charcoal">Adapters are included</h2>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                One selected adapter is included with each standard shade at no extra cost. The
                adapter is a mechanical support component only. It does not change wiring,
                electrical contacts, or the certified light fitting already installed in your home.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-amber/30 bg-amber/5 p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-amber" />
              <div>
                <h2 className="text-lg font-semibold text-charcoal">LED bulb safety note</h2>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                  Lumenform shades are designed for modern LED bulbs only. Do not use incandescent,
                  halogen, heat lamp, or other high-temperature bulbs. Unsafe bulb selection can
                  deform material and create a safety hazard.
                </p>
                <Link
                  href="/safety"
                  className="mt-4 inline-flex text-sm font-semibold text-charcoal underline underline-offset-4"
                >
                  Read the full safety note
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              href="/products"
              className="rounded-xl bg-charcoal px-5 py-4 text-center text-sm font-semibold text-warm-white transition-colors hover:bg-charcoal/90"
            >
              Shop shades
            </Link>
            <Link
              href="/faq"
              className="rounded-xl border border-charcoal/15 px-5 py-4 text-center text-sm font-semibold text-charcoal transition-colors hover:border-charcoal/30"
            >
              Read FAQ
            </Link>
            <Link
              href="/pickup"
              className="rounded-xl border border-charcoal/15 px-5 py-4 text-center text-sm font-semibold text-charcoal transition-colors hover:border-charcoal/30"
            >
              Local pickup details
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
