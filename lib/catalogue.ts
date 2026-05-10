// lib/catalogue.ts
//
// Product data source abstraction.
// Checks for Shopify credentials at runtime:
//   - If SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN are set → Shopify Storefront API
//   - Otherwise → local mock catalogue
//
// All exports are async to support both code paths uniformly.

import type { Product, ProductCategory } from "./types";

// ---------------------------------------------------------------------------
// Data source detection
// ---------------------------------------------------------------------------

function isShopifyConfigured(): boolean {
  return Boolean(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN);
}

// ---------------------------------------------------------------------------
// Mock data imports (lazy, only loaded when Shopify is not configured)
// ---------------------------------------------------------------------------

async function getMockModule() {
  return await import("./mock-products");
}

// ---------------------------------------------------------------------------
// Public catalogue API
// ---------------------------------------------------------------------------

/**
 * Returns all products from the active data source.
 * Server-side only — do not import in client components.
 */
export async function getProducts(): Promise<Product[]> {
  if (isShopifyConfigured()) {
    const { shopifyGetProducts } = await import("./shopify");
    return shopifyGetProducts();
  }
  const mock = await getMockModule();
  return mock.products;
}

/**
 * Returns a single product by its URL handle, or null if not found.
 * Server-side only — do not import in client components.
 */
export async function getProductByHandle(handle: string): Promise<Product | null> {
  if (isShopifyConfigured()) {
    const { shopifyGetProductByHandle } = await import("./shopify");
    return shopifyGetProductByHandle(handle);
  }
  const mock = await getMockModule();
  return mock.getProductByHandle(handle) ?? null;
}

/**
 * Returns the list of product categories.
 * Categories are static and shared between both data sources.
 */
export function getCategories(): ProductCategory[] {
  return [
    "Pleated shades",
    "Faceted / geometric shades",
    "Floral / petal shades",
    "Textured diffuser shades",
    "Starfield / perforated shades",
    "Experimental prototypes",
  ];
}

/**
 * Returns the current catalogue data source name for diagnostics.
 */
export function getCatalogueSource(): "shopify" | "mock" {
  return isShopifyConfigured() ? "shopify" : "mock";
}
