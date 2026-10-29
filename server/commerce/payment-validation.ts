import type Stripe from "stripe";
import type { VerifiedCartItem } from "@/server/cart/validation-core";

export function assertPaidSession(
  session: Stripe.Checkout.Session,
  lines: Stripe.LineItem[],
  items: VerifiedCartItem[],
  expectedAmount: number,
) {
  if (session.mode !== "payment" || session.payment_status !== "paid")
    throw new Error("Payment is not confirmed.");
  if (
    session.currency?.toUpperCase() !== "AUD" ||
    session.amount_total !== expectedAmount ||
    session.amount_subtotal !== expectedAmount
  )
    throw new Error("Payment amount or currency does not match the reservation.");
  if (!items.length || lines.length !== items.length)
    throw new Error("Payment item count does not match the reservation.");
  const remaining = new Map(
    items.map((item) => [`${item.productId}:${item.selectedSize ?? ""}`, item]),
  );
  for (const line of lines) {
    const product = line.price?.product;
    if (!product || typeof product === "string" || product.deleted)
      throw new Error("Payment product metadata is missing.");
    const item = remaining.get(
      `${product.metadata.product_id}:${product.metadata.merch_size ?? ""}`,
    );
    if (
      !item ||
      product.metadata.product_type !== item.productType ||
      line.quantity !== item.quantity ||
      line.price?.unit_amount !== item.unitAmount ||
      line.amount_total !== item.totalAmount ||
      line.currency.toUpperCase() !== "AUD"
    )
      throw new Error("Payment items do not match the reservation.");
    remaining.delete(`${item.productId}:${item.selectedSize ?? ""}`);
  }
  if (remaining.size) throw new Error("Payment items are incomplete.");
}
