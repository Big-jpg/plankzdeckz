# Plankz Deckz commerce deployment checklist

This checklist applies to the Neon/Stripe/Vercel Blob implementation. Production changes require explicit approval. Code checks do not authorize a release. Record the exact commit, project, Neon branch/database, Stripe account/mode, approver and operator for each release.

## 1. Establish recovery and deployment targets

- Confirm the Vercel project and custom domain from its Git integration; historical local metadata calls a project `lumenform`, so verify ownership rather than assuming that name identifies production.
- Confirm the source root is this storefront repository. Build remains `pnpm build`; migrations never run during a build.
- Retain the previous deployment and create/verify a Neon recovery point. Record a recovery operator and decision owner.
- Keep `NEXT_PUBLIC_SALES_ENABLED=false`. This setting is compiled into the build; changing it requires deployment. Webhooks and reconciliation remain available with new sales disabled.
- Test an upgrade on an isolated database copy before authorizing production SQL. Do not copy customer data into source control or test artifacts.

## 2. Database preflight and migration

Use a migration credential distinct from the application credential. Never rerun `001` on an existing database. Run psql with `ON_ERROR_STOP=1` and inspect every result.

Before `003`, inspect both checkout-hold tables and compare each session with Stripe. All existing holds must be resolved; migration `003` refuses to run otherwise. A local timestamp does not prove unpaid expiry. Complete paid orders and verify every item/inventory effect; release only reservations whose Stripe status is confirmed expired/unpaid. Unlinked legacy holds require an explicit operator investigation. Record any approved manual correction; do not blanket-delete holds to satisfy the preflight.

Inspect existing duplicate payment intents and Stripe line IDs before applying unique indexes:

```sql
SELECT stripe_payment_intent_id,count(*) FROM orders
WHERE stripe_payment_intent_id IS NOT NULL GROUP BY 1 HAVING count(*)>1;
SELECT metadata->>'stripe_line_item_id',count(*) FROM order_items
WHERE metadata ? 'stripe_line_item_id' GROUP BY 1 HAVING count(*)>1;
SELECT * FROM board_checkout_holds;
SELECT * FROM merch_checkout_holds;
```

Resolve conflicts with evidence before continuing; preserve order history.

Fresh database order: `001_initial_schema.sql`, `002_storefront_catalogue.sql`, `003_commerce_completion.sql`, `004_order_notifications.sql`, `005_market_sales.sql`, then order/auth/pickup procedure files. Existing database: apply only missing migrations in sequence; install the repository procedures where required. Never repeat a migration merely because a build was repeated.

PowerShell example for one explicitly approved migration:

```powershell
psql "$env:DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/003_commerce_completion.sql
```

The package migration shortcuts use POSIX `$DATABASE_URL` syntax; use the explicit PowerShell form on Windows. `db:setup` is fresh-database-only.

Verify application credentials are non-owner, non-superuser, lack BYPASSRLS and infrastructure administration privileges. Grant only schema USAGE, the SELECT/INSERT/UPDATE/DELETE operations actually required on app tables, and EXECUTE on the auth/order/pickup functions; no schema CREATE or ownership. Include checkout_attempts, inventory_adjustments, market_sales and order_notifications. Application SQL runs as the application role, not as a privileged SECURITY DEFINER shortcut. Test login, product CRUD, checkout and order reads using that role. Business operators use application accounts, never database credentials.

## 3. Environment and service configuration

Configure these separately for Preview and Production; never point preview writes at the production Neon database.

