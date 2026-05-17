// server/cart/validation.ts
// PLANKZ DECKZ — Shared server-side cart validation for checkout.

import "server-only";

import { getProducts } from "@/lib/catalogue";
import type { AdapterType, MerchSize, Product, ProductType } from "@/lib/types";
import { isBoardProduct, isMerchProduct } from "@/lib/types";

export interface CheckoutCartItemInput {
  productId?: unknown;
  variantId?: unknown;
  handle?: unknown;
  title?: unknown;
  variantTitle?: unknown;
  imageUrl?: unknown;
  unitPrice?: unknown;
  currency?: unknown;
  quantity?: unknown;
  productType?: unknown;
  selectedSize?: unknown;
  selectedAdapter?: unknown;
  bulbTypeConfirmed?: unknown;
  fixtureNotes?: unknown;
  customisationNotes?: unknown;
  material?: unknown;
  colour?: unknown;
  metadata?: unknown;
}

export interface CartValidationInput {
  items?: unknown;
  ledAcknowledged?: unknown;
}

export interface ValidationError {
  handle: string;
  field: string;
  message: string;
}

export interface VerifiedCartItem {
  productId: string;
  variantId: string | null;
  handle: string;
  title: string;
  variantTitle: string | null;
  imageUrl: string | null;
  unitPrice: number;
  unitAmount: number;
  totalAmount: number;
  currency: string;
  quantity: number;
  productType: ProductType;
  selectedSize: MerchSize | null;
  selectedAdapter: AdapterType;
  bulbTypeConfirmed: boolean;
  fixtureNotes: string | null;
  customisationNotes: string | null;
  material: string | null;
  colour: string | null;
  metadata: Record<string, unknown>;
  catalogueProduct: Product;
}

export interface CartValidationResult {
  valid: boolean;
  errors: ValidationError[];
  verifiedSubtotal: number;
  claimedSubtotal: number;
  currency: string;
  itemCount: number;
  verifiedItems: VerifiedCartItem[];
}

export interface CartValidationOptions {
  requireLedAcknowledgement?: boolean;
}

const VALID_ADAPTERS: AdapterType[] = ["Cruiser", "Longboard", "Surfskate", "Custom / not sure"];
const VALID_MERCH_SIZES: MerchSize[] = ["S", "M", "L", "XL", "One size"];

function isValidAdapter(value: unknown): value is AdapterType {
  return typeof value === "string" && VALID_ADAPTERS.includes(value as AdapterType);
}

function isValidMerchSize(value: unknown): value is MerchSize {
  return typeof value === "string" && VALID_MERCH_SIZES.includes(value as MerchSize);
}

function optionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function optionalStringWithFallback(primary: unknown, fallback: unknown): string | null {
  return optionalString(primary) ?? optionalString(fallback);
}

function normaliseMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).filter(([key]) => typeof key === "string" && key.length > 0),
  );
}

function emptyResult(errors: ValidationError[], statusCurrency = "AUD"): CartValidationResult {
  return {
    valid: false,
    errors,
    verifiedSubtotal: 0,
    claimedSubtotal: 0,
    currency: statusCurrency,
    itemCount: 0,
    verifiedItems: [],
  };
}

