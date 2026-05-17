// components/cart-drawer.tsx
"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Shirt, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { cartItemKey } from "@/lib/cart-types";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { state, itemCount, subtotal, currency, drawerOpen, closeDrawer, removeItem, setQuantity } =
    useCart();

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-charcoal/40 backdrop-blur-sm transition-opacity duration-300",
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-warm-white shadow-2xl transition-transform duration-300 ease-in-out",
          drawerOpen ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-charcoal/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-charcoal">
            Cart{" "}
            {itemCount > 0 && (
              <span className="text-sm font-normal text-charcoal/50">
                ({itemCount} {itemCount === 1 ? "item" : "items"})
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="rounded p-1 text-charcoal/40 transition-colors hover:text-charcoal"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {state.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6">
            <ShoppingBag className="h-12 w-12 text-charcoal/20" />
            <p className="mt-4 text-sm font-medium text-charcoal/60">Your cart is empty</p>
            <Link
              href="/shop"
              onClick={closeDrawer}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-charcoal px-5 py-2.5 text-sm font-semibold text-warm-white transition-colors hover:bg-charcoal/90"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                {state.items.map((item) => {
                  const key = cartItemKey(item);
                  const isBoard = (item.productType ?? "board") === "board";

                  return (
                    <div
                      key={key}
                      className="flex gap-3 rounded-lg border border-charcoal/5 bg-ivory/30 p-3"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-ivory/50">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-contain p-1"
                            sizes="64px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            {item.productType === "merch" ? (
                              <Shirt className="h-5 w-5 text-charcoal/20" />
                            ) : (
                              <ShoppingBag className="h-5 w-5 text-charcoal/20" />
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <p className="text-sm font-medium leading-tight text-charcoal">
                              {item.title}
                            </p>
                            <p className="mt-0.5 text-xs text-charcoal/50">
                              {item.productType === "merch"
                                ? `Merch${item.selectedSize ? ` · Size ${item.selectedSize}` : ""}`
                                : "Board"}
                              {item.material ? ` · ${item.material}` : ""}
                              {item.colour ? ` · ${item.colour}` : ""}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(key)}
                            className="rounded p-0.5 text-charcoal/30 transition-colors hover:text-red-600"
                            aria-label={`Remove ${item.title}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-2">
                          {isBoard ? (
                            <p className="text-xs font-medium text-charcoal/60">Qty 1</p>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setQuantity(key, item.quantity - 1)}
                                className="flex h-6 w-6 items-center justify-center rounded border border-charcoal/20 text-charcoal/60 transition-colors hover:border-charcoal/40"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-7 text-center text-xs font-medium text-charcoal">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => setQuantity(key, item.quantity + 1)}
                                className="flex h-6 w-6 items-center justify-center rounded border border-charcoal/20 text-charcoal/60 transition-colors hover:border-charcoal/40"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                          <p className="text-sm font-semibold text-charcoal">
                            ${(item.unitPrice * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-charcoal/10 px-6 py-4">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal/60">Subtotal</span>
                <span className="font-semibold text-charcoal">
                  ${subtotal.toFixed(2)} {currency}
                </span>
              </div>
              <Link
                href="/cart"
                onClick={closeDrawer}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-charcoal px-6 py-3 text-sm font-semibold text-warm-white transition-colors hover:bg-charcoal/90"
              >
                View full cart
              </Link>
              <button
                type="button"
                onClick={closeDrawer}
                className="mt-2 w-full text-center text-sm text-charcoal/50 underline underline-offset-2 transition-colors hover:text-charcoal"
              >
                Continue shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
