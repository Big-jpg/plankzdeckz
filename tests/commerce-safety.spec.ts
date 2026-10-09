import { expect, test } from "@playwright/test";
import type { BoardProduct, MerchProduct, Product } from "@/lib/types";
import {
  canReserveLockedProduct,
  hasDisplayOnlyFlag,
  hasSupportedSaleDetails,
  isPurchasableProduct,
  isPurchasableRecord,
  type SaleRecord,
} from "@/lib/sellability";
import { preflightCartInput, validateCartItems } from "@/server/cart/validation-core";

function board(): BoardProduct {
  return {
    id: "fixture-board-id",
    handle: "confirmed-board",
    title: "Confirmed board",
    description: "Isolated commerce test fixture",
    productType: "board",
    category: "Reclaimed cruisers",
    price: 275,
    currency: "AUD",
    publicationStatus: "published",
    images: [],
    material: "Confirmed timber",
    dimensions: "",
    colours: [],
    boardStyles: ["Cruiser"],
    inStock: true,
    stockQuantity: 1,
    availabilityStatus: "available",
    timberSpecies: ["Confirmed timber"],
    boardStyle: "cruiser",
    boardShape: "Confirmed shape",
    boardDimensions: { display: "" },
    specs: [],
    galleryNotes: "",
  };
}

function tee(): MerchProduct {
  return {
    ...board(),
    id: "fixture-tee-id",
    handle: "confirmed-tee",
    title: "Confirmed tee",
    productType: "merch",
    category: "Merch",
    merchKind: "tee",
    price: 39.99,
    sizes: ["S", "M"],
    sizeRequired: true,
    stockBySize: { S: 2, M: 0 },
    stockQuantity: 0,
    fitNotes: "",
  };
}

function item(product: Product, patch: Record<string, unknown> = {}) {
  return {
    handle: product.handle,
    unitPrice: product.price,
    currency: product.currency,
    quantity: 1,
    productType: product.productType,
    ...(product.productType === "merch" ? { selectedSize: "S" } : {}),
    ...patch,
  };
}

function record(patch: Partial<SaleRecord> = {}): SaleRecord {
  return {
    publication_status: "published",
    product_type: "board",
    price_amount: 27500,
    currency: "aud",
    metadata: {},
    availability_status: "available",
    stock_quantity: 1,
    merch_kind: null,
    merch_sizes: [],
    stock_by_size: {},
    ...patch,
  };
}

test("existing confirmed board and tee carts retain authoritative identity and cents", () => {
  const products = [board(), tee()];
  const result = validateCartItems({ items: products.map((product) => item(product)) }, products);
  expect(result.valid).toBe(true);
  expect(result.verifiedSubtotal).toBe(314.99);
  expect(result.verifiedItems.map((entry) => [entry.productId, entry.unitAmount])).toEqual([
    ["fixture-board-id", 27500],
    ["fixture-tee-id", 3999],
  ]);
});

const blockedBoardCases: Array<[string, Record<string, unknown>]> = [
  ["missing price", { price: undefined }],
  ["zero price", { price: 0 }],
  ["non-finite price", { price: NaN }],
  ["fractional cent price", { price: 1.001 }],
  ["missing currency", { currency: undefined }],
  ["unsupported currency", { currency: "USD" }],
  ["missing stock", { stockQuantity: undefined }],
  ["zero stock", { stockQuantity: 0 }],
  ["invalid stock", { stockQuantity: 2 }],
  ["missing publication", { publicationStatus: undefined }],
  ["draft", { publicationStatus: "draft" }],
  ["archived", { publicationStatus: "archived" }],
  ["display-only", { displayOnly: true }],
  ["malformed display-only flag", { displayOnly: "false" }],
  ["unsupported type", { productType: "hat" }],
  ["sold", { availabilityStatus: "sold", stockQuantity: 0 }],
  ["reserved", { availabilityStatus: "reserved" }],
];

