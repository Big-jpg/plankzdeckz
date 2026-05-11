// app/checkout/cancel/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Order Cancelled",
  description: "Your order has been cancelled.",
};

export default function CheckoutCancelPage() {
  return (
    <section className="bg-warm-white py-24 sm:py-32">
      <div className="mx-auto max-w-xl px-4 text-center sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-charcoal/10 bg-ivory/30 p-10">
          <XCircle className="mx-auto h-16 w-16 text-charcoal/25" />

          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
            Checkout cancelled
          </h1>

          <p className="mt-4 text-base leading-relaxed text-charcoal/60">
            Your checkout session was cancelled and no payment was processed.
            Any items already added to your cart will remain available if you
            decide to return later.
          </p>

          <p className="mt-4 text-sm leading-relaxed text-charcoal/50">
            No order has been placed and no production work has begun.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 rounded-lg bg-charcoal px-6 py-3 text-sm font-semibold text-warm-white transition-colors hover:bg-charcoal/90"
            >
              Return to cart
            </Link>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg border border-charcoal/20 px-6 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-charcoal/5"
            >
              Continue browsing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}