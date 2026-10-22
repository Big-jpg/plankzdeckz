# Plankz Deckz

Next.js storefront with Neon PostgreSQL as catalogue/order/inventory authority, Vercel Blob product imagery, Stripe hosted Checkout and Auth.js email sign-in. Online fulfilment is local pickup. Stripe Dashboard Tap to Pay is the separate owner-operated market payment application.

## Local development

Install locked dependencies with `pnpm install --frozen-lockfile`, configure a private `.env.local` from `.env.example`, then run `pnpm dev`. Keep development/preview resources separate from production. Never commit populated environment files or customer data.

Sales default to disabled. `NEXT_PUBLIC_SALES_ENABLED=true` enables a new build's buying UI and server checkout endpoints; changing the environment alone does not change an existing build. Configuration and passing tests do not authorize production activation.

## Products and inventory

The existing `/admin/products` wizard supports boards, tees, hats, jackets, bearings and stickers. Create incomplete drafts, upload images to Blob, supply real prices/units/stock and publish. Clothing uses declared sizes; other merchandise uses a single quantity. One product represents each colour/design/sale pack. An owner must confirm sales units; old merchandise without that label remains unavailable.

When sales are enabled, published purchasable Neon products appear in `/shop`'s Available products section and on stable `/products/[handle]` pages. Existing `/shop/[handle]` photography stays a separate non-purchasable collection. Published sold boards remain in `/gallery`; archives keep order history but leave public catalogue reads.

Stock changes require a current product revision and an adjustment reason. Outstanding checkout reservations and unresolved market-sale records block conflicting stock/publication changes. Refunds never restock automatically.

Checkout saves a durable attempt, reserves stock, creates an idempotent Stripe session and uses the verified paid webhook to commit the complete order/items/inventory/email intent together. Sessions expire after 35 minutes; reservations are released only after authoritative Stripe reconciliation. A local timestamp is not sufficient. Creation timeouts keep stock reserved until recovered.

Use `/admin/orders` for order search, pickup, refund refresh, checkout recovery and email retry. Use `/admin/market-sales` to record actual Tap to Pay sales with a Stripe reference. Unpublish all event products before physical sale, resolve pre-existing checkouts, and reconcile before republishing.

## Database installation

See [db/README.md](db/README.md) for fresh and upgrade sequences. Migrations are explicit operator actions and never run on application startup/build. The commerce upgrade refuses to proceed with unresolved legacy holds. Keep schema credentials separate from the restricted application role.

## Verification and operations

- `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`, `pnpm test:smoke`
- `pnpm test:commerce` runs isolated real PostgreSQL concurrency/recovery tests with mocked Stripe/SMTP; see the verification report for setup. It never reads `.env` or uses a production database.
- [Architecture audit](docs/commerce-go-live-audit.md)
- [Verification and remaining acceptance](docs/commerce-verification.md)
- [Production activation and rollback checklist](docs/production-environment-checklist.md)
- [Corey and Blair's operating guide](docs/commerce-owner-guide.md)
- [Private photography workflow](docs/photo-intake.md)

Live migrations, deployment, access changes, inventory changes, checkout activation, charges and refunds require explicit approval. Owner device acceptance, actual email delivery and payout routing remain manual launch gates.
