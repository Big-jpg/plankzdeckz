// app/contact/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact | PLANKZ DECKZ",
  description:
    "Contact PLANKZ DECKZ by email, Instagram, or Facebook for handmade skateboard deckz, custom board enquiries, and local pickup coordination.",
};

const contactMethods = [
  {
    title: "Email",
    text: "plankz.deckz@gmail.com",
    href: "mailto:plankz.deckz@gmail.com",
    cta: "Send an email",
  },
  {
    title: "Instagram",
    text: "@plankzdeckz",
    href: "https://www.instagram.com/plankzdeckz",
    cta: "Open Instagram",
  },
  {
    title: "Facebook",
    text: "facebook.com/share/1CpHCKqyF6",
    href: "https://www.facebook.com/share/1CpHCKqyF6/",
    cta: "Open Facebook",
  },
];

const includeItems = [
  "The board style you are interested in: cruiser, surfskate, longboard, display piece, or custom direction.",
  "Approximate dimensions, rider context, stance or hardware notes if the board will be ridden.",
  "Any timber, colour, finish, resin, or visual reference ideas you want considered.",
  "Preferred Perth-area pickup timing once the order or custom build is confirmed.",
];

export default function Page() {
  return (
    <main className="bg-warm-white">
      <section className="border-b border-charcoal/10 bg-weathered-gray/35 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal">Get in touch</p>
          <h1 className="mt-4 font-display text-4xl tracking-wide text-amber sm:text-6xl">Contact</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-charcoal/75">
            Contact PLANKZ DECKZ for available boards, custom deck enquiries, merch questions,
            reference images, and local pickup coordination in Western Australia.
          </p>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {contactMethods.map((method) => (
            <article
              key={method.title}
              className="rounded-3xl border border-charcoal/10 bg-ivory/85 p-6 shadow-sm"
            >
              <h2 className="font-display text-2xl tracking-wide text-amber">{method.title}</h2>
              <p className="mt-3 break-words text-sm leading-7 text-charcoal/72">{method.text}</p>
              <Link
                href={method.href}
                target={method.href.startsWith("http") ? "_blank" : undefined}
                rel={method.href.startsWith("http") ? "noreferrer" : undefined}
                className="mt-5 inline-flex rounded-full bg-charcoal px-4 py-2 text-sm font-semibold text-warm-white hover:bg-warm-black"
              >
                {method.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl bg-charcoal p-8 text-warm-white">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-coral">
              Direct contact works best
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-wide text-amber">
              Send the practical details first.
            </h2>
            <p className="mt-4 text-sm leading-7 text-warm-white/72">
              Reclaimed timber builds depend on material availability, board use, finish direction,
              and pickup timing. The more specific the enquiry, the more useful the first response can
              be.
            </p>
          </div>
          <div className="rounded-3xl border border-teal/25 bg-teal/10 p-8">
            <h2 className="font-display text-2xl tracking-wide text-amber">What to include</h2>
            <ul className="mt-5 space-y-4">
              {includeItems.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-7 text-charcoal/72">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-coral" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
