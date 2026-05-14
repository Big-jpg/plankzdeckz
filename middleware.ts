// middleware.ts
// Lumenform Studio — Next.js middleware for route protection.
// Protects /account/* and /admin/* routes by redirecting unauthenticated users to /login.
// Admin email allowlist enforcement happens server-side via Auth.js session checks.
// Guest checkout (/cart, /checkout/*) is NOT protected.
// All other public routes pass through unmodified.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth.js v5 stores the session token in this cookie name by default.
// For database strategy, it uses __Secure-authjs.session-token in production
// and authjs.session-token in development.
const SESSION_COOKIE_NAMES = ["authjs.session-token", "__Secure-authjs.session-token"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect account and admin routes.
  if (pathname.startsWith("/account") || pathname.startsWith("/admin")) {
    const hasSession = SESSION_COOKIE_NAMES.some((name) => request.cookies.get(name)?.value);

    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on protected page routes. Exclude API routes, static files, etc.
  matcher: ["/account/:path*", "/admin/:path*"],
};
