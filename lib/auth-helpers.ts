// lib/auth-helpers.ts
// Server-side auth helpers for use in Server Components and Route Handlers.

import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Get the current session. Returns null if not authenticated.
 * Safe to call from any server context.
 */
export async function getSession() {
  return auth();
}

/**
 * Require authentication. Redirects to /login if not authenticated.
 * Use in Server Components for protected pages.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

/**
 * Get the current user's email, or null if not authenticated.
 */
export async function getCurrentUserEmail(): Promise<string | null> {
  const session = await auth();
  return session?.user?.email ?? null;
}
