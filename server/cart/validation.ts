import "server-only";
import { getProducts } from "@/lib/catalogue";
import { SALES_ENABLED } from "@/lib/commerce-config";
import {
  preflightCartInput,
  salesDisabledCartResult,
  validateCartItems,
  type CartValidationInput,
  type CartValidationResult,
} from "./validation-core";

export type {
  CheckoutCartItemInput,
  CartValidationInput,
  ValidationError,
  VerifiedCartItem,
  CartValidationResult,
} from "./validation-core";

export async function validateCartForCheckout(
  input: CartValidationInput,
): Promise<CartValidationResult> {
  if (!SALES_ENABLED) return salesDisabledCartResult();
  const preflight = preflightCartInput(input);
  if (preflight) return preflight;
  return validateCartItems(input, await getProducts());
}
