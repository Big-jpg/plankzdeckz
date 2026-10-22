import { expect, test } from "@playwright/test";
import {
  inventoryChanges,
  parseProductInput,
  type ProductInput,
} from "../server/catalogue/product-input";
import { MERCH_KINDS, isClothing } from "../lib/types";

function input(): ProductInput {
  return {
    revision: 0,
    handle: "real-product",
    title: "Real product",
    description: "Confirmed description",
    productType: "merch",
    merchKind: "tee",
    priceAmount: 2500,
    publicationStatus: "published",
    images: [
      {
        url: "https://plankz-test.public.blob.vercel-storage.com/products/image.webp",
        alt: "Product front",
      },
    ],
    boardStyle: null,
    boardShape: "",
    timberSpecies: [],
    lengthCm: null,
    widthCm: null,
    thicknessCm: null,
    availabilityStatus: "available",
    stockQuantity: 0,
    stockBySize: { S: 2, L: 0 },
    fitNotes: "",
    salesUnitLabel: "one tee",
    adjustmentReason: "",
  };
}

test("incomplete draft does not require publication facts", () => {
  expect(
    parseProductInput({
      ...input(),
      publicationStatus: "draft",
      images: [],
      priceAmount: 0,
      description: "",
      salesUnitLabel: "",
      stockBySize: {},
    }).publicationStatus,
  ).toBe("draft");
});

for (const kind of MERCH_KINDS) {
  test(`publish ${kind} with explicit sale unit and zero stock`, () => {
    const product = parseProductInput({
      ...input(),
      merchKind: kind,
      priceAmount: 1,
      stockBySize: isClothing(kind) ? { XS: 0, "2XL": 0 } : { "One size": 0 },
      salesUnitLabel: `confirmed ${kind} unit`,
    });
    expect(product.merchKind).toBe(kind);
    expect(Object.values(product.stockBySize).every((stock) => stock === 0)).toBe(true);
  });
}

test("publish requires complete product facts and rejects unknown categories and stock", () => {
  for (const patch of [
    { images: [] },
    { priceAmount: 0 },
    { salesUnitLabel: "" },
    { description: "" },
    { merchKind: "wheel" },
    { stockBySize: { XS: -1 } },
    { stockBySize: { XS: 1.5 } },
    { stockBySize: { "": 1 } },
    { merchKind: "hat", stockBySize: { S: 1 } },
  ]) {
    expect(() => parseProductInput({ ...input(), ...patch })).toThrow();
  }
});

test("draft deck stock is still unique and sold deck stock cannot be positive", () => {
  expect(() =>
    parseProductInput({
      ...input(),
      productType: "board",
      publicationStatus: "draft",
      stockQuantity: 2,
    }),
  ).toThrow("zero or one");
  expect(() =>
    parseProductInput({
      ...input(),
      productType: "board",
      boardStyle: "cruiser",
      boardShape: "confirmed",
      timberSpecies: ["confirmed"],
      stockQuantity: 1,
      availabilityStatus: "sold",
    }),
  ).toThrow("zero");
});

test("inventory audit captures removals and restocks without photo or content changes", () => {
  const product = input();
  const before = {
    product_type: "merch" as const,
    stock_quantity: 0,
    stock_by_size: { S: 2, M: 3 },
  };
  expect(inventoryChanges(before, { ...product, stockBySize: { S: 5, L: 0 } })).toEqual([
    { variant: "S", before: 2, after: 5 },
    { variant: "M", before: 3, after: 0 },
  ]);
  expect(
    inventoryChanges(before, { ...product, title: "Updated", stockBySize: before.stock_by_size }),
  ).toEqual([]);
});
