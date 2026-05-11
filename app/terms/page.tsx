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

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ivory/70">
            Terms relating to orders, fittings, collection, and the use of
            Lumenform Studio products.
          </p>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 text-sm leading-relaxed text-charcoal/70">
            <div className="prose prose-charcoal max-w-none text-charcoal/80">
              <p className="text-lg leading-relaxed">
                Lumenform operates as a small-batch design studio rather than a
                mass-production retailer. Each piece is prepared individually,
                often to order, and small variations between pieces are considered
                part of the character of the object rather than manufacturing
                defects.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">
                Products and variations
              </h2>

              <p className="mt-3">
                Lumenform products are contemporary lighting objects produced
                using digitally driven fabrication methods. Product photography,
                renders, and mockups are intended as representative references,
                however minor differences in surface finish, translucency,
                geometry, colour tone, and material appearance may occur between
                pieces.
              </p>

              <p className="mt-3">
                Because each item is produced individually, slight variations are
                an expected part of the process and contribute to the unique
                nature of the finished work.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">
                Orders and production
              </h2>

              <p className="mt-3">
                Most products are prepared after an order is placed rather than
                held as warehouse inventory. Estimated lead times are provided as
                guidance only and may vary depending on studio workload, design
                complexity, material availability, and customisation requirements.
              </p>

              <p className="mt-3">
                Production of custom-developed or personalised works may begin
                shortly after order confirmation. Once production has materially
                commenced, cancellation or refund requests may not be possible.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">
                Fitting adapters and compatibility
              </h2>

              <p className="mt-3">
                Every standard shade includes one fitting adapter compatible with
                either B22, E27, or Clipsal No. 530 fittings. Customers are
                responsible for selecting the most appropriate option during
                checkout.
              </p>

              <p className="mt-3">
                Where “Other / not sure” is selected, production may be paused
                until fitting compatibility is confirmed through photographs or
                additional information supplied by the customer.
              </p>

              <p className="mt-3">
                Lumenform Studio reserves the right to decline or modify orders if
                a fitting arrangement appears unsafe, incompatible, or unsuitable
                for the intended installation environment.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">
                LED bulbs only
              </h2>

              <p className="mt-3">
                All Lumenform shades are designed exclusively for use with modern
                LED lighting. Incandescent, halogen, heat lamp, or other
                high-temperature bulbs must not be used under any circumstance.
              </p>

              <p className="mt-3">
                Use with incompatible lighting may deform materials, reduce
                product lifespan, or create a safety hazard. Lumenform Studio
                accepts no responsibility for damage resulting from unsuitable
                bulb selection or misuse.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">
                Collection and fulfilment
              </h2>

              <p className="mt-3">
                Lumenform currently operates primarily through local collection.
                Collection instructions and appointment details are provided after
                production is complete.
              </p>

              <p className="mt-3">
                Customers are responsible for ensuring collection details and
                contact information remain accurate. Orders not collected within a
                reasonable timeframe after repeated contact attempts may be
                cancelled or disposed of at the studio’s discretion.
              </p>

              <p className="mt-3">
                If shipping is offered in future, additional delivery terms may
                apply depending on destination, carrier availability, and product
                size.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">
                Returns and refunds
              </h2>

              <p className="mt-3">
                Due to the made-to-order nature of the studio, returns are
                generally accepted only where a product is materially defective,
                damaged prior to collection, or substantially inconsistent with
                the listed description.
              </p>

              <p className="mt-3">
                Customers should contact Lumenform Studio within 14 days of
                receiving or collecting an order if a problem is identified.
                Supporting photographs or installation details may be requested to
                help assess the issue.
              </p>

              <p className="mt-3">
                Refunds or replacements are assessed on a case-by-case basis with
                consideration given to the custom nature of the work.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">
                Installation and use
              </h2>

              <p className="mt-3">
                Lumenform products are decorative lighting accessories intended
                for indoor domestic use unless otherwise stated. Customers are
                responsible for ensuring safe installation and suitability for
                their specific environment.
              </p>

              <p className="mt-3">
                The supplied fitting adapters are mechanical support components
                only and do not alter electrical wiring or certified electrical
                infrastructure.
              </p>

              <p className="mt-3">
                Any electrical modifications should be performed by a qualified
                electrician in accordance with local regulations and Australian
                standards where applicable.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">
                Authentication and customer accounts
              </h2>

              <p className="mt-3">
                Lumenform uses email-based authentication methods, including magic
                links, to minimise friction during checkout and reduce the amount
                of personal information required to access orders.
              </p>

              <p className="mt-3">
                Customers are responsible for maintaining access to the email
                address associated with their order. Access to order history,
                collection information, and future correspondence may depend on
                control of that email account.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">
                Limitation of liability
              </h2>

              <p className="mt-3">
                To the maximum extent permitted by law, Lumenform Studio is not
                liable for indirect, incidental, or consequential damages arising
                from misuse, improper installation, incompatible fittings,
                unauthorised modifications, environmental exposure, or failure to
                follow product guidance.
              </p>

              <p className="mt-3">
                Nothing in these terms excludes rights or guarantees that cannot
                be excluded under Australian Consumer Law.
              </p>
            </div>

            <p className="border-t border-charcoal/10 pt-6 text-xs leading-relaxed text-charcoal/40">
              These terms describe the intended operating model of the studio and
              should be reviewed prior to accepting live commercial orders or
              enabling large-scale fulfilment.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}