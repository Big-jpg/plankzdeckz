-- Durable customer notifications. Apply after 003_commerce_completion.sql.
BEGIN;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_revision bigint NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS order_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id),
  kind text NOT NULL CHECK (kind IN (
    'order_confirmed', 'pickup_ready', 'pickup_collected', 'pickup_cancelled'
  )),
  dedupe_key text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sending', 'accepted', 'failed', 'superseded')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  lease_token uuid,
  lease_until timestamptz,
  last_error_code text,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_notifications_order
  ON order_notifications(order_id, created_at);
CREATE INDEX IF NOT EXISTS idx_order_notifications_pending
  ON order_notifications(status, lease_until) WHERE status <> 'accepted';

COMMIT;
