# Plankz Deckz database

Use plain PostgreSQL migrations against the explicitly selected Neon database. Builds and application startup do not change schema. Use a migration role distinct from the restricted application credential. See [production preflight and recovery](../docs/production-environment-checklist.md).

## Fresh database

Apply, with `ON_ERROR_STOP=1`:

1. `migrations/001_initial_schema.sql`
2. `migrations/002_storefront_catalogue.sql`
3. `migrations/003_commerce_completion.sql`
4. `migrations/004_order_notifications.sql`
5. `migrations/005_market_sales.sql`
6. `procedures/order_procedures.sql`
7. `procedures/auth_procedures.sql`
8. `procedures/pickup_procedures.sql`

## Existing database

Never rerun `001`. Identify already applied migrations and run only missing migrations in sequence. A database already on `002` needs `003`–`005`. Install/reapply the repository procedures as appropriate; new transactional financial writes are in server-only TypeScript using one pinned `pg` client per transaction.

Before `003`, resolve every existing board/merch checkout hold against Stripe, and investigate duplicate payment intents/Stripe line-item IDs. The migration refuses unresolved holds and conflicting unique keys; it does not erase them. Keep a recovery point and test the exact upgrade in isolation first. Existing product records are not seeded, sold or published by these migrations.

`003` adds durable checkout attempts, product revisions, order channel/refund fields and audited stock adjustments; fixes the multi-deck session constraint. `004` adds durable order notification intents and pickup revision. `005` adds audited market reconciliation records. These preserve order snapshots and existing catalogue identities.

For one approved migration in PowerShell:

```powershell
psql "$env:DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/003_commerce_completion.sql
```

The package shortcuts use POSIX variable syntax; use this explicit form on Windows. `db:setup` is only for a fresh database. Reapplying migrations `001` or `003`–`005` is not an upgrade strategy.

## Authority and recovery

Neon owns catalogue, stock and durable application orders. Stripe owns payment and refund status. Images live in Blob; ordered URLs/alt text live in products/order snapshots. Local hold expiry is advisory; only verified terminal nonpayment or a quiescent authoritative no-session search permits release.

Every financial transaction locks its attempt/sale and product rows, then commits complete order snapshots, inventory effects and notification intent together. Explicit stock adjustments record operator/reason/before/after; refunds do not invoke them.

A Vercel rollback does not undo database, Stripe or physical-sale state. Keep compatible forward schema changes and continue webhook/reconciliation service while new sales are disabled.
