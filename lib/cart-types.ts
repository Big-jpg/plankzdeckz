// lib/cart-types.ts
//
// Cart item shape and related types for the PLANKZ DECKZ storefront.
// Cart is client-side only (localStorage) — no backend persistence yet.

import type { MerchSize, ProductType } from "./types";

export interface CartItem {
  /** App-level product ID (Shopify global ID or mock ID). */
  productId: string;
  /** Shopify variant ID or null for mock products. */
  variantId: string | null;
  /** URL-safe product handle (slug). */
  handle: string;
  /** Product title. */
  title: string;
  /** Variant title (e.g. size label), empty string if single-variant. */
  variantTitle: string;
  /** Primary product image URL. */
  imageUrl: string;
  /** Unit price in the product's currency (numeric, not cents). */
  unitPrice: number;
  /** ISO currency code, e.g. "AUD". */
  currency: string;
  /** Quantity of this item in the cart. Boards are always quantity 1. */
  quantity: number;
  /** Product behaviour class. Defaults to "board" for legacy cart payloads. */
  productType?: ProductType;
  /** Selected merch size. Boards do not use this field. */
  selectedSize?: MerchSize;
  /** Product material or timber summary. */
  material: string;
  /** Selected colour or palette summary. */
  colour: string;
  /** Arbitrary metadata for checkout and order reconstruction. */
  metadata: Record<string, string> | null;
}

/**
 * Generates a deterministic key for deduplicating cart items.
 * Boards are one-of-a-kind, while merch is separated by selected size.
 */
export function cartItemKey(
  item: Pick<CartItem, "productId" | "variantId" | "productType" | "selectedSize">,
): string {
  return `${item.productId}::${item.variantId ?? "null"}::${item.productType ?? "board"}::${item.selectedSize ?? "none"}`;
}

export interface CartState {
  items: CartItem[];
}

export const EMPTY_CART: CartState = {
  items: [],
};

export const CART_STORAGE_KEY = "plankz_cart_v2";
