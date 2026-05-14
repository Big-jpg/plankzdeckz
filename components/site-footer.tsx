// components/site-footer.tsx
import Link from "next/link";

const footerSections = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All Products" },
      { href: "/custom", label: "Custom Design" },
      { href: "/fitting-guide", label: "Fitting Guide" },
      { href: "/materials", label: "Materials" },
    ],
  },
  {
    title: "Information",
    links: [
      { href: "/about", label: "About" },
      { href: "/production", label: "Production & Turnaround" },
      { href: "/pickup", label: "Local Pickup" },
      { href: "/shipping", label: "Shipping" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/returns", label: "Returns & Refunds" },
      { href: "/safety", label: "LED Bulb Safety" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-charcoal/10 bg-charcoal text-ivory">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight text-warm-white">
              Lumenform Studio
            </h3>
            <p className="text-sm leading-relaxed text-ivory/70">
              Custom 3D printed lampshades designed for the lights you already own. Parametric
              lighting objects, locally made.
            </p>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-ivory/50">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ivory/70 transition-colors hover:text-warm-white"
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
          <p className="text-center text-xs text-ivory/50">
            &copy; {new Date().getFullYear()} Lumenform Studio. All rights reserved. LED bulbs only.
          </p>
        </div>
      </div>
    </footer>
  );
}
