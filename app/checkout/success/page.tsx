// app/checkout/success/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your order has been confirmed.",
};

export default function CheckoutSuccessPage() {
  return (
    <section className="bg-warm-white py-24 sm:py-32">
      <div className="mx-auto max-w-xl px-4 text-center sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-charcoal/10 bg-ivory/30 p-10">
          <CheckCircle className="mx-auto h-16 w-16 text-green-700" />

          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
            Order confirmed
          </h1>

          <p className="mt-4 text-base leading-relaxed text-charcoal/60">
            Thank you for your order. Your piece has been added to the studio
            production queue and preparation will begin shortly.
          </p>

          <p className="mt-4 text-sm leading-relaxed text-charcoal/50">
            A confirmation email has been sent to your email address with order
            details, shipping or collection information, and any relevant fitting
            notes.
          </p>

          <div className="mt-8 rounded-lg border border-charcoal/10 bg-warm-white p-5 text-left">
            <h2 className="text-sm font-semibold text-charcoal">
              What happens next
            </h2>

            <div className="mt-4 space-y-3 text-sm leading-relaxed text-charcoal/60">
              <p>
                <strong className="text-charcoal">1.</strong> Your order is
                reviewed for fitting and production requirements.
              </p>

              <p>
                <strong className="text-charcoal">2.</strong> The piece is
                prepared, finished, and packed in the studio.
              </p>

              <p>
                <strong className="text-charcoal">3.</strong> You will receive
                another email once the order is ready for collection or dispatch.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-charcoal px-6 py-3 text-sm font-semibold text-warm-white transition-colors hover:bg-charcoal/90"
            >
              Continue browsing
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-charcoal/20 px-6 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-charcoal/5"
            >
              Return home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}