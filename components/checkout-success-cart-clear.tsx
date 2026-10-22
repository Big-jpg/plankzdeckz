"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/lib/cart-context";
import { cartItemKey } from "@/lib/cart-types";

export function CheckoutSuccessCartClear({
  orderId,
  items,
}: {
  orderId: string;
  items: Array<{ productId: string; size: string | null; quantity: number }>;
}) {
  const { state, isHydrated, setQuantity } = useCart();
  const handled = useRef(false);
  useEffect(() => {
    if (!isHydrated || handled.current) return;
    handled.current = true;
    const marker = `plankz_order_cleared:${orderId}`;
    try {
      if (localStorage.getItem(marker)) return;
      localStorage.setItem(marker, "true");
    } catch {
      /* Use the mount guard when storage is unavailable. */
    }
    for (const item of state.items) {
      const purchased = items.find(
        (line) =>
          line.productId === item.productId && (line.size ?? "") === (item.selectedSize ?? ""),
      );
      if (purchased)
        setQuantity(cartItemKey(item), Math.max(0, item.quantity - purchased.quantity));
    }
  }, [orderId, items, state.items, isHydrated, setQuantity]);
  return null;
}
