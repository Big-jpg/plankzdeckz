// app/account/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-helpers";
import { Package, User, LogOut } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your PLANKZ DECKZ account.",
};

export default async function AccountPage() {
  const session = await requireAuth();
  const user = session.user;

  return (
    <>
      {/* Hero */}
      <section className="bg-warm-black py-16 text-warm-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Your Account</h1>
          <p className="mt-3 text-base text-warm-white/70">
            Manage your profile and view your order history.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-warm-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Profile card */}
          <div className="rounded-xl border border-charcoal/10 bg-ivory p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-charcoal/5">
                <User className="h-6 w-6 text-charcoal" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-charcoal/50">Signed in as</p>
                <p className="text-base font-semibold text-charcoal truncate">
                  {user?.email || "Unknown"}
                </p>
                {user?.name && <p className="text-sm text-charcoal/70">{user.name}</p>}
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/account/orders"
              className="group flex items-center gap-4 rounded-xl border border-charcoal/10 bg-ivory p-6 transition-all hover:border-charcoal/20 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-charcoal/5 transition-colors group-hover:bg-charcoal/10">
                <Package className="h-5 w-5 text-charcoal" />
              </div>
              <div>
                <p className="text-sm font-semibold text-charcoal">Order History</p>
                <p className="text-xs text-charcoal/60">View your past orders and status</p>
              </div>
            </Link>

            <div className="flex items-center gap-4 rounded-xl border border-charcoal/10 bg-ivory p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-charcoal/5">
                <LogOut className="h-5 w-5 text-charcoal" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-charcoal mb-1">Sign Out</p>
                <SignOutButton />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
