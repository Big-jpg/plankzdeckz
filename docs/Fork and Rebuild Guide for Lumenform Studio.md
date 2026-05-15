# Fork and Rebuild Guide for Lumenform Studio

**Audience:** developers, technical founders, and operators who want to fork `Big-jpg/lumenform` and rebuild it as a small e-commerce storefront with different branding, product content, and operational accounts while preserving the same architecture.

**Verified against:** the cloned `Big-jpg/lumenform` repository source, including the database migrations and procedures, Auth.js configuration, Stripe checkout route, Stripe webhook handler, Vercel deployment runbook, catalogue modules, Shopify integration, global CSS tokens, admin pages, and production checklist.[1] [2] [3] [4]

> **Operating principle:** this project is intentionally simple at the infrastructure layer. It uses **Next.js on Vercel**, **PostgreSQL on Neon or another managed Postgres host**, **Stripe Checkout**, **Auth.js magic-link login**, **SMTP email**, and an optional **Shopify Storefront API catalogue**. The database write path is **raw SQL plus stored PostgreSQL functions**, not an ORM.[2] [5]

---

## 1. Architecture Overview

Lumenform Studio is a Next.js App Router storefront built as an “e-commerce lite” system. It is not a full Shopify theme and it is not a large custom commerce platform. The storefront owns the customer experience, cart validation, checkout initiation, authentication, admin-lite views, and order persistence. Stripe owns payment collection. PostgreSQL owns durable application state. Shopify is optional and only supplies live product data when configured; otherwise the app can render from a local mock catalogue.[2] [6]

### 1.1 Stack summary

| Layer | Implementation in this repository | Main files to inspect | Why it exists | Typical starter cost |
| --- | --- | --- | --- | --- |
| Web app | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4 | `app/`, `components/`, `package.json`, `app/globals.css` | Gives a deployable storefront, product pages, cart/checkout routes, protected account/admin pages, SEO routes, and Vercel-compatible server routes. | Vercel Hobby can work for experiments. For a commercial project, budget roughly **Vercel Pro at about US$20 per user/month**, plus usage if applicable.[7] |
| Hosting/runtime | Vercel-managed Next.js runtime | `docs/vercel-deployment.md` | The repo is configured for standard Next.js deployment with `pnpm install --frozen-lockfile` and `pnpm build`. Database migrations are intentionally manual, not part of the Vercel build. | About **US$20/month** for a single Pro seat is a practical working estimate, but confirm current pricing before launch.[7] |
| Database | PostgreSQL, intended for Neon or equivalent | `db/migrations/001_initial_schema.sql`, `db/procedures/*.sql`, `server/db/client.ts`, `server/db/contracts.ts` | Stores users, sessions, verification tokens, orders, order items, Stripe event idempotency records, pickup requests, buyer events, shipping stubs, and custom design requests. | Neon has a free plan suitable for early development; paid usage depends on compute/storage needs.[8] |
| Data access | `pg` connection pool and typed contract functions | `server/db/client.ts`, `server/db/contracts.ts` | Keeps writes inspectable and explicit. Application code calls stored procedures through a thin contract layer rather than using an ORM. | No separate cost. |
| Payments | Stripe Checkout sessions plus webhooks | `app/api/checkout/create-session/route.ts`, `app/api/webhooks/stripe/route.ts`, `server/stripe/client.ts` | The app creates server-validated Stripe Checkout sessions and persists paid orders only after a verified webhook event. | Stripe generally charges per successful transaction; confirm country-specific rates in Stripe pricing.[9] |
| Authentication | Auth.js v5 beta with Nodemailer magic-link provider and database sessions | `auth.ts`, `server/auth/adapter.ts`, `middleware.ts` | Passwordless login for customers and admins. Sessions are persisted in PostgreSQL, not JWT-only cookies. | No separate auth vendor cost. Email sending may use Resend, Postmark, Mailgun, SendGrid, or another SMTP provider. |
| Email | SMTP variables consumed by Auth.js/Nodemailer | `auth.ts`, `.env.example`, `docs/vercel-deployment.md` | Sends magic login links. In local development, if SMTP is missing, the app logs the magic link to the console. | Resend has a free tier and SMTP support; confirm current plan limits.[10] [11] |
| Product source | Local mock catalogue or Shopify Storefront API | `lib/catalogue.ts`, `lib/mock-products.ts`, `lib/shopify.ts`, `docs/SHOPIFY_PRODUCT_STRUCTURE.md` | Lets a fork start without Shopify, then switch to live product data when needed. | Shopify cost is not included in the minimal stack estimate. |
| Domain | Any registrar | Vercel project domains | Gives production identity and email domain alignment. | A basic domain is often around **US$10–20/year**, depending on TLD and registrar. |

### 1.2 How the pieces connect

A customer visits the storefront on Vercel. Product data is loaded through `lib/catalogue.ts`, which uses Shopify if `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN` are present, and falls back to `lib/mock-products.ts` when Shopify is not configured or fails.[6] The customer selects a product, chooses an adapter, acknowledges LED-only bulb guidance, and submits the cart to `POST /api/checkout/create-session`. That route re-validates the cart server-side against the catalogue before creating a Stripe Checkout session.[12]

Stripe redirects the customer to its hosted payment page. After payment, Stripe sends a signed webhook to `POST /api/webhooks/stripe`. The webhook handler verifies the signature using `STRIPE_WEBHOOK_SECRET`, records the Stripe event for idempotency, and only persists the order for `checkout.session.completed`. Other event types are recorded and marked processed, but ignored by the current application logic.[13]

Authentication is separate from checkout. Auth.js uses email magic links and stores users, sessions, and verification tokens in PostgreSQL. The custom adapter mostly calls stored procedures, with a few direct SQL operations for Auth.js paths not covered by existing procedures.[14]

### 1.3 What this architecture optimizes for

The project is optimized for **explicit control**, **small operational surface area**, and **low early-stage cost**. It avoids a custom payment flow by using Stripe Checkout. It avoids ORM migration coupling by keeping schema and stored procedure deployment as manual operator actions. It avoids a mandatory product backend by supporting a local mock catalogue and optional Shopify integration.

The trade-off is that several things are intentionally “lite.” The admin panel is useful for reviewing orders and custom requests, but it is not a full ERP. Shipping is represented by `shipping_stubs`, while the active fulfilment model is local pickup. Email automation hooks exist, but production buyer email flows are extension points rather than a complete campaign system.[15]

---

## 2. Prerequisites

