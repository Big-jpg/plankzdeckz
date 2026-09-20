# Plankz Deckz database

Migrations are plain PostgreSQL SQL. Apply them deliberately against the selected Neon database; application startup does not mutate schema.

For a fresh database, run in this order:

1. `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/001_initial_schema.sql`
2. `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/002_storefront_catalogue.sql`
3. `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/procedures/order_procedures.sql`
4. `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/procedures/auth_procedures.sql`
5. `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/procedures/pickup_procedures.sql`

For an existing database, apply steps 2 and 3 only. `002` adds publication and inventory fields, checkout holds, and an inventory event key without deleting order history. Existing product rows default to `draft`. Check for duplicate `stripe_line_item_id` values in existing `order_items.metadata` before applying the unique index. Retain a backup and test the rollback procedure in preview before production.

The original `products` columns remain to preserve existing records and order contracts. Neon is the catalogue authority for public product reads and checkout validation. Vercel Blob stores image bytes; Postgres stores ordered image URLs and descriptions.
