// components/product-detail.tsx
"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, MapPin, ShoppingBag } from "lucide-react";
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

  // Use adapters from the product DTO (populated from Shopify or mock data)
  const adapterOptions: AdapterType[] =
    product.adapters.length > 0
      ? product.adapters
      : ["B22", "E27", "Clipsal No. 530", "Other / not sure"];

  const canAdd =
    selectedAdapter !== null &&
    (selectedAdapter !== "Other / not sure" || fixtureNotes.trim().length > 0);

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
      {/* Breadcrumb */}
      <div className="border-b border-charcoal/5 bg-warm-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm text-charcoal/50 transition-colors hover:text-charcoal"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to shop
          </Link>
        </div>
      </div>

      <section className="bg-warm-white py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-ivory/50">
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-contain p-8"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>

            {/* Details */}
            <div className="flex flex-col">
              <p className="text-xs font-medium uppercase tracking-wider text-charcoal/40">
                {product.category}
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
                {product.title}
              </h1>
              <p className="mt-2 text-2xl font-semibold text-charcoal">
                ${product.price}{" "}
                <span className="text-base font-normal text-charcoal/50">{product.currency}</span>
              </p>

              <p className="mt-6 text-base leading-relaxed text-charcoal/70">
                {product.description}
              </p>

              {/* Specs */}
              <div className="mt-6 space-y-3 border-t border-charcoal/10 pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal/50">Material</span>
                  <span className="font-medium text-charcoal">{product.material}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal/50">Dimensions</span>
                  <span className="font-medium text-charcoal">{product.dimensions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal/50">Available colours</span>
                  <span className="font-medium text-charcoal">{product.colours.join(", ")}</span>
                </div>
                {product.designFamily && (
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal/50">Design family</span>
                    <span className="font-medium text-charcoal">{product.designFamily}</span>
                  </div>
                )}
              </div>

              {/* Colour selector */}
              {product.colours.length > 1 && (
                <div className="mt-6 border-t border-charcoal/10 pt-6">
                  <label className="text-sm font-semibold text-charcoal">Colour</label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.colours.map((colour) => (
                      <button
                        key={colour}
                        type="button"
                        onClick={() => setSelectedColour(colour)}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-sm font-medium transition-all",
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

              {/* Adapter Selector */}
              <div className="mt-6 border-t border-charcoal/10 pt-6">
                <label className="text-sm font-semibold text-charcoal">
                  Fitting adapter <span className="text-red-600">*</span>
                </label>
                <p className="mt-1 text-xs text-charcoal/50">
                  Included with your shade at no extra cost. Select the adapter for your light
                  fitting. If unsure, read the{" "}
                  <Link
                    href="/fitting-guide"
                    className="text-charcoal underline underline-offset-2"
                  >
                    fitting guide
                  </Link>
                  .
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {adapterOptions.map((adapter) => (
                    <button
                      key={adapter}
                      type="button"
                      onClick={() => handleAdapterSelect(adapter)}
                      className={cn(
                        "rounded-lg border px-3 py-2.5 text-sm font-medium transition-all",
                        selectedAdapter === adapter
                          ? "border-charcoal bg-charcoal text-warm-white"
                          : "border-charcoal/20 text-charcoal hover:border-charcoal/40",
                      )}
                    >
                      {adapter}
                    </button>
                  ))}
                </div>

                {/* Notes for "Other / not sure" */}
                {selectedAdapter === "Other / not sure" && (
                  <div className="mt-4 rounded-lg border border-amber/30 bg-amber/5 p-4">
                    <p className="text-sm font-medium text-charcoal">
                      Please describe your fitting or upload a photo
                    </p>
                    <p className="mt-1 text-xs text-charcoal/60">
                      Upload or email a photo of the fitting before production. We will confirm
                      compatibility before printing.
                    </p>
                    <textarea
                      value={fixtureNotes}
                      onChange={(e) => setFixtureNotes(e.target.value)}
                      placeholder="Describe your light fitting, brand, model, or any identifying details..."
                      className="mt-3 w-full rounded-lg border border-charcoal/20 bg-warm-white px-3 py-2 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
                      rows={3}
                    />
                    {fixtureNotes.trim().length === 0 && (
                      <p className="mt-2 text-xs text-red-600">
                        Fixture notes are required when &quot;Other / not sure&quot; is selected.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Customisation notes */}
              <div className="mt-6 border-t border-charcoal/10 pt-6">
                <label className="text-sm font-semibold text-charcoal">
                  Customisation notes{" "}
                  <span className="font-normal text-charcoal/40">(optional)</span>
                </label>
                <p className="mt-1 text-xs text-charcoal/50">
                  Any special requests for size, finish, or design modifications.
                </p>
                <textarea
                  value={customisationNotes}
                  onChange={(e) => setCustomisationNotes(e.target.value)}
                  placeholder="e.g. slightly larger opening, matte finish, specific colour match..."
                  className="mt-3 w-full rounded-lg border border-charcoal/20 bg-warm-white px-3 py-2 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
                  rows={3}
                />
              </div>

              {/* Safety note */}
              <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber/20 bg-amber/5 p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                <div>
                  <p className="text-sm font-medium text-charcoal">LED bulbs only</p>
                  <p className="mt-0.5 text-xs text-charcoal/60">
                    This shade is designed for LED bulbs only. Not compatible with incandescent or
                    halogen bulbs. Customer must confirm bulb type and fitting compatibility. Read
                    the{" "}
                    <Link href="/safety" className="text-charcoal underline underline-offset-2">
                      full safety note
                    </Link>
                    .
                  </p>
                </div>
              </div>

              {/* Local pickup note */}
              <div className="mt-4 flex items-start gap-3 rounded-lg border border-charcoal/10 p-4">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-charcoal/50" />
                <div>
                  <p className="text-sm font-medium text-charcoal">Local pickup only</p>
                  <p className="mt-0.5 text-xs text-charcoal/60">
                    This product is available for local pickup only. Shipping is not yet available.
                  </p>
                </div>
              </div>

              {/* Add to cart */}
              <button
                type="button"
                disabled={!canAdd}
                onClick={handleAddToCart}
                className={cn(
                  "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold transition-all",
                  canAdd
                    ? "bg-charcoal text-warm-white hover:bg-charcoal/90"
                    : "cursor-not-allowed bg-charcoal/20 text-charcoal/40",
                )}
              >
                <ShoppingBag className="h-4 w-4" />
                {!selectedAdapter
                  ? "Select a fitting adapter to continue"
                  : selectedAdapter === "Other / not sure" && fixtureNotes.trim().length === 0
                    ? "Add fixture notes to continue"
                    : "Add to cart"}
              </button>

              {/* Custom CTA */}
              <div className="mt-4 text-center">
                <Link
                  href="/custom"
                  className="text-sm text-charcoal/50 underline underline-offset-2 transition-colors hover:text-charcoal"
                >
                  Want this in a different size or colour? Request a custom design
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Toast notification */}
      <Toast
        message={`${product.title} added to cart`}
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </>
  );
}
