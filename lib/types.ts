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
  publicationStatus?: "draft" | "published" | "archived";
  imageDetails?: Array<{ url: string; alt: string }>;
  stockBySize?: Record<string, number>;
  stockQuantity?: number;
  /** Stable Postgres product ID. */
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
