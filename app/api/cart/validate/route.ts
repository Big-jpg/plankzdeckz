// app/api/cart/validate/route.ts
//
// Server-side cart validation endpoint.
// Validates cart items against the catalogue (Shopify or mock) before checkout.
// The server does NOT trust client-side prices — it verifies each item's price
// against the authoritative catalogue source.

import { NextResponse, type NextRequest } from "next/server";
import { getProducts } from "@/lib/catalogue";
import type { AdapterType } from "@/lib/types";

// ---------------------------------------------------------------------------
// Request / response types
// ---------------------------------------------------------------------------

interface CartItemPayload {
  productId: string;
  variantId: string | null;
  handle: string;
  title: string;
  unitPrice: number;
  currency: string;
  quantity: number;
  selectedAdapter: string;
  colour: string;
}

interface ValidationError {
  handle: string;
  field: string;
  message: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  /** Server-verified subtotal (sum of catalogue price * quantity). */
  verifiedSubtotal: number;
  /** Client-claimed subtotal (sum of client unitPrice * quantity). */
  claimedSubtotal: number;
  /** Currency from catalogue. */
  currency: string;
  /** Number of items validated. */
  itemCount: number;
}

// ---------------------------------------------------------------------------
// Adapter validation
// ---------------------------------------------------------------------------

const VALID_ADAPTERS: AdapterType[] = ["B22", "E27", "Clipsal No. 530", "Other / not sure"];

function isValidAdapter(value: string): value is AdapterType {
  return VALID_ADAPTERS.includes(value as AdapterType);
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse<ValidationResult>> {
  let body: { items?: CartItemPayload[] };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        valid: false,
        errors: [{ handle: "", field: "body", message: "Invalid JSON body." }],
        verifiedSubtotal: 0,
        claimedSubtotal: 0,
        currency: "AUD",
        itemCount: 0,
      },
      { status: 400 },
    );
  }

  const items = body.items;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      {
        valid: false,
        errors: [{ handle: "", field: "items", message: "Cart must contain at least one item." }],
        verifiedSubtotal: 0,
        claimedSubtotal: 0,
        currency: "AUD",
        itemCount: 0,
      },
      { status: 400 },
    );
  }

  // Fetch the full catalogue once
  const catalogue = await getProducts();
  const catalogueByHandle = new Map(catalogue.map((p) => [p.handle, p]));

  const errors: ValidationError[] = [];
  let verifiedSubtotal = 0;
  let claimedSubtotal = 0;
  let currency = "AUD";

  for (const item of items) {
    // --- Basic field validation ---

    if (!item.handle || typeof item.handle !== "string") {
      errors.push({
        handle: item.handle ?? "unknown",
        field: "handle",
        message: "Missing or invalid handle.",
      });
      continue;
    }

    if (
      typeof item.quantity !== "number" ||
      item.quantity < 1 ||
      !Number.isInteger(item.quantity)
    ) {
      errors.push({
        handle: item.handle,
        field: "quantity",
        message: "Quantity must be a positive integer.",
      });
      continue;
    }

    if (!item.selectedAdapter || !isValidAdapter(item.selectedAdapter)) {
      errors.push({
        handle: item.handle,
        field: "selectedAdapter",
        message: `Invalid adapter selection: "${item.selectedAdapter}". Must be one of: ${VALID_ADAPTERS.join(", ")}.`,
      });
    }

    // --- Catalogue lookup ---

    const catalogueProduct = catalogueByHandle.get(item.handle);

    if (!catalogueProduct) {
      errors.push({
        handle: item.handle,
        field: "handle",
        message: `Product "${item.handle}" not found in catalogue.`,
      });
      continue;
    }

    // Verify product is in stock
    if (!catalogueProduct.inStock) {
      errors.push({
        handle: item.handle,
        field: "inStock",
        message: `Product "${item.handle}" is currently out of stock.`,
      });
    }

    // --- Price verification ---
    // The server uses the catalogue price as the source of truth.

    currency = catalogueProduct.currency;
    const cataloguePrice = catalogueProduct.price;
    const clientPrice = item.unitPrice;

    if (typeof clientPrice !== "number" || clientPrice < 0) {
      errors.push({ handle: item.handle, field: "unitPrice", message: "Invalid unit price." });
    } else if (Math.abs(clientPrice - cataloguePrice) > 0.01) {
      errors.push({
        handle: item.handle,
        field: "unitPrice",
        message: `Price mismatch: client sent $${clientPrice.toFixed(2)}, catalogue price is $${cataloguePrice.toFixed(2)}.`,
      });
    }

    // --- Currency verification ---

    if (item.currency && item.currency !== catalogueProduct.currency) {
      errors.push({
        handle: item.handle,
        field: "currency",
        message: `Currency mismatch: client sent "${item.currency}", catalogue uses "${catalogueProduct.currency}".`,
      });
    }

    // --- Adapter compatibility ---

    if (
      isValidAdapter(item.selectedAdapter) &&
      catalogueProduct.adapters.length > 0 &&
      !catalogueProduct.adapters.includes(item.selectedAdapter as AdapterType)
    ) {
      errors.push({
        handle: item.handle,
        field: "selectedAdapter",
        message: `Adapter "${item.selectedAdapter}" is not compatible with this product. Compatible: ${catalogueProduct.adapters.join(", ")}.`,
      });
    }

    verifiedSubtotal += cataloguePrice * item.quantity;
    claimedSubtotal += (clientPrice ?? 0) * item.quantity;
  }

  const valid = errors.length === 0;

  return NextResponse.json(
    {
      valid,
      errors,
      verifiedSubtotal: Math.round(verifiedSubtotal * 100) / 100,
      claimedSubtotal: Math.round(claimedSubtotal * 100) / 100,
      currency,
      itemCount: items.length,
    },
    { status: valid ? 200 : 422 },
  );
}
