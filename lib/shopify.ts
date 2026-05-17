// lib/shopify.ts
//
// Server-only Shopify Storefront API client.
// All calls use the Storefront API (public, read-only) via server-side fetch.
// No private credentials are exposed to the client bundle.

import type { Product, ProductCategory, AdapterType, ProductMetadata } from "./types";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN ?? "";
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? "";
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2024-10";

function getEndpoint(): string {
  return `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
}

// ---------------------------------------------------------------------------
// Generic Storefront API fetch
// ---------------------------------------------------------------------------

interface StorefrontResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

async function storefrontFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(getEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 120 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify Storefront API error ${res.status}: ${text}`);
  }

  const json: StorefrontResponse<T> = await res.json();

  if (json.errors?.length) {
    throw new Error(`Shopify GraphQL errors: ${json.errors.map((e) => e.message).join("; ")}`);
  }

  if (!json.data) {
    throw new Error("Shopify Storefront API returned no data.");
  }

  return json.data;
}

// ---------------------------------------------------------------------------
// GraphQL fragments & queries
// ---------------------------------------------------------------------------

const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    productType
    tags
    availableForSale
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 10) {
      edges {
        node {
          url
          altText
        }
      }
    }
    variants(first: 1) {
      edges {
        node {
          id
          availableForSale
          price {
            amount
            currencyCode
          }
        }
      }
    }
    metafields(
      identifiers: [
        { namespace: "plankz", key: "category" }
        { namespace: "plankz", key: "design_family" }
        { namespace: "plankz", key: "material" }
        { namespace: "plankz", key: "dimensions" }
        { namespace: "plankz", key: "colours" }
        { namespace: "plankz", key: "compatible_builds" }
        { namespace: "plankz", key: "production_notes" }
        { namespace: "plankz", key: "market_event_id" }
        { namespace: "plankz", key: "market_source" }
        { namespace: "plankz", key: "qr_campaign" }
        { namespace: "plankz", key: "display_sample_id" }
        { namespace: "plankz", key: "production_queue_status" }
        { namespace: "plankz", key: "timber_material" }
        { namespace: "plankz", key: "timber_finish" }
        { namespace: "plankz", key: "build_profile" }
      ]
    )
  }
`;

const PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query Products($first: Int!) {
    products(first: $first) {
      edges {
        node {
          ...ProductFields
        }
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      ...ProductFields
    }
  }
`;

// ---------------------------------------------------------------------------
// Shopify response types (minimal, matching the fragment above)
// ---------------------------------------------------------------------------

interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

interface ShopifyImage {
  url: string;
  altText: string | null;
}

interface ShopifyMetafield {
  namespace: string;
  key: string;
  value: string;
  type: string;
}

interface ShopifyVariant {
  id: string;
  availableForSale: boolean;
  price: ShopifyMoney;
}

interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: ShopifyMoney;
  };
  images: {
    edges: Array<{ node: ShopifyImage }>;
  };
  variants: {
    edges: Array<{ node: ShopifyVariant }>;
  };
  metafields: (ShopifyMetafield | null)[];
}

// ---------------------------------------------------------------------------
// Normalisation helpers
// ---------------------------------------------------------------------------

const VALID_CATEGORIES: ProductCategory[] = [
  "Reclaimed cruisers",
  "Surfskate deckz",
  "Longboard deckz",
  "Custom builds",
  "Merch",
  "Experimental prototypes",
];

const VALID_ADAPTERS: AdapterType[] = ["Cruiser", "Longboard", "Surfskate", "Custom / not sure"];

function getMetafieldValue(metafields: (ShopifyMetafield | null)[], key: string): string | null {
  const mf = metafields.find((m) => m !== null && m.key === key);
  return mf?.value ?? null;
}

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // Fall back to comma-separated
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function normaliseCategory(raw: string | null, productType: string): ProductCategory {
  // Try metafield first, then productType
  const candidates = [raw, productType];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const trimmed = candidate.trim();
    const match = VALID_CATEGORIES.find((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (match) return match;
  }
  return "Experimental prototypes";
}

function normaliseAdapters(raw: string[]): AdapterType[] {
  if (raw.length === 0) {
    // Default: all build types available
    return [...VALID_ADAPTERS];
  }
  const mapped = raw
    .map((r) => {
      const trimmed = r.trim();
      return VALID_ADAPTERS.find((a) => a.toLowerCase() === trimmed.toLowerCase()) ?? null;
    })
    .filter((a): a is AdapterType => a !== null);
  return mapped.length > 0 ? mapped : [...VALID_ADAPTERS];
}

function normaliseProduct(shopifyProduct: ShopifyProduct): Product {
  const metafields = shopifyProduct.metafields ?? [];
  const firstVariant = shopifyProduct.variants.edges[0]?.node ?? null;
  const price = parseFloat(
    firstVariant?.price.amount ?? shopifyProduct.priceRange.minVariantPrice.amount,
  );
  const currency =
    firstVariant?.price.currencyCode ?? shopifyProduct.priceRange.minVariantPrice.currencyCode;

  const rawCategory = getMetafieldValue(metafields, "category");
  const rawColours = parseJsonArray(getMetafieldValue(metafields, "colours"));
  const rawAdapters = parseJsonArray(getMetafieldValue(metafields, "compatible_builds"));

  const metadata: ProductMetadata = {};
  const metadataKeys: (keyof ProductMetadata)[] = [
    "market_event_id",
    "market_source",
    "qr_campaign",
    "display_sample_id",
    "production_queue_status",
    "timber_material",
    "timber_finish",
    "build_profile",
  ];
  for (const key of metadataKeys) {
    const val = getMetafieldValue(metafields, key);
    if (val) {
      metadata[key] = val;
    }
  }

  return {
    id: shopifyProduct.id,
    handle: shopifyProduct.handle,
    title: shopifyProduct.title,
    price,
    currency,
    category: normaliseCategory(rawCategory, shopifyProduct.productType),
    description: shopifyProduct.description,
    material: getMetafieldValue(metafields, "material") ?? "Reclaimed timber",
    dimensions: getMetafieldValue(metafields, "dimensions") ?? "",
    colours: rawColours.length > 0 ? rawColours : ["Default"],
    images: shopifyProduct.images.edges.map((e) => e.node.url),
    adapters: normaliseAdapters(rawAdapters),
    inStock: shopifyProduct.availableForSale,
    shopifyProductId: shopifyProduct.id,
    shopifyVariantId: firstVariant?.id ?? null,
    designFamily: getMetafieldValue(metafields, "design_family"),
    compatibleAdapters: rawAdapters.length > 0 ? rawAdapters : null,
    productionNotes: getMetafieldValue(metafields, "production_notes"),
    metadata: Object.keys(metadata).length > 0 ? metadata : null,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function shopifyGetProducts(first: number = 50): Promise<Product[]> {
  const data = await storefrontFetch<{
    products: { edges: Array<{ node: ShopifyProduct }> };
  }>(PRODUCTS_QUERY, { first });

  return data.products.edges.map((edge) => normaliseProduct(edge.node));
}

export async function shopifyGetProductByHandle(handle: string): Promise<Product | null> {
  const data = await storefrontFetch<{
    productByHandle: ShopifyProduct | null;
  }>(PRODUCT_BY_HANDLE_QUERY, { handle });

  if (!data.productByHandle) return null;
  return normaliseProduct(data.productByHandle);
}
