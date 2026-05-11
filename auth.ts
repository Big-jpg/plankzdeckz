// auth.ts
// Lumenform Studio — Auth.js (NextAuth v5) configuration.
// Email magic link provider with custom PostgreSQL adapter.
// Database session strategy (not JWT) using public schema tables.

import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import type { NextAuthConfig } from "next-auth";
import { LumenformAdapter } from "@/server/auth/adapter";

// ---------------------------------------------------------------------------
// Email transport configuration
// ---------------------------------------------------------------------------

// When SMTP credentials are present, use them. Otherwise, fall back to a
// console-logging transport so dev/test works without an email service.
function getEmailServer(): string | undefined {
  const host = process.env.EMAIL_SERVER_HOST;
  const port = process.env.EMAIL_SERVER_PORT;
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;

  if (host && port && user && pass) {
    return `smtp://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}`;
  }

  return undefined;
}

const emailServer = getEmailServer();
const emailFrom = process.env.EMAIL_FROM || "Lumenform Studio <noreply@lumenform.studio>";

// ---------------------------------------------------------------------------
// Auth configuration
// ---------------------------------------------------------------------------

const authConfig: NextAuthConfig = {
  adapter: LumenformAdapter(),

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
        host: "localhost",
        port: 25,
        auth: { user: "", pass: "" },
        secure: false,
      },
      from: emailFrom,
      // When no email server is configured, log the magic link to console
      ...(emailServer
        ? {}
        : {
            sendVerificationRequest: async ({ identifier, url }) => {
              console.log("\n╔══════════════════════════════════════════════════════════════╗");
              console.log("║  LUMENFORM STUDIO — Magic Link (dev mode, no SMTP)         ║");
              console.log("╠══════════════════════════════════════════════════════════════╣");
              console.log(`║  Email: ${identifier}`);
              console.log(`║  Link:  ${url}`);
              console.log("╚══════════════════════════════════════════════════════════════╝\n");
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
