// app/fitting-guide/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fitting Guide",
  description:
    "Understand B22, E27, and Clipsal No. 530 fittings. Choose the right adapter for your lampshade.",
};

export default function FittingGuidePage() {
  return (
    <>
      <section className="bg-warm-black py-16 text-warm-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Fitting Guide</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ivory/70">
            Every Lumenform shade includes a fitting adapter at no extra cost. Use this guide to
            identify which adapter you need.
          </p>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {/* B22 */}
            <div className="rounded-xl border border-charcoal/10 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-charcoal text-sm font-bold text-warm-white">
                  B22
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-charcoal">B22 — Bayonet Cap (BC)</h2>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                    The most common bulb fitting in Australian households. The B22 bayonet cap has
                    two pins on opposite sides of the base that push in and twist to lock. If your
                    existing bulb pushes in and turns a quarter-turn to lock, you have a B22
                    fitting.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                    <strong className="text-charcoal">How to identify:</strong> Look at the base of
                    your current bulb. If it has two small protruding pins (not a screw thread), it
                    is a B22 bayonet.
                  </p>
                  <div className="mt-4 rounded-lg border border-dashed border-charcoal/20 bg-ivory/50 p-8 text-center text-sm text-charcoal/40">
                    Photo placeholder — B22 bayonet fitting
                  </div>
                </div>
              </div>
            </div>

            {/* E27 */}
            <div className="rounded-xl border border-charcoal/10 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-charcoal text-sm font-bold text-warm-white">
                  E27
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-charcoal">E27 — Edison Screw (ES)</h2>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                    The Edison screw is the second most common fitting in Australia and the most
                    common worldwide. The E27 base has a threaded screw that turns clockwise into
                    the socket. The &ldquo;27&rdquo; refers to the 27mm diameter of the screw base.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                    <strong className="text-charcoal">How to identify:</strong> If your bulb screws
                    into the socket (like a bottle cap), you have an Edison screw. Measure the base
                    diameter — if it is approximately 27mm, it is an E27.
                  </p>
                  <div className="mt-4 rounded-lg border border-dashed border-charcoal/20 bg-ivory/50 p-8 text-center text-sm text-charcoal/40">
                    Photo placeholder — E27 Edison screw fitting
                  </div>
                </div>
              </div>
            </div>

            {/* Clipsal No. 530 */}
            <div className="rounded-xl border border-charcoal/10 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-charcoal text-xs font-bold text-warm-white">
                  530
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-charcoal">
                    Clipsal No. 530 — Batten Holder
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                    The Clipsal No. 530 is a common Australian ceiling-mounted batten holder. It is
                    a fixed base (not a pendant) that mounts directly to the ceiling with the bulb
                    pointing downward. Many older Australian homes have these installed in bedrooms,
                    hallways, and laundries.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                    <strong className="text-charcoal">How to identify:</strong> If your light
                    fixture is a white plastic disc mounted flat against the ceiling with a B22 bulb
                    socket in the centre, it is likely a Clipsal 530 or equivalent batten holder.
                    Our adapter clips directly onto the batten holder body.
                  </p>
                  <div className="mt-4 rounded-lg border border-dashed border-charcoal/20 bg-ivory/50 p-8 text-center text-sm text-charcoal/40">
                    Photo placeholder — Clipsal No. 530 batten holder
                  </div>
                </div>
              </div>
            </div>

            {/* Not sure */}
            <div className="rounded-xl border border-amber/30 bg-amber/5 p-6">
              <h2 className="text-lg font-semibold text-charcoal">Not sure?</h2>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                If you cannot identify your fitting, select &ldquo;Other / not sure&rdquo; during
                checkout. We will ask you to provide a photo of your existing light fitting and
                confirm compatibility before production begins. No shade is printed until we are
                confident the adapter will work.
              </p>
              <p className="mt-4 text-sm text-charcoal/70">
                You can email a photo to us or upload it during the order process. Include a clear
                shot of the ceiling mount or pendant socket from below.
              </p>
            </div>

            {/* Safety */}
            <div className="rounded-lg border border-charcoal/10 bg-ivory/50 p-6">
              <h3 className="text-base font-semibold text-charcoal">Important safety note</h3>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                All Lumenform shades are designed for LED bulbs only. Do not use with incandescent
                or halogen bulbs. The adapter does not modify your electrical wiring — it is a
                mechanical attachment that holds the shade in position around the existing bulb and
                socket.
              </p>
            </div>
          </div>

          <div className="mt-12 border-t border-charcoal/10 pt-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-charcoal px-6 py-3 text-sm font-semibold text-warm-white transition-colors hover:bg-charcoal/90"
            >
              Shop with confidence
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
