// lib/types.ts

export type AdapterType = "B22" | "E27" | "Clipsal No. 530" | "Other / not sure";

export type ProductCategory =
  | "Pleated shades"
  | "Faceted / geometric shades"
  | "Floral / petal shades"
  | "Textured diffuser shades"
  | "Starfield / perforated shades"
  | "Experimental prototypes";

/**
 * Future-ready metadata fields from the branding doc.
 * These are optional and populated from Shopify metafields when available.
 */
export interface ProductMetadata {
  market_event_id?: string;
  market_source?: string;
  qr_campaign?: string;
  display_sample_id?: string;
  production_queue_status?: string;
  filament_material?: string;
  filament_colour?: string;
  print_profile?: string;
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
  /** Compatible adapter types for this product. */
  adapters: AdapterType[];
  inStock: boolean;

  // --- Shopify-specific identifiers (preserved for downstream use) ---

  /** Shopify global product ID, e.g. "gid://shopify/Product/123". Null for mock data. */
  shopifyProductId?: string | null;
  /** Shopify global variant ID for the default/base variant. Null for mock data. */
  shopifyVariantId?: string | null;

  // --- Extended catalogue fields ---

  /** Design family grouping, e.g. "Meridian", "Cobalt". */
  designFamily?: string | null;
  /** Compatible adapters as raw strings from Shopify (before normalisation). */
  compatibleAdapters?: string[] | null;
  /** Production notes from Shopify metafield. */
  productionNotes?: string | null;

  // --- Future-ready metadata ---

  metadata?: ProductMetadata | null;
}
