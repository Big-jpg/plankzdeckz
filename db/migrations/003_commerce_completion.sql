-- Apply with ON_ERROR_STOP after 001/002, with checkout creation disabled.
BEGIN;

-- An upgrade must not silently discard reservations made by the previous code.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM board_checkout_holds)
     OR EXISTS (SELECT 1 FROM merch_checkout_holds) THEN
    RAISE EXCEPTION 'Resolve every existing Stripe reservation before applying migration 003; see the commerce deployment checklist';
  END IF;
END $$;

ALTER TABLE board_checkout_holds DROP CONSTRAINT IF EXISTS board_checkout_holds_stripe_session_id_key;
CREATE INDEX IF NOT EXISTS idx_board_holds_session ON board_checkout_holds(stripe_session_id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS revision integer NOT NULL DEFAULT 0;

CREATE TABLE checkout_attempts (
  id uuid PRIMARY KEY,
  request_hash text NOT NULL,
  items jsonb NOT NULL CHECK (jsonb_typeof(items) = 'array'),
  expected_amount integer NOT NULL CHECK (expected_amount > 0),
  currency text NOT NULL CHECK (currency = 'AUD'),
  status text NOT NULL DEFAULT 'creating'
    CHECK (status IN ('creating','open','paid','expired','failed','needs_review')),
  stripe_session_id text UNIQUE,
  stripe_params jsonb,
  creation_requested_at timestamptz,
  expires_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_checkout_attempts_recovery ON checkout_attempts(status,updated_at);
ALTER TABLE board_checkout_holds ADD CONSTRAINT board_hold_attempt
  FOREIGN KEY (hold_token) REFERENCES checkout_attempts(id);
ALTER TABLE merch_checkout_holds ADD CONSTRAINT merch_hold_attempt
  FOREIGN KEY (hold_token) REFERENCES checkout_attempts(id);

ALTER TABLE orders ADD COLUMN channel text NOT NULL DEFAULT 'online' CHECK(channel IN ('online','market'));
ALTER TABLE orders ADD COLUMN operator_email text;
ALTER TABLE orders ADD COLUMN sold_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE orders ADD COLUMN reconciliation_status text NOT NULL DEFAULT 'reconciled'
  CHECK(reconciliation_status IN ('reconciled','needs_review'));
ALTER TABLE orders ADD COLUMN payment_reference text;
ALTER TABLE orders ADD COLUMN refund_status text NOT NULL DEFAULT 'none';
ALTER TABLE orders ADD COLUMN refunded_amount integer NOT NULL DEFAULT 0 CHECK(refunded_amount>=0);
ALTER TABLE orders ADD COLUMN refund_details jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE orders ADD COLUMN refund_checked_at timestamptz;
ALTER TABLE orders ADD COLUMN refund_sync_error text;
ALTER TABLE orders ADD COLUMN refund_refresh_revision integer NOT NULL DEFAULT 0;
ALTER TABLE orders ALTER COLUMN email DROP NOT NULL;
ALTER TABLE orders ADD CONSTRAINT online_order_email CHECK(channel='market' OR email IS NOT NULL);
-- Existing duplicates must be investigated, not deleted to make this pass.
CREATE UNIQUE INDEX idx_orders_payment_intent_unique ON orders(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

CREATE TABLE inventory_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id),
  variant_key text NOT NULL DEFAULT '',
  quantity_delta integer NOT NULL,
  before_quantity integer NOT NULL CHECK(before_quantity>=0),
  after_quantity integer NOT NULL CHECK(after_quantity>=0),
  reason text NOT NULL CHECK(length(trim(reason))>0),
  operator_email text NOT NULL,
  order_id uuid REFERENCES orders(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK(after_quantity-before_quantity=quantity_delta)
);
CREATE INDEX idx_inventory_adjustments_product ON inventory_adjustments(product_id,created_at);
COMMIT;
