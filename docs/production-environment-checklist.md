# Production Environment Checklist

This checklist is the final Phase 10 operational gate for **Lumenform Studio**. It is written for a controlled production release where storefront functionality, checkout validation, authentication, and database persistence must remain inspectable and reversible.

## Release identity

| Item                   | Required value                             |
| ---------------------- | ------------------------------------------ |
| Repository             | `Big-jpg/lumenform`                        |
| Phase 10 branch        | `phase-10-testing-deployment`              |
| Base branch            | `origin/phase-9-fitting-guide-and-trust`   |
| Framework              | Next.js App Router with TypeScript/TSX     |
| Data access policy     | Raw SQL and stored procedures only; no ORM |
| Primary release target | Vercel                                     |

## Pre-release code gate

| Check                                                          | Status                        |
| -------------------------------------------------------------- | ----------------------------- |
| `pnpm install --frozen-lockfile` completes in a clean checkout | Pending operator verification |
| `pnpm lint` passes                                             | Pending operator verification |
| `pnpm format:check` passes after formatting                    | Pending operator verification |
| `pnpm build` passes                                            | Pending operator verification |
| `pnpm test:smoke` passes locally or against preview            | Pending operator verification |
| Phase branch has been pushed to origin without merging         | Pending operator verification |

## Environment variables

| Variable                             | Production value confirmed | Failure mode if missing or incorrect                                                |
| ------------------------------------ | -------------------------- | ----------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`               | No                         | Incorrect canonical URLs, sitemap host, robots host, and Open Graph URLs.           |
| `DATABASE_URL`                       | No                         | Admin, order persistence, checkout hooks, and custom-design persistence may fail.   |
| `SHOPIFY_STORE_DOMAIN`               | No                         | Catalogue may fall back to mock products or fail to reflect live stock and pricing. |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN`    | No                         | Shopify catalogue access will fail.                                                 |
| `SHOPIFY_API_VERSION`                | No                         | Shopify API requests may be rejected or use unintended version behavior.            |
| `STRIPE_SECRET_KEY`                  | No                         | Checkout session creation will fail.                                                |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No                         | Client-facing Stripe references may be incomplete.                                  |
| `STRIPE_WEBHOOK_SECRET`              | No                         | Webhook signature verification will fail.                                           |
| `NEXTAUTH_URL`                       | No                         | Auth callbacks and redirects may resolve to the wrong origin.                       |
| `NEXTAUTH_SECRET`                    | No                         | Session signing and Auth.js behavior may be unstable or insecure.                   |
| `EMAIL_SERVER_HOST`                  | No                         | Email magic-link login will not send mail in production.                            |
| `EMAIL_SERVER_PORT`                  | No                         | SMTP connection will fail.                                                          |
| `EMAIL_SERVER_USER`                  | No                         | SMTP authentication will fail.                                                      |
| `EMAIL_SERVER_PASSWORD`              | No                         | SMTP authentication will fail.                                                      |
| `EMAIL_FROM`                         | No                         | Auth email sender identity may be rejected or misleading.                           |
| `ADMIN_EMAILS`                       | No                         | Admin users may be locked out or over-authorized.                                   |

## Database readiness

| Check                                                            | Status  | Notes                                                            |
| ---------------------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| Production PostgreSQL instance provisioned                       | Pending | Use a managed provider with backups enabled.                     |
| App database role created with least required privileges         | Pending | Avoid using owner or superuser credentials in Vercel.            |
| `db/migrations/001_initial_schema.sql` applied                   | Pending | Run with `pnpm db:migrate` only after confirming `DATABASE_URL`. |
| Stored procedures in `db/procedures` applied                     | Pending | Run with `pnpm db:procedures`.                                   |
| Backup or snapshot captured before migration                     | Pending | Required before production schema changes.                       |
| Read/write verification completed for orders and custom requests | Pending | Exercise checkout webhook and custom-design submission paths.    |

## Shopify catalogue readiness

| Check                                                   | Status  | Notes                                                                  |
| ------------------------------------------------------- | ------- | ---------------------------------------------------------------------- |
| Storefront token has read access to products            | Pending | Confirm access scope in Shopify.                                       |
| Product handles match application expectations          | Pending | Smoke coverage assumes `meridian-bloom` exists in fallback data.       |
| Product pricing and currency checked                    | Pending | Checkout validation rejects client/catalogue price mismatch.           |
| Adapter compatibility metadata checked                  | Pending | Product detail and checkout validation depend on adapter lists.        |
| Product images resolve through Next image configuration | Pending | Broken image hosts will degrade catalogue and Open Graph presentation. |

