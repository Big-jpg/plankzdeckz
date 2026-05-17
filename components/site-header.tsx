// components/site-header.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { UserMenu } from "@/components/user-menu";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/our-story", label: "Our Story" },
  { href: "/custom", label: "Custom Designer" },
  { href: "/gallery", label: "Gallery" },
  { href: "/shop#merch", label: "Merch" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount, openDrawer } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-charcoal/10 bg-warm-white/95 shadow-sm shadow-charcoal/5 backdrop-blur-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="PLANKZ DECKZ home">
          <Image
            src="/plankz-logo.png"
            alt="PLANKZ DECKZ circular logo placeholder"
            width={56}
            height={56}
            priority
            className="h-12 w-12 shrink-0 rounded-full object-contain sm:h-14 sm:w-14"
          />
          <span className="hidden min-w-0 flex-col leading-none sm:flex">
            <span className="font-display text-2xl tracking-[0.08em] text-amber drop-shadow-[0_1px_0_rgba(19,35,33,0.18)]">
              PLANKZ DECKZ
            </span>
            <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-charcoal/65">
              Recycled timber ride craft
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold uppercase tracking-[0.16em] text-charcoal/70 transition-colors hover:text-amber"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <UserMenu />

          <button
            type="button"
            onClick={openDrawer}
            className="relative flex items-center justify-center rounded-full border border-charcoal/10 bg-ivory p-2 text-charcoal/75 transition-colors hover:border-teal hover:text-charcoal"
            aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-coral text-[10px] font-bold text-charcoal">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className="flex items-center justify-center rounded-full border border-charcoal/10 bg-ivory p-2 text-charcoal/75 transition-colors hover:border-teal hover:text-charcoal md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden bg-warm-white transition-all duration-200 ease-in-out md:hidden",
          mobileOpen ? "max-h-96 border-t border-charcoal/10" : "max-h-0",
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-3 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-charcoal/75 transition-colors hover:bg-teal/15 hover:text-charcoal"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
