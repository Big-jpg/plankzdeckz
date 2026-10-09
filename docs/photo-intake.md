# Product photography and local review

Incoming photography is reviewed locally before it changes the public catalogue.
Photos do not establish a sale price, stock, size, material, or publication approval.

## Local photo review

Use the existing checkout and its dedicated feature branch. Keep the archive,
untouched originals, inventory, reviewed mapping, reports, and generated WebP files
under the ignored `.photo-intake/` directory. Do not commit that directory or attach
its contents to a public pull request.

The development server shows `/photo-review` when a valid private
`.photo-intake/display-catalogue.json` exists. The six sections use the existing
brand styling and shared gallery. Each record is permanently non-purchasable and
has no price, currency, stock, size, or commerce identifier. Jackets are labelled
“Not available for sale”. Other records are labelled as photo previews unavailable
to purchase. Missing and ambiguous items remain outside the displayed dataset.

The index, detail pages, and private image handler return 404 in production. There
is no switch to enable them in production. Photos are stored outside `public/`,
served only by the development handler, and excluded from Next file tracing. The
review page uses prepared 320, 800, and 1600-pixel WebP variants without the Next
image optimizer, so private photos do not enter its shared optimization cache.
Run the server bound to `127.0.0.1`; a development server exposed to a network would
make its local review pages accessible on that network.

## Reproduce intake and derivatives

Use Python 3.11 or newer with Pillow. The Codex workspace dependency runtime also
provides these tools. Obtain the archive through the supported connected Drive
download route, then verify that the full local bytes exist.

```powershell
python scripts/photo_intake.py inventory '<local archive.zip>' .photo-intake
python scripts/photo_intake.py derivatives .photo-intake .photo-intake/reviewed-mapping.json
```

The script rejects unsafe archive paths, symlinks, unsupported executable content,
duplicate destinations, and excessive expansion before extraction. CRC checking
and full decoding are separate checks from visual acceptance. Extraction preserves
the original bytes. Review the complete contact sheets and open each selected
original at full resolution before marking its quality acceptable.

The reviewed mapping links original paths and hashes to local photo-set identifiers,
category, view/order, alt text, quality findings, and crop choices. Source folder
identifiers must remain distinct from confirmed database product IDs. Record
ambiguous identities and views as needing confirmation. Derivatives apply EXIF
orientation, convert embedded colour profiles to sRGB where supported, contain
the full frame unless a reviewed crop is specified, never upscale, and strip
private EXIF/GPS metadata. A failed colour conversion requires review rather than
an unsupported colour-quality claim.

Create `display-catalogue.json` only from visually verified photo associations.
It contains `{ "items": [...] }`, with each item limited to `handle`, `title`,
`category`, `description`, `purchasable: false`, and `images`. Use a
`photo-review-` handle, one of `boards`, `hats`, `tees`, `jackets`, `hardware`,
`stickers`, and images with `url`, `alt`, `width`, and `height`. Image URLs are
`/photo-review/images/<12-hex-recipe-hash>-1600.webp`. The loader rejects unknown
fields, invalid image locations, duplicate handles, and malformed records.
Source links, private filenames, and acquisition metadata belong in the private
inventory, not this display model.

## Existing Plankz owner workflow

1. Sign in with an email allowed by `ADMIN_EMAILS`, then open `/admin/products`.
   Access requires a working email-delivery configuration and authenticated admin
   session. This build does not grant access or change credentials.
2. For an existing confirmed board or tee, open its stable product record. Confirm
   that incoming photos depict that exact product before replacement. Preserve its
   ID and URL handle.
3. After Ross approves the specific derivative files and Blob destination, upload
   them in **Photos**. This is a public Vercel Blob upload immediately, including
   uploads made while the record is a draft. Do not use it merely for private review.
4. Move the lead image first; arrange the remaining top/front, bottom/back, detail,
   and lifestyle views deliberately. Enter a concrete description for every image.
5. For an existing record, use **Save photos only** on the Photos step. Its PATCH
   request updates image URLs, descriptions/order, and the timestamp only. It
   preserves current price, stock, availability, publication status, and metadata,
   even if another editor has changed those sale fields. A published record cannot
   lose its final image through this action. A new record must first be saved as a
   draft before it has a photo-only save action.
   Saving from Preview also uses this PATCH when only images changed and the
   publication status stays the same. Explicit edits to product facts or a
   draft/published/archived transition still use the full catalogue operation.
6. Use **Preview** to inspect the listing, then separately confirm the actual AUD
   price, stock, board availability or tee size quantities, description, and owner
   publication approval. Full **Save changes**, **Publish**, and **Archive** remain
   separate catalogue operations. Refresh before changing sale fields; the full
   editor does not provide optimistic concurrency control.
7. Only publish confirmed boards or tees through the existing commerce editor.
   It does not support selling hats, jackets, bearings, or stickers. Keep these
   categories in local photo review until their intended public display and any
   future sale support have been explicitly approved.

Published sold boards retain their established gallery and product links. Server
cart validation and the locked inventory check accept only supported published
board/tee records with known price/currency and stock. Photo-review handles,
display-only records, unknown facts, and unsupported merchandise fail closed.

## Validation and release boundary

Run `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`, and `pnpm test:smoke`.
Run `python -m unittest discover -s tests -p test_photo_intake.py` for archive and
derivative safety fixtures. The local browser checks use the real private manifest
when present; absence is reported as skipped, not a successful image review.
Use `PLAYWRIGHT_CHANNEL=chrome` if testing with an existing Chrome installation
instead of Playwright's bundled browser. To verify the production boundary, run
`pnpm start` with live services disabled and set `PHOTO_REVIEW_TEST_MODE=production`
and `PLAYWRIGHT_BASE_URL` to that local server for the photo-review tests.
In development, Next may stream an unavailable page with HTTP 200 and noindex
metadata; it contains no review content. Production routes reject with HTTP 404
before streaming, and the image handler also rejects before reading private files.

Keep database and Stripe credentials out of local photo checks. Fixture tests cover
sale gates; real SQL, concurrent holds, authenticated saves, Stripe sessions,
webhooks, order/pickup flows, and existing database-backed pages still require an
explicitly authorized test environment with isolated inventory. Never use a real
purchase or live stock changes for QA.

Stop after local implementation and review. Uploads, publication, repository push,
draft PRs, shared previews, migrations, merging, and deployment require authority
for the specific action and destination. No migration is needed for this local
photo-display model. Public release requires confirming product identities and
catalogue associations, final copy, price/currency, stock/variants where sold,
sticker-pack composition, the missing photography, and approved assets/destinations.

Eventual Plankz operation depends on repository, admin-session, database, Blob,
domain/deployment, and billing ownership. Record these dependencies without secrets;
this build transfers none of those accounts, resources, or permissions.
