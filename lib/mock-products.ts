// lib/mock-products.ts
import type { Product, ProductCategory } from "./types";

const boardTypes = ["Cruiser", "Longboard", "Surfskate", "Custom / not sure"] as const;

export const products: Product[] = [
  {
    id: "deck-coastline-cruiser",
    handle: "coastline-cruiser",
    title: "Coastline Cruiser Deck",
    price: 189,
    currency: "AUD",
    category: "Reclaimed cruisers",
    description:
      "A compact recycled timber cruiser deck shaped for coastal errands, mellow carving, and everyday local rides.",
    material: "Reclaimed hardwood pallet timber with sealed timber finish",
    dimensions: "Approx. 760 mm x 230 mm, final dimensions vary by timber batch",
    colours: ["Weathered grey", "Warm timber", "Teal resin detail"],
    images: ["/og-product-placeholder.svg"],
    adapters: ["Cruiser", "Custom / not sure"],
    inStock: true,
    designFamily: "Cruiser",
    productionNotes: "Mock Phase 0 product. Final catalogue and stock model to be replaced in later phases.",
  },
  {
    id: "deck-reef-runner",
    handle: "reef-runner-surfskate",
    title: "Reef Runner Surfskate Deck",
    price: 219,
    currency: "AUD",
    category: "Surfskate deckz",
    description:
      "A surf-inspired outline with reclaimed timber grain and a beach-break stance for pumping and carving practice.",
    material: "Reclaimed mixed hardwood laminate with hand-shaped rails",
    dimensions: "Approx. 820 mm x 245 mm, surfskate-focused wheelbase pending hardware choice",
    colours: ["Sand", "Coral", "Warm timber"],
    images: ["/og-product-placeholder.svg"],
    adapters: ["Surfskate", "Custom / not sure"],
    inStock: true,
    designFamily: "Surfskate",
    productionNotes: "Mock Phase 0 product. Truck and wheel compatibility confirmed during custom handover.",
  },
  {
    id: "deck-driftwood-longboard",
    handle: "driftwood-longboard",
    title: "Driftwood Longboard Deck",
    price: 259,
    currency: "AUD",
    category: "Longboard deckz",
    description:
      "A longer reclaimed timber deck built around smooth coastal flow, visible grain contrast, and handmade character.",
    material: "Reclaimed hardwood with timber stain, sealed edges, and optional resin inlay",
    dimensions: "Approx. 970 mm x 240 mm, tuned per timber availability",
    colours: ["Weathered grey", "Gold grain", "Deep navy"],
    images: ["/og-product-placeholder.svg"],
    adapters: ["Longboard", "Custom / not sure"],
    inStock: true,
    designFamily: "Longboard",
    productionNotes: "Mock Phase 0 product. Built-to-order details to be captured in the custom designer phase.",
  },
  {
    id: "deck-yin-yang-og",
    handle: "yin-yang-og-deck",
    title: "Yin-Yang OG Deck",
    price: 299,
    currency: "AUD",
    category: "Custom builds",
    description:
      "A one-off flagship Plankz deck direction using yin-yang brand geometry, recycled timber contrast, and custom resin accents.",
    material: "Selected reclaimed hardwoods with contrast timber pairing and sealed finish",
    dimensions: "Custom profile confirmed before build",
    colours: ["Teal", "Coral", "Gold", "Warm timber"],
    images: ["/og-product-placeholder.svg"],
    adapters: [...boardTypes],
    inStock: false,
    designFamily: "Custom",
    productionNotes: "Expression-of-interest placeholder for the Phase 0 shell.",
  },
  {
    id: "merch-og-tee",
    handle: "og-plankz-tee",
    title: "OG PLANKZ Tee",
    price: 39,
    currency: "AUD",
    category: "Merch",
    description:
      "A placeholder merch item for the Phase 0 shell, carrying the PLANKZ DECKZ coastal recycled-timber identity.",
    material: "Cotton tee placeholder",
    dimensions: "Sizing to be confirmed",
    colours: ["Washed charcoal", "Teal print", "Coral print"],
    images: ["/og-product-placeholder.svg"],
    adapters: ["Custom / not sure"],
    inStock: false,
    designFamily: "Merch",
  },
  {
    id: "merch-sticker-pack",
    handle: "plankz-sticker-pack",
    title: "PLANKZ Sticker Pack",
    price: 12,
    currency: "AUD",
    category: "Merch",
    description:
      "Logo, deck, and beach-lifestyle sticker placeholders for the future merch drop.",
    material: "Vinyl sticker placeholder",
    dimensions: "Pack sizing to be confirmed",
    colours: ["Teal", "Coral", "Gold", "Weathered grey"],
    images: ["/og-product-placeholder.svg"],
    adapters: ["Custom / not sure"],
    inStock: false,
    designFamily: "Merch",
  },
  {
    id: "deck-landfill-rescue-prototype",
    handle: "landfill-rescue-prototype",
    title: "Landfill Rescue Prototype",
    price: 0,
    currency: "AUD",
    category: "Experimental prototypes",
    description:
      "A build-log placeholder for unusual recovered material experiments, test shapes, and one-off recycled deck concepts.",
    material: "Recovered timber and mixed reclaimed material experiments",
    dimensions: "Prototype only",
    colours: ["Raw timber", "Weathered grey", "Builder-selected resin"],
    images: ["/og-product-placeholder.svg"],
    adapters: [...boardTypes],
    inStock: false,
    designFamily: "Prototype",
    productionNotes: "Not a purchasable product. Included to preserve catalogue layout during Phase 0.",
  },
];

export function getProductByHandle(handle: string): Product | undefined {
  return products.find((product) => product.handle === handle);
}

export const categories: ProductCategory[] = [
  "Reclaimed cruisers",
  "Surfskate deckz",
  "Longboard deckz",
  "Custom builds",
  "Merch",
  "Experimental prototypes",
];