Before forking and deploying the project, create the external accounts listed below. You can work locally with only GitHub, Node.js, pnpm, and a PostgreSQL database, but production checkout and magic-link login require the full set.

| Account or tool | URL | Required for | Notes |
| --- | --- | --- | --- |
| GitHub | <https://github.com> | Forking and version control | Fork `https://github.com/Big-jpg/lumenform`, then clone your fork. |
| Vercel | <https://vercel.com> | Hosting and deployments | Use the **Add New → Project** import flow. Select the forked repository. |
| Neon | <https://neon.com> | Managed PostgreSQL | Any PostgreSQL host can work, but this guide uses Neon because it has a simple free tier and Vercel-friendly connection strings.[8] |
| Stripe | <https://dashboard.stripe.com> | Payments and webhooks | Use test mode first. Do not put live keys in Preview deployments. |
| Resend or another SMTP provider | <https://resend.com> | Magic-link email delivery | The code uses SMTP variables through Nodemailer. Resend can be used through SMTP, not through a Resend SDK in the current code.[11] |
| Domain registrar | Examples: <https://porkbun.com>, <https://namecheap.com>, <https://domains.google> alternatives, Cloudflare Registrar | Production domain and email sender identity | Buy the domain before production email setup, because SMTP/domain verification usually depends on DNS records. |
| Local Node.js | <https://nodejs.org> | Local development | The repository expects Node.js 20 or newer in deployment docs; the package uses Next.js 16 and React 19.[2] [3] |
| pnpm | <https://pnpm.io> | Dependency management | The project scripts assume `pnpm`. |
| PostgreSQL CLI | <https://www.postgresql.org/docs/current/app-psql.html> | Applying schema and functions | Install `psql` locally or use Neon’s SQL editor. |

### 2.1 Fork and clone

Open <https://github.com/Big-jpg/lumenform>, click **Fork**, choose your GitHub account or organization, then clone your fork.

```bash
git clone https://github.com/YOUR_GITHUB_USER/lumenform.git
cd lumenform
pnpm install --frozen-lockfile
cp .env.example .env.local
```

If your fork will become a branded store, rename the repository after the fork. Do not rename the Next.js package until after the first clean local build, because it is easier to isolate infrastructure problems before content and naming changes.

---

## 3. Neon PostgreSQL Setup

The database setup has two parts: the base schema and the stored procedures. The package scripts make this explicit.[2]

```bash
pnpm db:migrate      # runs db/migrations/001_initial_schema.sql
pnpm db:procedures  # runs order, auth, and pickup procedure files
pnpm db:setup       # runs both in sequence
```

This is not an ORM migration workflow. The repository uses `pg` through `server/db/client.ts` and a contract layer in `server/db/contracts.ts`. The schema is controlled by SQL files, and application writes are routed through PostgreSQL functions where the project has defined them.[5]

### 3.1 Create the Neon project

Go to <https://console.neon.tech>, sign in, then use the following path.

| Step | Action |
| --- | --- |
| 1 | Click **New Project**. |
| 2 | Choose a project name such as `your-store-production`. |
| 3 | Choose a region close to your Vercel region and customer base. |
| 4 | Create the project with the default database, or name it `lumenform` / `store` if prompted. |
| 5 | Open the project dashboard and click **Connect** or **Connection Details**. |
| 6 | Select the database and role you want the app to use. |
| 7 | Copy the pooled or serverless-compatible PostgreSQL connection string. |

The connection string should look structurally like this. Do not commit the real value.

```text
postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require
```

### 3.2 Configure the local environment

Edit `.env.local` and set at least `DATABASE_URL`.

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require"
```

For a quick shell-only setup, export it for the current terminal session.

```bash
export DATABASE_URL='postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require'
```

Confirm that `psql` can connect before running migrations.

```bash
psql "$DATABASE_URL" -c 'select current_database(), current_user, now();'
```

### 3.3 Run the schema SQL

From the repository root, run:

```bash
pnpm db:migrate
```

This executes:

```bash
psql $DATABASE_URL -f db/migrations/001_initial_schema.sql
```

The migration creates the tables used by Auth.js, orders, Stripe events, local pickup, buyer events, shipping placeholders, and custom design requests.[16]

### 3.4 Run the stored procedures SQL

After the tables exist, run:

```bash
pnpm db:procedures
```

This executes the procedure files in this order:

```bash
psql $DATABASE_URL -f db/procedures/order_procedures.sql
psql $DATABASE_URL -f db/procedures/auth_procedures.sql
psql $DATABASE_URL -f db/procedures/pickup_procedures.sql
```

The procedure files use `CREATE OR REPLACE FUNCTION`, so re-running them after edits is intended to be safe and idempotent at the function-definition level.[17]

### 3.5 Verify the database install

Run these checks after setup.

```bash
psql "$DATABASE_URL" -c "select table_name from information_schema.tables where table_schema = 'public' order by table_name;"
psql "$DATABASE_URL" -c "select routine_name from information_schema.routines where routine_schema = 'public' order by routine_name;"
```

You should see tables such as `users`, `sessions`, `orders`, `order_items`, `stripe_events`, `pickup_requests`, and `custom_design_requests`. You should also see functions such as `create_order_from_stripe_session`, `create_order_item`, `record_stripe_event`, `create_user`, `create_session`, `create_pickup_request`, and `update_pickup_status`.[16] [17]

### 3.6 Understand the procedure-based write pattern

The application-facing contract layer lives in `server/db/contracts.ts`. For example, the Stripe webhook handler does not manually insert an order with ad hoc SQL. It calls `createOrderFromStripeSession`, which calls the stored function `create_order_from_stripe_session`. Then it calls `createOrderItem`, which calls `create_order_item` for each Stripe line item.[13] [18]

This pattern matters when you add features. If you need a new write path, prefer this sequence.

| Change type | Recommended implementation |
| --- | --- |
| New durable entity | Add a table or columns in a migration SQL file. |
| New write operation | Add or update a stored function under `db/procedures/`. |
| App call site | Add a typed wrapper in `server/db/contracts.ts`. |
| Route/page/component | Call the typed wrapper, not raw SQL directly. |
| Read-only list/detail queries | Use stored functions when part of the domain contract; direct SQL can be acceptable for simple admin/Auth.js gaps, but document it. |

There is one important caveat. The project is strongly procedure-oriented, but not absolutely procedure-only. The custom Auth.js adapter uses stored functions for most operations, while `getUserByAccount`, `updateSession`, and `unlinkAccount` use direct SQL because corresponding procedures are not currently defined.[14]

---

## 4. Stripe Setup

Stripe is used for hosted payment collection. The storefront validates the cart server-side, creates a Checkout session, sends the customer to Stripe, then waits for a signed webhook before writing the order.[12] [13]

### 4.1 Create and verify the Stripe account

Open <https://dashboard.stripe.com/register> and create an account. In the Stripe Dashboard, complete the business onboarding path before going live. Depending on country and business type, Stripe may ask for identity, bank, tax, website, fulfilment, and business representative details. Keep the project in **Test mode** until checkout and webhook delivery are verified.

### 4.2 Get API keys

In the Stripe Dashboard:

| Step | Action |
| --- | --- |
| 1 | Open **Developers → API keys**. |
| 2 | Confirm the dashboard is in **Test mode**. |
| 3 | Copy the **Publishable key** into `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`. |
| 4 | Reveal and copy the **Secret key** into `STRIPE_SECRET_KEY`. |
| 5 | Repeat later in **Live mode** for production, but only after verification and business approval. |

Use test keys in local and Vercel Preview. Use live keys only in the Vercel Production environment. The server helper throws if `STRIPE_SECRET_KEY` is missing, and the webhook helper throws if `STRIPE_WEBHOOK_SECRET` is missing.[19]

### 4.3 Create the webhook endpoint

After you have a deployed URL, open <https://dashboard.stripe.com/webhooks>. Use test-mode webhooks for local/preview and live-mode webhooks for production.[20]

| Step | Action |
| --- | --- |
| 1 | Click **Add endpoint**. |
| 2 | For **Endpoint URL**, enter `https://YOUR_DOMAIN.com/api/webhooks/stripe`. |
| 3 | Click **Select events**. |
| 4 | Subscribe to `checkout.session.completed`. |
| 5 | Optionally also subscribe to `checkout.session.expired` for dashboard visibility and future extension. The current code records and ignores non-completed events; it does not update application order state for expired sessions.[13] |
| 6 | Click **Add endpoint**. |
| 7 | Open the endpoint and reveal the **Signing secret**. |
| 8 | Save that value as `STRIPE_WEBHOOK_SECRET` in Vercel and `.env.local`. |

