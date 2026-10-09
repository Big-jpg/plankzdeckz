import type { Product } from "./types";

interface SaleFacts {
  publicationStatus: unknown;
  productType: unknown;
  merchKind?: unknown;
  priceAmount: unknown;
  currency: unknown;
  displayOnly?: unknown;
  availabilityStatus?: unknown;
  stockQuantity?: unknown;
  sizes?: unknown;
  stockBySize?: unknown;
}

export interface SaleRecord {
  publication_status?: unknown;
  product_type?: unknown;
  merch_kind?: unknown;
  price_amount?: unknown;
  currency?: unknown;
  metadata?: unknown;
  availability_status?: unknown;
  stock_quantity?: unknown;
  merch_sizes?: unknown;
  stock_by_size?: unknown;
}

const supportedSizes = ["S", "M", "L", "XL", "One size"];
const wholeStock = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

export function isPhotoReviewHandle(handle: unknown): boolean {
  return typeof handle === "string" && handle.startsWith("photo-review-");
}

export function hasDisplayOnlyFlag(metadata: unknown): boolean {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return true;
  const values = metadata as Record<string, unknown>;
  // An absent flag preserves existing sales; an unrecognised flag cannot authorise a sale.
  return [values.display_only, values.displayOnly].some(
    (value) => value !== undefined && value !== false,
  );
}

function knownStock(facts: SaleFacts): boolean {
  if (facts.productType === "board") {
    if (!wholeStock(facts.stockQuantity) || facts.stockQuantity > 1) return false;
    if (facts.availabilityStatus === "available") return facts.stockQuantity === 1;
    // Legacy admin actions left sold boards at 1; their gallery details remain valid.
    if (facts.availabilityStatus === "sold") return true;
    return facts.availabilityStatus === "reserved";
  }
  if (
    !Array.isArray(facts.sizes) ||
    !facts.sizes.length ||
    facts.sizes.some((size) => !supportedSizes.includes(size)) ||
    new Set(facts.sizes).size !== facts.sizes.length ||
    !facts.stockBySize ||
    typeof facts.stockBySize !== "object" ||
    Array.isArray(facts.stockBySize)
  )
    return false;
  const stock = facts.stockBySize as Record<string, unknown>;
  return facts.sizes.every((size: string) => wholeStock(stock[size]));
}

function hasSupportedFacts(facts: SaleFacts): boolean {
  return (
    facts.publicationStatus === "published" &&
    (facts.productType === "board" ||
      (facts.productType === "merch" && facts.merchKind === "tee")) &&
    typeof facts.priceAmount === "number" &&
    Number.isSafeInteger(facts.priceAmount) &&
    facts.priceAmount > 0 &&
    typeof facts.currency === "string" &&
    facts.currency.toUpperCase() === "AUD" &&
    (facts.displayOnly === undefined || facts.displayOnly === false) &&
    knownStock(facts)
  );
}

function purchasableFacts(facts: SaleFacts): boolean {
  if (!hasSupportedFacts(facts)) return false;
  if (facts.productType === "board")
    return facts.availabilityStatus === "available" && facts.stockQuantity === 1;
  const stock = facts.stockBySize as Record<string, number>;
  return (facts.sizes as string[]).some((size) => stock[size] > 0);
}

function productFacts(product: Product): SaleFacts {
  const cents = product.price * 100;
  return {
    publicationStatus: product.publicationStatus,
    productType: product.productType,
    merchKind: product.productType === "merch" ? product.merchKind : undefined,
    priceAmount:
      Number.isFinite(cents) && Math.abs(cents - Math.round(cents)) < 0.000001
        ? Math.round(cents)
        : NaN,
    currency: product.currency,
    displayOnly: product.displayOnly,
    availabilityStatus: product.productType === "board" ? product.availabilityStatus : undefined,
    stockQuantity: product.stockQuantity,
    sizes: product.productType === "merch" ? product.sizes : undefined,
    stockBySize: product.stockBySize,
  };
}

function recordFacts(record: SaleRecord): SaleFacts {
  return {
    publicationStatus: record.publication_status,
    productType: record.product_type,
    merchKind: record.merch_kind,
    priceAmount: record.price_amount,
    currency: record.currency,
    displayOnly: hasDisplayOnlyFlag(record.metadata),
    availabilityStatus: record.availability_status,
    stockQuantity: record.stock_quantity,
    sizes: record.merch_sizes,
    stockBySize: record.stock_by_size,
  };
}

export function hasSupportedSaleDetails(product: Product): boolean {
  return !isPhotoReviewHandle(product.handle) && hasSupportedFacts(productFacts(product));
}

export function isPurchasableProduct(product: Product): boolean {
  return !isPhotoReviewHandle(product.handle) && purchasableFacts(productFacts(product));
}

export function isPurchasableRecord(record: SaleRecord): boolean {
  return purchasableFacts(recordFacts(record));
}

export function canReserveLockedProduct(
  record: SaleRecord,
  item: {
    productType: unknown;
    unitAmount: unknown;
    currency: unknown;
    selectedSize: string | null;
    quantity: number;
  },
): boolean {
  if (
    !isPurchasableRecord(record) ||
    record.product_type !== item.productType ||
    record.price_amount !== item.unitAmount ||
    typeof item.currency !== "string" ||
    typeof record.currency !== "string" ||
    record.currency.toUpperCase() !== item.currency.toUpperCase() ||
    !Number.isSafeInteger(item.quantity) ||
    item.quantity < 1
  )
    return false;
  if (record.product_type === "board") return item.quantity === 1;
  return (
    item.selectedSize !== null &&
    (record.merch_sizes as string[]).includes(item.selectedSize) &&
    (record.stock_by_size as Record<string, number>)[item.selectedSize] >= item.quantity
  );
}
