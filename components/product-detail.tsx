// components/product-detail.tsx
"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Info, MapPin, Ruler, ShoppingBag, Trees } from "lucide-react";
import type { BoardProduct, MerchProduct, MerchSize, Product } from "@/lib/types";
import { isBoardProduct, isMerchProduct } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import type { CartItem } from "@/lib/cart-types";
import { ProductVisual } from "@/components/product-visual";
import { Toast } from "@/components/toast";

function formatPrice(product: Product): string {
  return `$${product.price.toFixed(0)} ${product.currency}`;
}

function initialMerchSize(product: Product): MerchSize | null {
  if (!isMerchProduct(product)) return null;
  if (!product.sizeRequired) return product.sizes[0] ?? "One size";
  return null;
}

interface BoardAvailabilityResponse {
  available?: boolean;
  error?: string;
  message?: string;
}

async function assertBoardAvailableForCart(handle: string): Promise<void> {
  const response = await fetch(`/api/boards/availability?handle=${encodeURIComponent(handle)}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const payload = (await response.json().catch(() => ({}))) as BoardAvailabilityResponse;

  if (!response.ok || !payload.available) {
    throw new Error(
      payload.message ?? payload.error ?? "This board is no longer available for checkout.",
    );
  }
}

function StatusPill({ board }: { board: BoardProduct }) {
  const sold = board.availabilityStatus === "sold";
  const reserved = board.availabilityStatus === "reserved";

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]",
        sold || reserved
          ? "bg-charcoal/10 text-charcoal/60"
          : "bg-teal/20 text-charcoal ring-1 ring-teal/40",
      )}
    >
      <BadgeCheck className="h-4 w-4" />
      {sold ? "Sold" : reserved ? "Reserved" : "Available"}
    </span>
  );
}

export function ProductDetail({ product }: { product: Product }) {
  const [selectedColour] = useState<string>(product.colours[0] ?? "");
  const [selectedSize, setSelectedSize] = useState<MerchSize | null>(() => initialMerchSize(product));
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState(`${product.title} added to cart`);
  const [isAdding, setIsAdding] = useState(false);

  const { addItem, itemCount } = useCart();

  const sendBuyerEvent = useCallback((payload: Record<string, unknown>) => {
    void fetch("/api/buyer-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: "cart_created", payload }),
    }).catch(() => undefined);
  }, []);

  const isBoard = isBoardProduct(product);
  const isMerch = isMerchProduct(product);
  const boardCanAdd = isBoard && product.availabilityStatus === "available" && product.inStock;
  const merchCanAdd = isMerch && product.inStock && (!product.sizeRequired || selectedSize !== null);
  const canAdd = (boardCanAdd || merchCanAdd) && !isAdding;

  const handleAddToCart = useCallback(async () => {
    if (!canAdd) return;

    setIsAdding(true);
    try {
      if (isBoardProduct(product)) {
        await assertBoardAvailableForCart(product.handle);
      }

      const selectedMerchSize = isMerchProduct(product) ? (selectedSize ?? "One size") : undefined;
      const variantTitle = selectedMerchSize ? `Size ${selectedMerchSize}` : "One-of-a-kind board";

      const item: CartItem = {
        productId: product.id,
        variantId: product.shopifyVariantId ?? null,
        handle: product.handle,
        title: product.title,
        variantTitle,
        imageUrl: product.images[0] ?? "",
        unitPrice: product.price,
        currency: product.currency,
        quantity: 1,
        productType: product.productType,
        selectedSize: selectedMerchSize,
        material: product.material,
        colour: selectedColour,
        metadata: isBoardProduct(product)
          ? {
              availability_status: product.availabilityStatus,
              board_style: product.boardStyle,
              board_shape: product.boardShape,
              timber_species: product.timberSpecies.join(" / "),
              dimensions: product.boardDimensions.display,
            }
          : {
              merch_kind: product.merchKind,
              selected_size: selectedMerchSize ?? "One size",
            },
      };

      addItem(item);

      if (itemCount === 0) {
        sendBuyerEvent({
          product_id: product.id,
          product_handle: product.handle,
          product_title: product.title,
          product_type: product.productType,
          selected_size: selectedMerchSize ?? null,
          item_count: 1,
          currency: product.currency,
          subtotal_amount: Math.round(product.price * 100),
        });
      }

      setToastMessage(`${product.title} added to cart`);
      setToastVisible(true);
    } catch (error) {
      setToastMessage(
        error instanceof Error ? error.message : "This item could not be added to the cart.",
      );
      setToastVisible(true);
    } finally {
      setIsAdding(false);
    }
  }, [addItem, canAdd, itemCount, product, selectedColour, selectedSize, sendBuyerEvent]);

  return (
    <>
      <div className="border-b border-charcoal/10 bg-warm-white/95">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-sm text-charcoal/60 transition-colors hover:text-charcoal"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to shop
          </Link>
        </div>
      </div>

      {isBoardProduct(product) ? (
        <BoardDetail product={product} canAdd={canAdd} isAdding={isAdding} onAddToCart={handleAddToCart} />
      ) : (
        <MerchDetail
          product={product}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          canAdd={canAdd}
          isAdding={isAdding}
          onAddToCart={handleAddToCart}
        />
      )}

      <Toast message={toastMessage} visible={toastVisible} onClose={() => setToastVisible(false)} />
    </>
  );
}

function BoardDetail({
  product,
  canAdd,
  isAdding,
  onAddToCart,
}: {
  product: BoardProduct;
  canAdd: boolean;
  isAdding: boolean;
  onAddToCart: () => void;
}) {
  const sold = product.availabilityStatus === "sold";
  const reserved = product.availabilityStatus === "reserved";

  return (
    <section className="bg-warm-white py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
          <div className="space-y-4">
            <ProductVisual
              productType="board"
              title={product.title}
              images={product.images}
              className="aspect-[4/3] min-h-[22rem]"
              priority
            />
            <div className="grid grid-cols-3 gap-3">
              {["Timber", "Shape", "WA pickup"].map((label) => (
                <div key={label} className="rounded-2xl border border-charcoal/10 bg-ivory/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/45">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal">
                  One-of-a-kind board
                </p>
                <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-brand-gold sm:text-5xl">
                  {product.title}
                </h1>
              </div>
              <StatusPill board={product} />
            </div>

            <p className="mt-4 text-3xl font-semibold text-charcoal">{formatPrice(product)}</p>
            <p className="mt-6 text-base leading-8 text-charcoal/75">{product.description}</p>

            <div className="mt-8 rounded-3xl border border-teal/30 bg-teal/10 p-5">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
                <div>
                  <p className="text-sm font-semibold text-charcoal">No configuration required</p>
                  <p className="mt-1 text-sm leading-6 text-charcoal/70">
                    This deck is already a finished one-off piece. Add it as-is while available; once
                    sold, it is retained in the gallery only.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {product.specs.map((spec) => (
                <div key={spec.label} className="rounded-2xl border border-charcoal/10 bg-ivory/60 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/45">
                    {spec.label}
                  </dt>
                  <dd className="mt-2 text-sm font-semibold text-charcoal">{spec.value}</dd>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-charcoal/10 pt-6">
              <div className="flex justify-between gap-6 text-sm">
                <span className="flex items-center gap-2 text-charcoal/50">
                  <Trees className="h-4 w-4" /> Timber species
                </span>
                <span className="text-right font-medium text-charcoal">
                  {product.timberSpecies.join(" / ")}
                </span>
              </div>
              <div className="flex justify-between gap-6 text-sm">
                <span className="flex items-center gap-2 text-charcoal/50">
                  <Ruler className="h-4 w-4" /> Dimensions
                </span>
                <span className="text-right font-medium text-charcoal">
                  {product.boardDimensions.display}
                </span>
              </div>
              <div className="flex justify-between gap-6 text-sm">
                <span className="text-charcoal/50">Finish palette</span>
                <span className="text-right font-medium text-charcoal">{product.colours.join(", ")}</span>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-charcoal/10 p-4">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-charcoal/50" />
              <div>
                <p className="text-sm font-semibold text-charcoal">Local pickup only</p>
                <p className="mt-0.5 text-xs text-charcoal/65">
                  Built from repurposed WA hardwood and handed over locally by arrangement.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={!canAdd}
              onClick={onAddToCart}
              className={cn(
                "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all",
                canAdd
                  ? "bg-charcoal text-warm-white hover:bg-charcoal/90"
                  : "cursor-not-allowed bg-charcoal/20 text-charcoal/40",
              )}
            >
              <ShoppingBag className="h-4 w-4" />
              {sold
                ? "Sold — view only"
                : reserved
                  ? "Reserved — view only"
                  : isAdding
                    ? "Checking availability..."
                    : "Add one-of-a-kind board to cart"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function MerchDetail({
  product,
  selectedSize,
  setSelectedSize,
  canAdd,
  isAdding,
  onAddToCart,
}: {
  product: MerchProduct;
  selectedSize: MerchSize | null;
  setSelectedSize: (size: MerchSize) => void;
  canAdd: boolean;
  isAdding: boolean;
  onAddToCart: () => void;
}) {
  return (
    <section className="bg-warm-white py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[2rem] border border-charcoal/10 bg-ivory/40 p-5 shadow-sm sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
          <ProductVisual
            productType="merch"
            title={product.title}
            images={product.images}
            className="aspect-square min-h-[20rem]"
            priority
          />

          <div className="flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-coral">
              Repeatable merch
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-brand-gold sm:text-5xl">
              {product.title}
            </h1>
            <p className="mt-4 text-3xl font-semibold text-charcoal">{formatPrice(product)}</p>
            <p className="mt-6 text-base leading-8 text-charcoal/75">{product.description}</p>

            <div className="mt-8 border-t border-charcoal/10 pt-6">
              <label className="text-sm font-semibold text-charcoal">
                {product.sizeRequired ? "Select size" : "Size"}
                {product.sizeRequired && <span className="text-red-600"> *</span>}
              </label>
              <p className="mt-1 text-xs text-charcoal/55">{product.fitNotes}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                      selectedSize === size
                        ? "border-charcoal bg-charcoal text-warm-white"
                        : "border-charcoal/20 bg-warm-white text-charcoal hover:border-charcoal/40",
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-charcoal/10 pt-6">
              <div className="flex justify-between gap-6 text-sm">
                <span className="text-charcoal/50">Material</span>
                <span className="text-right font-medium text-charcoal">{product.material}</span>
              </div>
              <div className="flex justify-between gap-6 text-sm">
                <span className="text-charcoal/50">Palette</span>
                <span className="text-right font-medium text-charcoal">{product.colours.join(", ")}</span>
              </div>
              <div className="flex justify-between gap-6 text-sm">
                <span className="text-charcoal/50">Fulfilment</span>
                <span className="text-right font-medium text-charcoal">Western Australia local pickup</span>
              </div>
            </div>

            <button
              type="button"
              disabled={!canAdd}
              onClick={onAddToCart}
              className={cn(
                "mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all",
                canAdd
                  ? "bg-charcoal text-warm-white hover:bg-charcoal/90"
                  : "cursor-not-allowed bg-charcoal/20 text-charcoal/40",
              )}
            >
              <ShoppingBag className="h-4 w-4" />
              {isAdding ? "Adding..." : product.inStock ? "Add merch to cart" : "Out of stock"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