The repository’s webhook route is:

```text
POST /api/webhooks/stripe
```

The current webhook handler processes only this event type:

```text
checkout.session.completed
```

The handler records every received Stripe event through `record_stripe_event`, uses the `stripe_events` table for idempotency, and marks events processed through `mark_stripe_event_processed`. If Stripe retries the same already-processed event, the route returns a duplicate/processed response rather than creating a second order.[13] [17]

### 4.4 Test cards for development

Use Stripe’s documented test card numbers only in test mode.[21]

| Scenario | Test card | Notes |
| --- | --- | --- |
| Successful payment | `4242 4242 4242 4242` | Use any future expiry date, any CVC, and any postal code. |
| Authentication required | `4000 0025 0000 3155` | Useful if you need to verify 3D Secure flows. |
| Declined payment | `4000 0000 0000 9995` | Useful for confirming that no order is persisted without a completed session. |

### 4.5 Checkout metadata contract

The checkout route attaches metadata to Stripe product data and session metadata. If you change product types, adapter choices, or order fulfilment needs, update both the client cart payload and this metadata contract.[12]

| Metadata key | Scope | Source/purpose |
| --- | --- | --- |
| `source` | Checkout session | Currently `lumenform_studio`. Change this for your fork if you want analytics separation. |
| `checkout_payload_version` | Checkout session | Currently `phase_6_v1`; useful for future migrations. |
| `item_count` | Checkout session | Number of verified items. |
| `selected_adapters`, `materials`, `colours` | Checkout session | Aggregated values from cart items. |
| `fixture_notes`, `customisation_notes` | Checkout session | Aggregated note fields. |
| `cart_fingerprint` | Checkout session | SHA-256-derived fingerprint of handle, variant, quantity, adapter, colour, and notes. |
| `product_id`, `variant_id`, `handle` | Stripe product metadata | Used by the webhook to reconstruct order items. |
| `selected_adapter` | Stripe product metadata | Required by the webhook. Missing this causes webhook processing to fail. |
| `bulb_type_confirmed`, `fixture_notes`, `customisation_notes`, `material`, `colour`, `image_url`, `item_metadata` | Stripe product metadata | Persisted or incorporated into `order_items.metadata`. |

---

## 5. Vercel Deployment

The project is Vercel-compatible as a standard Next.js application. The repository deployment runbook explicitly states that database migrations and procedures are manual operator actions, not Vercel build steps.[3]

### 5.1 Import the fork

Go to <https://vercel.com/new> and use this flow.

| Step | Action |
| --- | --- |
| 1 | Click **Add New → Project**. |
| 2 | Select the GitHub account that owns your fork. |
| 3 | Click **Import** beside your forked repository. |
| 4 | Set **Framework Preset** to **Next.js**. Vercel usually detects this automatically. |
| 5 | Set **Root Directory** to the repository root. |
| 6 | Set **Install Command** to `pnpm install --frozen-lockfile`. |
| 7 | Set **Build Command** to `pnpm build`. |
| 8 | Leave **Output Directory** as the Vercel default for Next.js. |
| 9 | Add environment variables before the first production deployment. |
| 10 | Click **Deploy**. |

The repository deployment doc expects Node.js 20 or newer, `pnpm`, and standard Next.js output.[3]

### 5.2 Environment variables

Set these in **Vercel → Project → Settings → Environment Variables**. Add values separately for **Production**, **Preview**, and **Development** unless you intentionally want them shared. For secrets, do not prefix with `NEXT_PUBLIC_` unless the value is safe to expose to the browser.

