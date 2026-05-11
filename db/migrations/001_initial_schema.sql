-- db/migrations/001_initial_schema.sql
-- Lumenform Studio — Initial PostgreSQL Schema
-- Run against a fresh database: psql $DATABASE_URL -f db/migrations/001_initial_schema.sql
-- Requires PostgreSQL 13+ (gen_random_uuid())

BEGIN;

-- =============================================================================
-- Extension
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- Auth tables (Auth.js / NextAuth compatible)
-- =============================================================================

CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text,
  email         text UNIQUE,
  email_verified timestamptz,
  image         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE accounts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                text NOT NULL,
  provider            text NOT NULL,
  provider_account_id text NOT NULL,
  refresh_token       text,
  access_token        text,
  expires_at          integer,
  token_type          text,
  scope               text,
  id_token            text,
  session_state       text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_account_id)
);

CREATE TABLE sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text NOT NULL UNIQUE,
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires       timestamptz NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE verification_tokens (
  identifier text NOT NULL,
  token      text NOT NULL UNIQUE,
  expires    timestamptz NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- =============================================================================
-- Orders
-- =============================================================================

CREATE TABLE orders (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     uuid REFERENCES users(id) ON DELETE SET NULL,
  email                       text NOT NULL,
  buyer_name                  text,
  phone                       text,
  stripe_checkout_session_id  text UNIQUE,
  stripe_payment_intent_id    text,
  status                      text NOT NULL,
  fulfilment_method           text NOT NULL DEFAULT 'local_pickup',
  subtotal_amount             integer NOT NULL,
  total_amount                integer NOT NULL,
  currency                    text NOT NULL,
  pickup_status               text NOT NULL DEFAULT 'pending',
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- Order Items
-- =============================================================================

CREATE TABLE order_items (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  shopify_product_id    text,
  shopify_variant_id    text,
  title                 text NOT NULL,
  variant_title         text,
  quantity              integer NOT NULL,
  unit_amount           integer NOT NULL,
  total_amount          integer NOT NULL,
  image_url             text,
  selected_adapter      text NOT NULL,
  bulb_type_confirmed   boolean NOT NULL DEFAULT false,
  fixture_notes         text,
  customisation_notes   text,
  material              text,
  colour                text,
  metadata              jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- =============================================================================
-- Stripe Events (webhook idempotency)
-- =============================================================================

CREATE TABLE stripe_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text NOT NULL UNIQUE,
  event_type      text NOT NULL,
  payload         jsonb NOT NULL,
  processed       boolean NOT NULL DEFAULT false,
  processed_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- Pickup Requests
-- =============================================================================

CREATE TABLE pickup_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  requested_by    text NOT NULL,
  requested_at    timestamptz NOT NULL DEFAULT now(),
  preferred_date  date,
  preferred_time  text,
  notes           text,
  status          text NOT NULL DEFAULT 'pending',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- Buyer Events (analytics / hooks)
-- =============================================================================

CREATE TABLE buyer_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES users(id) ON DELETE SET NULL,
  email       text,
  event_type  text NOT NULL,
  event_data  jsonb NOT NULL DEFAULT '{}'::jsonb,
  order_id    uuid REFERENCES orders(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- Shipping Stubs (future use)
-- =============================================================================

CREATE TABLE shipping_stubs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  method          text NOT NULL DEFAULT 'not_available',
  address_json    jsonb,
  tracking_number text,
  status          text NOT NULL DEFAULT 'stub',
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- Custom Design Requests
-- =============================================================================

CREATE TABLE custom_design_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES users(id) ON DELETE SET NULL,
  email         text NOT NULL,
  name          text,
  phone         text,
  fixture_type  text,
  adapter_type  text,
  design_notes  text NOT NULL,
  budget_range  text,
  status        text NOT NULL DEFAULT 'new',
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- Indexes
-- =============================================================================

-- Orders
CREATE INDEX idx_orders_stripe_checkout_session_id ON orders(stripe_checkout_session_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_pickup_status ON orders(pickup_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Order Items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Stripe Events
CREATE INDEX idx_stripe_events_stripe_event_id ON stripe_events(stripe_event_id);
CREATE INDEX idx_stripe_events_processed ON stripe_events(processed);

-- Pickup Requests
CREATE INDEX idx_pickup_requests_order_id ON pickup_requests(order_id);
CREATE INDEX idx_pickup_requests_status ON pickup_requests(status);

-- Buyer Events
CREATE INDEX idx_buyer_events_user_id ON buyer_events(user_id);
CREATE INDEX idx_buyer_events_email ON buyer_events(email);
CREATE INDEX idx_buyer_events_event_type ON buyer_events(event_type);
CREATE INDEX idx_buyer_events_order_id ON buyer_events(order_id);

-- Custom Design Requests
CREATE INDEX idx_custom_design_requests_email ON custom_design_requests(email);
CREATE INDEX idx_custom_design_requests_status ON custom_design_requests(status);

-- Sessions
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- Accounts
CREATE INDEX idx_accounts_user_id ON accounts(user_id);

COMMIT;
