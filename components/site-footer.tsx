// components/site-footer.tsx
import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";

const footerSections = [
  {
    title: "Shop",
    links: [
      { href: "/shop#boards", label: "Boards" },
      { href: "/shop#merch", label: "Merch" },
      { href: "/gallery", label: "Gallery" },
    ],
  },
  {
    title: "Brand",
    links: [
      { href: "/our-story", label: "Our Story" },
      { href: "/materials", label: "Reclaimed Materials" },
      { href: "/process", label: "Build Process" },
      { href: "/pickup", label: "Local Pickup" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms & Conditions" },
    ],
  },
];

const socialLinks = [
  {
    href: "https://www.instagram.com/plankzdeckz",
    label: "Instagram @plankzdeckz",
    shortLabel: "IG",
  },
  {
    href: "https://www.facebook.com/share/1CpHCKqyF6/",
    label: "Facebook",
    shortLabel: "FB",
  },
  {
    href: "mailto:plankz.deckz@gmail.com",
    label: "plankz.deckz@gmail.com",
    shortLabel: "@",
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-charcoal/10 bg-warm-black text-ivory">
      <div className="thin-wood-trim h-px opacity-55" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(126,207,192,0.1),transparent_24rem),radial-gradient(circle_at_88%_18%,rgba(245,160,160,0.07),transparent_22rem)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Image
                src="/plankz-logo.png"
                alt="PLANKZ DECKZ circular logo placeholder"
                width={64}
                height={64}
                className="h-14 w-14 rounded-full object-contain"
              />
              <div>
                <h3 className="font-display text-3xl tracking-[0.08em] text-amber">PLANKZ DECKZ</h3>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal/85">
                  Recycle. Reclaim. Ride.
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-ivory/74">
              Hand-crafted recycled timber deckz, shaped for coastal flow and local handover.
            </p>
            <p className="text-sm leading-relaxed text-ivory/52">
              Built from repurposed materials with a quieter, one-of-a-kind browsing experience around
              the craft rather than the interface.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              {socialLinks.map((social) => (
                <Link
                  key={social.href}
                  href={social.href}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={social.href.startsWith("http") ? "noreferrer" : undefined}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ivory/15 text-ivory/70 transition-colors hover:border-teal/55 hover:bg-teal/10 hover:text-teal"
                  aria-label={social.label}
                >
                  {social.shortLabel === "@" ? (
                    <Mail className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-semibold tracking-wide">{social.shortLabel}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-teal/85">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ivory/68 transition-colors hover:text-amber"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-ivory/10 pt-8">
          <p className="text-center text-xs text-ivory/48">
            &copy; {new Date().getFullYear()} PLANKZ DECKZ. All rights reserved. Hand-crafted recycled
            timber deckz for local pickup.
          </p>
        </div>
      </div>
    </footer>
  );
}
