// lib/types.ts

export type BoardStyleLabel = "Cruiser" | "Longboard" | "Surfskate" | "Custom / not sure";

export type ProductType = "board" | "merch";

export type BoardAvailabilityStatus = "available" | "sold" | "reserved";

export type BoardStyle = "cruiser" | "surfskate" | "longboard";

export type MerchKind = "tee" | "flanno" | "sticker_pack";

export type MerchSize = "S" | "M" | "L" | "XL" | "One size";

export type ProductCategory =
  | "One-of-a-kind boards"
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

export interface ProductDimensions {
  display: string;
  lengthInches?: number;
  widthInches?: number;
  thicknessInches?: number;
  lengthCm?: number;
  widthCm?: number;
  thicknessCm?: number;
  wheelbaseInches?: number;
}

interface BaseProduct {
  /** App-level product ID. For Shopify products, this is the Shopify global ID. */
  id: string;
  /** URL-safe product handle (slug). */
  handle: string;
  title: string;
  price: number;
  currency: string;
  category: ProductCategory;
  description: string;
  productType: ProductType;
  images: string[];

  /** Legacy compatibility fields used by existing cart, admin, and checkout code paths. */
  material: string;
  dimensions: string;
  colours: string[];
  boardStyles: BoardStyleLabel[];
  inStock: boolean;

  // --- Shopify-specific identifiers (preserved for downstream use) ---

  /** Shopify global product ID, e.g. "gid://shopify/Product/123". Null for mock data. */
  shopifyProductId?: string | null;
  /** Shopify global variant ID for the default/base variant. Null for mock data. */
  shopifyVariantId?: string | null;

  // --- Extended catalogue fields ---

  /** Design family grouping, e.g. "Cruiser", "Longboard", "Merch". */
  designFamily?: string | null;
  /** Compatible board styles as raw strings from Shopify before normalisation. */
  compatibleBoardStyles?: string[] | null;
  /** Production notes from Shopify metafield. */
  productionNotes?: string | null;

  // --- Future-ready metadata ---

  metadata?: ProductMetadata | null;
}

export interface BoardProduct extends BaseProduct {
  productType: "board";
  category: "One-of-a-kind boards" | "Reclaimed cruisers" | "Surfskate deckz" | "Longboard deckz";
  availabilityStatus: BoardAvailabilityStatus;
  timberSpecies: string[];
  boardStyle: BoardStyle;
  boardShape: string;
  boardDimensions: ProductDimensions;
  specs: Array<{ label: string; value: string }>;
  galleryNotes: string;
}

export interface MerchProduct extends BaseProduct {
  productType: "merch";
  category: "Merch";
  merchKind: MerchKind;
  sizes: MerchSize[];
  sizeRequired: boolean;
  fitNotes: string;
}

export type Product = BoardProduct | MerchProduct;

export function isBoardProduct(product: Product): product is BoardProduct {
  return product.productType === "board";
}

export function isMerchProduct(product: Product): product is MerchProduct {
  return product.productType === "merch";
}
