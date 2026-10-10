export type PublicCatalogueCategory =
  | "boards"
  | "hats"
  | "tees"
  | "jackets"
  | "bearings"
  | "stickers";

export interface PublicCatalogueImage {
  readonly url: string;
  readonly thumbnailUrl: string;
  readonly cardUrl: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}

export interface PublicCatalogueItem {
  readonly id: string;
  readonly handle: string;
  readonly title: string;
  readonly description: string;
  readonly category: PublicCatalogueCategory;
  readonly images: readonly PublicCatalogueImage[];
  readonly purchasable: false;
}

export const PUBLIC_CATALOGUE_CATEGORIES = [
  { key: "boards", title: "Boards" },
  { key: "hats", title: "Hats" },
  { key: "tees", title: "Tees" },
  { key: "jackets", title: "Jackets" },
  { key: "bearings", title: "Bearings" },
  { key: "stickers", title: "Stickers" },
] as const satisfies readonly { key: PublicCatalogueCategory; title: string }[];

// Display identities are independent of commerce records. Every item stays non-purchasable.
export const PUBLIC_CATALOGUE: readonly PublicCatalogueItem[] = [
  {
    id: "board-1",
    handle: "board-1",
    title: "Board 01",
    description:
      "Top, underside, detail and held views of a timber board with Plankz branding, trucks and wheels.",
    category: "boards",
    images: [
      {
        url: "/catalogue-photos/9a8a77436da4-1600.webp",
        thumbnailUrl: "/catalogue-photos/9a8a77436da4-320.webp",
        cardUrl: "/catalogue-photos/9a8a77436da4-800.webp",
        alt: "Board 1 underside with trucks and wheels beside the coastal railing",
        width: 1600,
        height: 1067,
      },
      {
        url: "/catalogue-photos/f1c87a9c5de7-1600.webp",
        thumbnailUrl: "/catalogue-photos/f1c87a9c5de7-320.webp",
        cardUrl: "/catalogue-photos/f1c87a9c5de7-800.webp",
        alt: "Board 1 top surface beside the coastal railing",
        width: 1125,
        height: 1600,
      },
      {
        url: "/catalogue-photos/3b786e72256a-1600.webp",
        thumbnailUrl: "/catalogue-photos/3b786e72256a-320.webp",
        cardUrl: "/catalogue-photos/3b786e72256a-800.webp",
        alt: "Close view of Board 1 timber, printed mark and truck",
        width: 1600,
        height: 1067,
      },
      {
        url: "/catalogue-photos/bdd1a609588c-1600.webp",
        thumbnailUrl: "/catalogue-photos/bdd1a609588c-320.webp",
        cardUrl: "/catalogue-photos/bdd1a609588c-800.webp",
        alt: "Board 1 held to show the underside, trucks and wheels",
        width: 1600,
        height: 1023,
      },
      {
        url: "/catalogue-photos/b7875bc046ce-1600.webp",
        thumbnailUrl: "/catalogue-photos/b7875bc046ce-320.webp",
        cardUrl: "/catalogue-photos/b7875bc046ce-800.webp",
        alt: "Board 1 held to show the top surface",
        width: 1600,
        height: 1067,
      },
    ],
    purchasable: false,
  },
  {
    id: "board-3",
    handle: "board-3",
    title: "Board 03",
    description:
      "Top, underside, detail and held views of a timber board with Plankz branding, trucks and wheels.",
    category: "boards",
    images: [
      {
        url: "/catalogue-photos/e7f86664baf9-1600.webp",
        thumbnailUrl: "/catalogue-photos/e7f86664baf9-320.webp",
        cardUrl: "/catalogue-photos/e7f86664baf9-800.webp",
        alt: "Board 3 underside with trucks and wheels beside the coastal railing",
        width: 1600,
        height: 1067,
      },
      {
        url: "/catalogue-photos/c478a0eb741c-1600.webp",
        thumbnailUrl: "/catalogue-photos/c478a0eb741c-320.webp",
        cardUrl: "/catalogue-photos/c478a0eb741c-800.webp",
        alt: "Board 3 top surface beside the coastal railing",
        width: 1170,
        height: 1600,
      },
      {
        url: "/catalogue-photos/de4b0b0fefe6-1600.webp",
        thumbnailUrl: "/catalogue-photos/de4b0b0fefe6-320.webp",
        cardUrl: "/catalogue-photos/de4b0b0fefe6-800.webp",
        alt: "Close view of Board 3 timber, printed mark and truck",
        width: 1124,
        height: 1600,
      },
      {
        url: "/catalogue-photos/4ea4024209c5-1600.webp",
        thumbnailUrl: "/catalogue-photos/4ea4024209c5-320.webp",
        cardUrl: "/catalogue-photos/4ea4024209c5-800.webp",
        alt: "Board 3 held to show the underside, trucks and wheels",
        width: 1600,
        height: 1067,
      },
      {
        url: "/catalogue-photos/e83baf618f66-1600.webp",
        thumbnailUrl: "/catalogue-photos/e83baf618f66-320.webp",
        cardUrl: "/catalogue-photos/e83baf618f66-800.webp",
        alt: "Board 3 held to show the top surface",
        width: 1600,
        height: 1067,
      },
    ],
    purchasable: false,
  },
  {
    id: "board-4",
    handle: "board-4",
    title: "Board 04",
    description:
      "Top, underside, detail and held views of a timber board with Plankz branding, trucks and wheels.",
    category: "boards",
    images: [
      {
        url: "/catalogue-photos/8d5139f96087-1600.webp",
        thumbnailUrl: "/catalogue-photos/8d5139f96087-320.webp",
        cardUrl: "/catalogue-photos/8d5139f96087-800.webp",
        alt: "Board 4 underside with trucks and wheels beside the coastal railing",
        width: 1600,
        height: 1067,
      },
      {
        url: "/catalogue-photos/03554e5e5722-1600.webp",
        thumbnailUrl: "/catalogue-photos/03554e5e5722-320.webp",
        cardUrl: "/catalogue-photos/03554e5e5722-800.webp",
        alt: "Board 4 top surface beside the coastal railing",
        width: 1205,
        height: 1600,
      },
      {
        url: "/catalogue-photos/f86cf913f717-1600.webp",
        thumbnailUrl: "/catalogue-photos/f86cf913f717-320.webp",
        cardUrl: "/catalogue-photos/f86cf913f717-800.webp",
        alt: "Close view of Board 4 timber, printed mark and truck",
        width: 1124,
        height: 1600,
      },
      {
        url: "/catalogue-photos/26ba39523b7e-1600.webp",
        thumbnailUrl: "/catalogue-photos/26ba39523b7e-320.webp",
        cardUrl: "/catalogue-photos/26ba39523b7e-800.webp",
        alt: "Board 4 held to show the underside, trucks and wheels",
        width: 1600,
        height: 1067,
      },
      {
        url: "/catalogue-photos/d47f67a5582f-1600.webp",
        thumbnailUrl: "/catalogue-photos/d47f67a5582f-320.webp",
        cardUrl: "/catalogue-photos/d47f67a5582f-800.webp",
        alt: "Board 4 held to show the top surface",
        width: 1600,
        height: 985,
      },
    ],
    purchasable: false,
  },
  {
    id: "board-5",
    handle: "board-5",
    title: "Board 05",
    description:
      "Top, underside, detail and held views of a timber board with Plankz branding, trucks and wheels.",
    category: "boards",
    images: [
      {
        url: "/catalogue-photos/d52029f682ec-1600.webp",
        thumbnailUrl: "/catalogue-photos/d52029f682ec-320.webp",
        cardUrl: "/catalogue-photos/d52029f682ec-800.webp",
        alt: "Board 5 underside with trucks and wheels beside the coastal railing",
        width: 1600,
        height: 1067,
      },
      {
        url: "/catalogue-photos/f41e380580b1-1600.webp",
        thumbnailUrl: "/catalogue-photos/f41e380580b1-320.webp",
        cardUrl: "/catalogue-photos/f41e380580b1-800.webp",
        alt: "Board 5 top surface beside the coastal railing",
        width: 1039,
        height: 1600,
      },
      {
        url: "/catalogue-photos/4ce4e2a02a0e-1600.webp",
        thumbnailUrl: "/catalogue-photos/4ce4e2a02a0e-320.webp",
        cardUrl: "/catalogue-photos/4ce4e2a02a0e-800.webp",
        alt: "Close view of Board 5 timber, printed mark and truck",
        width: 1141,
        height: 1600,
      },
      {
        url: "/catalogue-photos/58cdedff9574-1600.webp",
        thumbnailUrl: "/catalogue-photos/58cdedff9574-320.webp",
        cardUrl: "/catalogue-photos/58cdedff9574-800.webp",
        alt: "Board 5 held to show the top surface",
        width: 1600,
        height: 1067,
      },
    ],
    purchasable: false,
  },
  {
    id: "board-6",
    handle: "board-6",
    title: "Board 06",
    description:
      "Top, underside, detail and held views of a timber board with Plankz branding, trucks and wheels.",
    category: "boards",
    images: [
      {
        url: "/catalogue-photos/d980b44b6e07-1600.webp",
        thumbnailUrl: "/catalogue-photos/d980b44b6e07-320.webp",
        cardUrl: "/catalogue-photos/d980b44b6e07-800.webp",
        alt: "Board 6 underside with trucks and wheels beside the coastal railing",
        width: 1600,
        height: 1067,
      },
      {
        url: "/catalogue-photos/cfe0395ad902-1600.webp",
        thumbnailUrl: "/catalogue-photos/cfe0395ad902-320.webp",
        cardUrl: "/catalogue-photos/cfe0395ad902-800.webp",
        alt: "Board 6 top surface beside the coastal railing",
        width: 1102,
        height: 1600,
      },
      {
        url: "/catalogue-photos/088fd0d9333a-1600.webp",
        thumbnailUrl: "/catalogue-photos/088fd0d9333a-320.webp",
        cardUrl: "/catalogue-photos/088fd0d9333a-800.webp",
        alt: "Close view of Board 6 timber, printed mark and truck",
        width: 1600,
        height: 1067,
      },
      {
        url: "/catalogue-photos/11f585990c66-1600.webp",
        thumbnailUrl: "/catalogue-photos/11f585990c66-320.webp",
        cardUrl: "/catalogue-photos/11f585990c66-800.webp",
        alt: "Board 6 held to show the underside, trucks and wheels",
        width: 1600,
        height: 1067,
      },
      {
        url: "/catalogue-photos/a8025a0e62d9-1600.webp",
        thumbnailUrl: "/catalogue-photos/a8025a0e62d9-320.webp",
        cardUrl: "/catalogue-photos/a8025a0e62d9-800.webp",
        alt: "Board 6 held to show the top surface",
        width: 1600,
        height: 1067,
      },
    ],
    purchasable: false,
  },
  {
    id: "hat-beige",
    handle: "hat-beige",
    title: "Beige cap",
    description:
      "A beige cap with an embroidered Plankz front logo, photographed beside the coast.",
    category: "hats",
    images: [
      {
        url: "/catalogue-photos/530b31e8b521-1600.webp",
        thumbnailUrl: "/catalogue-photos/530b31e8b521-320.webp",
        cardUrl: "/catalogue-photos/530b31e8b521-800.webp",
        alt: "Close front view of a beige Plankz cap with a black-and-white embroidered logo on a weathered timber railing.",
        width: 1600,
        height: 1067,
      },
      {
        url: "/catalogue-photos/ee80f5785b9e-1600.webp",
        thumbnailUrl: "/catalogue-photos/ee80f5785b9e-320.webp",
        cardUrl: "/catalogue-photos/ee80f5785b9e-800.webp",
        alt: "A beige Plankz cap with an embroidered front logo on a timber railing, with the rocky coast and ocean blurred behind.",
        width: 1194,
        height: 1600,
      },
      {
        url: "/catalogue-photos/ec039f026f01-1600.webp",
        thumbnailUrl: "/catalogue-photos/ec039f026f01-320.webp",
        cardUrl: "/catalogue-photos/ec039f026f01-800.webp",
        alt: "A beige Plankz cap in focus at the front of a row of five differently coloured caps on a timber railing beside the ocean.",
        width: 1600,
        height: 1165,
      },
    ],
    purchasable: false,
  },
  {
    id: "hat-black",
    handle: "hat-black",
    title: "Black cap",
    description:
      "A black cap with an embroidered Plankz front logo, photographed beside the coast.",
    category: "hats",
    images: [
      {
        url: "/catalogue-photos/babb9b026663-1600.webp",
        thumbnailUrl: "/catalogue-photos/babb9b026663-320.webp",
        cardUrl: "/catalogue-photos/babb9b026663-800.webp",
        alt: "A black Plankz cap in focus at the front of a row of five differently coloured caps on a timber railing beside the ocean.",
        width: 1600,
        height: 1067,
      },
      {
        url: "/catalogue-photos/9ce33614d064-1600.webp",
        thumbnailUrl: "/catalogue-photos/9ce33614d064-320.webp",
        cardUrl: "/catalogue-photos/9ce33614d064-800.webp",
        alt: "A black Plankz cap with an embroidered front logo on a timber railing, with the rocky coast and ocean blurred behind.",
        width: 1067,
        height: 1600,
      },
    ],
    purchasable: false,
  },
  {
    id: "hat-khaki",
    handle: "hat-khaki",
    title: "Khaki cap",
    description:
      "A khaki cap with an embroidered Plankz front logo, photographed beside the coast.",
    category: "hats",
    images: [
      {
        url: "/catalogue-photos/84405562bb84-1600.webp",
        thumbnailUrl: "/catalogue-photos/84405562bb84-320.webp",
        cardUrl: "/catalogue-photos/84405562bb84-800.webp",
        alt: "Close front view of a khaki Plankz cap with a black-and-white embroidered logo on a weathered timber railing.",
        width: 1600,
        height: 1067,
      },
      {
        url: "/catalogue-photos/dbef62946b80-1600.webp",
        thumbnailUrl: "/catalogue-photos/dbef62946b80-320.webp",
        cardUrl: "/catalogue-photos/dbef62946b80-800.webp",
        alt: "A khaki Plankz cap with an embroidered front logo on a timber railing, with the rocky coast and ocean blurred behind.",
        width: 1267,
        height: 1600,
      },
      {
        url: "/catalogue-photos/61d8cec9251e-1600.webp",
        thumbnailUrl: "/catalogue-photos/61d8cec9251e-320.webp",
        cardUrl: "/catalogue-photos/61d8cec9251e-800.webp",
        alt: "A khaki Plankz cap in focus at the front of a row of five differently coloured caps on a timber railing beside the ocean.",
        width: 1600,
        height: 1185,
      },
    ],
    purchasable: false,
  },
  {
    id: "hat-maroon",
    handle: "hat-maroon",
    title: "Maroon cap",
    description:
      "A maroon cap with an embroidered Plankz front logo, photographed beside the coast.",
    category: "hats",
    images: [
      {
        url: "/catalogue-photos/c18e3e539c92-1600.webp",
        thumbnailUrl: "/catalogue-photos/c18e3e539c92-320.webp",
        cardUrl: "/catalogue-photos/c18e3e539c92-800.webp",
        alt: "Close front view of a maroon Plankz cap with a black-and-white embroidered logo on a weathered timber railing.",
        width: 1600,
        height: 1067,
      },
      {
        url: "/catalogue-photos/78abf0814a39-1600.webp",
        thumbnailUrl: "/catalogue-photos/78abf0814a39-320.webp",
        cardUrl: "/catalogue-photos/78abf0814a39-800.webp",
        alt: "A maroon Plankz cap with an embroidered front logo on a timber railing, with the rocky coast and ocean blurred behind.",
        width: 1240,
        height: 1600,
      },
      {
        url: "/catalogue-photos/a6ea8562fde0-1600.webp",
        thumbnailUrl: "/catalogue-photos/a6ea8562fde0-320.webp",
        cardUrl: "/catalogue-photos/a6ea8562fde0-800.webp",
        alt: "A maroon Plankz cap in focus at the front of a row of five differently coloured caps on a timber railing beside the ocean.",
        width: 1600,
        height: 1161,
      },
    ],
    purchasable: false,
  },
  {
    id: "hat-pink",
    handle: "hat-pink",
    title: "Pink cap",
    description: "A pink cap with an embroidered Plankz front logo, photographed beside the coast.",
    category: "hats",
    images: [
      {
        url: "/catalogue-photos/2b92594ef91f-1600.webp",
        thumbnailUrl: "/catalogue-photos/2b92594ef91f-320.webp",
        cardUrl: "/catalogue-photos/2b92594ef91f-800.webp",
        alt: "A pink Plankz cap in focus at the front of a row of five differently coloured caps on a timber railing beside the ocean.",
        width: 1600,
        height: 1159,
      },
      {
        url: "/catalogue-photos/1fb153557664-1600.webp",
        thumbnailUrl: "/catalogue-photos/1fb153557664-320.webp",
        cardUrl: "/catalogue-photos/1fb153557664-800.webp",
        alt: "A pink Plankz cap with an embroidered front logo on a timber railing, with the rocky coast and ocean blurred behind.",
        width: 1206,
        height: 1600,
      },
    ],
    purchasable: false,
  },
  {
    id: "og-tee",
    handle: "og-tee",
    title: "Plankz tee",
    description: "A white tee with a small black chest mark and a larger colour print on the back.",
    category: "tees",
    images: [
      {
        url: "/catalogue-photos/4ecb7a9291ff-1600.webp",
        thumbnailUrl: "/catalogue-photos/4ecb7a9291ff-320.webp",
        cardUrl: "/catalogue-photos/4ecb7a9291ff-800.webp",
        alt: "Back of the white Plankz tee with the large colour print visible",
        width: 1237,
        height: 1600,
      },
      {
        url: "/catalogue-photos/61fa03c5677c-1600.webp",
        thumbnailUrl: "/catalogue-photos/61fa03c5677c-320.webp",
        cardUrl: "/catalogue-photos/61fa03c5677c-800.webp",
        alt: "Front of the white Plankz tee with its small black chest mark",
        width: 1600,
        height: 1067,
      },
      {
        url: "/catalogue-photos/4b9f77ac6c55-1600.webp",
        thumbnailUrl: "/catalogue-photos/4b9f77ac6c55-320.webp",
        cardUrl: "/catalogue-photos/4b9f77ac6c55-800.webp",
        alt: "Close view of the large colour print on the Plankz tee back",
        width: 1600,
        height: 1067,
      },
      {
        url: "/catalogue-photos/09f2c1fa7ee9-1600.webp",
        thumbnailUrl: "/catalogue-photos/09f2c1fa7ee9-320.webp",
        cardUrl: "/catalogue-photos/09f2c1fa7ee9-800.webp",
        alt: "Close view of the black chest mark on the Plankz tee front",
        width: 1600,
        height: 1067,
      },
      {
        url: "/catalogue-photos/b92bda678cdf-1600.webp",
        thumbnailUrl: "/catalogue-photos/b92bda678cdf-320.webp",
        cardUrl: "/catalogue-photos/b92bda678cdf-800.webp",
        alt: "Alternate coastal view of the Plankz tee back and large colour print",
        width: 1067,
        height: 1600,
      },
    ],
    purchasable: false,
  },
  {
    id: "jacket-beige",
    handle: "jacket-beige",
    title: "Beige jacket",
    description:
      "A beige plaid hooded jacket with front pockets, a small chest logo and a large Plankz back logo.",
    category: "jackets",
    images: [
      {
        url: "/catalogue-photos/8a725aa89a97-1600.webp",
        thumbnailUrl: "/catalogue-photos/8a725aa89a97-320.webp",
        cardUrl: "/catalogue-photos/8a725aa89a97-800.webp",
        alt: "Front of the beige plaid hooded jacket, showing pockets and the small chest logo.",
        width: 1210,
        height: 1600,
      },
      {
        url: "/catalogue-photos/6ded0f9ba876-1600.webp",
        thumbnailUrl: "/catalogue-photos/6ded0f9ba876-320.webp",
        cardUrl: "/catalogue-photos/6ded0f9ba876-800.webp",
        alt: "Back of the beige plaid hooded jacket, showing the large Plankz logo.",
        width: 1600,
        height: 1067,
      },
      {
        url: "/catalogue-photos/a158cf0daeb5-1600.webp",
        thumbnailUrl: "/catalogue-photos/a158cf0daeb5-320.webp",
        cardUrl: "/catalogue-photos/a158cf0daeb5-800.webp",
        alt: "Detail of the back logo on the beige plaid hooded jacket.",
        width: 1593,
        height: 1600,
      },
    ],
    purchasable: false,
  },
  {
    id: "jacket-olive",
    handle: "jacket-olive",
    title: "Olive jacket",
    description:
      "An olive plaid hooded jacket with front pockets, a small chest logo and a large Plankz back logo.",
    category: "jackets",
    images: [
      {
        url: "/catalogue-photos/f8c9683779bf-1600.webp",
        thumbnailUrl: "/catalogue-photos/f8c9683779bf-320.webp",
        cardUrl: "/catalogue-photos/f8c9683779bf-800.webp",
        alt: "Front of the olive plaid hooded jacket, showing pockets and the small chest logo.",
        width: 1247,
        height: 1600,
      },
      {
        url: "/catalogue-photos/0f7b24acb690-1600.webp",
        thumbnailUrl: "/catalogue-photos/0f7b24acb690-320.webp",
        cardUrl: "/catalogue-photos/0f7b24acb690-800.webp",
        alt: "Back of the olive plaid hooded jacket, showing the large Plankz logo.",
        width: 1600,
        height: 1067,
      },
      {
        url: "/catalogue-photos/105ba17b5bf3-1600.webp",
        thumbnailUrl: "/catalogue-photos/105ba17b5bf3-320.webp",
        cardUrl: "/catalogue-photos/105ba17b5bf3-800.webp",
        alt: "Detail of the back logo on the olive plaid hooded jacket.",
        width: 1600,
        height: 1067,
      },
    ],
    purchasable: false,
  },
  {
    id: "bearing-photo-set",
    handle: "bearing-photo-set",
    title: "Bearings",
    description: "Red-sealed bearings photographed beside Fushi packaging.",
    category: "bearings",
    images: [
      {
        url: "/catalogue-photos/695bdffcee2f-1600.webp",
        thumbnailUrl: "/catalogue-photos/695bdffcee2f-320.webp",
        cardUrl: "/catalogue-photos/695bdffcee2f-800.webp",
        alt: "Red-sealed bearings stacked beside two Fushi packages",
        width: 1600,
        height: 1509,
      },
      {
        url: "/catalogue-photos/17efa06a7ecc-1600.webp",
        thumbnailUrl: "/catalogue-photos/17efa06a7ecc-320.webp",
        cardUrl: "/catalogue-photos/17efa06a7ecc-800.webp",
        alt: "Red-sealed bearings laid in a tray beside two Fushi packages",
        width: 1600,
        height: 1586,
      },
    ],
    purchasable: false,
  },
  {
    id: "board-sticker",
    handle: "board-sticker",
    title: "Board-shaped sticker",
    description: "Board-shaped Plankz logo sticker designs arranged on timber.",
    category: "stickers",
    images: [
      {
        url: "/catalogue-photos/d50f0a08ed9a-1600.webp",
        thumbnailUrl: "/catalogue-photos/d50f0a08ed9a-320.webp",
        cardUrl: "/catalogue-photos/d50f0a08ed9a-800.webp",
        alt: "Board-shaped Plankz logo sticker designs on timber",
        width: 1600,
        height: 1067,
      },
    ],
    purchasable: false,
  },
  {
    id: "named-round-sticker",
    handle: "named-round-sticker",
    title: "Round name sticker",
    description: "Round sticker designs showing the Plankz Deckz name.",
    category: "stickers",
    images: [
      {
        url: "/catalogue-photos/86958af9628a-1600.webp",
        thumbnailUrl: "/catalogue-photos/86958af9628a-320.webp",
        cardUrl: "/catalogue-photos/86958af9628a-800.webp",
        alt: "Round Plankz sticker designs with the Plankz Deckz name on timber",
        width: 1600,
        height: 1067,
      },
    ],
    purchasable: false,
  },
  {
    id: "og-sticker",
    handle: "og-sticker",
    title: "Round logo sticker",
    description: "Round Plankz logo sticker designs with surrounding lettering.",
    category: "stickers",
    images: [
      {
        url: "/catalogue-photos/67b0bbc4172d-1600.webp",
        thumbnailUrl: "/catalogue-photos/67b0bbc4172d-320.webp",
        cardUrl: "/catalogue-photos/67b0bbc4172d-800.webp",
        alt: "Round Plankz logo sticker designs with surrounding lettering on timber",
        width: 1600,
        height: 1067,
      },
    ],
    purchasable: false,
  },
  {
    id: "sticker-designs-together",
    handle: "sticker-designs-together",
    title: "Sticker designs",
    description: "Two round sticker designs and one board-shaped design shown together.",
    category: "stickers",
    images: [
      {
        url: "/catalogue-photos/813ccbec1828-1600.webp",
        thumbnailUrl: "/catalogue-photos/813ccbec1828-320.webp",
        cardUrl: "/catalogue-photos/813ccbec1828-800.webp",
        alt: "Three Plankz sticker designs together: two round designs and a board-shaped design",
        width: 1600,
        height: 1067,
      },
    ],
    purchasable: false,
  },
];

export function getPublicCatalogueItemByHandle(handle: string): PublicCatalogueItem | undefined {
  return PUBLIC_CATALOGUE.find((item) => item.handle === handle);
}

export function getPublicCatalogueItems(
  category?: PublicCatalogueCategory,
): readonly PublicCatalogueItem[] {
  return category
    ? PUBLIC_CATALOGUE.filter((item) => item.category === category)
    : PUBLIC_CATALOGUE;
}
