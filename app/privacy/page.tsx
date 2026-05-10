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
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Privacy Policy</h1>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 text-sm leading-relaxed text-charcoal/70">
            <div>
              <h2 className="text-lg font-semibold text-charcoal">Overview</h2>
              <p className="mt-3">
                Lumenform Studio respects your privacy. This policy outlines how we collect, use,
                and protect your personal information when you use our website and purchase our
                products.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">Information we collect</h2>
              <p className="mt-3">
                When you place an order, we collect your name, email address, phone number (if
                provided), and any fitting or customisation notes you provide. Payment is processed
                securely through Stripe — we do not store your credit card details.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">How we use your information</h2>
              <p className="mt-3">
                Your information is used solely to fulfil your order, communicate about production
                status and pickup arrangements, and respond to enquiries. We do not sell, rent, or
                share your personal information with third parties for marketing purposes.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">Data retention</h2>
              <p className="mt-3">
                Order records are retained for accounting and warranty purposes. You may request
                deletion of your personal data at any time by contacting us.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">Cookies</h2>
              <p className="mt-3">
                This site uses essential cookies for cart functionality and session management. We
                do not use tracking cookies or third-party analytics at this time.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-charcoal">Contact</h2>
              <p className="mt-3">
                For privacy-related enquiries, contact us at hello@lumenform.studio.
              </p>
            </div>

            <p className="border-t border-charcoal/10 pt-6 text-xs text-charcoal/40">
              This privacy policy is a placeholder and will be updated with full legal terms before
              the store accepts live payments.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
