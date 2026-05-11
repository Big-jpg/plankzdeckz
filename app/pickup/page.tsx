// app/pickup/page.tsx
import type { Metadata } from "next";
import { MapPin, Clock, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Local Pickup",
  description: "Pickup information for Lumenform Studio orders.",
};

export default function PickupPage() {
  return (
    <>
      <section className="bg-warm-black py-16 text-warm-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Local Pickup
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ivory/70">
            Lumenform currently operates as a local studio practice. Each piece is
            produced to order and collected by appointment once ready.
          </p>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">
            <div className="prose prose-charcoal max-w-none text-charcoal/80">
              <p className="text-lg leading-relaxed">
                Working locally allows every order to remain flexible, responsive,
                and carefully prepared. It also provides an opportunity to ensure
                fittings, proportions, and finish details are correct before the
                piece enters your space.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-charcoal/10 bg-ivory/30 p-6 text-center">
                <MapPin className="mx-auto h-6 w-6 text-charcoal/50" />

                <h3 className="mt-3 text-sm font-semibold text-charcoal">
                  Location
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
                  Pickup is available within the local Perth area. Collection
                  details are provided after confirmation.
                </p>
              </div>

              <div className="rounded-xl border border-charcoal/10 bg-ivory/30 p-6 text-center">
                <Clock className="mx-auto h-6 w-6 text-charcoal/50" />

                <h3 className="mt-3 text-sm font-semibold text-charcoal">
                  Availability
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
                  Collections are arranged by appointment to ensure a convenient
                  handover time for both parties.
                </p>
              </div>

              <div className="rounded-xl border border-charcoal/10 bg-ivory/30 p-6 text-center">
                <MessageSquare className="mx-auto h-6 w-6 text-charcoal/50" />

                <h3 className="mt-3 text-sm font-semibold text-charcoal">
                  Updates
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
                  You will receive email confirmation once your order is complete
                  and ready for collection.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-charcoal">
                The Collection Process
              </h2>

              <div className="mt-5 space-y-5 text-sm leading-relaxed text-charcoal/70">
                <p>
                  <strong className="text-charcoal">1.</strong> Place your order
                  online and select the appropriate fitting option for your space.
                </p>

                <p>
                  <strong className="text-charcoal">2.</strong> Your piece is
                  produced and prepared in the studio. Lead times vary depending
                  on scale, geometry, and current production volume.
                </p>

                <p>
                  <strong className="text-charcoal">3.</strong> Once complete,
                  you will receive collection details along with available pickup
                  times.
                </p>

                <p>
                  <strong className="text-charcoal">4.</strong> At collection,
                  installation guidance and fitting support can be provided if
                  required.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-charcoal/10 bg-ivory/50 p-6">
              <h3 className="text-base font-semibold text-charcoal">
                Lead Times
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                Standard studio pieces are typically ready within 3–5 business
                days. Larger or custom-developed works may require additional
                production time depending on complexity and finishing
                requirements.
              </p>

              <p className="mt-4 text-sm leading-relaxed text-charcoal/70">
                Estimated completion windows are provided at the time of order so
                expectations remain clear throughout the process.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}