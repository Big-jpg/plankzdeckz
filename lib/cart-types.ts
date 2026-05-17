// lib/cart-types.ts
//
// Cart item shape and related types for the PLANKZ DECKZ storefront.
// Cart is client-side only (localStorage) — no backend persistence yet.

import type { AdapterType, MerchSize, ProductType } from "./types";

export interface CartItem {
  /** App-level product ID (Shopify global ID or mock ID). */
  productId: string;
  /** Shopify variant ID or null for mock products. */
  variantId: string | null;
  /** URL-safe product handle (slug). */
  handle: string;
  /** Product title. */
  title: string;
  /** Variant title (e.g. colour/size label), empty string if single-variant. */
  variantTitle: string;
  /** Primary product image URL. */
  imageUrl: string;
  /** Unit price in the product's currency (numeric, not cents). */
  unitPrice: number;
  /** ISO currency code, e.g. "AUD". */
  currency: string;
  /** Quantity of this item in the cart. Must be >= 1. */
  quantity: number;
  /** Product behaviour class. Defaults to "board" for legacy cart payloads. */
  productType?: ProductType;
  /** Selected merch size. Boards do not use this field. */
  selectedSize?: MerchSize;
  /** Selected ride/build adapter. Preserved for backend compatibility. */
  selectedAdapter: AdapterType;
  /** Whether the customer has acknowledged local pickup and handmade build terms. Tracked at cart level, not per-item. */
  bulbTypeConfirmed: boolean;
  /** Build notes from the customer (required when board type is "Custom / not sure"). */
  fixtureNotes: string;
  /** Optional free-text customisation notes from the customer. */
  customisationNotes: string;
  /** Product material. */
  material: string;
  /** Selected colour. */
  colour: string;
  /** Arbitrary metadata for future use. */
  metadata: Record<string, string> | null;
}

/**
 * Generates a deterministic key for deduplicating cart items.
 * Two items are considered the same if they share productId + variantId + behaviour metadata.
 */
export function cartItemKey(
  item: Pick<
    CartItem,
    "productId" | "variantId" | "selectedAdapter" | "colour" | "productType" | "selectedSize"
  >,
): string {
  return `${item.productId}::${item.variantId ?? "null"}::${item.productType ?? "board"}::${item.selectedAdapter}::${item.selectedSize ?? "none"}::${item.colour}`;
}

export interface CartState {
  items: CartItem[];
  /** Cart-level local pickup and handmade build acknowledgement. */
  ledAcknowledged: boolean;
}

export const EMPTY_CART: CartState = {
  items: [],
  ledAcknowledged: false,
};

export const CART_STORAGE_KEY = "plankz_cart_v1";