| Variable | Required? | Used by | What it does | Example |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Yes | Checkout route, metadata routes, SEO routes | Public canonical origin. The checkout route uses it for Stripe success/cancel URLs when present. | `https://yourstore.com` |
| `DATABASE_URL` | Yes | `server/db/client.ts`, all database-backed flows | PostgreSQL connection string. Required for auth persistence, custom requests, admin, orders, and webhook persistence. | `postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require` |
| `SHOPIFY_STORE_DOMAIN` | Optional unless using Shopify | `lib/shopify.ts`, `lib/catalogue.ts` | Shopify store domain for live catalogue data. Without it, the app can fall back to mock products. | `your-store.myshopify.com` |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Optional unless using Shopify | `lib/shopify.ts` | Token used to query Shopify Storefront API products. | `shpat_or_storefront_token` |
| `SHOPIFY_API_VERSION` | Recommended with Shopify | `lib/shopify.ts` | Storefront API version. Keep aligned with Shopify’s supported API versions. | `2025-01` |
| `STRIPE_SECRET_KEY` | Yes for checkout | `server/stripe/client.ts`, checkout route, webhook route | Server-side Stripe key used to create Checkout sessions and retrieve line items. | `sk_test_REPLACE_WITH_TEST_SECRET` or `sk_live_REPLACE_WITH_LIVE_SECRET` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Recommended | Deployment docs; client-facing Stripe references | Public Stripe key matching the selected Stripe mode. Current checkout redirect is server-created, but keep this configured for client Stripe references and future use. | `pk_test_REPLACE_WITH_TEST_PUBLISHABLE_KEY` |
| `STRIPE_WEBHOOK_SECRET` | Yes for webhook | `server/stripe/client.ts`, webhook route | Signing secret for `POST /api/webhooks/stripe`. Must match the endpoint and mode. | `whsec_REPLACE_WITH_ENDPOINT_SECRET` |
| `NEXTAUTH_URL` | Yes in production | Auth.js | Canonical auth callback origin. Set to the production URL exactly. | `https://yourstore.com` |
| `NEXTAUTH_SECRET` | Yes | Auth.js | Secret for Auth.js session/security behavior. Generate a strong random value. | Output of `openssl rand -base64 32` |
| `EMAIL_SERVER_HOST` | Yes for production login email | Auth.js Nodemailer provider | SMTP host. With Resend SMTP, use `smtp.resend.com`.[11] | `smtp.resend.com` |
| `EMAIL_SERVER_PORT` | Yes for production login email | Auth.js Nodemailer provider | SMTP port. Resend supports ports including `465` and `587`.[11] | `465` |
| `EMAIL_SERVER_USER` | Yes for production login email | Auth.js Nodemailer provider | SMTP username. With Resend SMTP, use `resend`.[11] | `resend` |
| `EMAIL_SERVER_PASSWORD` | Yes for production login email | Auth.js Nodemailer provider | SMTP password or API key. With Resend, use the Resend API key. | `re_REPLACE_WITH_RESEND_API_KEY` |
| `EMAIL_FROM` | Yes for production login email | Auth.js Nodemailer provider | Sender name and address for magic links. The domain usually must be verified with the email provider. | `Your Store <noreply@yourstore.com>` |
| `ADMIN_EMAILS` | Yes for admin access | Admin authorization code | Comma-separated list of emails allowed to access `/admin`. | `founder@example.com,ops@example.com` |

The project uses `NEXTAUTH_URL` and `NEXTAUTH_SECRET` in its existing docs and environment template, not `AUTH_URL` and `AUTH_SECRET`. Auth.js supports newer naming patterns in some contexts, but this repository’s documented deployment path uses `NEXTAUTH_*`; use the repository’s names unless you intentionally refactor and verify the auth configuration.[3] [22]

Generate the auth secret locally with:

```bash
openssl rand -base64 32
```

### 5.3 Production domain

In Vercel, open **Project → Settings → Domains**, add your domain, and follow the displayed DNS instructions. Typical setups use either an apex record pointing to Vercel or a `www` CNAME. After Vercel shows the domain as valid, set:

```text
NEXT_PUBLIC_SITE_URL=https://yourstore.com
NEXTAUTH_URL=https://yourstore.com
```

Keep these values exact. Auth redirect loops often come from a mismatch between `NEXTAUTH_URL`, the deployed domain, and the domain used in the browser.

### 5.4 Deployment verification

Before promoting production, run the local gate:

```bash
pnpm lint
pnpm format:check
pnpm build
pnpm test:smoke
```

To test a deployed preview URL:

```bash
PLAYWRIGHT_BASE_URL=https://your-preview-url.vercel.app pnpm test:smoke
```

Then manually verify:

| Route | Expected behavior |
| --- | --- |
| `/` | Home page loads with your branding. |
| `/products` | Catalogue renders product cards. |
| `/products/meridian-bloom` | Fallback product detail renders before you replace mock content. |
| `/cart` | Empty cart is not checkoutable. |
| `/custom` | Custom request form renders and can submit when DB is configured. |
| `/login` | Magic-link form renders. |
| `/admin` | Unauthenticated users redirect to login. |
| `/sitemap.xml` | Public marketing and product routes are listed. |
| `/robots.txt` | Protected and transactional routes are disallowed. |

---

## 6. Authentication and Email Magic Links

Authentication is implemented with Auth.js v5 beta and the Nodemailer provider. The app uses database sessions and stores users, sessions, and verification tokens in PostgreSQL. It does not use password login.[14]

### 6.1 How login works

A visitor goes to `/login`, enters an email address, and receives a magic link. Auth.js creates or retrieves the user through the custom adapter, stores a verification token, and later creates a database session after the magic link is used. Protected `/account` and `/admin` page routes are guarded by middleware that checks for Auth.js session cookies. Admin authorization is additionally controlled through the configured admin email allowlist.[14] [23]

### 6.2 Local development without SMTP

If the SMTP variables are absent, `auth.ts` falls back to a development behavior that logs the magic link to the server console instead of sending email. This is useful locally, but it is not acceptable for production because users will not receive the login email.[14]

Run the dev server:

```bash
pnpm dev
```

Open <http://localhost:3000/login>, submit an email address, then watch the terminal output for the magic link.

### 6.3 Production email with Resend SMTP

Create a Resend account at <https://resend.com>, verify your sending domain, and create an API key. Then set the SMTP variables in Vercel.[10] [11]

| Variable | Resend SMTP value |
| --- | --- |
| `EMAIL_SERVER_HOST` | `smtp.resend.com` |
| `EMAIL_SERVER_PORT` | `465` or `587` |
| `EMAIL_SERVER_USER` | `resend` |
| `EMAIL_SERVER_PASSWORD` | Your Resend API key |
| `EMAIL_FROM` | `Your Store <noreply@your-verified-domain.com>` |

If you use another SMTP provider, keep the same environment variable names and replace the host, port, username, password, and sender with that provider’s values.

### 6.4 Admin access

Set `ADMIN_EMAILS` as a comma-separated list of the exact email addresses allowed to operate the admin panel.

```text
ADMIN_EMAILS=founder@example.com,ops@example.com
```

