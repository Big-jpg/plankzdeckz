# Lumenform Studio

**Lumenform Studio** is a Next.js App Router storefront for custom 3D printed lampshades designed for the lights customers already own. The application combines a product catalogue, adapter-aware product detail pages, cart validation, Stripe Checkout, custom design requests, Auth.js authentication, and a protected admin area.

The implementation intentionally keeps core system behavior explicit. Database access uses raw SQL and stored procedures rather than an ORM, checkout is validated server-side before Stripe session creation, and operational setup is documented as a sequence of controlled release actions rather than implicit build-time automation.

## Current release state

This README reflects the Phase 10 handoff state: testing, deployment preparation, SEO metadata, crawler files, error boundaries, loading states, and production documentation are present. The Phase 10 branch should be reviewed and promoted through the normal pull-request process rather than merged automatically.

| Area           | Status                                                                                  |
| -------------- | --------------------------------------------------------------------------------------- |
| Framework      | Next.js App Router with TypeScript/TSX                                                  |
| Styling        | Tailwind CSS v4 with warm cream/ivory backgrounds, dark charcoal text, and gold accents |
| Catalogue      | Shopify Storefront API integration with local mock fallback                             |
| Cart           | Client-side cart state with server-side checkout validation                             |
| Checkout       | Stripe Checkout session creation through API route handlers                             |
| Authentication | Auth.js / NextAuth v5 with protected admin allowlist                                    |
| Database       | PostgreSQL through raw SQL and stored procedures; no ORM                                |
| Testing        | Playwright smoke tests for critical storefront and validation paths                     |
| Deployment     | Vercel-compatible with explicit environment and production checklists                   |

## Repository structure

```text
lumenform/
├── app/                         # Next.js App Router routes, metadata, sitemap, robots, boundaries
├── components/                  # Shared React components and client-side UI flows
├── db/                          # SQL migrations and stored procedures
├── docs/                        # Deployment and production handoff documents
├── lib/                         # Client utilities, catalogue access, cart state, types
├── public/                      # Static assets, product images, Open Graph placeholders
├── server/                      # Server-side validation, persistence, Stripe, hooks
├── tests/                       # Playwright smoke tests
├── .env.example                 # Environment variable template
├── playwright.config.ts         # Smoke-test runner configuration
└── package.json                 # Scripts and dependencies
```

## Stack

| Layer                 | Technology             | Notes                                                                       |
| --------------------- | ---------------------- | --------------------------------------------------------------------------- |
| Application framework | Next.js                | App Router, route handlers, dynamic metadata, sitemap and robots generation |
| Language              | TypeScript             | TS/TSX across application and tests                                         |
| UI                    | React and Tailwind CSS | Mobile-first storefront with existing Lumenform brand styling preserved     |
| Database              | PostgreSQL             | Raw SQL and stored procedures only                                          |
| Catalogue             | Shopify Storefront API | Product data is fetched from Shopify when configured                        |
| Payments              | Stripe Checkout        | Session creation occurs server-side after validation                        |
| Auth                  | Auth.js / NextAuth v5  | Email and optional OAuth providers, with admin allowlist                    |
| Smoke tests           | Playwright             | Browser and API smoke coverage for Phase 10 critical paths                  |
| Deployment            | Vercel                 | Standard Next.js deployment with explicit environment setup                 |

## Local development

Install dependencies and start the development server from the repository root.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) after the server starts. For local development without external services, the catalogue layer can fall back to mock products. Checkout, authentication email delivery, admin access, and persistence flows require the corresponding environment variables and backing services.

## Environment variables

The complete template is maintained in `.env.example`. Production values must be configured in the deployment platform rather than committed to source control.

