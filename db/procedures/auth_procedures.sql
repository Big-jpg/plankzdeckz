-- db/procedures/auth_procedures.sql
-- Lumenform Studio — Auth-related stored procedures/functions
-- Compatible with Auth.js / NextAuth PostgreSQL adapter pattern.
-- Run after 001_initial_schema.sql:
--   psql $DATABASE_URL -f db/procedures/auth_procedures.sql

BEGIN;

-- =============================================================================
-- create_user
-- =============================================================================
CREATE OR REPLACE FUNCTION create_user(
  p_name           text,
  p_email          text,
  p_email_verified timestamptz DEFAULT NULL,
  p_image          text DEFAULT NULL
)
RETURNS TABLE (
  out_id             uuid,
  out_name           text,
  out_email          text,
  out_email_verified timestamptz,
  out_image          text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    INSERT INTO users (name, email, email_verified, image)
    VALUES (p_name, p_email, p_email_verified, p_image)
    ON CONFLICT (email) DO UPDATE
      SET name = COALESCE(EXCLUDED.name, users.name),
          email_verified = COALESCE(EXCLUDED.email_verified, users.email_verified),
          image = COALESCE(EXCLUDED.image, users.image),
          updated_at = now()
    RETURNING
      users.id,
      users.name,
      users.email,
      users.email_verified,
      users.image;
END;
$$;

-- =============================================================================
-- get_user_by_id
-- =============================================================================
CREATE OR REPLACE FUNCTION get_user_by_id(p_user_id uuid)
RETURNS TABLE (
  out_id             uuid,
  out_name           text,
  out_email          text,
  out_email_verified timestamptz,
  out_image          text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    SELECT u.id, u.name, u.email, u.email_verified, u.image
    FROM users u
    WHERE u.id = p_user_id;
END;
$$;

-- =============================================================================
-- get_user_by_email
-- =============================================================================
CREATE OR REPLACE FUNCTION get_user_by_email(p_email text)
RETURNS TABLE (
  out_id             uuid,
  out_name           text,
  out_email          text,
  out_email_verified timestamptz,
  out_image          text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    SELECT u.id, u.name, u.email, u.email_verified, u.image
    FROM users u
    WHERE u.email = p_email;
END;
$$;

-- =============================================================================
-- link_account
-- =============================================================================
CREATE OR REPLACE FUNCTION link_account(
  p_user_id             uuid,
  p_type                text,
  p_provider            text,
  p_provider_account_id text,
  p_refresh_token       text DEFAULT NULL,
  p_access_token        text DEFAULT NULL,
  p_expires_at          integer DEFAULT NULL,
  p_token_type          text DEFAULT NULL,
  p_scope               text DEFAULT NULL,
  p_id_token            text DEFAULT NULL,
  p_session_state       text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO accounts (
    user_id, type, provider, provider_account_id,
    refresh_token, access_token, expires_at,
    token_type, scope, id_token, session_state
  ) VALUES (
    p_user_id, p_type, p_provider, p_provider_account_id,
    p_refresh_token, p_access_token, p_expires_at,
    p_token_type, p_scope, p_id_token, p_session_state
  )
  ON CONFLICT (provider, provider_account_id) DO UPDATE
    SET refresh_token = COALESCE(EXCLUDED.refresh_token, accounts.refresh_token),
        access_token = COALESCE(EXCLUDED.access_token, accounts.access_token),
        expires_at = COALESCE(EXCLUDED.expires_at, accounts.expires_at),
        token_type = COALESCE(EXCLUDED.token_type, accounts.token_type),
        scope = COALESCE(EXCLUDED.scope, accounts.scope),
        id_token = COALESCE(EXCLUDED.id_token, accounts.id_token),
        session_state = COALESCE(EXCLUDED.session_state, accounts.session_state)
  RETURNING accounts.id INTO v_id;

  RETURN v_id;
END;
$$;

-- =============================================================================
-- create_session
-- =============================================================================
CREATE OR REPLACE FUNCTION create_session(
  p_session_token text,
  p_user_id       uuid,
  p_expires       timestamptz
)
RETURNS TABLE (
  out_id            uuid,
  out_session_token text,
  out_user_id       uuid,
  out_expires       timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    INSERT INTO sessions (session_token, user_id, expires)
    VALUES (p_session_token, p_user_id, p_expires)
    RETURNING
      sessions.id,
      sessions.session_token,
      sessions.user_id,
      sessions.expires;
END;
$$;

-- =============================================================================
-- get_session_and_user
-- =============================================================================
CREATE OR REPLACE FUNCTION get_session_and_user(p_session_token text)
RETURNS TABLE (
  session_id      uuid,
  session_token   text,
  session_expires timestamptz,
  user_id         uuid,
  user_name       text,
  user_email      text,
  email_verified  timestamptz,
  user_image      text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    SELECT
      s.id AS session_id,
      s.session_token,
      s.expires AS session_expires,
      u.id AS user_id,
      u.name AS user_name,
      u.email AS user_email,
      u.email_verified,
      u.image AS user_image
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.session_token = p_session_token
      AND s.expires > now();
END;
$$;

-- =============================================================================
-- delete_session
-- =============================================================================
CREATE OR REPLACE FUNCTION delete_session(p_session_token text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_deleted boolean;
BEGIN
  DELETE FROM sessions WHERE session_token = p_session_token;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- =============================================================================
-- create_verification_token
-- =============================================================================
CREATE OR REPLACE FUNCTION create_verification_token(
  p_identifier text,
  p_token      text,
  p_expires    timestamptz
)
RETURNS TABLE (
  out_identifier text,
  out_token      text,
  out_expires    timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    INSERT INTO verification_tokens (identifier, token, expires)
    VALUES (p_identifier, p_token, p_expires)
    RETURNING
      verification_tokens.identifier,
      verification_tokens.token,
      verification_tokens.expires;
END;
$$;

-- =============================================================================
-- use_verification_token
-- Consumes (deletes) the token and returns it if valid.
-- =============================================================================
CREATE OR REPLACE FUNCTION use_verification_token(
  p_identifier text,
  p_token      text
)
RETURNS TABLE (
  out_identifier text,
  out_token      text,
  out_expires    timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    DELETE FROM verification_tokens
    WHERE verification_tokens.identifier = p_identifier
      AND verification_tokens.token = p_token
    RETURNING
      verification_tokens.identifier,
      verification_tokens.token,
      verification_tokens.expires;
END;
$$;

-- =============================================================================
-- delete_user
-- =============================================================================
CREATE OR REPLACE FUNCTION delete_user(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_deleted boolean;
BEGIN
  DELETE FROM users WHERE id = p_user_id;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- =============================================================================
-- update_user
-- =============================================================================
CREATE OR REPLACE FUNCTION update_user(
  p_user_id        uuid,
  p_name           text DEFAULT NULL,
  p_email          text DEFAULT NULL,
  p_email_verified timestamptz DEFAULT NULL,
  p_image          text DEFAULT NULL
)
RETURNS TABLE (
  out_id             uuid,
  out_name           text,
  out_email          text,
  out_email_verified timestamptz,
  out_image          text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    UPDATE users
    SET
      name = COALESCE(p_name, users.name),
      email = COALESCE(p_email, users.email),
      email_verified = COALESCE(p_email_verified, users.email_verified),
      image = COALESCE(p_image, users.image),
      updated_at = now()
    WHERE users.id = p_user_id
    RETURNING
      users.id,
      users.name,
      users.email,
      users.email_verified,
      users.image;
END;
$$;

COMMIT;