For safety, use lowercase addresses consistently. After deployment, test three states: unauthenticated user, authenticated non-admin user, and authenticated admin user. The middleware only checks whether a session cookie exists for `/account` and `/admin`; server-side admin code must still enforce the admin allowlist for authorization.[23]

---

## 7. Production Readiness Checklist

Use this checklist before accepting real payments. The repository includes a production checklist with the same operational posture: code checks, secrets, database setup, Stripe webhook verification, admin access, and rollback ownership must all be confirmed before launch.[24]

| Area | Check | Why it matters |
| --- | --- | --- |
| Code | `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm format:check`, `pnpm build`, and `pnpm test:smoke` pass. | Confirms that your fork still builds and the smoke suite passes. |
| Database | Schema and procedures have been applied to the intended production database. | Vercel deployment does not run migrations automatically. |
| Secrets | Production and Preview environment variables are separated. | Prevents live payments from being tested accidentally in Preview. |
| Stripe | Test checkout succeeds and webhook delivery is verified. | Orders are persisted only from the webhook. |
| Auth | `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, SMTP variables, and `ADMIN_EMAILS` are set. | Prevents login failures and admin lockout. |
| Email | Sender domain is verified and test magic links arrive in real inboxes. | SMTP acceptance is not the same as inbox delivery. |
| Catalogue | Mock or Shopify products show correct prices, currency, adapter options, and stock state. | Checkout validation rejects price, currency, stock, and adapter mismatches. |
| Rollback | A previous Vercel deployment is available and database rollback strategy is documented. | Vercel rollback does not revert database schema or data changes. |

---

## 8. Customization Guide

This section explains where to change the store without disturbing the infrastructure.

### 8.1 Branding, site name, and global visual identity

Start with these files.

| What to change | File | Notes |
| --- | --- | --- |
| Global color tokens | `app/globals.css` | The `:root` and `@theme inline` blocks define `--color-charcoal`, `--color-warm-black`, `--color-ivory`, `--color-warm-white`, `--color-amber`, `--color-frosted-blue`, `--color-filament-beige`, `--color-copper`, and related tokens. |
| Layout-level metadata and site shell | `app/layout.tsx` | Change global metadata, canonical assumptions, and site-wide wrappers. |
| Header/navigation branding | Header/nav components under `components/` and layout files | Search for `Lumenform`, `Studio`, and the current nav labels. |
| Footer copy | Footer component under `components/` or layout shell | Replace production claims such as delivery/fulfilment language only if your operation supports them. |
| Open Graph placeholders | `app/og-default.svg`, `app/og-product-placeholder.svg` if present | Replace with branded social preview assets. |

Use search before editing branding strings.

```bash
grep -R "Lumenform\|lumenform\|Studio" -n app components lib docs --exclude-dir=node_modules
```

The current global CSS tokens are intentionally plain CSS variables rather than a heavily abstracted theme system. A clean fork can often rebrand by replacing the color values in `app/globals.css`, updating logo/site text in layout/navigation components, and replacing product imagery.[25]

### 8.2 Product catalogue without Shopify

If you do not want Shopify initially, edit the mock product source.

| File | Purpose |
| --- | --- |
| `lib/mock-products.ts` | Defines starter products, handles, titles, descriptions, price, currency, images, stock state, materials, adapter compatibility, and metadata. |
| `lib/catalogue.ts` | Exposes catalogue functions and decides whether to use Shopify or fallback products. |
| `lib/types.ts` | Defines product and adapter types used by UI, validation, and checkout. |

For a fork, replace the mock catalogue entries with your own products. Keep handles stable and URL-safe because product detail routes depend on them.

A product must remain compatible with server-side checkout validation. At minimum, preserve these fields conceptually:

| Field | Why it matters |
| --- | --- |
| `id` and `handle` | Used to identify catalogue products and cart items. |
| `title` and description fields | Used in product pages and Stripe line item names. |
| `price` and `currency` | Re-read server-side during checkout. Client-submitted prices are not trusted. |
| `images` | Used for product UI and Stripe product image metadata when absolute URLs are available. |
| `inStock` | Checkout rejects out-of-stock catalogue products. |
| `adapters` | Checkout validates the selected adapter against this list. |
| `material` and optional metadata | Persisted into checkout/order metadata. |

### 8.3 Adapter options and product option changes

The current adapter options are hard-coded in the cart validation layer as:

```text
B22
E27
Clipsal No. 530
Other / not sure
```

The validation file enforces two important rules. The selected adapter must be one of the allowed values, and if the customer selects `Other / not sure`, fixture notes are required.[12]

To change adapter options for a different product type, update all affected layers together.

| Layer | File or area | Required change |
| --- | --- | --- |
| Type definitions | `lib/types.ts` | Update the `AdapterType` union or equivalent type. |
| Product data | `lib/mock-products.ts` and/or Shopify metafields/tags | Ensure each product exposes compatible option values. |
| Product UI | `components/product-detail.tsx` | Change dropdown/radio options, labels, and explanatory copy. |
| Cart validation | `server/cart/validation.ts` | Update `VALID_ADAPTERS` and any conditional validation rules. |
| Stripe metadata | `app/api/checkout/create-session/route.ts` | Rename metadata keys only if you also update the webhook and database persistence. |
| Database/order display | `order_items.selected_adapter`, admin pages | Rename database fields only through a migration and corresponding procedure updates. |

Do not only change the UI. If the server-side validation still expects the original adapter strings, checkout will fail with `422 Cart validation failed`.

### 8.4 Checkout metadata changes

The checkout route builds Stripe line items and metadata from verified cart items. If your store sells a different class of products, prefer adding new metadata keys over renaming existing keys until you have updated the webhook and schema.[12] [13]

For example, if a fork sells framed prints instead of lamp shades, you might add:

```ts
frame_size: metadataValue(item.metadata.frameSize),
paper_type: metadataValue(item.metadata.paperType),
```

But if you remove `selected_adapter` without updating the webhook, order persistence will fail because the webhook currently treats missing `selected_adapter` as an error.[13]

### 8.5 Custom design request form

The custom request endpoint is:

```text
POST /api/custom-design-requests
```

The client form currently collects fields such as name, email, phone, fixture type, adapter type, desired shade style, dimensions, colour/material preference, notes, and an upload acknowledgement. The backend persists a normalized request into `custom_design_requests` through `create_custom_design_request`.[17]

The current database table is simpler than the UI. It stores `email`, `name`, `phone`, `fixture_type`, `adapter_type`, `design_notes`, `budget_range`, and `status`. If you want each UI field stored separately, add database columns, update the stored function, and update the route mapping. Do not assume adding a client field automatically persists it as a separate database column.[16] [17]

### 8.6 Admin panel adjustments

The admin pages live under `app/admin`. The current admin-lite surface includes order review, custom design request review/status management, and dashboard overview functions from the database contract layer.[18]

| Admin area | Where to look | What to change |
| --- | --- | --- |
| Admin navigation/layout | `app/admin/layout.tsx` and related components | Rename sections, add links, or remove links only after confirming routes. |
| Orders list | `app/admin/orders/page.tsx` | Change displayed columns, status badges, or filters. |
| Order detail | `app/admin/orders/[id]/page.tsx` if present | Add product-specific metadata display. |
| Custom requests | `app/admin/custom-requests/page.tsx` | Change intake review fields and statuses. |
| Status controls | `components/admin/status-controls.tsx` | Change allowed status transitions carefully. |
| Dashboard summary | `get_admin_dashboard_overview()` and consuming page | Add metrics through SQL first, then expose them in `server/db/contracts.ts`. |

Preserve admin authorization while editing. Do not make `/admin` a purely client-side protection problem; admin data is fetched server-side and should remain gated on the server.

### 8.7 Content pages and SEO

Use repository search to find marketing copy and static route content.

```bash
find app -maxdepth 3 -type f \( -name 'page.tsx' -o -name 'layout.tsx' -o -name 'metadata.ts' \) | sort
```

Then search for legacy brand terms.

```bash
grep -R "Lumenform\|lampshade\|adapter\|pickup\|LED" -n app components lib --exclude-dir=node_modules
```

When changing content, keep transactional claims accurate. If your fork does not support local pickup, remove or update local-pickup copy, but also update the fulfilment assumptions in the webhook/database/admin flow. The current webhook persists `fulfilment_method: "local_pickup"`.[13]

---

## 9. Shopify Integration Optional

Shopify is optional. The app can run from mock catalogue data, but live product data can be pulled from Shopify through the Storefront API when the relevant environment variables are present.[6]

### 9.1 Create a Shopify Storefront API token

In Shopify Admin, use the current Shopify path for custom app/storefront access. The exact UI can change, but the general path is:

| Step | Action |
| --- | --- |
| 1 | Open your Shopify Admin. |
| 2 | Go to **Settings → Apps and sales channels**. |
| 3 | Open **Develop apps** or create/open a custom app. |
| 4 | Configure **Storefront API integration**. |
| 5 | Grant read access needed for products and product variants. |
| 6 | Install the app if required. |
| 7 | Copy the Storefront API access token. |

Set:

```bash
SHOPIFY_STORE_DOMAIN="your-store.myshopify.com"
SHOPIFY_STOREFRONT_ACCESS_TOKEN="your-storefront-token"
SHOPIFY_API_VERSION="2025-01"
```

Confirm the API version is currently supported by Shopify before launch.[26]

### 9.2 Expected product structure

The repository includes `docs/SHOPIFY_PRODUCT_STRUCTURE.md` and normalization logic in `lib/shopify.ts`. The integration expects Shopify products to map into the app’s `Product` shape: handle, title, description, images, variant information, price/currency, stock/availability, material, adapter compatibility, and product metadata.[6] [27]

In practical terms, each live product should have:

| Product data | Expected use in app |
| --- | --- |
| Product handle | Product URL and cart lookup. |
| Title and description | Product card and detail page. |
| Images | Product gallery/card and optional Stripe product image. |
| Variant price and currency | Server-side checkout validation. |
| Availability | `inStock` behavior. |
| Material | Product display and Stripe/order metadata. |
| Adapter compatibility | Product UI and checkout validation. |
| Tags/metafields | Normalized into product metadata, adapter lists, material, colour, or other option fields depending on repository mapping. |

### 9.3 Fallback behavior

If Shopify variables are missing, the app can use mock products. That is good for local development and early brand rebuilds. For production, decide explicitly whether mock products are acceptable. If you intend Shopify to be authoritative for price and stock, treat a Shopify outage or misconfiguration as a launch blocker rather than silently selling stale fallback inventory.

---

## 10. Database Schema Reference

The current schema is in `db/migrations/001_initial_schema.sql`.[16]

### 10.1 Tables

| Table | Purpose | Key columns |
| --- | --- | --- |
| `users` | Auth.js users and customer identities. | `id`, `name`, `email`, `email_verified`, `image`, `created_at`, `updated_at` |
| `accounts` | Auth.js provider accounts. | `id`, `user_id`, `type`, `provider`, `provider_account_id`, OAuth token fields, `created_at` |
| `sessions` | Auth.js database sessions. | `id`, `session_token`, `user_id`, `expires`, `created_at` |
| `verification_tokens` | Email magic-link verification tokens. | `identifier`, `token`, `expires` |
| `orders` | Order headers created from completed Stripe Checkout sessions. | `id`, `user_id`, `email`, `buyer_name`, `phone`, `stripe_checkout_session_id`, `stripe_payment_intent_id`, `status`, `fulfilment_method`, `subtotal_amount`, `total_amount`, `currency`, `pickup_status`, timestamps |
| `order_items` | Product lines for persisted orders. | `id`, `order_id`, Shopify IDs, `title`, `variant_title`, `quantity`, `unit_amount`, `total_amount`, `image_url`, `selected_adapter`, `bulb_type_confirmed`, notes, `material`, `colour`, `metadata` |
| `stripe_events` | Idempotency and audit log for Stripe webhooks. | `id`, `stripe_event_id`, `event_type`, `payload`, `processed`, `processed_at`, `created_at` |
| `pickup_requests` | Local pickup workflow records. | `id`, `order_id`, `requested_by`, `requested_at`, `preferred_date`, `preferred_time`, `notes`, `status`, timestamps |
| `buyer_events` | Event log for buyer lifecycle hooks. | `id`, `user_id`, `email`, `event_type`, `event_data`, `order_id`, `created_at` |
| `shipping_stubs` | Placeholder for future shipping implementation. | `id`, `order_id`, `method`, `address_json`, `tracking_number`, `status`, `notes`, timestamps |
| `custom_design_requests` | Custom enquiry/intake records. | `id`, `user_id`, `email`, `name`, `phone`, `fixture_type`, `adapter_type`, `design_notes`, `budget_range`, `status`, `created_at` |

### 10.2 Indexes

The migration creates indexes for common lookup paths: order lookup by Stripe checkout session, user, email, status, pickup status, and creation time; order items by order; Stripe events by event id and processed state; pickup requests by order and status; buyer events by user, email, event type, and order; custom design requests by email and status; sessions and accounts by user.[16]

### 10.3 Stored procedures and functions

| File | Functions |
| --- | --- |
| `db/procedures/auth_procedures.sql` | `create_user`, `get_user_by_id`, `get_user_by_email`, `link_account`, `create_session`, `get_session_and_user`, `delete_session`, `create_verification_token`, `use_verification_token`, `delete_user`, `update_user` |
| `db/procedures/order_procedures.sql` | `create_order_from_stripe_session`, `create_order_item`, `record_stripe_event`, `mark_stripe_event_processed`, `record_buyer_event`, `get_order_by_id`, `get_order_by_checkout_session`, `get_orders_for_email`, `get_recent_orders_admin`, `create_custom_design_request`, `get_admin_dashboard_overview`, `get_custom_design_requests_admin`, `get_custom_design_request_by_id`, `update_custom_design_request_status` |
| `db/procedures/pickup_procedures.sql` | `create_pickup_request`, `update_pickup_status`, `get_pickup_requests_for_order`, `get_orders_pending_pickup` |

---

## 11. Development Workflow

### 11.1 Run locally

Use this sequence for a clean local start.

```bash
git clone https://github.com/YOUR_GITHUB_USER/lumenform.git
cd lumenform
pnpm install --frozen-lockfile
cp .env.example .env.local
```

Edit `.env.local` with at least:

```bash
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
ADMIN_EMAILS="you@example.com"
```

If you want checkout locally, also add Stripe test values:

```bash
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Apply the database schema and procedures:

