import { expect, test } from "@playwright/test";
import { HAT_PRICING, hatUnitAmount, type HatPricingFamily } from "../lib/hat-pricing";
import type { MerchProduct } from "../lib/types";
import { canReserveLockedProduct, isPurchasableProduct } from "../lib/sellability";
import { validateCartItems } from "../server/cart/validation-core";
import { parseProductInput } from "../server/catalogue/product-input";

function hat(family: HatPricingFamily | null, suffix = "fixture"): MerchProduct {
  return {
    id: `${family}-${suffix}`,
    handle: `${family}-${suffix}`,
    title: "Fixture hat",
    description: "Isolated policy fixture",
    productType: "merch",
    category: "Merch",
    merchKind: "hat",
    price: family ? HAT_PRICING[family].retailUnitAmount / 100 : 25,
    currency: "AUD",
    publicationStatus: "published",
    images: [],
    material: "",
    dimensions: "",
    colours: [],
    boardStyles: [],
    inStock: true,
    stockQuantity: 0,
    stockBySize: { "One size": 40 },
    sizes: ["One size"],
    sizeRequired: false,
    fitNotes: "",
    salesUnitLabel: "One fixture hat",
    hatPricingFamily: family,
  };
}

const item = (product: MerchProduct, quantity: number) => ({
  handle: product.handle,
  productType: "merch",
  unitPrice: product.price,
  currency: "AUD",
  quantity,
});

test("approved hat tiers give savings without increasing unit rates for any supported quantity", () => {
  for (let quantity = 1; quantity <= 20; quantity++) {
    expect(hatUnitAmount("trad", quantity)).toBe(quantity === 1 ? 2500 : 2250);
    expect(hatUnitAmount("cord", quantity)).toBe(
      quantity === 1 ? 4000 : quantity < 5 ? 3750 : 3100,
    );
    if (quantity > 1) {
      expect(hatUnitAmount("trad", quantity)).toBeLessThanOrEqual(
        hatUnitAmount("trad", quantity - 1),
      );
      expect(hatUnitAmount("cord", quantity)).toBeLessThanOrEqual(
        hatUnitAmount("cord", quantity - 1),
      );
    }
  }
  for (const quantity of [
    0,
    -1,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.MAX_SAFE_INTEGER + 1,
  ])
    expect(() => hatUnitAmount("trad", quantity)).toThrow("quantities");
});

test("same-family colours combine while Trad, Cord and unassigned hats retain separate pricing", () => {
  const products = [
    hat("trad", "blue"),
    hat("trad", "black"),
    hat("cord", "green"),
    hat("cord", "cream"),
    hat(null),
  ];
  const result = validateCartItems(
    { items: products.map((product, index) => item(product, index === 3 ? 4 : 1)) },
    products,
  );
  expect(result.valid).toBe(true);
  expect(result.retailSubtotal).toBe(275);
  expect(result.verifiedSubtotal).toBe(225);
  expect(result.discountAmount).toBe(50);
  expect(result.lineQuotes.map((line) => line.unitAmount)).toEqual([2250, 2250, 3100, 3100, 2500]);
  expect(result.verifiedItems.map((line) => line.hatFamilyQuantity)).toEqual([
    2,
    2,
    5,
    5,
    undefined,
  ]);
  const oneEach = validateCartItems(
    { items: [item(products[0], 1), item(products[2], 1)] },
    products,
  );
  expect(oneEach.verifiedSubtotal).toBe(65);
  expect(oneEach.discountAmount).toBe(0);
});

test("duplicate lines aggregate before tier selection and preserve per-product quantity limits", () => {
  const product = hat("cord");
  const result = validateCartItems({ items: [item(product, 2), item(product, 3)] }, [product]);
  expect(result.valid).toBe(true);
  expect(result.verifiedItems).toHaveLength(1);
  expect(result.lineQuotes[0]).toMatchObject({
    quantity: 5,
    retailUnitAmount: 4000,
    unitAmount: 3100,
    totalAmount: 15500,
  });
  for (const quantity of [0, -1, 1.5, 21, Number.NaN])
    expect(validateCartItems({ items: [item(product, quantity)] }, [product]).valid).toBe(false);
  expect(validateCartItems({ items: [item(product, 20), item(product, 1)] }, [product]).valid).toBe(
    false,
  );
});

