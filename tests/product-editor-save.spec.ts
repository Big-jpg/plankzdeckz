import { expect, test } from "@playwright/test";
import { isPhotoOnlyProductSave } from "../components/admin/product-editor";
import type { ProductInput } from "../server/catalogue/product-input";

function product(): ProductInput {
  return {
    handle: "confirmed-product",
    title: "Confirmed product",
    description: "Existing product details",
    productType: "board",
    priceAmount: 27500,
    publicationStatus: "published",
    images: [{ url: "https://example.invalid/original.webp", alt: "Original front view" }],
    boardStyle: "cruiser",
    boardShape: "Confirmed shape",
    timberSpecies: ["Confirmed timber"],
    lengthCm: 85,
    widthCm: 23,
    thicknessCm: 1.8,
    availabilityStatus: "available",
    stockQuantity: 1,
    stockBySize: { S: 2, M: 0 },
    fitNotes: "Existing metadata must remain part of the saved baseline",
  };
}

test("photo order, descriptions and replacements use the safe save from any editor step", () => {
  const saved = product();
  const current = {
    ...saved,
    images: [
      { url: "https://example.invalid/replacement.webp", alt: "Replacement grip view" },
      { ...saved.images[0], alt: "Revised original view" },
    ],
  };
  expect(isPhotoOnlyProductSave(saved, current, "published")).toBe(true);
  expect(isPhotoOnlyProductSave(saved, saved, "published")).toBe(true);
});

test("price, stock, identity, details and initial metadata changes require an explicit full save", () => {
  const saved = product();
  const changes: Partial<ProductInput>[] = [
    { priceAmount: 28000 },
    { availabilityStatus: "sold" },
    { stockQuantity: 0 },
    { stockBySize: { S: 1, M: 0 } },
    { title: "Updated name" },
    { handle: "updated-handle" },
    { productType: "merch" },
    { description: "Updated description" },
    { boardStyle: "longboard" },
    { boardShape: "Updated shape" },
    { timberSpecies: ["Other confirmed timber"] },
    { lengthCm: 90 },
    { widthCm: 25 },
    { thicknessCm: 2 },
    { fitNotes: "Explicit metadata edit" },
  ];
  for (const change of changes) {
    expect(
      isPhotoOnlyProductSave(saved, { ...saved, ...change }, "published"),
      String(Object.keys(change)),
    ).toBe(false);
  }
});

test("publishing, archiving and draft transitions retain explicit status writes", () => {
  const published = product();
  const draft = { ...published, publicationStatus: "draft" as const };
  const archived = { ...published, publicationStatus: "archived" as const };
  expect(isPhotoOnlyProductSave(draft, draft, "published")).toBe(false);
  expect(isPhotoOnlyProductSave(published, published, "archived")).toBe(false);
  expect(isPhotoOnlyProductSave(archived, archived, "draft")).toBe(false);
  expect(isPhotoOnlyProductSave(draft, draft, "draft")).toBe(true);
});

test("size stock key order does not turn a photo edit into a stale full save", () => {
  const saved = product();
  const current = { ...saved, stockBySize: { M: 0, S: 2 } };
  expect(isPhotoOnlyProductSave(saved, current, "published")).toBe(true);
});

test("a successful full-save baseline makes later photo saves safe", () => {
  const initial = product();
  const explicitlySaved = { ...initial, priceAmount: 28000, fitNotes: "Saved metadata edit" };
  const laterPhotos = { ...explicitlySaved, images: [] };
  expect(isPhotoOnlyProductSave(initial, laterPhotos, "published")).toBe(false);
  expect(isPhotoOnlyProductSave(explicitlySaved, laterPhotos, "published")).toBe(true);
});
