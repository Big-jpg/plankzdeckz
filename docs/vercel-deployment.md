# Vercel Deployment Instructions

This document describes the production deployment path for **Lumenform Studio**, a Next.js App Router storefront using raw SQL, Shopify Storefront API catalogue access, Stripe Checkout, and Auth.js. It assumes deployment to [Vercel](https://vercel.com) with PostgreSQL hosted externally, such as Neon, Supabase, Railway, or another managed PostgreSQL provider.

## Deployment model

The application is Vercel-compatible and should be deployed as a standard Next.js project. Database migrations and stored-procedure installation are explicit operator actions and are **not** coupled to Vercel build execution. This avoids accidental schema changes during preview deployments and keeps database state under manual release control.

| Area             | Production expectation                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| Runtime          | Vercel managed Next.js runtime                                                                        |
| Framework preset | Next.js                                                                                               |
| Package manager  | pnpm                                                                                                  |
| Install command  | `pnpm install --frozen-lockfile`                                                                      |
| Build command    | `pnpm build`                                                                                          |
| Output directory | Vercel default for Next.js                                                                            |
| Node version     | Node.js 20 or newer                                                                                   |
| Database         | PostgreSQL using raw SQL and stored procedures; no ORM                                                |
| Catalogue        | Shopify Storefront API, with local mock catalogue fallback only for development or degraded operation |
| Payments         | Stripe Checkout sessions created by server route handlers                                             |
| Authentication   | Auth.js with email and optional OAuth providers                                                       |

## Initial Vercel setup

Create a new Vercel project from the `Big-jpg/lumenform` repository and select the production branch according to the release process. For Phase 10 review, use the `phase-10-testing-deployment` branch as a preview deployment source only; do not merge or promote it without review approval.

Configure the project with the following settings.

| Setting             | Value                                                                    |
| ------------------- | ------------------------------------------------------------------------ |
| Framework preset    | Next.js                                                                  |
| Root directory      | Repository root                                                          |
| Build command       | `pnpm build`                                                             |
| Development command | `pnpm dev`                                                               |
| Install command     | `pnpm install --frozen-lockfile`                                         |
| Environment         | Production variables must be set in Vercel before first production build |

## Required environment variables

Set the following variables in Vercel under **Project Settings → Environment Variables**. Values must be entered separately for Production and Preview unless intentionally shared.

| Variable                             | Required                         | Scope                                                      | Notes                                                                                                    |
| ------------------------------------ | -------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`               | Yes                              | Production and Preview                                     | Public canonical origin, for example `https://lumenform.studio`. Preview may use the Vercel preview URL. |
| `DATABASE_URL`                       | Yes                              | Production and Preview if database-backed flows are tested | PostgreSQL connection string. Use a least-privilege app role if available.                               |
| `SHOPIFY_STORE_DOMAIN`               | Yes for live catalogue           | Production and Preview                                     | Shopify store domain, for example `example.myshopify.com`.                                               |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN`    | Yes for live catalogue           | Production and Preview                                     | Storefront API token.                                                                                    |
| `SHOPIFY_API_VERSION`                | Yes                              | Production and Preview                                     | Keep aligned with Shopify Storefront API support window.                                                 |
| `STRIPE_SECRET_KEY`                  | Yes for checkout                 | Production and Preview                                     | Use test keys in Preview and live keys only in Production.                                               |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes for client Stripe references | Production and Preview                                     | Publishable key matching the secret key mode.                                                            |
| `STRIPE_WEBHOOK_SECRET`              | Yes for webhook processing       | Production and Preview                                     | Must match the configured Stripe webhook endpoint.                                                       |
| `NEXTAUTH_URL`                       | Yes                              | Production                                                 | Must equal the canonical deployed origin.                                                                |
| `NEXTAUTH_SECRET`                    | Yes                              | Production and Preview                                     | Generate with `openssl rand -base64 32`.                                                                 |
| `EMAIL_SERVER_HOST`                  | Yes for production email login   | Production                                                 | SMTP host for magic-link auth.                                                                           |
| `EMAIL_SERVER_PORT`                  | Yes for production email login   | Production                                                 | Typically `465` or `587`.                                                                                |
| `EMAIL_SERVER_USER`                  | Yes for production email login   | Production                                                 | SMTP username.                                                                                           |
| `EMAIL_SERVER_PASSWORD`              | Yes for production email login   | Production                                                 | SMTP password or API key.                                                                                |
| `EMAIL_FROM`                         | Yes for production email login   | Production                                                 | Sender identity, for example `Lumenform Studio <noreply@lumenform.studio>`.                              |
| `ADMIN_EMAILS`                       | Yes for admin access             | Production and Preview                                     | Comma-separated allowlist of admin email addresses.                                                      |

## Database deployment

Run database setup from a controlled operator environment, not from the Vercel build hook. The current schema and stored procedures are applied with explicit `psql` commands through package scripts.

```bash
pnpm db:migrate
pnpm db:procedures
```

Before running these commands against production, verify that `DATABASE_URL` points to the intended production database and that a current backup exists. If using a managed PostgreSQL provider, take a provider-native snapshot immediately before applying schema or procedure changes.

## Stripe webhook configuration

Configure Stripe webhooks after the production or preview deployment URL is known. The webhook endpoint should target the existing Stripe webhook route in the application. Use test-mode webhooks for Preview and live-mode webhooks only for Production.

| Environment | Stripe mode | Required operator check                                                                                      |
| ----------- | ----------- | ------------------------------------------------------------------------------------------------------------ |
| Preview     | Test        | Confirm checkout session creation and webhook delivery using Stripe test cards.                              |
| Production  | Live        | Confirm live key isolation, webhook signing secret, and successful delivery before accepting public traffic. |

## Pre-deployment verification

Run the local verification sequence before opening a pull request or promoting a preview deployment.

```bash
pnpm lint
pnpm format:check
pnpm build
pnpm test:smoke
```

The smoke suite starts the Next.js development server automatically unless `PLAYWRIGHT_BASE_URL` is provided. To smoke-test an already deployed preview URL, run:

```bash
PLAYWRIGHT_BASE_URL=https://your-preview-url.vercel.app pnpm test:smoke
```

## Post-deployment verification

After deployment, verify the following routes and generated metadata endpoints.

| Route or endpoint             | Expected result                                                                    |
| ----------------------------- | ---------------------------------------------------------------------------------- |
| `/`                           | Home page loads and footer uses “Lightweight domestic delivery”.                   |
| `/products`                   | Catalogue loads with product cards.                                                |
| `/products/meridian-bloom`    | Product detail loads and requires adapter selection before add-to-cart.            |
| `/cart`                       | Empty cart is rejected as non-checkoutable.                                        |
| `/custom`                     | Custom request form renders and submits to the API when persistence is configured. |
| `/admin`                      | Unauthenticated users redirect to login.                                           |
| `/sitemap.xml`                | Public marketing and product routes are listed.                                    |
| `/robots.txt`                 | Protected and transactional routes are disallowed.                                 |
| `/og-default.svg`             | Default Open Graph placeholder asset is available.                                 |
| `/og-product-placeholder.svg` | Product Open Graph placeholder asset is available.                                 |

## Rollback

Use Vercel deployment rollback for application code. Database rollback must be planned separately because migrations and stored procedures are explicit database operations. If a deployment affects checkout, authentication, or order persistence, disable promotion and preserve logs before rolling forward or back.
