// lib/admin-auth.ts
// Lumenform Studio — Admin authorization helpers for server components and route handlers.

import { auth } from "@/auth";
import type { Session } from "next-auth";
import { redirect } from "next/navigation";

export type AdminAuthResult =
  | { ok: true; session: Session; email: string }
  | { ok: false; status: 401 | 403; reason: string };

export function getAdminEmailAllowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmailAllowlist().includes(email.trim().toLowerCase());
}

export async function checkAdminAuth(): Promise<AdminAuthResult> {
  const session = await auth();
  const email = session?.user?.email ?? null;

  if (!session?.user || !email) {
    return { ok: false, status: 401, reason: "Authentication is required." };
  }

  if (!isAdminEmail(email)) {
    return { ok: false, status: 403, reason: "Admin access is required." };
  }

  return { ok: true, session, email };
}

export async function requireAdmin() {
  const result = await checkAdminAuth();

  if (result.ok) {
    return result;
  }

  if (result.status === 401) {
    redirect("/login?callbackUrl=/admin");
  }

  redirect("/");
}
