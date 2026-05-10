// app/pickup/page.tsx
import type { Metadata } from "next";
import { MapPin, Clock, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Local Pickup",
  description: "Pickup instructions for Lumenform Studio orders.",
};

export default function PickupPage() {
  return (
    <>
      <section className="bg-warm-black py-16 text-warm-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Local Pickup</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ivory/70">
            All orders are currently available for local pickup only. We will notify you when your
            shade is ready to collect.
          </p>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-charcoal/10 p-6 text-center">
                <MapPin className="mx-auto h-6 w-6 text-charcoal/50" />
                <h3 className="mt-3 text-sm font-semibold text-charcoal">Location</h3>
                <p className="mt-2 text-sm text-charcoal/60">
                  Local area — exact address provided after order confirmation.
                </p>
              </div>
              <div className="rounded-xl border border-charcoal/10 p-6 text-center">
                <Clock className="mx-auto h-6 w-6 text-charcoal/50" />
                <h3 className="mt-3 text-sm font-semibold text-charcoal">Availability</h3>
                <p className="mt-2 text-sm text-charcoal/60">
                  By appointment. We will arrange a time that works for you.
                </p>
              </div>
              <div className="rounded-xl border border-charcoal/10 p-6 text-center">
                <MessageSquare className="mx-auto h-6 w-6 text-charcoal/50" />
                <h3 className="mt-3 text-sm font-semibold text-charcoal">Notification</h3>
                <p className="mt-2 text-sm text-charcoal/60">
                  You will receive an email when your order is ready for collection.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-charcoal">How it works</h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-charcoal/70">
                <p>
                  <strong className="text-charcoal">1.</strong> Place your order and complete
                  payment online.
                </p>
                <p>
                  <strong className="text-charcoal">2.</strong> Your shade is printed and finished.
                  Typical production time is 3–7 business days depending on design complexity.
                </p>
                <p>
                  <strong className="text-charcoal">3.</strong> You receive an email notification
                  with pickup details and available times.
                </p>
                <p>
                  <strong className="text-charcoal">4.</strong> Collect your shade at the arranged
                  time. We will walk you through installation if needed.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-charcoal/10 bg-ivory/50 p-6">
              <h3 className="text-base font-semibold text-charcoal">Production times</h3>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                Standard designs: 3–5 business days. Complex or custom designs: 5–10 business days.
                We will provide an estimated completion date at the time of order.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
