import type { MerchKind } from "@/lib/types";
import type { HatPricingFamily } from "@/lib/hat-pricing";
import type { ProductInput } from "@/server/catalogue/product-input";

interface WaresPreset {
  handle: string;
  title: string;
  merchKind: MerchKind;
  description: string;
  priceAmount: number;
  hatPricingFamily?: HatPricingFamily;
}

// Only proposed retail facts from the supplied October 2026 design brief belong here.
export const WARES_PRESETS = [
  {
    handle: "trad-hat",
    title: "Trad Hat",
    merchKind: "hat",
    description: "Trad hat with the Plankz logo.",
    priceAmount: 2500,
    hatPricingFamily: "trad",
  },
  {
    handle: "cord-plankz-hat",
    title: "Cord Plankz Hat",
    merchKind: "hat",
    description: "Cord hat with the board logo.",
    priceAmount: 4000,
    hatPricingFamily: "cord",
  },
  {
    handle: "og-logo-tee",
    title: "OG Logo Tee",
    merchKind: "tee",
    description: "Normal-fit tee with the OG logo. 180 GSM.",
    priceAmount: 4000,
  },
  {
    handle: "beer-coaster-tee",
    title: "Beer Coaster Tee",
    merchKind: "tee",
    description: "Oversized tee with the Beer Coaster logo. 240 GSM.",
    priceAmount: 5500,
  },
  {
    handle: "sunrise-tee",
    title: "Sunrise Tee",
    merchKind: "tee",
    description: "Normal-fit tee with the Sunrise logo. 180 GSM.",
    priceAmount: 5000,
  },
  {
    handle: "palm-beach-tee",
    title: "Palm Beach Tee",
    merchKind: "tee",
    description: "Acid-washed tee with the Palm Beach logo. 230 GSM.",
    priceAmount: 5000,
  },
  {
    handle: "3-pack-stickers",
    title: "3 Pack Stickers",
    merchKind: "sticker",
    description: "A pack of three stickers.",
    priceAmount: 500,
  },
  {
    handle: "board-sticker",
    title: "Board Sticker",
    merchKind: "sticker",
    description: "Board sticker.",
    priceAmount: 200,
  },
  {
    handle: "og-logo-sticker",
    title: "OG Logo Sticker",
    merchKind: "sticker",
    description: "OG logo sticker.",
    priceAmount: 200,
  },
  {
    handle: "round-plankz-deckz-sticker",
    title: "Round Plankz Deckz Sticker",
    merchKind: "sticker",
    description: "Round Plankz Deckz sticker.",
    priceAmount: 200,
  },
  {
    handle: "puente-trucks",
    title: "7-inch PUENTE Trucks",
    merchKind: "truck",
    description: "7-inch PUENTE trucks in black.",
    priceAmount: 10000,
  },
  {
    handle: "pu-wheels",
    title: "70 × 51 mm PU Wheels",
    merchKind: "wheel",
    description: "70 × 51 mm polyurethane wheels. 78a hardness.",
    priceAmount: 6000,
  },
  {
    handle: "fushi-reds-bearings",
    title: "FUSHI Reds ABEC 9 Bearings",
    merchKind: "bearings",
    description: "FUSHI Reds ABEC 9 bearings.",
    priceAmount: 3000,
  },
] as const satisfies readonly WaresPreset[];

export function canApplyWaresPreset(current: ProductInput, productId?: string): boolean {
  return (
    !productId &&
    current.revision === 0 &&
    current.publicationStatus === "draft" &&
    !current.title &&
    !current.handle &&
    !current.description &&
    !current.images.length &&
    current.priceAmount === 0 &&
    !current.salesUnitLabel &&
    !current.fitNotes &&
    !current.hatPricingFamily &&
    !current.boardShape &&
    !current.timberSpecies.length &&
    !current.lengthCm &&
    !current.widthCm &&
    !current.thicknessCm &&
    !current.adjustmentReason &&
    Object.values(current.stockBySize).every((quantity) => quantity === 0) &&
    current.stockQuantity <= 1
  );
}

export function applyWaresPreset(
  current: ProductInput,
  handle: string,
  productId?: string,
): ProductInput {
  const preset = WARES_PRESETS.find((item) => item.handle === handle);
  if (!preset || !canApplyWaresPreset(current, productId)) return current;
  return {
    ...current,
    ...preset,
    productType: "merch",
    publicationStatus: "draft",
    boardStyle: null,
    boardShape: "",
    timberSpecies: [],
    lengthCm: null,
    widthCm: null,
    thicknessCm: null,
    stockQuantity: 0,
    stockBySize: {},
    salesUnitLabel: "",
  };
}
