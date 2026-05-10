# Lumenform Studio

Custom 3D printed lampshades designed for the lights you already own.

Parametric lighting objects with included B22, E27, and Clipsal-compatible adapters. Lightweight, locally produced, and customisable.

## Stack

| Layer             | Technology                                       |
| ----------------- | ------------------------------------------------ |
| Framework         | Next.js (App Router)                             |
| Language          | TypeScript                                       |
| Styling           | Tailwind CSS v4                                  |
| Database          | PostgreSQL (raw SQL, stored procedures — no ORM) |
| Product Catalogue | Shopify Storefront API                           |
| Payments          | Stripe Checkout + Webhooks                       |
| Auth              | Auth.js (NextAuth)                               |
| Deployment        | Vercel-compatible                                |

## Prerequisites

- Node.js 20+ (LTS recommended)
- pnpm 9+
- PostgreSQL 15+ (for phases 4+)
- Shopify store with Storefront API access (for phases 2+)
- Stripe account with test keys (for phases 5+)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Big-jpg/lumenform.git
cd lumenform

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

See `.env.example` for the full list. Key groups:

| Variable                          | Phase | Description                           |
| --------------------------------- | ----- | ------------------------------------- |
| `DATABASE_URL`                    | 4     | PostgreSQL connection string          |
| `SHOPIFY_STORE_DOMAIN`            | 2     | Shopify store domain                  |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | 2     | Storefront API token                  |
| `SHOPIFY_API_VERSION`             | 2     | Storefront API version                |
| `STRIPE_SECRET_KEY`               | 5     | Stripe secret key                     |
| `STRIPE_PUBLISHABLE_KEY`          | 5     | Stripe publishable key                |
| `STRIPE_WEBHOOK_SECRET`           | 5     | Stripe webhook signing secret         |
| `NEXTAUTH_URL`                    | 6     | Auth.js callback URL                  |
| `NEXTAUTH_SECRET`                 | 6     | Auth.js session secret                |
| `AUTH_GOOGLE_ID`                  | 6     | Google OAuth client ID                |
| `AUTH_GOOGLE_SECRET`              | 6     | Google OAuth client secret            |
| `ADMIN_EMAILS`                    | 8     | Comma-separated admin email allowlist |

## Project Structure

```
lumenform/
├── app/                  # Next.js App Router pages and layouts
├── components/           # Shared React components
├── lib/                  # Client-side utilities and helpers
├── server/               # Server-side modules (API, services)
├── db/
│   ├── migrations/       # Versioned SQL migration files
│   └── procedures/       # PostgreSQL stored procedures/functions
├── public/
│   └── products/         # Product images
├── .env.example          # Environment variable template
├── eslint.config.mjs     # ESLint configuration
├── .prettierrc           # Prettier configuration
├── next.config.ts        # Next.js configuration
├── postcss.config.mjs    # PostCSS configuration (Tailwind v4)
├── tsconfig.json         # TypeScript configuration
└── package.json
```

## Scripts

```bash
pnpm dev            # Start development server
pnpm build          # Production build
pnpm start          # Start production server
pnpm lint           # Run ESLint
pnpm format         # Format code with Prettier
pnpm format:check   # Check formatting without writing
```

## Branching Protocol

Each project phase is developed on a dedicated branch (`phase-N-short-description`). Branches are not merged to `main` without explicit review and approval.

## Architecture Notes

- **No ORM**: All database access uses raw SQL via `pg` or `@neondatabase/serverless`. Stored procedures and functions form the database contract.
- **Shopify as CMS**: Product catalogue is managed in Shopify. The Next.js app consumes it via the Storefront API.
- **Stripe for payments**: Checkout sessions are created server-side. Webhooks persist order state.
- **Adapter selection required**: Every lampshade purchase requires the customer to select a fixture adapter (B22, E27, Clipsal No. 530, or Other).
- **LED only**: Products are designed for LED bulbs only. Safety disclaimers are displayed throughout.
- **Local pickup only**: Shipping is stubbed but not active.

## License

Private. All rights reserved.
