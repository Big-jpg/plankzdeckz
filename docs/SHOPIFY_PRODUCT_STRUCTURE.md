# Shopify Product Structure — Lumenform Studio

This document describes the expected Shopify product configuration for the Lumenform Studio storefront to correctly normalise Shopify catalogue data into the application's internal Product DTO.

---

## Overview

The application reads products from the **Shopify Storefront API** (GraphQL) and normalises them into a unified `Product` type defined in `/lib/types.ts`. Product metadata that cannot be expressed through standard Shopify fields is stored in **metafields** under the `lumenform` namespace.

---

## Standard Shopify Fields Used

| Shopify Field                | Maps To                                  | Notes                                                |
| ---------------------------- | ---------------------------------------- | ---------------------------------------------------- |
| `id`                         | `Product.id`, `Product.shopifyProductId` | Shopify global ID (e.g. `gid://shopify/Product/123`) |
| `handle`                     | `Product.handle`                         | URL-safe slug used for routing                       |
| `title`                      | `Product.title`                          | Product display name                                 |
| `description`                | `Product.description`                    | Plain text product description                       |
| `productType`                | `Product.category` (fallback)            | Used if `lumenform.category` metafield is not set    |
| `tags`                       | —                                        | Reserved for future filtering; not currently mapped  |
| `availableForSale`           | `Product.inStock`                        | Boolean stock availability                           |
| `priceRange.minVariantPrice` | `Product.price`, `Product.currency`      | Fallback if no variant is present                    |
| `images`                     | `Product.images`                         | Array of image URLs (first 10)                       |
| `variants[0].id`             | `Product.shopifyVariantId`               | First variant ID preserved for cart/checkout         |
| `variants[0].price`          | `Product.price`, `Product.currency`      | Primary price source                                 |

---

## Metafields (namespace: `lumenform`)

All metafields use the `lumenform` namespace. Create them in Shopify Admin under **Settings > Custom data > Products**.

### Required Metafields

| Key                   | Type                               | Description                                                                                             | Example Value                                           |
| --------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `category`            | `single_line_text_field`           | Product category matching one of the app's `ProductCategory` values                                     | `Pleated shades`                                        |
| `material`            | `single_line_text_field`           | Material description                                                                                    | `PLA (polylactic acid), matte finish`                   |
| `dimensions`          | `single_line_text_field`           | Physical dimensions                                                                                     | `Ø 280mm × H 220mm`                                     |
| `colours`             | `json` or `single_line_text_field` | Available colour options. JSON array preferred; comma-separated string accepted as fallback.            | `["Warm White", "Soft Ivory", "Pale Grey"]`             |
| `compatible_adapters` | `json` or `single_line_text_field` | Adapter types this product supports. JSON array preferred. If empty or missing, all adapters are shown. | `["B22", "E27", "Clipsal No. 530", "Other / not sure"]` |

### Optional Metafields

| Key                       | Type                     | Description                                        | Example Value                             |
| ------------------------- | ------------------------ | -------------------------------------------------- | ----------------------------------------- |
| `design_family`           | `single_line_text_field` | Design family grouping name                        | `Meridian`                                |
| `production_notes`        | `multi_line_text_field`  | Internal production notes (not shown to customers) | `Print at 0.2mm layer height, 15% infill` |
| `market_event_id`         | `single_line_text_field` | Market/fair event identifier                       | `market-2024-glebe`                       |
| `market_source`           | `single_line_text_field` | Market source attribution                          | `glebe-markets`                           |
| `qr_campaign`             | `single_line_text_field` | QR code campaign identifier                        | `qr-spring-2024`                          |
| `display_sample_id`       | `single_line_text_field` | Physical display sample reference                  | `sample-meridian-01`                      |
| `production_queue_status` | `single_line_text_field` | Current production status                          | `queued`                                  |
| `filament_material`       | `single_line_text_field` | Specific filament material used                    | `Polymaker PolyLite PLA`                  |
| `filament_colour`         | `single_line_text_field` | Specific filament colour code                      | `Warm White #F5F0E8`                      |
| `print_profile`           | `single_line_text_field` | Slicer print profile reference                     | `lumenform-standard-0.2`                  |

---

## Valid Category Values

The `category` metafield must match one of the following values exactly (case-insensitive matching is applied during normalisation):

- `Pleated shades`
- `Faceted / geometric shades`
- `Floral / petal shades`
- `Textured diffuser shades`
- `Starfield / perforated shades`
- `Experimental prototypes`

If no valid category is found in either the metafield or `productType`, the product defaults to `Experimental prototypes`.

---

## Valid Adapter Values

The `compatible_adapters` metafield should contain one or more of:

- `B22`
- `E27`
- `Clipsal No. 530`
- `Other / not sure`

If the metafield is empty or missing, **all four adapters** are shown as available options.

---

## Variant Strategy

The application uses a **single base variant** per product. The adapter selection is a configuration field on the storefront, not a paid Shopify variant.

**Do NOT create separate paid variants for each adapter type** unless explicitly approved. The adapter is included in the product price.

If multiple variants exist (e.g. for colour), only the first variant's ID and price are used by the current normalisation logic.

---

## Image Requirements

- Upload product images directly to Shopify.
- The first image is used as the primary display image.
- Up to 10 images are fetched per product.
- Images are served from `cdn.shopify.com` and are configured in `next.config.ts` remote patterns.

---

## Environment Variables

| Variable                          | Description                                     | Example                   |
| --------------------------------- | ----------------------------------------------- | ------------------------- |
| `SHOPIFY_STORE_DOMAIN`            | Your `.myshopify.com` domain                    | `lumenform.myshopify.com` |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Storefront API access token (public, read-only) | `shpat_xxxxx`             |
| `SHOPIFY_API_VERSION`             | API version string                              | `2024-10`                 |

When these variables are not set, the application automatically falls back to the local mock catalogue (`/lib/mock-products.ts`).

---

## Fallback Behaviour

| Condition                                 | Behaviour                                                                |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| `SHOPIFY_STORE_DOMAIN` not set            | Mock catalogue is used                                                   |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` not set | Mock catalogue is used                                                   |
| Both set but API returns error            | Error is thrown (no silent fallback to mock)                             |
| Metafield missing                         | Sensible defaults applied (see normalisation logic in `/lib/shopify.ts`) |

---

## Setting Up Metafields in Shopify Admin

1. Go to **Settings > Custom data > Products**.
2. Click **Add definition** for each metafield listed above.
3. Set the namespace to `lumenform` and the key as specified.
4. Choose the appropriate type (`single_line_text_field`, `multi_line_text_field`, or `json`).
5. Populate values on each product.

Alternatively, use the Shopify Admin API or a bulk import tool to set metafield values programmatically.
