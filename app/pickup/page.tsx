// app/pickup/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Clock, MailCheck, MapPin, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Local Pickup",
  description:
    "Local pickup instructions for Lumenform Studio orders, including appointment flow and current pickup-only fulfilment status.",
};

const pickupSteps = [
  {
    title: "Order online",
    text: "Choose the product, colour, fitting adapter, and any customisation notes. Shipping is not available at checkout.",
  },
  {
    title: "Studio production",
    text: "The shade is produced to order. Standard pieces are typically ready within 3–5 business days; custom work may take longer after confirmation.",
  },
  {
    title: "Pickup email",
    text: "When complete, you receive an email with collection details and available appointment times.",
  },
  {
    title: "Collect locally",
    text: "At handover, basic fitting and adapter guidance can be provided. The adapter does not alter electrical wiring.",
  },
];

export default function PickupPage() {
  return (
    <>
      <section className="bg-warm-black py-16 text-warm-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">Fulfilment</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Local Pickup</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ivory/70">
            Lumenform currently operates as a local pickup-only studio. Each order is produced to
            order and collected by appointment once it is ready.
          </p>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-amber/30 bg-amber/5 p-6 sm:p-8">
            <MapPin className="h-7 w-7 text-amber" />
            <h2 className="mt-4 text-xl font-semibold text-charcoal">Pickup only at this stage</h2>
            <p className="mt-4 text-sm leading-relaxed text-charcoal/70">
              Public shipping is not live. Orders are prepared for local collection in the Perth
              area, with exact collection details supplied after the order is complete and ready for
              handover.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-charcoal/10 bg-ivory/30 p-6 text-center">
              <MapPin className="mx-auto h-6 w-6 text-charcoal/50" />
              <h3 className="mt-3 text-sm font-semibold text-charcoal">Location</h3>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
                Pickup is available within the local Perth area. Collection details are provided
                after completion confirmation.
              </p>
            </div>

            <div className="rounded-xl border border-charcoal/10 bg-ivory/30 p-6 text-center">
              <CalendarCheck className="mx-auto h-6 w-6 text-charcoal/50" />
              <h3 className="mt-3 text-sm font-semibold text-charcoal">Appointment</h3>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
                Collections are arranged by appointment so the finished piece can be handed over
                safely and without missed pickups.
              </p>
            </div>

            <div className="rounded-xl border border-charcoal/10 bg-ivory/30 p-6 text-center">
              <MessageSquare className="mx-auto h-6 w-6 text-charcoal/50" />
              <h3 className="mt-3 text-sm font-semibold text-charcoal">Support</h3>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
                Fitting and adapter questions can be clarified before production or at collection
                where practical.
              </p>
            </div>
          </div>

          <section className="mt-10 rounded-2xl border border-charcoal/10 bg-warm-white p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-charcoal">The collection process</h2>
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-4">
              {pickupSteps.map((step, index) => (
                <article
                  key={step.title}
                  className="rounded-xl border border-charcoal/10 bg-ivory/30 p-5"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-charcoal text-xs font-semibold text-warm-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-charcoal">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{step.text}</p>
                </article>
              ))}
            </div>
          </section>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-charcoal/10 bg-ivory/40 p-6">
              <Clock className="h-6 w-6 text-charcoal/50" />
              <h2 className="mt-4 text-lg font-semibold text-charcoal">Timing</h2>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                Standard studio pieces are typically ready within 3–5 business days. Larger or
                custom-developed work may require additional time depending on complexity, material
                availability, and fitting confirmation.
              </p>
              <Link
                href="/production"
                className="mt-4 inline-flex text-sm font-semibold text-charcoal underline underline-offset-4"
              >
                Read production timing
              </Link>
            </section>

            <section className="rounded-2xl border border-charcoal/10 bg-warm-white p-6">
              <MailCheck className="h-6 w-6 text-charcoal/50" />
              <h2 className="mt-4 text-lg font-semibold text-charcoal">Collection email</h2>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                Please keep the order email address accessible. Pickup coordination, order updates,
                and collection appointment options are sent there.
              </p>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
