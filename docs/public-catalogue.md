# Public photo catalogue

The public shop is a browsing catalogue while online sales are closed. It renders in both development and production from `lib/public-catalogue.ts`, independently of Neon inventory. It has 18 display entries across boards, hats, tees, jackets, bearings and stickers, with 54 reviewed photo views.

## Files and operator workflow

- `lib/public-catalogue.ts` is the public display manifest. Its handles identify photo sets, not confirmed database products or SKUs. Keep `purchasable: false`; omit prices, inventory, sizes and unsupported specifications.
- `public/catalogue-photos/` holds the selected metadata-free WebPs at 320, 800 and 1600 pixels. The 162 files total 18,110,494 bytes. These files become publicly accessible when this branch is deployed or pushed to the public repository.
- `/shop` renders category links and cards. `/shop/[handle]` renders the full-frame gallery. Category query links work without JavaScript; the gallery includes direct-photo links for that case.
- `lib/commerce-config.ts` sets `SALES_ENABLED = false`. This hides purchase controls and blocks cart validation, availability requests and checkout before database, stock-hold or Stripe access. Existing payment webhooks, hold release and order recovery remain available.
- `components/react-bits/` contains the React Bits FadeContent component. Source revision and complete licence are recorded in `THIRD_PARTY_NOTICES.md`.

For a display-copy correction, edit the public manifest and review the affected card and gallery. For a new photograph, first complete the private intake and quality review described in [photo-intake.md](photo-intake.md). Copy only approved metadata-free derivatives into the public asset folder, add explicit URLs for each size, dimensions and descriptive alt text, then verify the image association and whole-frame presentation. Keep the ZIP, originals, source filenames and links, contact sheets, and private mappings inside the ignored `.photo-intake/` folder. Board 2, wheels and trucks have no new listings.

The older `/products/[handle]`, admin and sold-board archive retain their database identities. Public photo entries do not create or publish database rows. The admin price, stock and photo-only editing contracts remain in place.

## Sales and release

Do not enable sales merely because photographs are public. Resolve product identities, prices, currency, variants, stock, jacket availability and sticker pack composition first, then validate the commerce flow using approved test inventory and Stripe test mode. This release deliberately closes sales for existing products as well as the incoming photo sets. A stale cart cannot start checkout. Previously issued hosted Stripe sessions are not expired by this code change; existing payment recovery stays operational.

The original private `/photo-review` pages and their image handler remain development-only and return 404 in production. Public browsing uses separate routes and selected static assets; changing the private route guard is unnecessary.

No migration, Blob upload or production environment change is required for this catalogue. Deployment must include the public assets and public manifest from this feature branch. Re-deploying an older commit will show the older shop.

## Local verification

Run `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`, and `pnpm test:smoke`. For isolated browsing checks, override `DATABASE_URL` with an unusable local connection, clear Stripe and Blob credentials, and use a local test auth secret. Do not use live inventory or a real purchase for verification.

The production check must use `pnpm start` after a successful build. Test `/shop`, all six category links, public photo detail pages and image bytes, the disabled cart and checkout APIs, and the 404 boundary around private review routes. Check 360–390 px mobile widths, tablet and desktop, reduced motion, keyboard, touch and image loading. Production-mode private-route assertions use `PHOTO_REVIEW_TEST_MODE=production`.
