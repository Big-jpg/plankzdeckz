// app/privacy/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Lumenform Studio.",
};

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-warm-black py-16 text-warm-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ivory/70">
            Lumenform Studio collects only the information needed to prepare,
            confirm, and complete your order.
          </p>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 text-sm leading-relaxed text-charcoal/70">
            <div className="prose prose-charcoal max-w-none text-charcoal/80">
              <p className="text-lg leading-relaxed">
                Lumenform is designed to be a simple, low-friction studio store.
                You should not need to create another password, connect a social
                account, or hand over unnecessary personal information just to buy
                a lighting object.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">Overview</h2>
              <p className="mt-3">
                This policy explains how Lumenform Studio collects, uses, and
                protects personal information when you browse the website, make an
                enquiry, or place an order. The guiding principle is simple: we
                only ask for information that is required to complete the
                transaction and support the product after purchase.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">
                Email-first authentication
              </h2>
              <p className="mt-3">
                Lumenform uses email-based authentication, including magic links,
                rather than requiring customers to manage another username and
                password. A magic link allows you to sign in securely through your
                email address without connecting a Facebook, Google, Apple, or
                other third-party social account.
              </p>
              <p className="mt-3">
                This keeps checkout simple across phones, tablets, shared devices,
                and work computers where social login may be unavailable or
                inappropriate. It also reduces the amount of identity data handled
                by the store. If you can receive email, you can access your order,
                confirm collection details, and provide any required fitting or
                shipping information.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">
                Information we collect
              </h2>
              <p className="mt-3">
                When you place an order or make an enquiry, we may collect your
                name, email address, phone number if provided, order details,
                fitting selection, collection notes, shipping details where
                applicable, and any customisation information you choose to
                provide.
              </p>
              <p className="mt-3">
                Payment processing is handled securely through Stripe. Lumenform
                Studio does not store your full card number or payment credentials.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">
                How we use your information
              </h2>
              <p className="mt-3">
                Your information is used to process your order, prepare your
                shade, confirm fitting requirements, arrange local collection or
                shipping where available, provide order updates, respond to
                enquiries, and meet basic accounting and record-keeping
                obligations.
              </p>
              <p className="mt-3">
                We do not sell, rent, or trade customer information. We do not use
                customer accounts as a data-harvesting mechanism. The purpose of
                the store is to sell well-made lighting objects to people who want
                to purchase them, not to accumulate unnecessary customer profiles.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">
                Local collection and order coordination
              </h2>
              <p className="mt-3">
                Because Lumenform currently operates as a local studio practice,
                email is the primary contact point for order confirmation,
                collection arrangements, fitting questions, and any follow-up
                support. Where local pickup applies, collection details are shared
                only after an order has been confirmed.
              </p>
              <p className="mt-3">
                If shipping becomes available for your order or location, the
                required delivery information will be collected only when needed
                for that fulfilment purpose.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">
                Cookies and sessions
              </h2>
              <p className="mt-3">
                This site may use essential cookies or session storage for cart
                functionality, checkout continuity, authentication, and basic site
                operation. These are used so the store works correctly across
                pages and devices.
              </p>
              <p className="mt-3">
                Lumenform does not currently use tracking cookies or third-party
                advertising analytics.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">
                Data retention
              </h2>
              <p className="mt-3">
                Order records may be retained for accounting, warranty, product
                support, fraud prevention, and legal compliance purposes. Enquiry
                information is retained only for as long as reasonably required to
                respond and provide support.
              </p>
              <p className="mt-3">
                You may request access to, correction of, or deletion of your
                personal information by contacting Lumenform Studio. Some records
                may need to be retained where required by law or legitimate
                business obligations.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">
                Third-party services
              </h2>
              <p className="mt-3">
                Lumenform may rely on trusted service providers for payment
                processing, website hosting, email delivery, authentication, and
                order fulfilment. These providers receive only the information
                required to perform their role.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">Contact</h2>
              <p className="mt-3">
                For privacy-related enquiries, contact Lumenform Studio using the
                contact details provided on the website.
              </p>
            </div>

            <p className="border-t border-charcoal/10 pt-6 text-xs leading-relaxed text-charcoal/40">
              This privacy policy should be reviewed before accepting live
              payments. It is written to describe the intended operating model of
              the store and may need adjustment for final legal, tax, payment, and
              fulfilment requirements.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}