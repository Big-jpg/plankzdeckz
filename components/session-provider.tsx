// components/session-provider.tsx
"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

/**
 * Wraps the app in the NextAuth SessionProvider so that useSession()
 * works in client components. The session is fetched automatically
 * from /api/auth/session.
 */
export function SessionProvider({ children }: Props) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
