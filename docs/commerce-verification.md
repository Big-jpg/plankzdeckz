# Commerce verification and readiness

Verified locally on 23 October 2026 on `feature/commerce-go-live`, based on `origin/main` at `df84a4c`. This report distinguishes implementation evidence from production service acceptance. No production migration/configuration, live inventory change, deployment, charge, refund or message to an owner was performed.

## Executed checks

| Check                                | Result and evidence                                                                                                                |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Locked dependency installation       | Passed `pnpm install --frozen-lockfile`; no dependency versions changed                                                            |
| TypeScript                           | Passed final `pnpm exec tsc --noEmit --incremental false`                                                                          |
| ESLint                               | Passed final `pnpm lint` without warnings                                                                                          |
| Enabled production build             | Passed `pnpm build` using isolated PostgreSQL and empty real Stripe/Blob/SMTP credentials                                          |
| Real PostgreSQL commerce suite       | **38 passed** on a freshly initialized native PostgreSQL 18.4 cluster; migrations 001–005 plus all procedures applied successfully |
| Authenticated browser/API acceptance | **4 passed** against the final compiled enabled build, isolated database, real Auth.js sessions and installed Chrome               |
| Standard smoke/closed catalogue      | **102 passed, 5 skipped**; skipped cases verified separately as described below                                                    |
| Final disabled production build      | Passed `pnpm build` with `NEXT_PUBLIC_SALES_ENABLED=false`; the final compiled release gate is closed                              |
| Compiled production boundaries       | **5 passed** against that disabled build with no usable database/payment credentials                                               |

The PostgreSQL suite covers unique-deck and merchandise concurrency, reversed lock ordering, multi-deck sessions, idempotent retries, UUID creation/reconciliation normalization, pending market-sale blocking, trusted cents/currency, duplicate paid delivery, cryptographic webhook signatures, partial-transaction rollback/retry, delayed payments after local hold expiry, creation timeout followed by typed Stripe errors, authoritative session absence, stale absence proof, refund-before-order recovery, concurrent refund refresh ordering, partial/full refunds without restock, pickup transition/outbox deduplication, migration preflight and market sale exact amounts/stock/audits.

The browser cases exercise all six categories through real authenticated HTTP draft/publish flows, persisted price/image URL/stock, public shop/detail rendering, out-of-stock controls, real editor saves, stale revision rejection, photo-only preservation after a simulated sale, signed-in non-admin denial, truthful pending confirmation, and removal of only purchased cart quantities once. Image URLs are fixture Blob-shaped URLs; browser image bytes are simulated and clearly labelled. These tests do **not** prove a real Blob upload. Browser sessions are seeded only in the explicitly guarded local fixture database; production authentication is unchanged. Shop and editor screenshots were inspected locally.

The standard smoke suite includes pure validation/security tests and development-mode catalogue/browser tests at multiple screen widths. Its five intentional skips are the four separately executed enabled-commerce browser cases and the production-only private-photo boundary. The latter passed against the final disabled production build together with four compiled sales-closure cases. Existing public gallery, keyboard/touch browsing, no-JavaScript catalogue and closed-cart behaviour passed.

Validation initially exposed two test-boundary issues: a pure pickup-state test imported a database module marked server-only, and an empty base URL bypassed Playwright's fallback. Pickup validation now lives in a pure module; empty URLs fall back consistently. Generated Playwright reports are excluded from lint/format/type scans. The final checks above passed after these corrections.

Stripe SDK methods are replaced with deterministic test doubles and an outbound-request kill switch in transaction tests. Signature verification uses the real SDK test-signature generator. Automated emails use mock transports or unconfigured SMTP; no real mail is sent. These results prove application transaction/recovery behaviour, not end-to-end Stripe test-account or inbox acceptance.

## Reproducing isolated tests

The ordinary smoke suite needs no external service credentials. On this Windows host use installed Chrome with `PLAYWRIGHT_CHANNEL=chrome`; the bundled Playwright Chromium download is absent. The local smoke webserver overrides payment/email/Blob credentials and does not inherit a production database connection.

