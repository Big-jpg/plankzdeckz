-- PLANKZ DECKZ — Initial PostgreSQL Schema
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
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text,
  email           text UNIQUE,
  email_verified  timestamptz,
  image           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
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
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token   text NOT NULL UNIQUE,
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires         timestamptz NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE verification_tokens (
  identifier  text NOT NULL,
  token       text NOT NULL UNIQUE,
  expires     timestamptz NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- =============================================================================
-- Products
-- =============================================================================

CREATE TABLE products (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_product_id   text UNIQUE,
  shopify_variant_id   text,
  handle               text NOT NULL UNIQUE,
  title                text NOT NULL,
  description          text NOT NULL DEFAULT '',
  product_type         text NOT NULL CHECK (product_type IN ('board', 'merch')),
  price_amount         integer NOT NULL CHECK (price_amount >= 0),
  currency             text NOT NULL DEFAULT 'aud',
  category             text,
  image_urls           jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(image_urls) = 'array'),

  -- Board-specific fields. Null for merch unless explicitly useful as metadata.
  timber_species       text[] NOT NULL DEFAULT ARRAY[]::text[],
  board_style          text CHECK (board_style IS NULL OR board_style IN ('cruiser', 'surfskate', 'longboard')),
  length_cm            numeric(6,2) CHECK (length_cm IS NULL OR length_cm > 0),
  width_cm             numeric(6,2) CHECK (width_cm IS NULL OR width_cm > 0),
  thickness_cm         numeric(5,2) CHECK (thickness_cm IS NULL OR thickness_cm > 0),
  board_shape          text,
  availability_status  text NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'sold', 'reserved')),

  -- Merch-specific fields.
  merch_kind           text,
  merch_sizes          text[] NOT NULL DEFAULT ARRAY[]::text[],

  metadata             jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT products_board_fields_check CHECK (
    product_type <> 'board'
    OR (board_style IS NOT NULL AND board_shape IS NOT NULL)
  )
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
  product_type          text NOT NULL CHECK (product_type IN ('board', 'merch')),
  board_style           text CHECK (board_style IS NULL OR board_style IN ('cruiser', 'surfskate', 'longboard')),
  merch_size            text,
  customisation_notes   text,
  material              text,
  colour                text,
  metadata              jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
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
-- Custom Board Requests
-- =============================================================================

CREATE TABLE custom_design_requests (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid REFERENCES users(id) ON DELETE SET NULL,
  email                   text NOT NULL,
  name                    text,
  phone                   text,
  intended_use            text,
  board_style             text CHECK (board_style IS NULL OR board_style IN ('cruiser', 'surfskate', 'longboard', 'custom')),
  board_shape             text,
  board_length            numeric(6,2) CHECK (board_length IS NULL OR board_length > 0),
  board_width             numeric(6,2) CHECK (board_width IS NULL OR board_width > 0),
  timber_preference       text,
  resin_inlay_preference  text,
  design_notes            text NOT NULL,
  budget_range            text,
  status                  text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'quoted', 'accepted', 'rejected', 'completed')),
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- Custom Board Designs (Phase 5 configurator persistence)
-- =============================================================================

CREATE TABLE custom_board_designs (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id           uuid REFERENCES users(id) ON DELETE SET NULL,
  board_shape           text NOT NULL,
  board_length          numeric(6,2) NOT NULL CHECK (board_length > 0),
  board_width           numeric(6,2) NOT NULL CHECK (board_width > 0),
  truck_positions       jsonb NOT NULL DEFAULT '[]'::jsonb,
  resin_inlay_config    jsonb NOT NULL DEFAULT '{}'::jsonb,
  timber_preference     text,
  notes                 text,
  status                text NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'reviewing', 'quoted', 'approved', 'rejected', 'archived')),
  configurator_payload  jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(configurator_payload) = 'object'),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- Indexes
-- =============================================================================

-- Products
CREATE INDEX idx_products_product_type ON products(product_type);
CREATE INDEX idx_products_board_style ON products(board_style);
CREATE INDEX idx_products_availability_status ON products(availability_status);
CREATE INDEX idx_products_handle ON products(handle);

-- Orders
CREATE INDEX idx_orders_stripe_checkout_session_id ON orders(stripe_checkout_session_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_pickup_status ON orders(pickup_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Order Items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_type ON order_items(product_type);

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

-- Custom Board Requests
CREATE INDEX idx_custom_design_requests_email ON custom_design_requests(email);
CREATE INDEX idx_custom_design_requests_status ON custom_design_requests(status);
CREATE INDEX idx_custom_design_requests_board_style ON custom_design_requests(board_style);

-- Custom Board Designs
CREATE INDEX idx_custom_board_designs_customer_id ON custom_board_designs(customer_id);
CREATE INDEX idx_custom_board_designs_status ON custom_board_designs(status);
CREATE INDEX idx_custom_board_designs_created_at ON custom_board_designs(created_at DESC);

-- Sessions
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- Accounts
CREATE INDEX idx_accounts_user_id ON accounts(user_id);

COMMIT;
