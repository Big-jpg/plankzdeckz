# October website delivery and verification

Validated locally on 28–29 October 2026. Branch: `feature/october-website-completion`, based on existing local commerce commit `326fecd`. No dependencies, database migrations, commerce providers or deployment services were added.

## Focused increments

| Commit    | Module                        | Result                                                                                                                                                                                                 |
| --------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `3ac6132` | Phase 0 discovery             | Existing capabilities, architecture boundaries, input gaps and implementation order documented                                                                                                         |
| `3f4d389` | Branding and supporting pages | Supplied OG artwork, exact header tagline, brown public brand text, preserved typography and beige styling, renamed process heading, accessible five-image homepage carousel                           |
| `7f124db` | Board catalogue and gallery   | Supplied copy on existing board records, verified timber facts, reversible beige photo surrounds, card navigation and navigable enlarged images, shared gallery metadata and transparent logo overlays |
| `24521ac` | WARES catalogue preparation   | Thirteen protected draft presets and existing-schema truck/wheel support; no live catalogue writes                                                                                                     |
| `c66284c` | Hat incentive pricing         | Explicit Trad/Cord eligibility, authoritative quotes, locked reservation validation, discounted payment snapshots and consistent cart presentation                                                     |

## Module delivery details

### Branding and homepage

Files: `app/page.tsx`, `app/globals.css`, `components/homepage-carousel.tsx`, `components/site-header.tsx`, `components/site-footer.tsx`, `public/plankz-og-logo.png`, supporting routes under `app/{our-story,materials,process,pickup,faq,contact,privacy,terms}/page.tsx`, and `tests/homepage-carousel.spec.ts`.

The logo derivative was extracted from the supplied vector PDF, with its white paper removed and artwork proportions retained. Existing Bangers/Inter typography remains. The header tagline is `HAND-CRAFTED SKATEBOARD DECKZ`. Public yellow brand text uses the existing homepage brown; the amber token remains for operational status/warnings. Existing supporting prose is preserved, apart from the requested process name and homepage pallets wording.

The carousel uses five actual existing board photographs, identified as temporary pending lifestyle images. It supports six-second rotation, pause/resume, manual selection, keyboard, touch, focus/hover suspension, reduced motion and failed-image fallback.

Assumption/dependency: current board images are temporary content, not the final requested lifestyle sequence. Regression risks are limited to shared header/footer styling and carousel interaction; browser and screenshot checks cover those surfaces. Suggested next content increment: replace the five carousel references when final images arrive.

### Board presentation and gallery

Files: `lib/public-catalogue.ts`, `components/public-catalogue-card.tsx`, `components/public-catalogue-gallery.tsx`, `app/shop/[handle]/page.tsx`, `app/shop/catalogue.css`, `app/shop/page.tsx`, `app/gallery/page.tsx`, `docs/board-content-pending.md`, and `tests/board-presentation.spec.ts`.

Existing Board #1 and #3–#6 handles/identifiers retain the supplied descriptions. Structured facts include only timber identified by the supplied copy. Board #2 copy is retained privately in documentation pending photographs; Boards #7–#11 remain pending. Reference-retailer dimensions and components are excluded. Existing OG tee and FUSHI bearing records receive the supplied verified details.

Cards retain their original image/title detail link while adding independent photo controls. The enlarged viewer shares the selected image with the detail gallery, supports keyboard/touch/thumbnails, contains focus, restores it on dismissal, and retains direct image links. Failed and empty image lists have explicit fallbacks. `--pc-photo-surround` makes the beige treatment reversible.

The public gallery reuses canonical display-board records. The Neon sold-board archive and `/products/[handle]` purchase identities remain separate. Empty hardware photo categories state that photographs have not been supplied rather than inventing images.

Assumption/dependency: no association between display-photo handles and commerce records is inferred. Main risks are image controls intercepting links, modal focus and responsive overflow; new and existing browser checks cover those behaviours. Suggested next increment: verified Board #2 imagery and missing board specifications.

### WARES preparation

Files: `components/admin/wares-presets.ts`, `components/admin/product-editor.tsx`, `app/admin/products/page.tsx`, `lib/types.ts`, `lib/catalogue.ts`, `lib/commerce-categories.ts`, `server/catalogue/product-input.ts`, `tests/wares-presets.spec.ts`, and existing product-input, safety, market-sale and authenticated-browser tests.

The existing wizard offers proposed retail values for Trad/Cord hats, four tees, four sticker products, trucks, wheels and bearings. Presets only apply to untouched, unsaved drafts. They preserve unknown stock, photographs, sizes and selling units; publication still requires confirmed data. Hardware kinds extend the existing explicit allowlist and text schema. Supplier costs and profit figures are absent from application presets.

