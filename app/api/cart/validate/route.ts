// app/api/cart/validate/route.ts
// Server-side cart validation endpoint.
// When sales are enabled, validates cart items against the authoritative catalogue.
// The server does NOT trust client-side prices — it verifies each item's price
// against the authoritative catalogue source.

import { NextResponse, type NextRequest } from "next/server";
import { validateCartForCheckout, type CartValidationResult } from "@/server/cart/validation";
import { salesDisabledCartResult } from "@/server/cart/validation-core";
import { SALES_ENABLED, SALES_DISABLED_CODE } from "@/lib/commerce-config";

type PublicValidationResult = Omit<CartValidationResult, "verifiedItems"> & { code?: string };

function publicResult(result: CartValidationResult): PublicValidationResult {
  return {
    valid: result.valid,
    errors: result.errors,
    verifiedSubtotal: result.verifiedSubtotal,
    retailSubtotal: result.retailSubtotal,
    discountAmount: result.discountAmount,
    lineQuotes: result.lineQuotes,
    claimedSubtotal: result.claimedSubtotal,
    currency: result.currency,
    itemCount: result.itemCount,
  };
}

function unavailableResult(field: string, message: string): PublicValidationResult {
  return {
    valid: false,
    errors: [{ handle: "", field, message }],
    verifiedSubtotal: 0,
    retailSubtotal: 0,
    discountAmount: 0,
    lineQuotes: [],
    claimedSubtotal: 0,
    currency: "AUD",
    itemCount: 0,
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<PublicValidationResult>> {
  if (!SALES_ENABLED) {
    return NextResponse.json(
      { ...publicResult(salesDisabledCartResult()), code: SALES_DISABLED_CODE },
      { status: 403 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(unavailableResult("body", "Invalid JSON body."), { status: 400 });
  }

  try {
    const result = await validateCartForCheckout(
      body && typeof body === "object" ? body : { items: undefined },
    );
    return NextResponse.json(publicResult(result), { status: result.valid ? 200 : 422 });
  } catch {
    return NextResponse.json(
      unavailableResult("pricing", "Prices could not be confirmed. Try again shortly."),
      { status: 503 },
    );
  }
}