for (const [name, patch] of blockedBoardCases) {
  test(`${name} fails closed despite a claimed in-stock flag`, () => {
    const product = { ...board(), ...patch } as Product;
    expect(isPurchasableProduct(product)).toBe(false);
    const result = validateCartItems({ items: [item(product)] }, [product]);
    expect(result.valid).toBe(false);
    expect(result.verifiedItems).toEqual([]);
    expect(result.errors).toContainEqual(expect.objectContaining({ field: "sellability" }));
  });
}

test("sold board retains supported price/gallery details without becoming purchasable", () => {
  const sold = { ...board(), availabilityStatus: "sold", stockQuantity: 0 } as BoardProduct;
  expect(hasSupportedSaleDetails(sold)).toBe(true);
  expect(isPurchasableProduct(sold)).toBe(false);
});

test("legacy sold board with stock 1 retains gallery details but cannot cart or reserve", () => {
  const sold = { ...board(), availabilityStatus: "sold", stockQuantity: 1 } as BoardProduct;
  expect(hasSupportedSaleDetails(sold)).toBe(true);
  expect(isPurchasableProduct(sold)).toBe(false);
  expect(validateCartItems({ items: [item(sold)] }, [sold]).valid).toBe(false);
  const soldRecord = record({ availability_status: "sold", stock_quantity: 1 });
  expect(isPurchasableRecord(soldRecord)).toBe(false);
  expect(
    canReserveLockedProduct(soldRecord, {
      productType: "board",
      unitAmount: 27500,
      currency: "AUD",
      quantity: 1,
      selectedSize: null,
    }),
  ).toBe(false);
  expect(hasSupportedSaleDetails({ ...sold, stockQuantity: undefined })).toBe(false);
  expect(hasSupportedSaleDetails({ ...sold, stockQuantity: 2 })).toBe(false);
});

test("unknown stock does not become an out-of-stock sales presentation", () => {
  expect(hasSupportedSaleDetails({ ...board(), stockQuantity: undefined })).toBe(false);
  expect(hasSupportedSaleDetails({ ...board(), stockQuantity: 0 })).toBe(false);
  expect(hasSupportedSaleDetails({ ...board(), displayOnly: true })).toBe(false);
});

for (const kind of ["flanno", "sticker_pack", "hat", "bearings", undefined]) {
  test(`unsupported merchandise ${String(kind)} cannot check out`, () => {
    const product = { ...tee(), merchKind: kind } as Product;
    expect(isPurchasableProduct(product)).toBe(false);
    expect(validateCartItems({ items: [item(product)] }, [product]).valid).toBe(false);
  });
}

const invalidSizeStocks: Array<Record<string, number> | undefined> = [
  undefined,
  {},
  { S: 2 },
  { S: -1, M: 0 },
  { S: 1.5, M: 0 },
];
for (const stockBySize of invalidSizeStocks) {
  test(`missing or invalid tee size stock ${JSON.stringify(stockBySize)} is blocked`, () => {
    const product = { ...tee(), stockBySize };
    expect(isPurchasableProduct(product)).toBe(false);
    expect(validateCartItems({ items: [item(product)] }, [product]).valid).toBe(false);
  });
}

test("unavailable, unknown, missing and excessive tee variants are rejected", () => {
  const product = tee();
  for (const patch of [
    { selectedSize: "M" },
    { selectedSize: "XL" },
    { selectedSize: undefined },
    { selectedSize: "S", quantity: 3 },
  ])
    expect(validateCartItems({ items: [item(product, patch)] }, [product]).valid).toBe(false);
});

test("stale and forged carts cannot supply their own sale facts", () => {
  const product = board();
  for (const patch of [
    { handle: "removed-product" },
    { unitPrice: 1 },
    { unitPrice: NaN },
    { currency: "USD" },
    { productType: "merch" },
    { quantity: 2 },
  ])
    expect(validateCartItems({ items: [item(product, patch)] }, [product]).valid).toBe(false);
  const valid = validateCartItems(
    { items: [item(product, { productId: "forged-id", metadata: { displayOnly: false } })] },
    [product],
  );
  expect(valid.verifiedItems[0].productId).toBe(product.id);
});