test("client family, price and promotion claims cannot select a pricing policy", () => {
  const product = hat(null);
  product.title = "Cord Plankz Hat";
  product.price = 40;
  const result = validateCartItems(
    {
      items: [
        {
          ...item(product, 5),
          hatPricingFamily: "cord",
          metadata: { hat_pricing_family: "cord" },
          coupon: "FREE",
          unitAmount: 1,
        },
      ],
    },
    [product],
  );
  expect(result.valid).toBe(true);
  expect(result.verifiedSubtotal).toBe(200);
  expect(result.discountAmount).toBe(0);
  expect(result.verifiedItems[0].hatPricingFamily).toBeNull();
  const assigned = hat("trad");
  expect(
    validateCartItems({ items: [{ ...item(assigned, 2), unitPrice: 22.5 }] }, [assigned]).valid,
  ).toBe(false);
});

test("assigned families fail closed for mismatched retail, currency, category or missing stock", () => {
  for (const changes of [
    { price: 20 },
    { price: 30 },
    { currency: "USD" },
    { merchKind: "wheel" as const },
    { stockBySize: {} },
    { salesUnitLabel: "" },
  ])
    expect(isPurchasableProduct({ ...hat("trad"), ...changes })).toBe(false);
  expect(isPurchasableProduct({ ...hat(null), price: 20 })).toBe(true);
});

test("locked price checks use retail and family snapshots as well as discounted unit amounts", () => {
  const product = hat("cord");
  const quoted = validateCartItems({ items: [item(product, 5)] }, [product]).verifiedItems[0];
  const record = {
    publication_status: "published",
    product_type: "merch",
    merch_kind: "hat",
    price_amount: 4000,
    currency: "AUD",
    merch_sizes: ["One size"],
    stock_by_size: { "One size": 10 },
    metadata: { sales_unit_label: "One fixture hat", hat_pricing_family: "cord" },
  };
  expect(canReserveLockedProduct(record, quoted)).toBe(true);
  expect(canReserveLockedProduct({ ...record, price_amount: 3500 }, quoted)).toBe(false);
  expect(
    canReserveLockedProduct(
      { ...record, metadata: { ...record.metadata, hat_pricing_family: null } },
      quoted,
    ),
  ).toBe(false);
  expect(canReserveLockedProduct(record, { ...quoted, unitAmount: 1 })).toBe(false);
  expect(canReserveLockedProduct(record, { ...quoted, retailUnitAmount: 3100 })).toBe(false);
  expect(canReserveLockedProduct(record, { ...quoted, hatFamilyQuantity: undefined })).toBe(false);
});

test("admin assignment is explicit, hat-only and requires the agreed retail when publishing", () => {
  const draft = parseProductInput({
    handle: "fixture-hat",
    title: "Fixture",
    productType: "merch",
    merchKind: "hat",
    hatPricingFamily: "trad",
    publicationStatus: "draft",
    priceAmount: 0,
    stockQuantity: 0,
    stockBySize: {},
  });
  expect(draft.hatPricingFamily).toBe("trad");
  for (const changes of [
    { hatPricingFamily: "other" },
    { merchKind: "tee" },
    { merchKind: "wheel" },
  ])
    expect(() => parseProductInput({ ...draft, ...changes })).toThrow("Quantity pricing");
  const publish = {
    ...draft,
    publicationStatus: "published",
    images: [
      { url: "https://fixture.public.blob.vercel-storage.com/hat.webp", alt: "Fixture hat" },
    ],
    description: "Fixture",
    salesUnitLabel: "One hat",
    stockBySize: { "One size": 2 },
  };
  expect(() => parseProductInput({ ...publish, priceAmount: 2000 })).toThrow("retail price");
  expect(parseProductInput({ ...publish, priceAmount: 2500 }).hatPricingFamily).toBe("trad");
});
