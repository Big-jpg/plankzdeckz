# October 2026 website completion discovery

Discovery performed on 28 October 2026 in `C:\Users\rossf\Documents\plankzd\plankzdeckz`, starting from `326fecd` on `feature/commerce-go-live`. The application working tree was clean. The parent workspace has unrelated package-store changes; those are outside this delivery.

## Authority and source boundaries

The pasted Incremental Website Completion Contract is the implementation request. Corey Parker's supplied Word document and logo PDF supply reference content and artwork. Requests embedded in those documents are interpreted within the contract's constraints, rather than as authority to deploy, change live stock, or invent missing facts. The Word document's supplier costs and profit columns must not be copied into application data or browser bundles.

The document includes example product screenshots from a different retailer. Their dimensions, components, price, financing options and purchase controls are layout references, not PLANKZ product facts. No such values are imported.

## Existing capabilities

| Area               | Verified implementation                                                                                               | Smallest necessary change                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Framework          | Next.js 16 App Router, React 19, TypeScript, Tailwind 4; pnpm lockfile                                                | Keep framework and dependencies                                                                      |
| Branding           | Bangers and Inter; shared header/footer; homepage brown `#332619` and beige `#f8f2e5`                                 | Supplied artwork derivative, exact tagline, scoped public text colour                                |
| Homepage           | Real board photographs with stable photo-detail links                                                                 | One small carousel component, five existing photographs temporarily                                  |
| Photo catalogue    | 18 canonical display-only sets, 54 selected photographs, stable `/shop/[handle]` routes                               | Supplied board copy, card controls, enlarged navigable viewer                                        |
| Commerce catalogue | Neon canonical products, `/products/[handle]`, existing admin wizard, drafts and revision checks                      | Retail-only WARES presets and truck/wheel allowlist entries                                          |
| Images             | Committed public photography; Vercel Blob for administered products                                                   | Reuse existing storage; no new image service                                                         |
| Cart and checkout  | Local cart, trusted server validation, stock reservations, Stripe hosted Checkout, transactional payment finalisation | Explicit Trad/Cord family metadata and authoritative quantity quote                                  |
| Gallery            | Sold boards read from canonical Neon records                                                                          | Preserve sold archive and reuse canonical photo-board records without assuming commerce associations |
| Supporting pages   | Story, timber, process, pickup, FAQ and contact routes exist                                                          | Requested colours and process heading only                                                           |
| Verification       | ESLint, TypeScript, Next build, Playwright, isolated PostgreSQL commerce tests                                        | Extend meaningful navigation and pricing checks                                                      |
| Deployment         | Documented Vercel/Next deployment; migrations are explicit operator actions; sales disabled by default                | Preserve deployment model and production approval gate                                               |

No checked-in `.github` workflow, `vercel.json` or `.vercel` link was found. Hosted deployment and live database state were not queried. Local verification must not be represented as production acceptance.

## Boundaries and implementation order

1. Branding, homepage carousel and supporting-page styling form a visual module. Fonts, page routes and existing supporting prose remain intact.
2. Board descriptions, optional verified timber facts, card navigation and enlarged photography form a catalogue-presentation module. Photo identities remain independent from saleable product identities.
3. WARES presets use the existing unsaved-draft editor. Trucks and wheels need application allowlist changes; the existing text schema already supports them. No new persistence service or schema migration is required for those kinds.
4. Hat pricing is a separate commerce module spanning explicit product eligibility, server quote, locked reservation, Stripe line amounts and cart presentation. The existing checkout disables promotion codes; adding a coupon alone would conflict with its exact payment checks.
5. Final checks cover responsive/keyboard/touch/image-failure behaviour, existing routes, sales-disabled boundaries, draft/publication validation and authoritative pricing.

Neon remains catalogue, order and inventory authority. Stripe remains payment and refund authority. Private photography does not become purchasable merely because it has a public display page. Those are actual data and security constraints, not reasons to introduce another platform.

## Inputs still needed

- Final homepage lifestyle sequence. Existing board photography may be used temporarily and is identified as such.
- Board #2 photographs; final content and photographs for Boards #7–#11.
- Actual board dimensions, grip, trucks and wheels for each board where not already verified in its canonical product record.
- Cord hat, trucks, wheels and new tee photographs; confirmed image/product/colour mapping and stock counts.
- Hardware selling units, clothing sizes and stock, and explicit eligibility for the two hat families in actual commerce records.
- Manufacturing-process photographs promised in the reference.
- Existing production acceptance items and explicit production-release approval.

## Confirmed pricing correction

The original document's 3-hat tiers increased the unit price relative to the 2-hat tier. The user subsequently requested a general incentive model and expressly confirmed these replacement unit tiers in chat:

| Family | Quantity  | AUD per hat |
| ------ | --------- | ----------- |
| Trad   | 1         | 25.00       |
| Trad   | 2 or more | 22.50       |
| Cord   | 1         | 40.00       |
| Cord   | 2–4       | 37.50       |
| Cord   | 5 or more | 31.00       |

Eligibility is explicit per canonical product, never inferred from a title, a client field or the fact that a product is a hat. Colours within the same explicitly assigned family share that family's quantity count; Trad and Cord counts remain separate. Existing promotion-code closure is preserved. Existing owner-controlled refund administration remains in place; payment records retain the paid amount and this increment does not introduce automatic return repricing.