test("photo-review handles fail preflight before a catalogue is required", () => {
  const preview = { ...board(), handle: "photo-review-board-one" };
  const input = { items: [item(preview)] };
  expect(preflightCartInput(input)?.valid).toBe(false);
  expect(validateCartItems(input, [preview]).verifiedItems).toEqual([]);
  expect(isPurchasableProduct(preview)).toBe(false);
});

test("locked row recheck preserves supported board and tee reservations", () => {
  const boardItem = {
    productType: "board",
    unitAmount: 27500,
    currency: "AUD",
    quantity: 1,
    selectedSize: null,
  };
  expect(canReserveLockedProduct(record(), boardItem)).toBe(true);
  const teeRecord = record({
    product_type: "merch",
    merch_kind: "tee",
    merch_sizes: ["S", "M"],
    stock_by_size: { S: 2, M: 0 },
  });
  expect(
    canReserveLockedProduct(teeRecord, {
      ...boardItem,
      productType: "merch",
      selectedSize: "S",
      quantity: 2,
    }),
  ).toBe(true);
  expect(
    canReserveLockedProduct(teeRecord, {
      ...boardItem,
      productType: "merch",
      selectedSize: "S",
      quantity: 3,
    }),
  ).toBe(false);
});

test("locked row changes cannot create holds from previously valid cart items", () => {
  const verified = {
    productType: "board",
    unitAmount: 27500,
    currency: "AUD",
    quantity: 1,
    selectedSize: null,
  };
  for (const patch of [
    { price_amount: 0 },
    { price_amount: undefined },
    { price_amount: 27600 },
    { currency: "USD" },
    { currency: undefined },
    { publication_status: "draft" },
    { publication_status: "archived" },
    { product_type: "merch", merch_kind: "tee", merch_sizes: ["S"], stock_by_size: { S: 1 } },
    { stock_quantity: undefined },
    { stock_quantity: 0 },
    { availability_status: "sold" },
    { availability_status: "reserved" },
    { metadata: { display_only: true } },
    { metadata: { displayOnly: true } },
    { metadata: { display_only: "false" } },
    { metadata: undefined },
  ])
    expect(canReserveLockedProduct(record(patch), verified), JSON.stringify(patch)).toBe(false);
});

test("locked unsupported merchandise and unknown variants fail the same gate", () => {
  const teeRecord = record({
    product_type: "merch",
    merch_kind: "tee",
    merch_sizes: ["S"],
    stock_by_size: { S: 2 },
  });
  const verified = {
    productType: "merch",
    unitAmount: 27500,
    currency: "AUD",
    quantity: 1,
    selectedSize: "S",
  };
  for (const kind of ["flanno", "sticker_pack", "hat", "bearings", null])
    expect(canReserveLockedProduct({ ...teeRecord, merch_kind: kind }, verified)).toBe(false);
  expect(canReserveLockedProduct(teeRecord, { ...verified, selectedSize: "M" })).toBe(false);
  expect(canReserveLockedProduct(teeRecord, { ...verified, selectedSize: null })).toBe(false);
  expect(isPurchasableRecord({ ...teeRecord, stock_by_size: {} })).toBe(false);
});

test("missing flags retain existing sales while ambiguous display-only metadata blocks sales", () => {
  expect(hasDisplayOnlyFlag({ fit_notes: "Existing tee metadata" })).toBe(false);
  expect(hasDisplayOnlyFlag({ display_only: false })).toBe(false);
  expect(hasDisplayOnlyFlag({ display_only: null })).toBe(true);
  expect(hasDisplayOnlyFlag(null)).toBe(true);
});
