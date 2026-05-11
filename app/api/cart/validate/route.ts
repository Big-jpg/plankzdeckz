// app/api/cart/validate/route.ts
// Server-side cart validation endpoint.
// Validates cart items against the catalogue (Shopify or mock) before checkout.
// The server does NOT trust client-side prices — it verifies each item's price
// against the authoritative catalogue source.

import { NextResponse, type NextRequest } from "next/server";
import { validateCartForCheckout, type CartValidationResult } from "@/server/cart/validation";

type PublicValidationResult = Omit<CartValidationResult, "verifiedItems">;

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
