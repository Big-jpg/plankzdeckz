# October website completion handover

This handover records the remaining owner inputs for the October website contract. Work began on 28 October and continued on 29 October 2026. Local implementation and validation do not authorise production release.

## Homepage photographs

HANDOVER ID: PLANKZ-OCT-01

MODULE: Branding and homepage

DECISION OR ACCESS REQUIRED: The five final homepage photographs and their intended order.

WHY IT IS BLOCKING: The requested board/riding/standing/board/riding sequence has not been supplied.

EXISTING IMPLEMENTATION: Five actual reviewed board photographs rotate with manual controls, pause, keyboard, touch and reduced-motion support. The temporary board-photo sequence is identified on the page.

RECOMMENDED MINIMAL ACTION: Replace only the carousel image references when the final photographs arrive.

OWNER ACTION: Supply the final images, descriptive alt text or subject identification, and order.

RESUME CRITERIA: All five photographs are locally readable, approved and mapped to their captions and links.

## Board content and specifications

HANDOVER ID: PLANKZ-OCT-02

MODULE: DECKZ and gallery

DECISION OR ACCESS REQUIRED: Board #2 photographs; final copy and images for Boards #7–#11; any additional verified specifications for each board.

WHY IT IS BLOCKING: Photographs and product facts cannot be inferred from another retailer's example layout or from unrelated board records.

EXISTING IMPLEMENTATION: The five existing board photo records retain their identifiers and routes and use the supplied descriptions. The gallery reuses those records. Board #2 copy is retained in `docs/board-content-pending.md`; missing boards remain absent from the public photo catalogue. Existing saleable board specifications and sold archive continue to come from canonical Neon products.

RECOMMENDED MINIMAL ACTION: Extend existing canonical records as photographs and confirmed facts become available.

OWNER ACTION: Identify each image's board number and confirm dimensions, timber, grip, trucks and wheels where they should be displayed. Confirm any intended association between a photo record and a saleable product.

RESUME CRITERIA: Board identity, copy, image association and each proposed specification are verified. No purchase identity is inferred from a display handle.

## WARES records and colour browsing

HANDOVER ID: PLANKZ-OCT-03

MODULE: WARES catalogue

DECISION OR ACCESS REQUIRED: Actual product/photo/colour associations, missing merchandise images, clothing sizes and stock, hardware selling units, and the Trad/Cord family assignment for real hat records.

WHY IT IS BLOCKING: The supplied retail prices do not establish inventory, available colours, pack size or which existing photograph belongs to a purchasable record. Cord hats, trucks, wheels and new tee photography are incomplete. The five existing cap photo sets have verified colour labels but no confirmed commerce association or family assignment.

EXISTING IMPLEMENTATION: The existing product wizard has 13 retail-only presets for the specified hats, tees, stickers and hardware. Presets start incomplete, unpublished drafts with no photographs, selling unit or stock. The wizard supports trucks and wheels using the existing schema. Existing saved products are never overwritten by a preset. No live products have been inserted or changed by this delivery.

RECOMMENDED MINIMAL ACTION: Use `/admin/products/new` for missing products and `/admin/products/[id]` for confirmed existing ones. Create one canonical record per colour/design/sale pack under the existing stock model. Confirm the Trad group photograph and colour records before grouping them publicly. Use the existing photo editor for real uploads.

OWNER ACTION: Complete the required facts in the wizard and review drafts before publication. Assign quantity pricing only to actual Trad or Cord hats. Use the established provider/environment workflows for access; do not put credentials in source or chat.

RESUME CRITERIA: Images, selling units, price, stock, sizes, colours and pricing family are verified against each canonical record. Public colour grouping can then select those records without creating a parallel inventory model.

## Manufacturing photographs

HANDOVER ID: PLANKZ-OCT-04

MODULE: How Plankz Are Made

DECISION OR ACCESS REQUIRED: Actual manufacturing-process photographs and step identification.

WHY IT IS BLOCKING: The referenced earlier PowerPoint/process photographs were not supplied with this request. Existing media names do not prove source or process identity.

EXISTING IMPLEMENTATION: The route, process prose and steps are preserved; the heading is renamed and requested text styling applied.

RECOMMENDED MINIMAL ACTION: Add approved photographs to the existing step presentation.

OWNER ACTION: Supply the process photographs and identify the corresponding steps.

RESUME CRITERIA: Real photographs, step mapping and alt text are available.

## Production release and live acceptance

HANDOVER ID: PLANKZ-OCT-05

MODULE: Release

DECISION OR ACCESS REQUIRED: Owner review of the local increments, real environment acceptance and explicit production-release approval.

WHY IT IS BLOCKING: The contract expressly requires approval before production deployment. Local PostgreSQL fixtures and mocked Stripe responses cannot establish actual owner access, live catalogue correctness or hosted checkout acceptance.

EXISTING IMPLEMENTATION: The existing deployment model and default closed-sales switch are preserved. Existing acceptance requirements are documented in `docs/production-environment-checklist.md` and `docs/commerce-verification.md`.

RECOMMENDED MINIMAL ACTION: Review the focused local commits, complete confirmed catalogue drafts, then follow the existing preview/test-mode and release checklist.

OWNER ACTION: Approve the intended release only after the real environment and product data have been accepted. Production credentials remain in established environment/provider-secret configuration.

RESUME CRITERIA: Explicit approval names the release scope, the relevant live/test acceptance is complete, and rollback is understood. This delivery performs no push, production migration, deployment, live catalogue mutation, charge or refund.

## Confirmed hat pricing operation

The user confirmed the revised incentive model in chat: Trad costs AUD 25 for one and AUD 22.50 per hat from two; Cord costs AUD 40 for one, AUD 37.50 per hat for two to four, and AUD 31 per hat from five. Those rates replace the original document's non-monotonic bundle totals.

Each actual hat record must explicitly select its family, and one sale unit must represent one hat. The editor states that requirement beside the family selector. Colours assigned to the same family contribute to that family's quantity; Trad and Cord do not combine. A tagged product must retain that family's confirmed AUD retail base rate, otherwise it is unavailable until corrected. Unassigned hats and all other merchandise retain ordinary pricing. Existing promotion codes remain disabled.

The server quote and stock lock determine payable amounts. The browser displays that quote and checkout validates again. Paid unit amounts and pricing provenance are retained with the order. Existing manual refund administration and no-automatic-restock behaviour remain; no new customer return or refund policy is asserted by this implementation.
