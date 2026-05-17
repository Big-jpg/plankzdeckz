// app/admin/layout.tsx
// Admin-Lite layout. Access is restricted by ADMIN_EMAILS allowlist via Auth.js session email.

import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin | PLANKZ DECKZ",
  description: "Admin-Lite operational panel for PLANKZ DECKZ.",
};

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/custom-requests", label: "Custom Requests" },
  { href: "/admin/products", label: "Products" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();

  return (
    <main className="min-h-screen bg-ivory">
      <section className="border-b border-charcoal/10 bg-warm-black py-10 text-warm-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber">Admin-Lite</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl font-semibold">PLANKZ operations</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-warm-white/70">
                Restricted operational surface for orders, pickup transitions, custom requests, and
                catalogue visibility.
              </p>
            </div>
            <p className="text-sm text-warm-white/60">Signed in as {admin.email}</p>
          </div>
          <nav className="mt-8 flex flex-wrap gap-2" aria-label="Admin navigation">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-warm-white/15 px-4 py-2 text-sm font-medium text-warm-white/80 transition hover:border-amber hover:text-amber"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</section>
    </main>
  );
}