## Stripe checkout readiness

| Check                                                 | Status  | Notes                                                            |
| ----------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| Test-mode checkout succeeds in preview                | Pending | Use Stripe test cards only.                                      |
| Empty cart rejection verified                         | Pending | API should return `422` with `items` validation error.           |
| Missing adapter rejection verified                    | Pending | API should return `422` with `selectedAdapter` validation error. |
| Missing LED acknowledgement rejection verified        | Pending | API should return `422` with `ledAcknowledged` validation error. |
| Production live keys isolated from preview            | Pending | Never reuse live keys in preview environments.                   |
| Webhook endpoint registered and signing secret stored | Pending | Confirm event delivery in Stripe dashboard.                      |

## Authentication and admin readiness

| Check                                           | Status  | Notes                                                   |
| ----------------------------------------------- | ------- | ------------------------------------------------------- |
| `NEXTAUTH_URL` equals canonical production URL  | Pending | Required for stable callback behavior.                  |
| `NEXTAUTH_SECRET` generated with strong entropy | Pending | Generate with `openssl rand -base64 32`.                |
| SMTP provider verified                          | Pending | Confirm actual email delivery, not only API acceptance. |
| `ADMIN_EMAILS` contains only approved operators | Pending | Comma-separated lowercase emails recommended.           |
| Unauthenticated `/admin` redirects to login     | Pending | Covered by smoke test.                                  |
| Non-admin authenticated user is blocked         | Pending | Requires manual or integration verification.            |

## Storefront and UX readiness

| Check                                                           | Status  | Notes                                                                                  |
| --------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------- |
| Home page loads                                                 | Pending | Covered by smoke test.                                                                 |
| Product catalogue loads                                         | Pending | Covered by smoke test.                                                                 |
| Product detail loads                                            | Pending | Covered by smoke test.                                                                 |
| Adapter selection required before add-to-cart                   | Pending | Covered by smoke test.                                                                 |
| Add-to-cart drawer and cart count update                        | Pending | Covered by smoke test.                                                                 |
| Cart LED acknowledgement state is visible and required          | Pending | Covered by smoke/API validation.                                                       |
| Custom design form submission persists in production            | Pending | Smoke test mocks success; production persistence still requires database verification. |
| Mobile responsive layout checked on at least one small viewport | Pending | Manual visual check recommended before launch.                                         |

## SEO and crawler readiness

| Check                                                                             | Status  | Notes                                                                               |
| --------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------- |
| Root metadata renders canonical, description, Open Graph, and Twitter card values | Pending | Confirm with page source or metadata inspector.                                     |
| Product metadata renders dynamic title and description                            | Pending | Confirm for a live product handle.                                                  |
| `/sitemap.xml` lists public pages and product routes                              | Pending | Generated dynamically from route list and catalogue.                                |
| `/robots.txt` disallows protected and transactional routes                        | Pending | Disallows `/admin`, `/account`, `/cart`, `/checkout`, `/api`, and `/login`.         |
| `/og-default.svg` resolves                                                        | Pending | Placeholder only; replace with final branded social art before launch if available. |
| `/og-product-placeholder.svg` resolves                                            | Pending | Placeholder only; replace with final catalogue/product art when ready.              |

## Observability and rollback readiness

| Check                                                    | Status  | Notes                                             |
| -------------------------------------------------------- | ------- | ------------------------------------------------- |
| Vercel function logs accessible to release operators     | Pending | Required for checkout, auth, and webhook triage.  |
| Stripe dashboard access confirmed                        | Pending | Required for payment and webhook validation.      |
| Database logs or query visibility available              | Pending | Required for persistence failure triage.          |
| Shopify API dashboard access confirmed                   | Pending | Required for catalogue failure triage.            |
| Rollback owner identified                                | Pending | One operator should own rollback decision-making. |
| Previous stable Vercel deployment available for rollback | Pending | Verify before production promotion.               |
| Database rollback plan documented                        | Pending | Vercel rollback does not revert database changes. |

## Launch approval gate

Production launch should not proceed until the following conditions are all true: code checks pass, smoke tests pass, required secrets are set in the production environment, database migration and stored procedures are applied, Stripe webhook delivery is verified, admin access is verified, and rollback authority is assigned.
