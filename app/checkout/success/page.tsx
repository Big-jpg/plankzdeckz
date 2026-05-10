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
        <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
          Order confirmed
        </h1>
        <p className="mt-4 text-base leading-relaxed text-charcoal/60">
          Thank you for your order. We will begin production and notify you when your shade is ready
          for local pickup.
        </p>
        <p className="mt-2 text-sm text-charcoal/50">
          A confirmation email has been sent to your email address.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-lg bg-charcoal px-6 py-3 text-sm font-semibold text-warm-white transition-colors hover:bg-charcoal/90"
          >
            Continue shopping
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-charcoal/20 px-6 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-charcoal/5"
          >
            Return home
          </Link>
        </div>
      </div>
    </section>
  );
}