| Variable                             | Purpose                                                                                                         |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| DATABASE_URL                         | Restricted application-role connection to the selected Neon database, with the provider's required TLS settings |
| AUTH_SECRET                          | Stable Auth.js session secret for this environment                                                              |
| ADMIN_EMAILS                         | Corey and Blair's individually approved email addresses                                                         |
| NEXT_PUBLIC_SITE_URL                 | Exact public HTTPS origin used by checkout links and email configuration                                        |
| NEXT_PUBLIC_SALES_ENABLED            | `false` until approved; exact `true` enables a new build                                                        |
| STRIPE_SECRET_KEY                    | Test key in isolated verification; correct business account live key only for approved activation               |
| STRIPE_WEBHOOK_SECRET                | Signing secret for this environment's endpoint                                                                  |
| BLOB_READ_WRITE_TOKEN                | Token for the selected product image store                                                                      |
| EMAIL_SERVER_HOST/PORT/USER/PASSWORD | Existing authorized SMTP relay; port 465 uses TLS, others require STARTTLS                                      |
| EMAIL_FROM                           | Relay-authorized sender; confirm actual inbox delivery                                                          |

Confirm the Stripe endpoint is `/api/webhooks/stripe`. Subscribe to `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded`, `charge.refunded`, `refund.created`, `refund.updated`, `refund.failed`. Test signatures and duplicate/reordered events. Online checkout is cards/AUD, local pickup, no automatic shipping/tax changes. Owners approve entered prices and business receipt/tax settings.

Confirm Blob uploads work with owner-authenticated tokens, expected image content types and the configured image host. Confirm both owners' magic links arrive and each can access product/order/market administration; verify a signed-in non-admin is denied.

## 4. Acceptance before new sales

- Execute type, lint, build, smoke, real PostgreSQL commerce and browser CRUD tests; attach the verification report with exact scope.
- In an isolated deployed environment, complete a genuine Stripe test-mode Checkout session. Compare its amount/session/PaymentIntent with the complete Neon order and item snapshots, inventory effects and email record.
- Verify an order confirmation and a ready-for-pickup email in actual test inboxes. SMTP acceptance alone is not evidence of inbox delivery. Force an SMTP failure and retry from admin.
- Exercise all six categories, sizes, exact sales units, sold-out states, stale editor rejection, multiple unique decks, duplicate events, expired sessions, refunds and manual market reconciliation.
- Owners supply and review actual identities, images, units, prices, sizes and stock. Unresolved products remain drafts. Existing tee records need a confirmed sales-unit label before selling.
- Configure each owner's supported Tap to Pay phone, individual Stripe identity/permissions and 2FA. Owners verify business account and payout bank. Dashboard mobile is live-only: its controlled charges/refunds require separate explicit approval.

## 5. Approved activation and first trades

Obtain explicit approval before production migrations, Stripe changes, administrator changes, inventory/publication changes, deployment, enabling checkout, or live charges/refunds.

1. Apply approved schema changes and deploy the reviewed build with sales disabled.
2. Verify connectivity, restricted credentials, owner access, uploads, email configuration and webhook endpoint.
3. Publish owner-reviewed products after approved inventory changes.
4. Approve and deploy `NEXT_PUBLIC_SALES_ENABLED=true`; verify UI and server gate agree.
5. Execute the specifically approved controlled online payment and one mobile payment per owner. Reconcile the complete order, payment, stock and email states. Approve any refund separately; verify it does not restock.
6. Owners verify payout routing and agree the operating guide and daily review routine.

## 6. Rollback and incidents

Disable new sales and deploy that build first. Continue accepting verified webhooks and reconciling existing Stripe sessions: closing the storefront does not cancel sessions already issued. Resolve or explicitly expire outstanding sessions through an authorized Stripe workflow before releasing their stock. Never delete reservations based on age.

Keep compatible forward schema changes. Rolling back Vercel does not roll back Neon, Stripe payments, refunds, stock or email deliveries. Do not restore an old application version that can overwrite revised inventory or reuse locally expired holds. If no safe previous build exists, leave sales disabled on the new build and repair it.

For paid-but-unrecorded transactions, use checkout reconciliation and inspect Stripe delivery history; avoid a new charge. For unlinked attempts, reconciliation searches all relevant Stripe sessions by the saved attempt token. Creation requests must be quiet for two minutes before absence can release stock. If Stripe cannot be queried or associations conflict, keep stock reserved and investigate. Review failed email deliveries, refund-sync errors and unmatched market sales in admin. Record the evidence and operator actions; do not mark unresolved capabilities ready.