```bash
export DATABASE_URL='postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require'
pnpm db:setup
```

Start the app:

```bash
pnpm dev
```

Open <http://localhost:3000>.

### 11.2 Local Stripe webhook testing

For local webhook testing, install the Stripe CLI from <https://stripe.com/docs/stripe-cli>, sign in, and forward events.

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI prints a signing secret like `whsec_REPLACE_WITH_ENDPOINT_SECRET`. Put that value into `.env.local` as `STRIPE_WEBHOOK_SECRET`, then restart `pnpm dev`.

Trigger a test event or complete a real test checkout from the local app. Because the webhook creates the order, do not judge order persistence from the success redirect alone. Check the `orders`, `order_items`, and `stripe_events` tables.

```bash
psql "$DATABASE_URL" -c 'select id, email, status, total_amount, currency, created_at from orders order by created_at desc limit 5;'
psql "$DATABASE_URL" -c 'select stripe_event_id, event_type, processed, created_at from stripe_events order by created_at desc limit 5;'
```

### 11.3 Branching model

Use a conservative branch model.

| Branch type | Purpose | Rule |
| --- | --- | --- |
| `main` | Production-ready code | Only merge after preview verification. |
| `feature/...` | Product, content, or integration work | Keep changes focused. Do not mix branding rewrite with payment/auth changes if avoidable. |
| `fix/...` | Corrective changes | Include reproduction and verification notes in the PR. |
| `db/...` | Schema/procedure changes | Include SQL migration/procedure changes and manual rollback notes. |

