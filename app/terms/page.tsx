// app/terms/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for Lumenform Studio.",
};

export default function TermsPage() {
  return (
    <>
      <section className="bg-warm-black py-16 text-warm-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Terms &amp; Conditions
          </h1>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 text-sm leading-relaxed text-charcoal/70">
            <div>
              <h2 className="text-lg font-semibold text-charcoal">Products</h2>
              <p className="mt-3">
                All products sold by Lumenform Studio are custom 3D printed lampshades. Each product
                is made to order after payment is received. Products are not mass-produced and may
                exhibit minor variations inherent to the FDM printing process.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">Fitting adapters</h2>
              <p className="mt-3">
                Every lampshade includes one fitting adapter (B22, E27, or Clipsal No. 530) at no
                additional cost. The customer is responsible for selecting the correct adapter type
                during checkout. If &ldquo;Other / not sure&rdquo; is selected, production will not
                begin until fitting compatibility is confirmed.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">LED bulbs only</h2>
              <p className="mt-3">
                All Lumenform shades are designed for use with LED bulbs only. Use with
                incandescent, halogen, or other high-heat bulbs is not supported and may damage the
                product or create a safety hazard. Lumenform Studio accepts no liability for damage
                caused by use with non-LED bulbs.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">Returns and refunds</h2>
              <p className="mt-3">
                As products are made to order, returns are accepted only if the product is
                materially defective or significantly different from the listed description. Contact
                us within 14 days of pickup to discuss. Custom design orders are non-refundable once
                production has begun.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">Pickup</h2>
              <p className="mt-3">
                All orders are available for local pickup only. Pickup details and timing are
                communicated via email after production is complete. Orders not collected within 30
                days of notification may be disposed of without refund.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">Liability</h2>
              <p className="mt-3">
                Lumenform Studio provides lampshades as decorative lighting accessories. Final
                compatibility with the customer&apos;s electrical fixture depends on the
                customer&apos;s specific installation. The customer is responsible for ensuring safe
                installation and appropriate bulb selection.
              </p>
            </div>

            <p className="border-t border-charcoal/10 pt-6 text-xs text-charcoal/40">
              These terms are a placeholder and will be updated with full legal terms before the
              store accepts live payments.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
