// auth.ts
// PLANKZ DECKZ — Auth.js (NextAuth v5) configuration.
// Email magic link provider with custom PostgreSQL adapter.
// Database session strategy (not JWT) using public schema tables.

import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import type { NextAuthConfig } from "next-auth";
import { PlankzAdapter } from "@/server/auth/adapter";

// ---------------------------------------------------------------------------
// Email transport configuration
// ---------------------------------------------------------------------------

// Keep email delivery independent of the SMTP provider. A missing or partial
// configuration must fail the sign-in request instead of claiming to send it.
const emailFrom = process.env.EMAIL_FROM?.trim();

function getEmailServer() {
  const host = process.env.EMAIL_SERVER_HOST?.trim();
  const port = Number(process.env.EMAIL_SERVER_PORT);
  const user = process.env.EMAIL_SERVER_USER?.trim();
  const pass = process.env.EMAIL_SERVER_PASSWORD;

  if (
    !host ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535 ||
    !user ||
    !pass ||
    !emailFrom
  ) {
    return undefined;
  }

  return {
    host,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user, pass },
  };
}

const emailServer = getEmailServer();

// ---------------------------------------------------------------------------
// Auth configuration
// ---------------------------------------------------------------------------

const authConfig: NextAuthConfig = {
  adapter: PlankzAdapter(),

  // Use database sessions (not JWT) — matches our sessions table.
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  pages: {
    signIn: "/login",
    // verifyRequest is the "check your email" page after magic link is sent
    verifyRequest: "/login?verify=1",
    error: "/login",
  },

  providers: [
    Nodemailer({
      server: emailServer || {
        host: "127.0.0.1",
        port: 25,
      },
      from: emailFrom || "unconfigured@localhost",
      ...(emailServer
        ? {}
        : {
            sendVerificationRequest: async () => {
              throw new Error("Email sign-in is not configured");
            },
          }),
    }),
  ],

  callbacks: {
    // Expose user.id in the session object for client-side use
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
  },

  // Trust the host header in production (Vercel sets this)
  trustHost: true,
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