Assumption/dependency: actual products, colours, photos, sale units and stock must be confirmed in the existing wizard. No production record was inserted, repriced, tagged or published. The requested public Trad colour grouping awaits confirmed photo/product/family mapping. Main risks are overwriting authored drafts or weakening publication checks; pure and authenticated compiled-browser tests cover both. Suggested next increment: complete and review real catalogue drafts.

### Hat pricing

Files: `lib/hat-pricing.ts`, `lib/types.ts`, `lib/catalogue.ts`, `lib/sellability.ts`, `server/catalogue/product-input.ts`, product admin routes/editor/presets, `server/cart/validation-core.ts`, `server/cart/holds.ts`, cart-validation and checkout-creation routes, `lib/cart-context.tsx`, `lib/cart-types.ts`, `components/{product-detail,cart-drawer,cart-page-content}.tsx`, and the new hat-policy, cart-quote and PostgreSQL hat-pricing tests.

The chat-confirmed policy is Trad 1 at AUD 25, 2+ at AUD 22.50 each; Cord 1 at AUD 40, 2–4 at AUD 37.50 each, 5+ at AUD 31 each. Colours within the same explicitly assigned family aggregate; families remain separate. The operator must confirm that one sale unit means one hat. Tagged records with a mismatched base retail price fail closed.

Browser metadata cannot choose eligibility or rates. The server merges duplicate variants, derives family quantities, quotes integer cents and rechecks retail/family/stock under product locks. Reservation and paid-order snapshots retain actual unit amounts and pricing provenance. Stripe receives those discounted unit amounts through the existing hosted-checkout integration; promotion codes remain disabled. Existing refund accounting preserves paid prices and does not automatically restock or invent a return policy.

The product detail shows approved tiers only for tagged hats. Cart and drawer use a fresh server quote and show savings, loading and retry states. Quote responses cannot be reused after cart changes, including A → B → A quantity changes. Checkout compares the displayed expected total with the trusted calculation; price changes require a refreshed quote and another explicit checkout click. An earlier durable reservation with a different amount is retained for safe reconciliation rather than silently reopened at another price.

Assumption/dependency: pricing is available in local code and the wizard; activation for actual records requires verified family/unit assignment. Real Stripe test-mode hosted checkout remains an external acceptance gate. Financial regression risk is material, so the change is covered through server quote, row locks, Stripe parameters, durable snapshots, paid-line validation, idempotency and partial refunds in isolated PostgreSQL.

## Verification evidence

| Check                                | Result                                                                                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript                           | Passed standalone elevated checks and enabled and disabled production builds                                                          |
| ESLint                               | Full repository run passed; changed-component and commerce checks also passed                                                         |
| Storefront regression suite          | 127 passed, 11 intentional skips; skipped compiled/enabled checks were then run separately                                            |
| Real PostgreSQL commerce integration | 46 passed: 38 existing plus 8 new pricing/API cases, with mocked Stripe/SMTP                                                          |
| Enabled compiled browser acceptance  | 11 passed: five cart-quote cases, five authenticated commerce cases, one private-photo production boundary                            |
| Enabled production build             | Passed; rebuilt after the editor-label correction and accepted against the compiled app                                               |
| Final disabled production build      | Passed; final compiled sales switch remains disabled                                                                                  |
| Compiled disabled-sales boundary     | Passed, 5/5 sales-closure and private-photo boundary checks                                                                           |
| Responsive and visual review         | Homepage at 360/1440px and board/detail/enlarged views reviewed; catalogue checked at 360/390/768/1440px, with no horizontal overflow |
| Keyboard/touch/images                | Passed carousel and catalogue keyboard/swipe, modal focus/Escape, no-JavaScript photo access and failed-image checks                  |
| Whitespace/formatting                | `git diff --check` passed; changed source formatted                                                                                   |

The WARES browser test initially selected an additional hidden Next.js streamed editor subtree. The trace established the cause. Explicit label/help association and exact semantic roles within the visible product-editor region fixed the ambiguity; assertions were retained. No existing test was removed or weakened.

Validation used the bundled Node runtime, installed Chrome and fresh guarded localhost PostgreSQL databases. Production credentials were overridden with blank values or isolated local test values. Blob image bytes in authenticated lifecycle tests were explicitly simulated; those tests prove record/image-URL persistence, not real Blob upload. Stripe was mocked in integration tests; no real payment was attempted. Existing middleware-convention deprecation and development-image advisories remain outside this increment.

See `docs/october-website-handover.md` for the five owner handovers. The remaining work concerns real content, catalogue facts, external environment acceptance and explicit production approval. No push, deployment, production migration or live catalogue/payment operation is included in this delivery.