`pnpm test:commerce` never reads `.env`. It accepts `LOCAL_TEST_DATABASE_URL` only for a loopback database named `plankz_commerce_test`; test fixture truncation is guarded by that boundary. Otherwise, on Windows x64 it starts a new isolated native cluster under the ignored `.commerce-test-runtime` directory and stops that cluster afterward. Other platforms can supply an explicitly isolated loopback PostgreSQL database. On this sandbox, loopback/native process checks require the corresponding local execution permission.

To install only the optional test binary package (not an application dependency):

```powershell
npm install --prefix .commerce-test-runtime --no-package-lock --ignore-scripts @embedded-postgres/windows-x64@18.4.0-beta.17
pnpm test:commerce
```

`node scripts/test-commerce.mjs --serve` can retain a local fixture server for inspection. The runtime and data are ignored by Git, TypeScript, formatting/lint scans and Next output tracing. No cloud database or queue was introduced.

For browser acceptance, initialize a separate local `plankz_commerce_browser` database with all migrations/procedures and run the app against that database with sales enabled, a test AUTH_SECRET and `ADMIN_EMAILS=commerce-admin@example.test`. Set `COMMERCE_BROWSER_DATABASE_URL`, `PLAYWRIGHT_BASE_URL` to that loopback app, `NEXT_PUBLIC_SALES_ENABLED=true`, and `PLAYWRIGHT_CHANNEL=chrome`, then run only `tests/commerce-browser.spec.ts`. The suite verifies the fixture session is recognized by the app before any HTTP mutation. It skips the normal smoke run. Never reuse these fixture identities on a real environment.

## Capability readiness

| Capability                                                                                          | Classification                                                                 | Remaining evidence                                                                                             |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Six-category product creation/edit/publication and public discovery                                 | Ready and verified locally; awaiting manual production acceptance              | Owner-supplied product identities, units, prices, stock and photos; real Blob upload                           |
| Online reservation/order/inventory consistency                                                      | Ready and verified locally; implemented but awaiting external configuration    | Deployed Stripe test-mode Checkout, endpoint/key/mode mapping, complete Neon reconciliation                    |
| Individual owner administration                                                                     | Implemented but awaiting external configuration and manual acceptance          | Approved allowlist, actual magic-link delivery, separate Corey/Blair sessions                                  |
| Restricted production database role                                                                 | Awaiting external configuration/verification                                   | Actual Neon grants and least-privilege application-role acceptance                                             |
| Order/refund/recovery administration                                                                | Ready and verified locally; awaiting external acceptance                       | Real Stripe test refunds and webhook delivery; operator recovery exercise                                      |
| Automated order/pickup email and admin retries                                                      | Implemented and mock-tested; awaiting external configuration/manual acceptance | Authorized SMTP sender, actual order/pickup inbox delivery, failure/retry exercise                             |
| Native mobile payment acceptance                                                                    | Awaiting manual acceptance testing                                             | Each supported phone, actual operator roles, approved controlled live payment, account and payout verification |
| Manual market sales and inventory reconciliation                                                    | Ready and verified locally; awaiting owner acceptance                          | Each owner records actual card-present payment; event isolation/reconciliation exercise                        |
| Production checkout activation                                                                      | Blocked pending explicit production authorization                              | Approved migration/deployment/inventory/configuration changes and controlled acceptance                        |
| Automated product-to-POS synchronization, custom POS, Connect, shipping and scheduled email retries | Deferred by design                                                             | Outside the agreed launch scope                                                                                |

## Operational limits

- Stripe native Dashboard payments have no reliable product mapping supplied by the storefront; owners manually enter verified products and payment references. Amount alone never chooses a product.
- All event products are unpublished until reconciled; existing Checkout sessions must be resolved before physical sale. There is no claim of real-time cross-channel synchronization.
- Uncertain payment state retains stock. Failed/unlinked attempts can reduce availability until successful Stripe reconciliation; admin makes this visible.
- SMTP accepted means the relay accepted the message, not that an inbox received it. Ambiguous send acknowledgements can produce duplicate emails despite event deduplication/stable Message-ID. No automatic scheduled retries are promised.
- Refunds preserve physical stock until an explicit reasoned restock. Failed refreshes remain visible in order administration.
- The build retains the existing Next.js 16 middleware-convention deprecation warning. Migrating unrelated route middleware is deferred.

Follow the production checklist and owner operating guide before classifying any capability as production-ready.
