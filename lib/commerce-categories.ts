import type { Product } from "./types";
import type { PublicCatalogueCategory } from "./public-catalogue";

export function commerceCategory(product: Product): PublicCatalogueCategory {
  if (product.productType === "board") return "boards";
  return {
    tee: "tees",
    hat: "hats",
    jacket: "jackets",
    bearings: "bearings",
    sticker: "stickers",
    truck: "trucks",
    wheel: "wheels",
  }[product.merchKind] as PublicCatalogueCategory;
}
