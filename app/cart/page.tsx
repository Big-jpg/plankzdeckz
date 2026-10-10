// app/cart/page.tsx
import type { Metadata } from "next";
import { CartPageContent } from "@/components/cart-page-content";
import { SALES_ENABLED } from "@/lib/commerce-config";

export const metadata: Metadata = {
  title: SALES_ENABLED ? "Cart" : "Browse the collection",
  description: SALES_ENABLED
    ? "Your shopping cart."
    : "Explore the Plankz collection. Online purchases are currently disabled.",
};

export default function CartPage() {
  return (
    <>
      {SALES_ENABLED && (
        <section className="bg-warm-black py-16 text-warm-white sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your Cart</h1>
          </div>
        </section>
      )}
      <CartPageContent />
    </>
  );
}
