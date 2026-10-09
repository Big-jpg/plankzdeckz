import "server-only";
import { getProducts } from "@/lib/catalogue";
import {
  preflightCartInput,
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
  const preflight = preflightCartInput(input);
  if (preflight) return preflight;
  return validateCartItems(input, await getProducts());
}
