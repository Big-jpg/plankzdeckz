// lib/types.ts

export type AdapterType = "Cruiser" | "Longboard" | "Surfskate" | "Custom / not sure";

export type ProductCategory =
  | "Reclaimed cruisers"
  | "Surfskate deckz"
  | "Longboard deckz"
  | "Custom builds"
  | "Merch"
  | "Experimental prototypes";

/**
 * Future-ready metadata fields from the original commerce scaffold.
 * These are optional and populated from Shopify metafields when available.
 */
export interface ProductMetadata {
  market_event_id?: string;
  market_source?: string;
  qr_campaign?: string;
  display_sample_id?: string;
  production_queue_status?: string;
  timber_material?: string;
  timber_finish?: string;
  build_profile?: string;
}

export interface Product {
  /** App-level product ID. For Shopify products, this is the Shopify global ID. */
  id: string;
  /** URL-safe product handle (slug). */
  handle: string;
  title: string;
  price: number;
  currency: string;
  category: ProductCategory;
  description: string;
  material: string;
  dimensions: string;
  colours: string[];
  images: string[];
  /** Board build types compatible with this product. */
  adapters: AdapterType[];
  inStock: boolean;

  // --- Shopify-specific identifiers (preserved for downstream use) ---

  /** Shopify global product ID, e.g. "gid://shopify/Product/123". Null for mock data. */
  shopifyProductId?: string | null;
  /** Shopify global variant ID for the default/base variant. Null for mock data. */
  shopifyVariantId?: string | null;

  // --- Extended catalogue fields ---

  /** Design family grouping, e.g. "Cruiser", "Longboard". */
  designFamily?: string | null;
  /** Compatible board types as raw strings from Shopify before normalisation. */
  compatibleAdapters?: string[] | null;
  /** Production notes from Shopify metafield. */
  productionNotes?: string | null;

  // --- Future-ready metadata ---

  metadata?: ProductMetadata | null;
}