| Variable group   | Variables                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| General          | `NEXT_PUBLIC_SITE_URL`                                                                                       |
| Database         | `DATABASE_URL`                                                                                               |
| Shopify          | `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, `SHOPIFY_API_VERSION`                             |
| Stripe           | `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Auth.js          | `NEXTAUTH_URL`, `NEXTAUTH_SECRET`                                                                            |
| OAuth providers  | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`                               |
| Email magic link | `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD`, `EMAIL_FROM`         |
| Admin            | `ADMIN_EMAILS`                                                                                               |

## Scripts

| Command              | Purpose                                                  |
| -------------------- | -------------------------------------------------------- |
| `pnpm dev`           | Start the local Next.js development server.              |
| `pnpm build`         | Create a production build.                               |
| `pnpm start`         | Start the compiled production server.                    |
| `pnpm lint`          | Run ESLint.                                              |
| `pnpm format`        | Format the repository with Prettier.                     |
| `pnpm format:check`  | Check formatting without writing changes.                |
| `pnpm test:smoke`    | Run Playwright smoke tests.                              |
| `pnpm db:migrate`    | Apply the initial SQL schema to `DATABASE_URL`.          |
| `pnpm db:procedures` | Apply stored procedures and functions to `DATABASE_URL`. |
| `pnpm db:setup`      | Run schema migration and stored-procedure installation.  |

## Smoke tests

Phase 10 adds Playwright smoke tests for the critical paths that should remain stable during deployment hardening. The suite covers home page loading, product catalogue loading, product detail loading, adapter selection enforcement, add-to-cart behavior, checkout rejection for empty carts, checkout rejection for missing adapter selection, checkout rejection for missing LED acknowledgement, custom design form submission, and unauthenticated admin protection.

Run the suite locally with:

```bash
pnpm test:smoke
```

The Playwright configuration starts `pnpm dev` automatically unless `PLAYWRIGHT_BASE_URL` is set. To run the same smoke checks against a preview deployment, use:

```bash
PLAYWRIGHT_BASE_URL=https://your-preview-url.vercel.app pnpm test:smoke
```

If browsers are not already installed in the local or CI environment, install the required Chromium browser with:

```bash
pnpm exec playwright install chromium
```

## Database operation

The database contract is deliberately explicit. The app does not use an ORM, and database setup is not hidden behind framework lifecycle hooks. Apply schema and stored procedures from a trusted operator environment after confirming that `DATABASE_URL` points to the intended database.

```bash
pnpm db:migrate
pnpm db:procedures
```

For production, take a managed database backup or snapshot before running schema or procedure changes. Application rollback through Vercel does not automatically roll back database state.

## Checkout and validation model

Checkout is guarded by server-side validation in `server/cart/validation.ts`. The validation layer rejects empty carts, missing or incompatible adapter selections, missing LED acknowledgement, invalid quantities, missing catalogue handles, out-of-stock catalogue products, price mismatches, and currency mismatches before any Stripe Checkout session is created.

This model ensures that client UI state is not trusted as the source of record. The product detail page prevents add-to-cart until an adapter is selected, while the checkout route repeats validation server-side to preserve correctness under direct API calls or stale browser state.

## SEO, sitemap, robots, and social placeholders

Phase 10 adds application-wide SEO defaults in the root layout, route-specific catalogue and product metadata, generated `/sitemap.xml`, generated `/robots.txt`, and placeholder Open Graph assets. The placeholder assets are intentionally conservative and should be replaced with final brand-approved social imagery when available.

| Asset or endpoint             | Purpose                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------ |
| `/sitemap.xml`                | Lists public marketing and product routes.                                     |
| `/robots.txt`                 | Allows public routes and disallows protected, transactional, and API surfaces. |
| `/og-default.svg`             | Default social sharing placeholder.                                            |
| `/og-product-placeholder.svg` | Product and catalogue social sharing placeholder.                              |

## Error boundaries and loading states

The application includes a root error boundary, an admin-specific error boundary, and route-level loading states for the root shell, product catalogue, product detail, admin, and custom-design areas. These additions are intentionally basic and brand-consistent, providing recoverable UI states without changing existing route contracts or business logic.

## Deployment documentation

Vercel deployment instructions and production readiness gates are maintained as standalone handoff documents.

| Document                                                                               | Purpose                                                                                                               |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [`docs/vercel-deployment.md`](docs/vercel-deployment.md)                               | Vercel setup, environment variables, database deployment, Stripe webhook setup, and post-deploy verification.         |
| [`docs/production-environment-checklist.md`](docs/production-environment-checklist.md) | Operator checklist for code gates, credentials, database readiness, checkout, auth, SEO, observability, and rollback. |

## Production release sequence

A safe production release should follow this sequence: configure environment variables, provision and back up the database, apply SQL schema and stored procedures, deploy to a Vercel preview, run smoke tests against the preview URL, verify Stripe test checkout and webhook delivery, verify admin authentication, promote or merge only after review approval, and preserve rollback access to the prior stable deployment.

## Branching protocol

Each project phase is developed on a dedicated branch named `phase-N-short-description`. Phase branches are pushed to origin for review and are not merged into main without explicit approval.

## Operational constraints

The current implementation preserves the following constraints: no ORM, no removal of working endpoints or flows for cleanliness, server-side checkout validation as the source of truth, explicit adapter selection, LED-only acknowledgement before checkout, protected admin routes, and deployment actions that are inspectable by operators.

## License

Private. All rights reserved.