export async function validateCartForCheckout(
  input: CartValidationInput,
  options: CartValidationOptions = {},
): Promise<CartValidationResult> {
  const rawItems = input.items;
  const requireLedAcknowledgement = options.requireLedAcknowledgement ?? false;
  const errors: ValidationError[] = [];

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return emptyResult([
      { handle: "", field: "items", message: "Cart must contain at least one item." },
    ]);
  }

  if (requireLedAcknowledgement && input.ledAcknowledged !== true) {
    errors.push({
      handle: "",
      field: "ledAcknowledged",
      message: "Reclaimed-deck safety acknowledgement is required before checkout.",
    });
  }

  const catalogue = await getProducts();
  const catalogueByHandle = new Map(catalogue.map((product) => [product.handle, product]));

  const verifiedItems: VerifiedCartItem[] = [];
  let verifiedSubtotal = 0;
  let claimedSubtotal = 0;
  let currency = "AUD";

  for (const rawItem of rawItems as unknown[]) {
    if (!rawItem || typeof rawItem !== "object") {
      errors.push({ handle: "unknown", field: "item", message: "Invalid cart item." });
      continue;
    }

    const item = rawItem as CheckoutCartItemInput;
    const handle = typeof item.handle === "string" ? item.handle : "unknown";

    if (!item.handle || typeof item.handle !== "string") {
      errors.push({ handle, field: "handle", message: "Missing or invalid handle." });
      continue;
    }

    if (
      typeof item.quantity !== "number" ||
      item.quantity < 1 ||
      !Number.isInteger(item.quantity)
    ) {
      errors.push({
        handle,
        field: "quantity",
        message: "Quantity must be a positive integer.",
      });
      continue;
    }

    if (!isValidAdapter(item.selectedAdapter)) {
      errors.push({
        handle,
        field: "selectedAdapter",
        message: `Invalid board type selection: "${String(item.selectedAdapter)}". Must be one of: ${VALID_ADAPTERS.join(", ")}.`,
      });
      continue;
    }

    const fixtureNotes = optionalString(item.fixtureNotes);

    const catalogueProduct = catalogueByHandle.get(item.handle);

    if (!catalogueProduct) {
      errors.push({
        handle,
        field: "handle",
        message: `Product "${item.handle}" not found in catalogue.`,
      });
      continue;
    }

    const productType: ProductType = catalogueProduct.productType;

    if (item.productType && item.productType !== productType) {
      errors.push({
        handle,
        field: "productType",
        message: `Product type mismatch: client sent "${String(item.productType)}", catalogue uses "${productType}".`,
      });
    }

    if (!catalogueProduct.inStock) {
      errors.push({
        handle,
        field: "inStock",
        message: `Product "${item.handle}" is currently out of stock.`,
      });
    }

    if (isBoardProduct(catalogueProduct) && catalogueProduct.availabilityStatus !== "available") {
      errors.push({
        handle,
        field: "availabilityStatus",
        message: `Board "${item.handle}" is marked ${catalogueProduct.availabilityStatus} and cannot be checked out.`,
      });
    }

    let selectedSize: MerchSize | null = null;

    if (isMerchProduct(catalogueProduct)) {
      if (item.selectedSize === undefined || item.selectedSize === null) {
        if (catalogueProduct.sizeRequired) {
          errors.push({
            handle,
            field: "selectedSize",
            message: "A merch size is required for this product.",
          });
        } else {
          selectedSize = catalogueProduct.sizes[0] ?? "One size";
        }
      } else if (!isValidMerchSize(item.selectedSize)) {
        errors.push({
          handle,
          field: "selectedSize",
          message: `Invalid merch size: "${String(item.selectedSize)}".`,
        });
      } else if (!catalogueProduct.sizes.includes(item.selectedSize)) {
        errors.push({
          handle,
          field: "selectedSize",
          message: `Size "${item.selectedSize}" is not available for this product. Available: ${catalogueProduct.sizes.join(", ")}.`,
        });
      } else {
        selectedSize = item.selectedSize;
      }
    }

    if (isBoardProduct(catalogueProduct) && item.selectedAdapter === "Custom / not sure" && !fixtureNotes) {
      errors.push({
        handle,
        field: "fixtureNotes",
        message: "Build notes are required when the selected board type is Custom / not sure.",
      });
    }

    currency = catalogueProduct.currency;
    const cataloguePrice = catalogueProduct.price;
    const clientPrice = item.unitPrice;

    if (typeof clientPrice !== "number" || clientPrice < 0) {
      errors.push({ handle, field: "unitPrice", message: "Invalid unit price." });
    } else if (Math.abs(clientPrice - cataloguePrice) > 0.01) {
      errors.push({
        handle,
        field: "unitPrice",
        message: `Price mismatch: client sent $${clientPrice.toFixed(2)}, catalogue price is $${cataloguePrice.toFixed(2)}.`,
      });
    }

    if (item.currency && item.currency !== catalogueProduct.currency) {
      errors.push({
        handle,
        field: "currency",
        message: `Currency mismatch: client sent "${String(item.currency)}", catalogue uses "${catalogueProduct.currency}".`,
      });
    }

    if (
      isBoardProduct(catalogueProduct) &&
      catalogueProduct.adapters.length > 0 &&
      !catalogueProduct.adapters.includes(item.selectedAdapter)
    ) {
      errors.push({
        handle,
        field: "selectedAdapter",
        message: `Board type "${item.selectedAdapter}" is not compatible with this product. Compatible: ${catalogueProduct.adapters.join(", ")}.`,
      });
    }

    const unitAmount = Math.round(cataloguePrice * 100);
    const totalAmount = unitAmount * item.quantity;
    verifiedSubtotal += cataloguePrice * item.quantity;
    claimedSubtotal += (typeof clientPrice === "number" ? clientPrice : 0) * item.quantity;

    verifiedItems.push({
      productId: optionalString(item.productId) ?? catalogueProduct.id,
      variantId: optionalStringWithFallback(item.variantId, catalogueProduct.shopifyVariantId),
      handle: item.handle,
      title: optionalString(item.title) ?? catalogueProduct.title,
      variantTitle: optionalString(item.variantTitle),
      imageUrl: optionalString(item.imageUrl) ?? catalogueProduct.images[0] ?? null,
      unitPrice: cataloguePrice,
      unitAmount,
      totalAmount,
      currency: catalogueProduct.currency,
      quantity: item.quantity,
      productType,
      selectedSize,
      selectedAdapter: item.selectedAdapter,
      bulbTypeConfirmed: input.ledAcknowledged === true || item.bulbTypeConfirmed === true,
      fixtureNotes,
      customisationNotes: optionalString(item.customisationNotes),
      material: optionalString(item.material) ?? catalogueProduct.material,
      colour: optionalString(item.colour),
      metadata: normaliseMetadata(item.metadata),
      catalogueProduct,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    verifiedSubtotal: Math.round(verifiedSubtotal * 100) / 100,
    claimedSubtotal: Math.round(claimedSubtotal * 100) / 100,
    currency,
    itemCount: rawItems.length,
    verifiedItems,
  };
}