### 11.4 Adding features in the existing pattern

When adding a feature, preserve the repo’s layering.

| Feature need | Preferred path |
| --- | --- |
| New public page | Add an App Router page under `app/`, reuse existing layout/components. |
| New product attribute | Add it to product data/types, render it in components, validate it server-side if checkout-relevant, and persist it through Stripe metadata/database only if operationally needed. |
| New database write | Migration SQL, stored function, contract wrapper, then route/page usage. |
| New admin view | Add read function or query, expose via `server/db/contracts.ts`, render under `app/admin`, preserve admin auth. |
| New webhook event behavior | Subscribe in Stripe, update webhook handler, add idempotent persistence, test retries and duplicate events. |
| New email automation | Use `server/hooks/buyer-events.ts` as the extension point, but keep checkout/webhook failure modes isolated from non-critical email failures. |

### 11.5 Quality gates

Run these before opening a pull request.

```bash
pnpm lint
pnpm format:check
pnpm build
pnpm test:smoke
```

Avoid broad auto-formatting or lint-driven rewrites in the same commit as business logic. It makes regressions harder to review.

---

## 12. Troubleshooting and FAQ

### 12.1 Webhook is not firing

First determine whether Stripe is failing to deliver the event or whether the app is rejecting it.

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| No event appears in Stripe endpoint delivery log | Webhook endpoint not registered in the correct Stripe mode. | In Stripe Dashboard, confirm **Developers → Webhooks** in Test or Live mode, matching your keys. |
| Delivery returns `404` | Wrong URL. | Use `https://YOUR_DOMAIN.com/api/webhooks/stripe`. |
| Delivery returns `400 Missing Stripe signature header` | Request did not come from Stripe or header was stripped. | Use Stripe Dashboard/CLI delivery, not a generic POST tool. |
| Delivery returns signature verification error | Wrong `STRIPE_WEBHOOK_SECRET`. | Copy the signing secret from the exact endpoint and mode. Preview and production endpoints have different secrets. |
| Delivery returns `500` mentioning missing `selected_adapter` | Checkout metadata and webhook expectations are inconsistent. | Restore `selected_adapter` metadata or update the webhook/database logic together. |
| Event is delivered but no order appears | Event was not `checkout.session.completed`, or processing failed. | Check `stripe_events.processed`, Vercel function logs, and the webhook response body. |

### 12.2 Checkout session creation fails

Check the server response from `POST /api/checkout/create-session` and Vercel logs.

| Error | Meaning | Fix |
| --- | --- | --- |
| `STRIPE_SECRET_KEY is required for Stripe checkout.` | Missing server secret. | Set `STRIPE_SECRET_KEY` and redeploy/restart. |
| `Cart validation failed` with `ledAcknowledged` | Customer did not acknowledge LED-only requirement. | Preserve or adapt the acknowledgement flow. |
| `Cart validation failed` with `selectedAdapter` | Adapter value is not one of the server-allowed values or not compatible with product. | Update UI, product data, and `server/cart/validation.ts` consistently. |
| `Price mismatch` | Client price does not match catalogue price. | Confirm mock/Shopify product price and client cart state. Do not bypass this check. |
| `Product not found in catalogue` | Cart handle does not exist in current catalogue source. | Keep handles stable or clear cart state after product data changes. |

### 12.3 Auth redirect loops

