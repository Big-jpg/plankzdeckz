// server/auth/adapter.ts
// Lumenform Studio — Custom PostgreSQL adapter for Auth.js (NextAuth v5).
// Uses the existing pg client and stored procedures from Phase 4.
// No ORM. No Prisma. Direct stored procedure calls via server/db/client.ts.

import type { Adapter, AdapterUser, AdapterSession, AdapterAccount } from "next-auth/adapters";
import type { VerificationToken } from "next-auth/adapters";
import { queryOne } from "@/server/db/client";

// ---------------------------------------------------------------------------
// Helpers: map DB snake_case rows to Auth.js camelCase types
// ---------------------------------------------------------------------------

interface DbUser {
  id: string;
  name: string | null;
  email: string;
  email_verified: string | null;
  image: string | null;
}

interface DbSession {
  session_id: string;
  session_token: string;
  session_expires: string;
  user_id: string;
  user_name: string | null;
  user_email: string;
  email_verified: string | null;
  user_image: string | null;
}

interface DbSessionRow {
  id: string;
  session_token: string;
  user_id: string;
  expires: string;
}

interface DbVerificationToken {
  identifier: string;
  token: string;
  expires: string;
}

function toAdapterUser(row: DbUser): AdapterUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    emailVerified: row.email_verified ? new Date(row.email_verified) : null,
    image: row.image,
  };
}

function toAdapterSession(row: DbSessionRow): AdapterSession {
  return {
    sessionToken: row.session_token,
    userId: row.user_id,
    expires: new Date(row.expires),
  };
}

// ---------------------------------------------------------------------------
// Adapter implementation
// ---------------------------------------------------------------------------

export function LumenformAdapter(): Adapter {
  return {
    // -----------------------------------------------------------------------
    // User methods
    // -----------------------------------------------------------------------

    async createUser(user) {
      const row = await queryOne<DbUser>(`SELECT * FROM create_user($1, $2, $3, $4)`, [
        user.name ?? null,
        user.email,
        user.emailVerified?.toISOString() ?? null,
        user.image ?? null,
      ]);
      if (!row) throw new Error("Failed to create user");
      return toAdapterUser(row);
    },

    async getUser(id) {
      const row = await queryOne<DbUser>(`SELECT * FROM get_user_by_id($1)`, [id]);
      return row ? toAdapterUser(row) : null;
    },

    async getUserByEmail(email) {
      const row = await queryOne<DbUser>(`SELECT * FROM get_user_by_email($1)`, [email]);
      return row ? toAdapterUser(row) : null;
    },

    async getUserByAccount({ provider, providerAccountId }) {
      // No stored procedure for this in Phase 4; use direct SQL read.
      const row = await queryOne<DbUser>(
        `SELECT u.id, u.name, u.email, u.email_verified, u.image
         FROM users u
         JOIN accounts a ON a.user_id = u.id
         WHERE a.provider = $1 AND a.provider_account_id = $2`,
        [provider, providerAccountId],
      );
      return row ? toAdapterUser(row) : null;
    },

    async updateUser(user) {
      const row = await queryOne<DbUser>(`SELECT * FROM update_user($1, $2, $3, $4, $5)`, [
        user.id,
        user.name ?? null,
        user.email ?? null,
        user.emailVerified?.toISOString() ?? null,
        user.image ?? null,
      ]);
      if (!row) throw new Error("Failed to update user");
      return toAdapterUser(row);
    },

    async deleteUser(userId) {
      await queryOne(`SELECT delete_user($1)`, [userId]);
    },

    // -----------------------------------------------------------------------
    // Account methods
    // -----------------------------------------------------------------------

    async linkAccount(account) {
      await queryOne<{ link_account: string }>(
        `SELECT link_account($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          account.userId,
          account.type,
          account.provider,
          account.providerAccountId,
          account.refresh_token ?? null,
          account.access_token ?? null,
          account.expires_at ?? null,
          account.token_type ?? null,
          account.scope ?? null,
          account.id_token ?? null,
          account.session_state ?? null,
        ],
      );
      return account as AdapterAccount;
    },

    async unlinkAccount({ provider, providerAccountId }) {
      await queryOne(`DELETE FROM accounts WHERE provider = $1 AND provider_account_id = $2`, [
        provider,
        providerAccountId,
      ]);
    },

    // -----------------------------------------------------------------------
    // Session methods (database strategy)
    // -----------------------------------------------------------------------

    async createSession(session) {
      const row = await queryOne<DbSessionRow>(`SELECT * FROM create_session($1, $2, $3)`, [
        session.sessionToken,
        session.userId,
        session.expires.toISOString(),
      ]);
      if (!row) throw new Error("Failed to create session");
      return toAdapterSession(row);
    },

    async getSessionAndUser(sessionToken) {
      const row = await queryOne<DbSession>(`SELECT * FROM get_session_and_user($1)`, [
        sessionToken,
      ]);
      if (!row) return null;

      return {
        session: {
          sessionToken: row.session_token,
          userId: row.user_id,
          expires: new Date(row.session_expires),
        },
        user: {
          id: row.user_id,
          name: row.user_name,
          email: row.user_email,
          emailVerified: row.email_verified ? new Date(row.email_verified) : null,
          image: row.user_image,
        },
      };
    },

    async updateSession(session) {
      // No stored procedure for update_session in Phase 4; use direct SQL.
      const row = await queryOne<DbSessionRow>(
        `UPDATE sessions
         SET expires = COALESCE($2, expires)
         WHERE session_token = $1
         RETURNING id, session_token, user_id, expires`,
        [session.sessionToken, session.expires?.toISOString() ?? null],
      );
      return row ? toAdapterSession(row) : null;
    },

    async deleteSession(sessionToken) {
      await queryOne(`SELECT delete_session($1)`, [sessionToken]);
    },

    // -----------------------------------------------------------------------
    // Verification token methods (email magic link)
    // -----------------------------------------------------------------------

    async createVerificationToken(verificationToken) {
      const row = await queryOne<DbVerificationToken>(
        `SELECT * FROM create_verification_token($1, $2, $3)`,
        [
          verificationToken.identifier,
          verificationToken.token,
          verificationToken.expires.toISOString(),
        ],
      );
      if (!row) return null;
      return {
        identifier: row.identifier,
        token: row.token,
        expires: new Date(row.expires),
      } satisfies VerificationToken;
    },

    async useVerificationToken({ identifier, token }) {
      const row = await queryOne<DbVerificationToken>(
        `SELECT * FROM use_verification_token($1, $2)`,
        [identifier, token],
      );
      if (!row) return null;
      return {
        identifier: row.identifier,
        token: row.token,
        expires: new Date(row.expires),
      } satisfies VerificationToken;
    },
  };
}
