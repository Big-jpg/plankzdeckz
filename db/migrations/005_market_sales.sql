BEGIN;

CREATE TABLE IF NOT EXISTS market_sales (
  id uuid PRIMARY KEY,
  payment_reference text NOT NULL,
  stripe_payment_intent_id text UNIQUE,
  items jsonb NOT NULL CHECK (jsonb_typeof(items) = 'array' AND jsonb_array_length(items) BETWEEN 1 AND 20),
  total_amount integer NOT NULL CHECK (total_amount > 0),
  sold_at timestamptz NOT NULL,
  operator_email text NOT NULL,
  customer_email text,
  status text NOT NULL DEFAULT 'needs_review' CHECK (status IN ('needs_review', 'reconciled', 'dismissed')),
  error text,
  resolution_note text,
  resolved_by text,
  resolved_at timestamptz,
  order_id uuid UNIQUE REFERENCES orders(id),
  revision integer NOT NULL DEFAULT 0 CHECK (revision >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((status = 'reconciled') = (order_id IS NOT NULL)),
  CHECK (status <> 'reconciled' OR stripe_payment_intent_id IS NOT NULL),
  CHECK (status <> 'dismissed' OR (resolution_note IS NOT NULL AND length(trim(resolution_note)) >= 10 AND resolved_by IS NOT NULL AND resolved_at IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS idx_market_sales_review ON market_sales(created_at DESC) WHERE status = 'needs_review';
CREATE INDEX IF NOT EXISTS idx_market_sales_items ON market_sales USING gin(items jsonb_path_ops);

COMMIT;
