import { expect, test } from "@playwright/test";
import {
  applyWaresPreset,
  canApplyWaresPreset,
  WARES_PRESETS,
} from "../components/admin/wares-presets";
import { parseProductInput, type ProductInput } from "../server/catalogue/product-input";

function blank(): ProductInput {
  return {
    revision: 0,
    handle: "",
    title: "",
    description: "",
    productType: "board",
    priceAmount: 0,
    publicationStatus: "draft",
    images: [],
    boardStyle: "cruiser",
    boardShape: "",
    timberSpecies: [],
    lengthCm: null,
    widthCm: null,
    thicknessCm: null,
    availabilityStatus: "available",
    stockQuantity: 1,
    stockBySize: { S: 0, M: 0, L: 0, XL: 0 },
    fitNotes: "",
    merchKind: null,
    salesUnitLabel: "",
    adjustmentReason: "",
  };
}

test("supplied WARES starts incomplete drafts with proposed retail prices and no sale assumptions", () => {
  const prices = [2500, 4000, 4000, 5500, 5000, 5000, 500, 200, 200, 200, 10000, 6000, 3000];
  expect(WARES_PRESETS).toHaveLength(13);
  for (const [index, preset] of WARES_PRESETS.entries()) {
    const input = applyWaresPreset(blank(), preset.handle);
    expect(input.priceAmount).toBe(prices[index]);
    expect(input.productType).toBe("merch");
    expect(input.publicationStatus).toBe("draft");
    expect(input.images).toEqual([]);
    expect(input.stockBySize).toEqual({});
    expect(input.salesUnitLabel).toBe("");
    expect(parseProductInput(input).publicationStatus).toBe("draft");
    expect(() => parseProductInput({ ...input, publicationStatus: "published" })).toThrow();
  }
});

test("presets cannot overwrite saved products or authored draft details", () => {
  const preset = WARES_PRESETS[0].handle;
  const original = blank();
  expect(applyWaresPreset(original, preset, "saved-product-id")).toBe(original);
  for (const changes of [
    { revision: 1 },
    { title: "Entered title" },
    { handle: "entered-handle" },
    { description: "Entered description" },
    { priceAmount: 4500 },
    { publicationStatus: "published" as const },
    { salesUnitLabel: "Confirmed unit" },
    { images: [{ url: "https://example.invalid/photo.webp", alt: "Entered photo" }] },
    { stockBySize: { XS: 3 } },
    { boardShape: "Entered shape" },
    { lengthCm: 80 },
  ]) {
    const current = { ...blank(), ...changes };
    expect(canApplyWaresPreset(current)).toBe(false);
    expect(applyWaresPreset(current, preset)).toBe(current);
  }
  expect(applyWaresPreset(original, "unknown-preset")).toBe(original);
});

for (const merchKind of ["truck", "wheel"] as const) {
  test(`${merchKind} publication requires confirmed sale unit and stock`, () => {
    const preset = WARES_PRESETS.find((item) => item.merchKind === merchKind)!;
    const draft = applyWaresPreset(blank(), preset.handle);
    const photographed = {
      ...draft,
      images: [
        {
          url: "https://fixture.public.blob.vercel-storage.com/photo.webp",
          alt: "Hardware fixture",
        },
      ],
    };
    expect(() => parseProductInput({ ...photographed, publicationStatus: "published" })).toThrow();
    expect(() =>
      parseProductInput({
        ...photographed,
        publicationStatus: "published",
        stockBySize: { "One size": 2 },
      }),
    ).toThrow("unit");
    const published = parseProductInput({
      ...photographed,
      publicationStatus: "published",
      stockBySize: { "One size": 2 },
      salesUnitLabel: "Owner-confirmed sale unit",
    });
    expect(published.merchKind).toBe(merchKind);
    expect(published.stockBySize).toEqual({ "One size": 2 });
    expect(() => parseProductInput({ ...published, stockBySize: { S: 2 } })).toThrow("quantity");
  });
}
