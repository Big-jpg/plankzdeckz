# Plankz Deckz

A Next.js site for Plankz boards and wares. The public `/shop` is a photo catalogue with online sales disabled. Its 18 display entries and 54 reviewed views render independently of stock records. See [the public catalogue operator guide](docs/public-catalogue.md).

The separate commerce catalogue remains in Neon Postgres and is authored in `/admin/products`, with product images in public Vercel Blob. Stripe checkout code is retained behind the sales closure; existing order recovery and payment webhooks remain available.

## Setup

Install dependencies with `pnpm install`. Configure `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `AUTH_SECRET`, `ADMIN_EMAILS`, and `NEXT_PUBLIC_SITE_URL` in the target environment. Keep secrets out of the repository. Run `pnpm dev` for local development.

For a **new** database, apply `001_initial_schema.sql`, then `002_storefront_catalogue.sql`, then all files in `db/procedures/` in the order shown in [db/README.md](db/README.md). For an **existing** Plankz database, apply only `002_storefront_catalogue.sql` and reapply `order_procedures.sql`. Do not rerun the initial schema on an existing database. Existing product rows become drafts and require review and real photos before publication; nothing is seeded into the shop.

## Product workflow

An allowed admin signs in and creates a board or OG tee. The editor saves incomplete drafts, orders image views, previews the listing, and permits commerce publication only after the required price, images, description, and stock details exist. The list also permits quick publication, board availability, and tee size stock changes. Sold published boards remain visible in `/gallery` and on their stable product URLs. Draft and archived products are excluded from public catalogue queries and checkout.

When explicitly enabled, checkout revalidates the current database price and stock. A Postgres hold reserves each board or tee quantity before a Stripe session is created. The verified paid webhook records the order and applies stock changes idempotently. Sessions expire after 30 minutes; the matching expiry event releases the hold. Pickup details are tracked in the existing order admin.

For private photo intake, local non-purchasable category previews, reproducible derivatives, and photo-only saves that preserve price and stock, follow [the photography operator guide](docs/photo-intake.md). This workflow needs no migration and does not publish incoming imagery.

## Preview verification

Apply the migration and Blob token to a preview environment first. Create a draft, edit it, upload four original product views, preview, publish, and confirm the public URL. Exercise stale price, unavailable size, simultaneous board checkouts, abandoned session, and duplicate webhook cases. Confirm the order and pickup fields before any production migration or deployment. No product imagery or inventory is seeded by this repository.

`pnpm exec tsc --noEmit`, `pnpm lint`, and `pnpm build` verify local code. `pnpm test:smoke` covers basic API and route protection without inventory. Full browser and payment checks require a reachable preview database, a Stripe test account, and real test inventory.
