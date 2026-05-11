// components/user-menu.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User, Package, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open]);

  // Loading state — show nothing to avoid layout shift
  if (status === "loading") {
    return <div className="h-8 w-8" />;
  }

  // Not authenticated — show sign in link
  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="text-sm font-medium text-charcoal/70 transition-colors hover:text-charcoal"
      >
        Sign in
      </Link>
    );
  }

  // Authenticated — show user dropdown
  const email = session.user.email || "User";
  const initial = email.charAt(0).toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 text-sm transition-colors",
          "hover:bg-charcoal/5",
          open && "bg-charcoal/5",
        )}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-charcoal text-xs font-bold text-warm-white">
          {initial}
        </span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 text-charcoal/50 transition-transform", open && "rotate-180")}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-charcoal/10 bg-warm-white shadow-lg">
          {/* User info */}
          <div className="border-b border-charcoal/10 px-4 py-3">
            <p className="text-xs font-medium text-charcoal/50">Signed in as</p>
            <p className="text-sm font-medium text-charcoal truncate">{email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal/70 transition-colors hover:bg-charcoal/5 hover:text-charcoal"
            >
              <User className="h-4 w-4" />
              Account
            </Link>
            <Link
              href="/account/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal/70 transition-colors hover:bg-charcoal/5 hover:text-charcoal"
            >
              <Package className="h-4 w-4" />
              Orders
            </Link>
          </div>

          {/* Sign out */}
          <div className="border-t border-charcoal/10 py-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-charcoal/70 transition-colors hover:bg-charcoal/5 hover:text-charcoal"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
