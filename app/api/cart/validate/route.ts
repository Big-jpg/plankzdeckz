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
    claimedSubtotal: result.claimedSubtotal,
    currency: result.currency,
    itemCount: result.itemCount,
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

  const result = await validateCartForCheckout(
    body && typeof body === "object" ? body : { items: undefined },
  );

  return NextResponse.json(publicResult(result), { status: result.valid ? 200 : 422 });
}
