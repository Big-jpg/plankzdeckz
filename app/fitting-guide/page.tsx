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
            Every Lumenform shade includes the required fitting adapter. This guide will help you
            identify the right option for your home.
          </p>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            <div className="prose prose-charcoal max-w-none text-charcoal/80">
              <p className="text-lg leading-relaxed">
                Most Australian homes use one of three common lighting fittings: B22 bayonet, E27
                Edison screw, or a ceiling-mounted batten holder such as the Clipsal No. 530.
                Lumenform shades are supplied with a compatible adapter so the piece can sit cleanly
                and securely around the existing light point.
              </p>
            </div>

            {/* B22 */}
            <div className="rounded-xl border border-charcoal/10 bg-ivory/30 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-charcoal text-sm font-bold text-warm-white">
                  B22
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-charcoal">B22 — Bayonet Cap</h2>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                    B22 is the familiar bayonet fitting found in many Australian homes. The bulb has
                    two small side pins, presses into the socket, then turns slightly to lock into
                    place.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                    <strong className="text-charcoal">How to identify it:</strong> remove the bulb
                    and look at the base. If there are two small protruding pins rather than a
                    threaded screw, it is a B22 bayonet fitting.
                  </p>
                  <div className="mt-4 rounded-lg border border-dashed border-charcoal/20 bg-warm-white p-8 text-center text-sm text-charcoal/40">
                    Photo placeholder — B22 bayonet fitting
                  </div>
                </div>
              </div>
            </div>

            {/* E27 */}
            <div className="rounded-xl border border-charcoal/10 bg-ivory/30 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-charcoal text-sm font-bold text-warm-white">
                  E27
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-charcoal">E27 — Edison Screw</h2>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                    E27 is the standard large screw fitting used widely in pendant lights, lamps,
                    and ceiling fixtures. The bulb turns clockwise into the socket and is held by
                    the screw thread.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                    <strong className="text-charcoal">How to identify it:</strong> if the bulb
                    screws in like a bottle cap, it is an Edison screw. The E27 version has a base
                    diameter of approximately 27mm.
                  </p>
                  <div className="mt-4 rounded-lg border border-dashed border-charcoal/20 bg-warm-white p-8 text-center text-sm text-charcoal/40">
                    Photo placeholder — E27 Edison screw fitting
                  </div>
                </div>
              </div>
            </div>

            {/* Clipsal No. 530 */}
            <div className="rounded-xl border border-charcoal/10 bg-ivory/30 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-charcoal text-xs font-bold text-warm-white">
                  530
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-charcoal">
                    Clipsal No. 530 — Batten Holder
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                    The Clipsal No. 530 is a common Australian ceiling-mounted batten holder. It
                    sits directly against the ceiling rather than hanging as a pendant, with the
                    bulb facing downward from the centre of the fitting.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                    <strong className="text-charcoal">How to identify it:</strong> look for a white
                    circular base mounted flat to the ceiling, usually with a bayonet socket in the
                    centre. The Lumenform adapter is designed to attach to the batten holder body
                    without changing the electrical fitting.
                  </p>
                  <div className="mt-4 rounded-lg border border-dashed border-charcoal/20 bg-warm-white p-8 text-center text-sm text-charcoal/40">
                    Photo placeholder — Clipsal No. 530 batten holder
                  </div>
                </div>
              </div>
            </div>

            {/* Not sure */}
            <div className="rounded-xl border border-charcoal/10 bg-warm-white p-6">
              <h2 className="text-lg font-semibold text-charcoal">
                Unsure which fitting you have?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                Select “Other / not sure” during checkout. You can provide a clear photo of the
                existing light point, and compatibility will be confirmed before your order is
                prepared.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-charcoal/70">
                A useful photo shows the ceiling mount or pendant socket from below, with the bulb
                removed where safe to do so.
              </p>
            </div>

            {/* Safety */}
            <div className="rounded-lg border border-charcoal/10 bg-ivory/50 p-6">
              <h3 className="text-base font-semibold text-charcoal">Important safety note</h3>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                Lumenform shades are designed for LED bulbs only. Do not use them with incandescent
                or halogen bulbs. The adapter is a mechanical support component; it does not alter
                wiring, electrical contacts, or the original light fitting.
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
