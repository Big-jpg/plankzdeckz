// app/contact/page.tsx
import type { Metadata } from "next";
import { Mail, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Lumenform Studio.",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-warm-black py-16 text-warm-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Contact
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ivory/70">
            Questions about a piece, fitting, collection, or custom design can be
            directed to the studio.
          </p>
        </div>
      </section>

      <section className="bg-warm-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">
            <div className="prose prose-charcoal max-w-none text-charcoal/80">
              <p className="text-lg leading-relaxed">
                Lumenform operates as a small studio, so enquiries are handled
                directly. For fitting questions, custom work, or order support,
                clear photos and practical measurements are often the most useful
                starting point.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-charcoal/10 bg-ivory/30 p-6">
                <Mail className="h-6 w-6 text-charcoal/50" />

                <h3 className="mt-3 text-base font-semibold text-charcoal">
                  Email
                </h3>

                <p className="mt-2 text-sm text-charcoal/60">
                  hello@lumenform.studio
                </p>

                <p className="mt-2 text-xs leading-relaxed text-charcoal/40">
                  Most enquiries are answered within 1-2 business days.
                </p>
              </div>

              <div className="rounded-xl border border-charcoal/10 bg-ivory/30 p-6">
                <MessageSquare className="h-6 w-6 text-charcoal/50" />

                <h3 className="mt-3 text-base font-semibold text-charcoal">
                  Custom enquiries
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
                  For custom work, include photos of the existing fitting, the
                  surrounding space, and any approximate dimensions or design
                  references.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-charcoal/10 bg-ivory/50 p-6">
              <h3 className="text-lg font-semibold text-charcoal">
                Send a message
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
                Share the practical details first: the fitting, the space, the
                product or order involved, and what you would like help with.
              </p>

              <form className="mt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-charcoal">
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="Your name"
                      className="mt-1 w-full rounded-lg border border-charcoal/20 bg-warm-white px-3 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="mt-1 w-full rounded-lg border border-charcoal/20 bg-warm-white px-3 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal">
                    Message
                  </label>
                  <textarea
                    placeholder="Tell us what you need help with..."
                    rows={5}
                    className="mt-1 w-full rounded-lg border border-charcoal/20 bg-warm-white px-3 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
                  />
                </div>

                <button
                  type="button"
                  className="w-full rounded-lg bg-charcoal px-6 py-3 text-sm font-semibold text-warm-white transition-colors hover:bg-charcoal/90"
                >
                  Send message
                </button>

                <p className="text-center text-xs leading-relaxed text-charcoal/40">
                  Form is not yet functional. Contact Lumenform directly in the
                  meantime.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}