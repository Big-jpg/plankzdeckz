# Vercel deployment

Plankz Deckz uses the existing Next.js deployment, Neon PostgreSQL, Stripe Checkout, Auth.js SMTP sign-in and Vercel Blob. It does not use Shopify for catalogue or inventory.

Follow [the production checklist](production-environment-checklist.md) for target verification, migration order, secrets, test-mode acceptance, approval gates and rollback. Builds do not apply migrations. Use isolated Preview resources and keep sales disabled until the explicitly approved activation build.

`NEXT_PUBLIC_SALES_ENABLED` is a build-time setting shared by browser and server code, defaulting to false. A previous disabled build remains disabled after an environment change until it is rebuilt. Webhooks/recovery must remain running for outstanding payments, including while new checkout is disabled.

Never deploy a version lacking the current inventory revision and durable reservation protections against the upgraded live database.
