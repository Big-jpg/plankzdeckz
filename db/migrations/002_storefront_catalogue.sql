ALTER TABLE products ADD COLUMN IF NOT EXISTS publication_status text NOT NULL DEFAULT 'draft'
  CHECK (publication_status IN ('draft', 'published', 'archived'));
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_details jsonb NOT NULL DEFAULT '[]'::jsonb
  CHECK (jsonb_typeof(image_details) = 'array');
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_by_size jsonb NOT NULL DEFAULT '{}'::jsonb
  CHECK (jsonb_typeof(stock_by_size) = 'object');
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 0
  CHECK (stock_quantity >= 0);

-- The original schema required board specifications at insert time. Drafts need
-- to exist before those details are ready; publication enforces them instead.
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_board_fields_check;
ALTER TABLE products ADD CONSTRAINT products_published_board_fields_check CHECK (
  product_type <> 'board' OR publication_status <> 'published'
  OR (board_style IS NOT NULL AND board_shape IS NOT NULL AND length(trim(board_shape)) > 0)
);

CREATE TABLE IF NOT EXISTS board_checkout_holds (
  product_id uuid PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  hold_token uuid NOT NULL,
  stripe_session_id text UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_board_checkout_holds_expiry ON board_checkout_holds(expires_at);

CREATE TABLE IF NOT EXISTS merch_checkout_holds (
  hold_token uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  stripe_session_id text,
  expires_at timestamptz NOT NULL,
  PRIMARY KEY (hold_token, product_id, size)
);
CREATE INDEX IF NOT EXISTS idx_merch_checkout_holds_active
  ON merch_checkout_holds(product_id, size, expires_at);

CREATE TABLE IF NOT EXISTS storefront_inventory_events (
  stripe_session_id text NOT NULL,
  product_id uuid NOT NULL REFERENCES products(id),
  variant_key text NOT NULL DEFAULT '',
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (stripe_session_id, product_id, variant_key)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_order_items_stripe_line_item
  ON order_items ((metadata->>'stripe_line_item_id'))
  WHERE metadata ? 'stripe_line_item_id';