Redirect loops usually come from mismatched auth URLs, missing secrets, or cookie/domain issues.

| Check | Expected value |
| --- | --- |
| `NEXTAUTH_URL` | Exact deployed origin, e.g. `https://yourstore.com`. |
| `NEXT_PUBLIC_SITE_URL` | Same canonical production origin unless you intentionally use a different public URL. |
| `NEXTAUTH_SECRET` | Set in every environment that uses Auth.js. |
| Browser URL | Use the same domain configured in `NEXTAUTH_URL`; avoid mixing Vercel preview domain and custom domain during auth tests. |
| SMTP | In production, magic-link email must actually send. In local dev, check terminal output for the logged magic link. |

The middleware checks for Auth.js session cookies on `/account` and `/admin`. If the cookie is absent, it redirects to `/login` with `callbackUrl` set to the original path.[23]

### 12.4 Database connection errors

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `DATABASE_URL` undefined | Environment variable missing in local shell or Vercel. | Set it in `.env.local` and Vercel Project Settings. |
| SSL error | Connection string missing SSL mode for hosted Postgres. | Use Neon’s provided string, typically with `sslmode=require`. |
| Relation does not exist | Schema not applied to that database. | Run `pnpm db:migrate` against the intended `DATABASE_URL`. |
| Function does not exist | Procedures not applied after schema. | Run `pnpm db:procedures`. |
| Works locally but not Vercel | Environment variables differ. | Compare Vercel Production/Preview variables and redeploy after changes. |

### 12.5 Build failures

Run the same commands locally that Vercel runs.

```bash
pnpm install --frozen-lockfile
pnpm build
```

Common causes are TypeScript errors after changing product types, missing imports after moving components, or assuming environment variables exist at build time. Server routes can read runtime secrets, but metadata/static generation paths may fail if code assumes live external services without fallback behavior.

### 12.6 Products are stale or wrong

If using mock products, edit `lib/mock-products.ts`. If using Shopify, confirm the three Shopify environment variables are set in the relevant Vercel environment and that the Storefront token can read products. Also confirm product handles, variant availability, price, currency, and tags/metafields map into the expected normalized product shape.[6] [27]

### 12.7 Orders are duplicated

The intended design prevents duplicate order persistence by storing Stripe event IDs and enforcing uniqueness on `stripe_events.stripe_event_id`, plus uniqueness on `orders.stripe_checkout_session_id`.[13] [16] If duplicates appear, check whether manual inserts or alternate write paths bypassed the stored procedures.

### 12.8 Can I replace Neon with Supabase, Railway, or another PostgreSQL host?

Yes, if the host provides a PostgreSQL connection string compatible with `pg` and supports the SQL used in the migration and procedure files. The app does not depend on Neon-specific SQL features. Neon is only the recommended path in this guide because it is simple, serverless-friendly, and has a free starter tier.[8]

### 12.9 Can I remove Shopify entirely?

Yes. Keep `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN` unset, maintain `lib/mock-products.ts`, and verify catalogue/checkout behavior. If you remove Shopify code, do it after launch-critical flows are stable, not as part of the first branding fork.

### 12.10 Can I change from local pickup to shipping?

Yes, but it is not just copy. The webhook currently persists `fulfilment_method: "local_pickup"`, the schema includes `pickup_status` and `pickup_requests`, and `shipping_stubs` is only a placeholder. A shipping implementation should add address collection, shipping method/rate selection, database fields or tables, Stripe Checkout shipping settings if used, admin fulfilment views, and customer notifications.[13] [16]

---

## References

[1]: https://github.com/Big-jpg/lumenform "Big-jpg/lumenform repository"
[2]: https://github.com/Big-jpg/lumenform/blob/main/package.json "Lumenform package.json"
[3]: https://github.com/Big-jpg/lumenform/blob/main/docs/vercel-deployment.md "Lumenform Vercel deployment runbook"
[4]: https://github.com/Big-jpg/lumenform/blob/main/.env.example "Lumenform environment template"
[5]: https://github.com/Big-jpg/lumenform/blob/main/server/db/client.ts "Lumenform PostgreSQL client helper"
[6]: https://github.com/Big-jpg/lumenform/blob/main/lib/catalogue.ts "Lumenform catalogue module"
[7]: https://vercel.com/pricing "Vercel pricing"
[8]: https://neon.com/pricing "Neon pricing"
[9]: https://stripe.com/pricing "Stripe pricing"
[10]: https://resend.com/pricing "Resend pricing"
[11]: https://resend.com/docs/send-with-smtp "Resend SMTP documentation"
[12]: https://github.com/Big-jpg/lumenform/blob/main/app/api/checkout/create-session/route.ts "Lumenform Stripe checkout session route"
[13]: https://github.com/Big-jpg/lumenform/blob/main/app/api/webhooks/stripe/route.ts "Lumenform Stripe webhook route"
[14]: https://github.com/Big-jpg/lumenform/blob/main/auth.ts "Lumenform Auth.js configuration"
[15]: https://github.com/Big-jpg/lumenform/blob/main/server/hooks/buyer-events.ts "Lumenform buyer event hooks"
[16]: https://github.com/Big-jpg/lumenform/blob/main/db/migrations/001_initial_schema.sql "Lumenform initial PostgreSQL schema"
[17]: https://github.com/Big-jpg/lumenform/tree/main/db/procedures "Lumenform stored procedures"
[18]: https://github.com/Big-jpg/lumenform/blob/main/server/db/contracts.ts "Lumenform database contract layer"
[19]: https://github.com/Big-jpg/lumenform/blob/main/server/stripe/client.ts "Lumenform Stripe client helper"
[20]: https://docs.stripe.com/webhooks "Stripe webhook documentation"
[21]: https://docs.stripe.com/testing "Stripe testing documentation"
[22]: https://authjs.dev/getting-started/deployment "Auth.js deployment documentation"
[23]: https://github.com/Big-jpg/lumenform/blob/main/middleware.ts "Lumenform protected-route middleware"
[24]: https://github.com/Big-jpg/lumenform/blob/main/docs/production-environment-checklist.md "Lumenform production environment checklist"
[25]: https://github.com/Big-jpg/lumenform/blob/main/app/globals.css "Lumenform global CSS brand tokens"
[26]: https://shopify.dev/docs/api/usage/versioning "Shopify API versioning"
[27]: https://github.com/Big-jpg/lumenform/blob/main/docs/SHOPIFY_PRODUCT_STRUCTURE.md "Lumenform Shopify product structure"
