// components/sign-out-button.tsx
"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-xs font-medium text-charcoal/60 underline underline-offset-4 transition-colors hover:text-charcoal"
    >
      Sign out of your account
    </button>
  );
}
