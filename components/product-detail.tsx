// components/product-detail.tsx
"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Info, MapPin, ShoppingBag } from "lucide-react";
import type { Product, AdapterType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import type { CartItem } from "@/lib/cart-types";
import { Toast } from "@/components/toast";

export function ProductDetail({ product }: { product: Product }) {
  const [selectedAdapter, setSelectedAdapter] = useState<AdapterType | null>(null);
  const [selectedColour, setSelectedColour] = useState<string>(product.colours[0] ?? "");
  const [fixtureNotes, setFixtureNotes] = useState("");
  const [customisationNotes, setCustomisationNotes] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const { addItem, itemCount } = useCart();

  const sendBuyerEvent = useCallback(
    (eventType: "adapter_selected" | "cart_created", payload: Record<string, unknown>) => {
      void fetch("/api/buyer-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_type: eventType, payload }),
      }).catch(() => undefined);
    },
    [],
  );

  // Field names remain adapter-oriented for cart/back-end compatibility from the inherited scaffold.
  const adapterOptions: AdapterType[] =
    product.adapters.length > 0
      ? product.adapters
      : ["Cruiser", "Longboard", "Surfskate", "Custom / not sure"];

  const canAdd =
    selectedAdapter !== null &&
    (selectedAdapter !== "Custom / not sure" || fixtureNotes.trim().length > 0);

  const handleAdapterSelect = useCallback(
    (adapter: AdapterType) => {
      setSelectedAdapter(adapter);
      sendBuyerEvent("adapter_selected", {
        product_id: product.id,
        product_handle: product.handle,
        product_title: product.title,
        adapter_type: adapter,
      });
    },
    [product.handle, product.id, product.title, sendBuyerEvent],
  );

  const handleAddToCart = useCallback(() => {
    if (!selectedAdapter || !canAdd) return;

    const item: CartItem = {
      productId: product.id,
      variantId: product.shopifyVariantId ?? null,
      handle: product.handle,
      title: product.title,
      variantTitle: "",
      imageUrl: product.images[0] ?? "",
      unitPrice: product.price,
      currency: product.currency,
      quantity: 1,
      selectedAdapter,
      bulbTypeConfirmed: false,
      fixtureNotes: fixtureNotes.trim(),
      customisationNotes: customisationNotes.trim(),
      material: product.material,
      colour: selectedColour,
      metadata: null,
    };

    addItem(item);

    if (itemCount === 0) {
      sendBuyerEvent("cart_created", {
        product_id: product.id,
        product_handle: product.handle,
        product_title: product.title,
        selected_adapter: selectedAdapter,
        item_count: 1,
        currency: product.currency,
        subtotal_amount: Math.round(product.price * 100),
      });
    }

    setToastVisible(true);
  }, [
    selectedAdapter,
    canAdd,
    product,
    fixtureNotes,
    customisationNotes,
    selectedColour,
    addItem,
    itemCount,
    sendBuyerEvent,
  ]);

  return (
    <>
      <div className="border-b border-charcoal/10 bg-warm-white/95">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm text-charcoal/60 transition-colors hover:text-charcoal"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to shop
          </Link>
        </div>
      </div>

      <section className="bg-warm-white py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-charcoal/10 bg-ivory/70 shadow-sm">
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-contain p-8"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>

            <div className="flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                {product.category}
              </p>
              <h1 className="mt-2 font-display text-3xl tracking-wide text-brand-gold sm:text-4xl">
                {product.title}
              </h1>
              <p className="mt-2 text-2xl font-semibold text-charcoal">
                ${product.price}{" "}
                <span className="text-base font-normal text-charcoal/50">{product.currency}</span>
              </p>

              <p className="mt-6 text-base leading-relaxed text-charcoal/75">{product.description}</p>

              <div className="mt-6 space-y-3 border-t border-charcoal/10 pt-6">
                <div className="flex justify-between gap-6 text-sm">
                  <span className="text-charcoal/50">Material</span>
                  <span className="text-right font-medium text-charcoal">{product.material}</span>
                </div>
                <div className="flex justify-between gap-6 text-sm">
                  <span className="text-charcoal/50">Dimensions</span>
                  <span className="text-right font-medium text-charcoal">{product.dimensions}</span>
                </div>
                <div className="flex justify-between gap-6 text-sm">
                  <span className="text-charcoal/50">Finish palette</span>
                  <span className="text-right font-medium text-charcoal">{product.colours.join(", ")}</span>
                </div>
                {product.designFamily && (
                  <div className="flex justify-between gap-6 text-sm">
                    <span className="text-charcoal/50">Build family</span>
                    <span className="text-right font-medium text-charcoal">{product.designFamily}</span>
                  </div>
                )}
              </div>

              {product.colours.length > 1 && (
                <div className="mt-6 border-t border-charcoal/10 pt-6">
                  <label className="text-sm font-semibold text-charcoal">Finish direction</label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.colours.map((colour) => (
                      <button
                        key={colour}
                        type="button"
                        onClick={() => setSelectedColour(colour)}
                        className={cn(
                          "rounded-full border px-3 py-2 text-sm font-medium transition-all",
                          selectedColour === colour
                            ? "border-charcoal bg-charcoal text-warm-white"
                            : "border-charcoal/20 text-charcoal hover:border-charcoal/40",
                        )}
                      >
                        {colour}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 border-t border-charcoal/10 pt-6">
                <label className="text-sm font-semibold text-charcoal">
                  Board build type <span className="text-red-600">*</span>
                </label>
                <p className="mt-1 text-xs text-charcoal/55">
                  Select the closest ride style for this deck. If unsure, choose custom and add notes so
                  the build can be confirmed before pickup.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {adapterOptions.map((adapter) => (
                    <button
                      key={adapter}
                      type="button"
                      onClick={() => handleAdapterSelect(adapter)}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all",
                        selectedAdapter === adapter
                          ? "border-charcoal bg-charcoal text-warm-white"
                          : "border-charcoal/20 text-charcoal hover:border-charcoal/40",
                      )}
                    >
                      {adapter}
                    </button>
                  ))}
                </div>

                {selectedAdapter === "Custom / not sure" && (
                  <div className="mt-4 rounded-xl border border-brand-gold/35 bg-brand-gold/10 p-4">
                    <p className="text-sm font-semibold text-charcoal">Describe the intended ride</p>
                    <p className="mt-1 text-xs text-charcoal/65">
                      Include rider size, stance, preferred trucks, or any inspiration photos you plan to
                      send through before production.
                    </p>
                    <textarea
                      value={fixtureNotes}
                      onChange={(event) => setFixtureNotes(event.target.value)}
                      placeholder="e.g. relaxed longboard cruiser, surfskate carve trainer, wall-hanger with local pickup..."
                      className="mt-3 w-full rounded-xl border border-charcoal/20 bg-warm-white px-3 py-2 text-sm text-charcoal placeholder:text-charcoal/35 focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
                      rows={3}
                    />
                    {fixtureNotes.trim().length === 0 && (
                      <p className="mt-2 text-xs text-red-600">
                        Build notes are required when &quot;Custom / not sure&quot; is selected.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 border-t border-charcoal/10 pt-6">
                <label className="text-sm font-semibold text-charcoal">
                  Customisation notes <span className="font-normal text-charcoal/40">(optional)</span>
                </label>
                <p className="mt-1 text-xs text-charcoal/55">
                  Add preferences for size, concave, timber tone, resin detail, grip, or display finish.
                </p>
                <textarea
                  value={customisationNotes}
                  onChange={(event) => setCustomisationNotes(event.target.value)}
                  placeholder="e.g. warmer timber, teal resin accent, mellow concave, no grip tape yet..."
                  className="mt-3 w-full rounded-xl border border-charcoal/20 bg-warm-white px-3 py-2 text-sm text-charcoal placeholder:text-charcoal/35 focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
                  rows={3}
                />
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/10 p-4">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-charcoal">Handmade recycled timber</p>
                  <p className="mt-0.5 text-xs text-charcoal/65">
                    Each deck varies with the reclaimed material available. Final grain, tone, and small
                    build details are confirmed before production.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-xl border border-charcoal/10 p-4">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-charcoal/50" />
                <div>
                  <p className="text-sm font-semibold text-charcoal">Local pickup only</p>
                  <p className="mt-0.5 text-xs text-charcoal/65">
                    Built locally from repurposed materials and handed over by arrangement. Shipping is
                    not currently available.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={!canAdd}
                onClick={handleAddToCart}
                className={cn(
                  "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all",
                  canAdd
                    ? "bg-charcoal text-warm-white hover:bg-charcoal/90"
                    : "cursor-not-allowed bg-charcoal/20 text-charcoal/40",
                )}
              >
                <ShoppingBag className="h-4 w-4" />
                {!selectedAdapter
                  ? "Select a board build type to continue"
                  : selectedAdapter === "Custom / not sure" && fixtureNotes.trim().length === 0
                    ? "Add build notes to continue"
                    : "Add to cart"}
              </button>

              <div className="mt-4 text-center">
                <Link
                  href="/custom"
                  className="text-sm text-charcoal/55 underline underline-offset-2 transition-colors hover:text-charcoal"
                >
                  Want a different outline, timber story, or finish? Request a custom deck
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Toast message={`${product.title} added to cart`} visible={toastVisible} onClose={() => setToastVisible(false)} />
    </>
  );
}
