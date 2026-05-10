// app/cart/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export const metadata: Metadata = {
  title: "Cart",
  description: "Your shopping cart.",
};

export default function CartPage() {
  return (
    <>
      <section className="bg-warm-black py-16 text-warm-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your Cart</h1>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-charcoal/10 bg-ivory/50 p-12 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-charcoal/20" />
            <h2 className="mt-4 text-lg font-semibold text-charcoal">Your cart is empty</h2>
            <p className="mt-2 text-sm text-charcoal/60">
              Browse our collection and add a shade to get started.
            </p>
            <div className="mt-8">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg bg-charcoal px-6 py-3 text-sm font-semibold text-warm-white transition-colors hover:bg-charcoal/90"
              >
                Shop lampshades
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
