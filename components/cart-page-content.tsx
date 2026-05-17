// components/cart-page-content.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Shirt, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { cartItemKey } from "@/lib/cart-types";
import { cn } from "@/lib/utils";

interface CheckoutCreateSessionResponse {
  sessionId?: string;
  url?: string;
  error?: string;
  details?: Array<{ message?: string }>;
}

function checkoutErrorMessage(payload: CheckoutCreateSessionResponse): string {
  const firstDetail = payload.details?.find((detail) => detail.message)?.message;
  return firstDetail ?? payload.error ?? "Checkout could not be started. Please review your cart.";
}

export function CartPageContent() {
  const { state, itemCount, subtotal, currency, removeItem, setQuantity } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  async function handleCheckout(): Promise<void> {
    setCheckoutError(null);
    setIsCheckingOut(true);

    try {
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: state.items }),
      });

      const payload = (await response.json().catch(() => ({}))) as CheckoutCreateSessionResponse;

      if (!response.ok || !payload.url) {
        setCheckoutError(checkoutErrorMessage(payload));
        setIsCheckingOut(false);
        return;
      }

      window.location.assign(payload.url);
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : "Checkout could not be started. Please try again.",
      );
      setIsCheckingOut(false);
    }
  }

  if (state.items.length === 0) {
    return (
      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-charcoal/10 bg-ivory/50 p-12 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-charcoal/20" />
            <h2 className="mt-4 text-lg font-semibold text-charcoal">Your cart is empty</h2>
            <p className="mt-2 text-sm text-charcoal/60">
              Browse the deck collection and add a build to get started.
            </p>
            <div className="mt-8">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-lg bg-charcoal px-6 py-3 text-sm font-semibold text-warm-white transition-colors hover:bg-charcoal/90"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-warm-white py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {state.items.map((item) => {
                const key = cartItemKey(item);
                const isBoard = (item.productType ?? "board") === "board";

                return (
                  <div
                    key={key}
                    className="flex gap-4 rounded-xl border border-charcoal/10 bg-ivory/30 p-4 sm:gap-6 sm:p-6"
                  >
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-ivory/50 sm:h-28 sm:w-28">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-contain p-2"
                          sizes="112px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          {item.productType === "merch" ? (
                            <Shirt className="h-8 w-8 text-charcoal/20" />
                          ) : (
                            <ShoppingBag className="h-8 w-8 text-charcoal/20" />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/products/${item.handle}`}
                            className="text-sm font-semibold text-charcoal hover:underline sm:text-base"
                          >
                            {item.title}
                          </Link>
                          {item.variantTitle && (
                            <p className="text-xs text-charcoal/50">{item.variantTitle}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(key)}
                          className="rounded p-1 text-charcoal/30 transition-colors hover:text-red-600"
                          aria-label={`Remove ${item.title} from cart`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal/60">
                        <span>
                          Type:{" "}
                          <span className="font-medium text-charcoal">
                            {item.productType === "merch" ? "Merch" : "Board"}
                          </span>
                        </span>
                        {item.productType === "merch" && item.selectedSize && (
                          <span>
                            Size: <span className="font-medium text-charcoal">{item.selectedSize}</span>
                          </span>
                        )}
                        {item.material && (
                          <span>
                            Timber: <span className="font-medium text-charcoal">{item.material}</span>
                          </span>
                        )}
                        {item.colour && (
                          <span>
                            Colour: <span className="font-medium text-charcoal">{item.colour}</span>
                          </span>
                        )}
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-3">
                        {isBoard ? (
                          <p className="rounded-lg border border-charcoal/10 px-3 py-1.5 text-xs font-medium text-charcoal/60">
                            Qty 1
                          </p>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setQuantity(key, item.quantity - 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-charcoal/20 text-charcoal/60 transition-colors hover:border-charcoal/40 hover:text-charcoal"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-10 text-center text-sm font-medium text-charcoal">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQuantity(key, item.quantity + 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-charcoal/20 text-charcoal/60 transition-colors hover:border-charcoal/40 hover:text-charcoal"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                        <div className="text-right">
                          <p className="text-sm font-semibold text-charcoal">
                            ${(item.unitPrice * item.quantity).toFixed(2)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-charcoal/50">${item.unitPrice.toFixed(2)} each</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <Link
                href="/shop"
                className="text-sm text-charcoal/50 underline underline-offset-2 transition-colors hover:text-charcoal"
              >
                Continue shopping
              </Link>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-charcoal/10 bg-ivory/30 p-6">
              <h2 className="text-lg font-semibold text-charcoal">Order summary</h2>

              <div className="mt-4 space-y-3 border-t border-charcoal/10 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal/60">Items ({itemCount})</span>
                  <span className="font-medium text-charcoal">
                    ${subtotal.toFixed(2)} {currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal/60">Fulfilment</span>
                  <span className="text-xs text-charcoal/40">Local pickup only</span>
                </div>
              </div>

              <div className="mt-4 border-t border-charcoal/10 pt-4">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-charcoal">Subtotal</span>
                  <span className="text-base font-semibold text-charcoal">
                    ${subtotal.toFixed(2)} {currency}
                  </span>
                </div>
              </div>

              <p className="mt-6 rounded-lg border border-amber/20 bg-amber/5 p-4 text-xs leading-relaxed text-charcoal/80">
                Local pickup only. Handmade board timber character and finish may vary by available reclaimed material.
              </p>

              <button
                type="button"
                disabled={isCheckingOut}
                onClick={handleCheckout}
                aria-busy={isCheckingOut}
                className={cn(
                  "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold transition-all",
                  !isCheckingOut
                    ? "bg-charcoal text-warm-white hover:bg-charcoal/90"
                    : "cursor-not-allowed bg-charcoal/20 text-charcoal/40",
                )}
              >
                {isCheckingOut ? "Starting secure checkout..." : "Proceed to checkout"}
              </button>

              {checkoutError && (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-700">
                  {checkoutError}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
