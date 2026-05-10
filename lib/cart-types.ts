// lib/cart-types.ts
//
// Cart item shape and related types for the Lumenform Studio storefront.
// Cart is client-side only (localStorage) — no backend persistence yet.

import type { AdapterType } from "./types";

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
  /** Selected fitting adapter — required before add-to-cart. */
  selectedAdapter: AdapterType;
  /** Whether the customer has confirmed LED-only bulb usage. Tracked at cart level, not per-item. */
  bulbTypeConfirmed: boolean;
  /** Notes about the customer's fixture (required when adapter is "Other / not sure"). */
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
 * Two items are considered the same if they share productId + variantId + selectedAdapter + colour.
 */
export function cartItemKey(
  item: Pick<CartItem, "productId" | "variantId" | "selectedAdapter" | "colour">,
): string {
  return `${item.productId}::${item.variantId ?? "null"}::${item.selectedAdapter}::${item.colour}`;
}

export interface CartState {
  items: CartItem[];
  /** Cart-level LED bulb acknowledgement. */
  ledAcknowledged: boolean;
}

export const EMPTY_CART: CartState = {
  items: [],
  ledAcknowledged: false,
};

export const CART_STORAGE_KEY = "lumenform_cart_v1";
