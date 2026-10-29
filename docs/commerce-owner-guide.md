# PLANKZ DECKZ owner operating guide

For Corey and Blair. Website stock/orders live in Plankz administration; payments, refunds and payouts live in the business Stripe account. Use your own identities in both systems. The market workflow requires manual recording and does not promise real-time synchronization.

## Before the first sale

- Each owner signs into the website at `/login` with their authorized email, then opens `/admin`. If a login email does not arrive, resolve email delivery rather than sharing a session or password.
- The Stripe account owner invites each operator to the same business account with the payment/refund permissions needed for their work. Enable 2FA and verify the phone number. View-only and Support specialist roles cannot take payments; inspect the actual permissions rather than granting administration by default. [Stripe access requirements](https://support.stripe.com/questions/accept-in-person-payments-with-the-stripe-dashboard-mobile-app)
- Install Stripe's **Dashboard** app and select the activated Australian business account. The workflow requires full Stripe Dashboard access; Express-only accounts or accounts without Dashboard access cannot use this app. The owner completes any Tap to Pay onboarding and payout-bank verification. Developers do not need routine access to business finances. [Stripe account eligibility](https://support.stripe.com/questions/stripe-dashboard-mobile-app-on-iphone-and-android)
- An iPhone needs XS or later, a currently supported nonbeta iOS, a passcode, iCloud sign-in and location permission. [Stripe iPhone requirements](https://docs.stripe.com/no-code/in-person)
- Android needs 13 or later, working NFC, ARM hardware with supported secure keystore, Google Play services/Store, a locked unmodified device, developer options disabled, a security update within 12 months and reliable internet. Actual compatibility must be checked on each phone. [Stripe Android requirements](https://docs.stripe.com/terminal/payments/setup-reader/tap-to-pay?platform=android#supported-devices)
- Confirm supported Australian cards/wallets on each device; do not assume every globally advertised brand applies. Native contactless acceptance includes eligible cards and NFC wallets. [Australian reader/payment support](https://docs.stripe.com/terminal/payments/collect-card-payment/supported-card-brands)
- Budget the account's card-present processing rate and Tap to Pay authorization fee. On 23 October 2026, Stripe's AU pricing page displayed **1.65% + A$0.10 domestic**, **3.5% + A$0.10 international**, plus **A$0.15 per Tap to Pay authorization**. Confirm your actual account terms before accepting payments; published rates can change. [Stripe AU pricing](https://stripe.com/au/pricing#terminal)
- The Dashboard mobile app shows live payments rather than test data. Each owner's first device charge and any refund require explicit approval and a controlled live acceptance exercise. Website payment testing uses Stripe test mode separately. [Stripe mobile mode restriction](https://support.stripe.com/questions/stripe-dashboard-mobile-app-on-iphone-and-android)

## 1. Add and publish a product

Open **Admin → Products → Add product**. Choose board or the correct merchandise category, enter the name and stable URL handle, and save a draft. Add the actual description, images with descriptions, price, board details or merchandise sales unit/variants and stock. A unique deck has one unit. Publish when the record is complete; check its listing under the shop's **Available products** and open its product page. Public photography alone is not a sale record. Archive or return a product to draft to remove it from sale without deleting order history.

## 2. Update stock

Open the product, check the current physical quantity and enter the adjustment reason. Use the correct merchandise variant and sales unit. Save and verify the result. If the editor reports that the product changed, reload before editing again. A held checkout or unresolved market record must be reconciled before stock changes or republication. **Mark sold adjustment** is a stock correction; a paid market sale belongs in **Market sales** so its payment and order remain traceable.

## 3. Process an online order

Open **Admin → Orders** and inspect the paid order, item quantities, amount and Stripe payment reference. A checkout return page or screenshot alone does not prove payment. Prepare the item, mark pickup **Ready**, and mark **Collected** after handover. Review email delivery status on the order; retry failures after fixing the cause. Check the customer inbox during acceptance testing—provider acceptance is not proof of delivery.

## 4. Take a market payment

Before the event, set every product being sold there to **Draft**, including all unique decks on display. If an active checkout prevents that change, exclude those units from physical sales. Wait for payment completion or confirmed expiry, use the reconciliation action in **Orders** when offered, then reload and set the remaining stock to **Draft**. Fresh holds may not yet appear in the recovery list. Leave event stock unpublished until the event closes and physical quantities have been reconciled.

In Stripe Dashboard, confirm the business, choose **+ → Charge a card or send an invoice**, enter the actual total, select **Tap to Pay**, and follow the phone prompts. Confirm the payment succeeded in Stripe and retain its `pi_` payment or `ch_` charge reference. This launch workflow uses native contactless payments; manually keyed cards, payment links and standalone terminals require a separately agreed reconciliation flow. [Stripe mobile payment steps](https://docs.stripe.com/no-code/in-person)

## 5. Record and reconcile a market sale

Immediately open **Admin → Market sales**. Enter the Stripe reference, Perth sale time, products, variant/size, actual quantity and actual **line total** for each product. Customer email is optional. Submit **Record and verify payment**. The line totals must match the successful AUD payment; the system verifies the reference against the business Stripe account and records one collected order with the inventory change.

If the record says **Needs review**, its stock has not changed. Keep the affected products unpublished. Open the record, correct the reference/items if needed and retry. If another order already uses the payment, find that order rather than recording it again. Dismiss only a documented duplicate/mistake after checking physical stock and the real order; provide the required audit reason. A real unreconciled sale must not be dismissed to republish its stock.

## 6. Find an order

Use **Orders** search with the order ID, customer email/name, Checkout session or Stripe payment reference. Filter **Online** or **Market** and use the page links. A market order may have no customer email. Open it to see the original items, operator, payment/reconciliation status, refunds and notification history.

## 7. Refund a customer

Open the matching payment from the order's Stripe link, confirm the business and customer amount, and perform the authorized full or partial refund in Stripe. Refresh refund status in the Plankz order if the update has not appeared. A refund does **not** restock delivered goods. Inspect a returned item and make a separate reasoned stock adjustment before republishing it. If a sale was refunded before it was recorded, still reconcile the original sale so both payment/refund and physical inventory remain traceable.

## 8. Check payouts

In the correct business Stripe Dashboard, inspect **Balances/Payouts**, payment fees and the transfer status. The business owner verifies the approved destination bank account. Compare individual Stripe payments against their Plankz order references; a payout can combine multiple payments and deductions. Do not change bank details merely to resolve a delayed payout.

## 9. Handle a failed or disputed transaction

- **Payment failed or uncertain:** inspect Stripe before charging again or handing over stock. In Orders, reconcile an unresolved checkout against Stripe; retain its reservation until the outcome is known.
- **Market payment succeeded but recording failed:** keep its products unpublished, keep the saved review record and retry that record. Do not adjust stock as a substitute or create another payment.
- **Refund refresh failed:** use the order's refresh action and inspect the Stripe payment; the order displays an error while synchronization is incomplete.
- **Dispute:** open it in Stripe, note the response deadline and follow the authorized evidence workflow using the order and fulfilment record. Keep the payment/order references together; a dispute is not an instruction to restock.
- **Email failed:** correct delivery configuration through the approved operator, then retry from the order. Contact the customer directly if pickup timing requires it.

At event close, compare recorded Stripe payments with market orders and unresolved records, count remaining physical stock, make documented corrections, then publish only the quantities actually available online.
