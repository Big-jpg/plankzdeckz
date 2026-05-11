-- db/procedures/pickup_procedures.sql
-- Lumenform Studio — Pickup-related stored procedures/functions
-- Run after 001_initial_schema.sql:
--   psql $DATABASE_URL -f db/procedures/pickup_procedures.sql

BEGIN;

-- =============================================================================
-- create_pickup_request
-- Creates a pickup request for an order.
-- =============================================================================
CREATE OR REPLACE FUNCTION create_pickup_request(
  p_order_id        uuid,
  p_requested_by    text,
  p_preferred_date  date DEFAULT NULL,
  p_preferred_time  text DEFAULT NULL,
  p_notes           text DEFAULT NULL
)
RETURNS TABLE (
  id             uuid,
  order_id       uuid,
  requested_by   text,
  preferred_date date,
  preferred_time text,
  status         text,
  created_at     timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    INSERT INTO pickup_requests (
      order_id,
      requested_by,
      preferred_date,
      preferred_time,
      notes
    ) VALUES (
      p_order_id,
      p_requested_by,
      p_preferred_date,
      p_preferred_time,
      p_notes
    )
    RETURNING
      pickup_requests.id,
      pickup_requests.order_id,
      pickup_requests.requested_by,
      pickup_requests.preferred_date,
      pickup_requests.preferred_time,
      pickup_requests.status,
      pickup_requests.created_at;
END;
$$;

-- =============================================================================
-- update_pickup_status
-- Updates the pickup_status on the order itself and the pickup_request record.
-- Valid statuses: pending, ready, collected, cancelled
-- =============================================================================
CREATE OR REPLACE FUNCTION update_pickup_status(
  p_order_id   uuid,
  p_new_status text
)
RETURNS TABLE (
  order_id      uuid,
  pickup_status text,
  updated_at    timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate status
  IF p_new_status NOT IN ('pending', 'ready', 'collected', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid pickup status: %. Must be one of: pending, ready, collected, cancelled', p_new_status;
  END IF;

  -- Update order pickup_status
  UPDATE orders
  SET pickup_status = p_new_status, updated_at = now()
  WHERE orders.id = p_order_id;

  -- Update latest pickup request status if exists
  UPDATE pickup_requests
  SET status = p_new_status, updated_at = now()
  WHERE pickup_requests.order_id = p_order_id
    AND pickup_requests.id = (
      SELECT pr.id FROM pickup_requests pr
      WHERE pr.order_id = p_order_id
      ORDER BY pr.created_at DESC
      LIMIT 1
    );

  RETURN QUERY
    SELECT o.id AS order_id, o.pickup_status, o.updated_at
    FROM orders o
    WHERE o.id = p_order_id;
END;
$$;

-- =============================================================================
-- get_pickup_requests_for_order
-- =============================================================================
CREATE OR REPLACE FUNCTION get_pickup_requests_for_order(p_order_id uuid)
RETURNS TABLE (
  id             uuid,
  order_id       uuid,
  requested_by   text,
  requested_at   timestamptz,
  preferred_date date,
  preferred_time text,
  notes          text,
  status         text,
  created_at     timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    SELECT
      pr.id,
      pr.order_id,
      pr.requested_by,
      pr.requested_at,
      pr.preferred_date,
      pr.preferred_time,
      pr.notes,
      pr.status,
      pr.created_at
    FROM pickup_requests pr
    WHERE pr.order_id = p_order_id
    ORDER BY pr.created_at DESC;
END;
$$;

-- =============================================================================
-- get_orders_pending_pickup
-- Returns orders that are ready for pickup (admin view).
-- =============================================================================
CREATE OR REPLACE FUNCTION get_orders_pending_pickup(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id            uuid,
  email         text,
  buyer_name    text,
  total_amount  integer,
  currency      text,
  pickup_status text,
  created_at    timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    SELECT
      o.id,
      o.email,
      o.buyer_name,
      o.total_amount,
      o.currency,
      o.pickup_status,
      o.created_at
    FROM orders o
    WHERE o.fulfilment_method = 'local_pickup'
      AND o.pickup_status IN ('pending', 'ready')
      AND o.status = 'paid'
    ORDER BY o.created_at ASC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

COMMIT;
