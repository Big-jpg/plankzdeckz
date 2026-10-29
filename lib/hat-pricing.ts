export type HatPricingFamily = "trad" | "cord";

export interface CartLineQuote {
  handle: string;
  selectedSize: string | null;
  quantity: number;
  retailUnitAmount: number;
  unitAmount: number;
  totalAmount: number;
}

export const HAT_PRICING = {
  trad: {
    label: "Trad",
    retailUnitAmount: 2500,
    tiers: [
      { minimumQuantity: 1, unitAmount: 2500 },
      { minimumQuantity: 2, unitAmount: 2250 },
    ],
  },
  cord: {
    label: "Cord",
    retailUnitAmount: 4000,
    tiers: [
      { minimumQuantity: 1, unitAmount: 4000 },
      { minimumQuantity: 2, unitAmount: 3750 },
      { minimumQuantity: 5, unitAmount: 3100 },
    ],
  },
} as const;

export function isHatPricingFamily(value: unknown): value is HatPricingFamily {
  return value === "trad" || value === "cord";
}

export function hasValidHatPricing(
  kind: unknown,
  retailUnitAmount: unknown,
  family: unknown,
): boolean {
  return (
    family == null ||
    (kind === "hat" &&
      isHatPricingFamily(family) &&
      retailUnitAmount === HAT_PRICING[family].retailUnitAmount)
  );
}

export function hatUnitAmount(family: HatPricingFamily, quantity: number): number {
  if (!isHatPricingFamily(family)) throw new Error("Unknown hat pricing family.");
  if (!Number.isSafeInteger(quantity) || quantity < 1)
    throw new Error("Hat quantities must be positive whole numbers.");
  let amount: number = HAT_PRICING[family].retailUnitAmount;
  for (const tier of HAT_PRICING[family].tiers) {
    if (quantity >= tier.minimumQuantity) amount = tier.unitAmount;
  }
  return amount;
}
