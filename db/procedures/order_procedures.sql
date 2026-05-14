-- db/procedures/order_procedures.sql
-- Lumenform Studio — Order-related stored procedures/functions
-- Run after 001_initial_schema.sql:
--   psql $DATABASE_URL -f db/procedures/order_procedures.sql

BEGIN;

-- =============================================================================
-- create_order_from_stripe_session
-- Idempotent: if an order with the given stripe_checkout_session_id already
-- exists, returns the existing order instead of creating a duplicate.
-- =============================================================================
CREATE OR REPLACE FUNCTION create_order_from_stripe_session(
  p_email                       text,
  p_buyer_name                  text,
  p_phone                       text,
  p_stripe_checkout_session_id  text,
  p_stripe_payment_intent_id    text,
  p_status                      text,
  p_fulfilment_method           text,
  p_subtotal_amount             integer,
  p_total_amount                integer,
  p_currency                    text,
  p_user_id                     uuid DEFAULT NULL
)
RETURNS TABLE (
  id                          uuid,
  email                       text,
  buyer_name                  text,
  stripe_checkout_session_id  text,
  status                      text,
  created_at                  timestamptz,
  is_new                      boolean
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_existing_id uuid;
BEGIN
  -- Check for existing order (idempotency for webhook replay)
  SELECT o.id INTO v_existing_id
  FROM orders o
  WHERE o.stripe_checkout_session_id = p_stripe_checkout_session_id;

  IF v_existing_id IS NOT NULL THEN
    RETURN QUERY
      SELECT
        o.id,
        o.email,
        o.buyer_name,
        o.stripe_checkout_session_id,
        o.status,
        o.created_at,
        false AS is_new
      FROM orders o
      WHERE o.id = v_existing_id;
    RETURN;
  END IF;

  -- Insert new order
  RETURN QUERY
    INSERT INTO orders (
      user_id,
      email,
      buyer_name,
      phone,
      stripe_checkout_session_id,
      stripe_payment_intent_id,
      status,
      fulfilment_method,
      subtotal_amount,
      total_amount,
      currency
    ) VALUES (
      p_user_id,
      p_email,
      p_buyer_name,
      p_phone,
      p_stripe_checkout_session_id,
      p_stripe_payment_intent_id,
      p_status,
      COALESCE(p_fulfilment_method, 'local_pickup'),
      p_subtotal_amount,
      p_total_amount,
      p_currency
    )
    RETURNING
      orders.id,
      orders.email,
      orders.buyer_name,
      orders.stripe_checkout_session_id,
      orders.status,
      orders.created_at,
      true AS is_new;
END;
$$;

-- =============================================================================
-- create_order_item
-- Inserts a single order item. Metadata jsonb can carry future-ready fields:
--   market_event_id, market_source, qr_campaign, display_sample_id,
--   production_queue_status, filament_material, filament_colour, print_profile
-- =============================================================================
CREATE OR REPLACE FUNCTION create_order_item(
  p_order_id            uuid,
  p_shopify_product_id  text,
  p_shopify_variant_id  text,
  p_title               text,
  p_variant_title       text,
  p_quantity            integer,
  p_unit_amount         integer,
  p_total_amount        integer,
  p_image_url           text,
  p_selected_adapter    text,
  p_bulb_type_confirmed boolean,
  p_fixture_notes       text,
  p_customisation_notes text,
  p_material            text,
  p_colour              text,
  p_metadata            jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO order_items (
    order_id,
    shopify_product_id,
    shopify_variant_id,
    title,
    variant_title,
    quantity,
    unit_amount,
    total_amount,
    image_url,
    selected_adapter,
    bulb_type_confirmed,
    fixture_notes,
    customisation_notes,
    material,
    colour,
    metadata
  ) VALUES (
    p_order_id,
    p_shopify_product_id,
    p_shopify_variant_id,
    p_title,
    p_variant_title,
    p_quantity,
    p_unit_amount,
    p_total_amount,
    p_image_url,
    p_selected_adapter,
    p_bulb_type_confirmed,
    p_fixture_notes,
    p_customisation_notes,
    p_material,
    p_colour,
    p_metadata
  )
  RETURNING order_items.id INTO v_id;

  RETURN v_id;
END;
$$;

-- =============================================================================
-- record_stripe_event
-- Idempotent: if the event already exists, returns existing record.
-- =============================================================================
CREATE OR REPLACE FUNCTION record_stripe_event(
  p_stripe_event_id text,
  p_event_type      text,
  p_payload         jsonb
)
RETURNS TABLE (
  id              uuid,
  stripe_event_id text,
  event_type      text,
  processed       boolean,
  is_new          boolean
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_existing_id uuid;
BEGIN
  -- Check for existing event (idempotency)
  SELECT se.id INTO v_existing_id
  FROM stripe_events se
  WHERE se.stripe_event_id = p_stripe_event_id;

  IF v_existing_id IS NOT NULL THEN
    RETURN QUERY
      SELECT
        se.id,
        se.stripe_event_id,
        se.event_type,
        se.processed,
        false AS is_new
      FROM stripe_events se
      WHERE se.id = v_existing_id;
    RETURN;
  END IF;

  RETURN QUERY
    INSERT INTO stripe_events (stripe_event_id, event_type, payload)
    VALUES (p_stripe_event_id, p_event_type, p_payload)
    RETURNING
      stripe_events.id,
      stripe_events.stripe_event_id,
      stripe_events.event_type,
      stripe_events.processed,
      true AS is_new;
END;
$$;

-- =============================================================================
-- mark_stripe_event_processed
-- =============================================================================
CREATE OR REPLACE FUNCTION mark_stripe_event_processed(
  p_stripe_event_id text
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_updated boolean;
BEGIN
  UPDATE stripe_events
  SET processed = true, processed_at = now()
  WHERE stripe_event_id = p_stripe_event_id
    AND processed = false;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

-- =============================================================================
-- record_buyer_event
-- =============================================================================
CREATE OR REPLACE FUNCTION record_buyer_event(
  p_event_type text,
  p_event_data jsonb,
  p_email      text DEFAULT NULL,
  p_user_id    uuid DEFAULT NULL,
  p_order_id   uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO buyer_events (user_id, email, event_type, event_data, order_id)
  VALUES (p_user_id, p_email, p_event_type, p_event_data, p_order_id)
  RETURNING buyer_events.id INTO v_id;

  RETURN v_id;
END;
$$;

-- =============================================================================
-- get_order_by_id
-- Returns order row joined with its items as a JSON array.
-- =============================================================================
CREATE OR REPLACE FUNCTION get_order_by_id(p_order_id uuid)
RETURNS TABLE (
  id                          uuid,
  user_id                     uuid,
  email                       text,
  buyer_name                  text,
  phone                       text,
  stripe_checkout_session_id  text,
  stripe_payment_intent_id    text,
  status                      text,
  fulfilment_method           text,
  subtotal_amount             integer,
  total_amount                integer,
  currency                    text,
  pickup_status               text,
  created_at                  timestamptz,
  updated_at                  timestamptz,
  items                       jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    SELECT
      o.id,
      o.user_id,
      o.email,
      o.buyer_name,
      o.phone,
      o.stripe_checkout_session_id,
      o.stripe_payment_intent_id,
      o.status,
      o.fulfilment_method,
      o.subtotal_amount,
      o.total_amount,
      o.currency,
      o.pickup_status,
      o.created_at,
      o.updated_at,
      COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'id', oi.id,
            'shopify_product_id', oi.shopify_product_id,
            'shopify_variant_id', oi.shopify_variant_id,
            'title', oi.title,
            'variant_title', oi.variant_title,
            'quantity', oi.quantity,
            'unit_amount', oi.unit_amount,
            'total_amount', oi.total_amount,
            'image_url', oi.image_url,
            'selected_adapter', oi.selected_adapter,
            'bulb_type_confirmed', oi.bulb_type_confirmed,
            'fixture_notes', oi.fixture_notes,
            'customisation_notes', oi.customisation_notes,
            'material', oi.material,
            'colour', oi.colour,
            'metadata', oi.metadata
          )
        ) FROM order_items oi WHERE oi.order_id = o.id),
        '[]'::jsonb
      ) AS items
    FROM orders o
    WHERE o.id = p_order_id;
END;
$$;

-- =============================================================================
-- get_order_by_checkout_session
-- Returns order row joined with its items for a Stripe checkout session.
-- =============================================================================
CREATE OR REPLACE FUNCTION get_order_by_checkout_session(p_stripe_checkout_session_id text)
RETURNS TABLE (
  id                          uuid,
  user_id                     uuid,
  email                       text,
  buyer_name                  text,
  phone                       text,
  stripe_checkout_session_id  text,
  stripe_payment_intent_id    text,
  status                      text,
  fulfilment_method           text,
  subtotal_amount             integer,
  total_amount                integer,
  currency                    text,
  pickup_status               text,
  created_at                  timestamptz,
  updated_at                  timestamptz,
  items                       jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    SELECT
      o.id,
      o.user_id,
      o.email,
      o.buyer_name,
      o.phone,
      o.stripe_checkout_session_id,
      o.stripe_payment_intent_id,
      o.status,
      o.fulfilment_method,
      o.subtotal_amount,
      o.total_amount,
      o.currency,
      o.pickup_status,
      o.created_at,
      o.updated_at,
      COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'id', oi.id,
            'shopify_product_id', oi.shopify_product_id,
            'shopify_variant_id', oi.shopify_variant_id,
            'title', oi.title,
            'variant_title', oi.variant_title,
            'quantity', oi.quantity,
            'unit_amount', oi.unit_amount,
            'total_amount', oi.total_amount,
            'image_url', oi.image_url,
            'selected_adapter', oi.selected_adapter,
            'bulb_type_confirmed', oi.bulb_type_confirmed,
            'fixture_notes', oi.fixture_notes,
            'customisation_notes', oi.customisation_notes,
            'material', oi.material,
            'colour', oi.colour,
            'metadata', oi.metadata
          )
        ) FROM order_items oi WHERE oi.order_id = o.id),
        '[]'::jsonb
      ) AS items
    FROM orders o
    WHERE o.stripe_checkout_session_id = p_stripe_checkout_session_id;
END;
$$;

-- =============================================================================
-- get_orders_for_email
-- Returns all orders for a given email, most recent first.
-- =============================================================================
CREATE OR REPLACE FUNCTION get_orders_for_email(
  p_email text,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id                          uuid,
  email                       text,
  buyer_name                  text,
  stripe_checkout_session_id  text,
  status                      text,
  fulfilment_method           text,
  total_amount                integer,
  currency                    text,
  pickup_status               text,
  created_at                  timestamptz,
  item_count                  bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    SELECT
      o.id,
      o.email,
      o.buyer_name,
      o.stripe_checkout_session_id,
      o.status,
      o.fulfilment_method,
      o.total_amount,
      o.currency,
      o.pickup_status,
      o.created_at,
      (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
    FROM orders o
    WHERE o.email = p_email
    ORDER BY o.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- =============================================================================
-- get_recent_orders_admin
-- Returns recent orders for admin dashboard view.
-- =============================================================================
CREATE OR REPLACE FUNCTION get_recent_orders_admin(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_status_filter text DEFAULT NULL
)
RETURNS TABLE (
  id                          uuid,
  email                       text,
  buyer_name                  text,
  stripe_checkout_session_id  text,
  status                      text,
  fulfilment_method           text,
  total_amount                integer,
  currency                    text,
  pickup_status               text,
  created_at                  timestamptz,
  item_count                  bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    SELECT
      o.id,
      o.email,
      o.buyer_name,
      o.stripe_checkout_session_id,
      o.status,
      o.fulfilment_method,
      o.total_amount,
      o.currency,
      o.pickup_status,
      o.created_at,
      (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
    FROM orders o
    WHERE (p_status_filter IS NULL OR o.status = p_status_filter)
    ORDER BY o.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- =============================================================================
-- create_custom_design_request
-- =============================================================================
CREATE OR REPLACE FUNCTION create_custom_design_request(
  p_email         text,
  p_name          text,
  p_phone         text,
  p_fixture_type  text,
  p_adapter_type  text,
  p_design_notes  text,
  p_budget_range  text,
  p_user_id       uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO custom_design_requests (
    user_id,
    email,
    name,
    phone,
    fixture_type,
    adapter_type,
    design_notes,
    budget_range
  ) VALUES (
    p_user_id,
    p_email,
    p_name,
    p_phone,
    p_fixture_type,
    p_adapter_type,
    p_design_notes,
    p_budget_range
  )
  RETURNING custom_design_requests.id INTO v_id;

  RETURN v_id;
END;
$$;

-- =============================================================================
-- get_admin_dashboard_overview
-- Counts used by the Admin-Lite dashboard.
-- =============================================================================
CREATE OR REPLACE FUNCTION get_admin_dashboard_overview()
RETURNS TABLE (
  recent_orders_count       bigint,
  pending_pickups_count     bigint,
  new_custom_requests_count bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    SELECT
      (SELECT COUNT(*) FROM orders o WHERE o.created_at >= now() - interval '30 days') AS recent_orders_count,
      (SELECT COUNT(*) FROM orders o WHERE o.fulfilment_method = 'local_pickup' AND o.pickup_status IN ('pending', 'ready')) AS pending_pickups_count,
      (SELECT COUNT(*) FROM custom_design_requests cdr WHERE cdr.status = 'new') AS new_custom_requests_count;
END;
$$;

-- =============================================================================
-- get_custom_design_requests_admin
-- Returns custom design requests for admin review, most recent first.
-- =============================================================================
CREATE OR REPLACE FUNCTION get_custom_design_requests_admin(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_status_filter text DEFAULT NULL
)
RETURNS TABLE (
  id           uuid,
  user_id      uuid,
  email        text,
  name         text,
  phone        text,
  fixture_type text,
  adapter_type text,
  design_notes text,
  budget_range text,
  status       text,
  created_at   timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    SELECT
      cdr.id,
      cdr.user_id,
      cdr.email,
      cdr.name,
      cdr.phone,
      cdr.fixture_type,
      cdr.adapter_type,
      cdr.design_notes,
      cdr.budget_range,
      cdr.status,
      cdr.created_at
    FROM custom_design_requests cdr
    WHERE (p_status_filter IS NULL OR cdr.status = p_status_filter)
    ORDER BY cdr.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- =============================================================================
-- get_custom_design_request_by_id
-- =============================================================================
CREATE OR REPLACE FUNCTION get_custom_design_request_by_id(p_request_id uuid)
RETURNS TABLE (
  id           uuid,
  user_id      uuid,
  email        text,
  name         text,
  phone        text,
  fixture_type text,
  adapter_type text,
  design_notes text,
  budget_range text,
  status       text,
  created_at   timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    SELECT
      cdr.id,
      cdr.user_id,
      cdr.email,
      cdr.name,
      cdr.phone,
      cdr.fixture_type,
      cdr.adapter_type,
      cdr.design_notes,
      cdr.budget_range,
      cdr.status,
      cdr.created_at
    FROM custom_design_requests cdr
    WHERE cdr.id = p_request_id;
END;
$$;

-- =============================================================================
-- update_custom_design_request_status
-- All custom design request status writes must go through this procedure.
-- Valid statuses: new, reviewing, quoted, accepted, rejected, completed
-- =============================================================================
CREATE OR REPLACE FUNCTION update_custom_design_request_status(
  p_request_id uuid,
  p_new_status text
)
RETURNS TABLE (
  id           uuid,
  user_id      uuid,
  email        text,
  name         text,
  phone        text,
  fixture_type text,
  adapter_type text,
  design_notes text,
  budget_range text,
  status       text,
  created_at   timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_new_status NOT IN ('new', 'reviewing', 'quoted', 'accepted', 'rejected', 'completed') THEN
    RAISE EXCEPTION 'Invalid custom design request status: %. Must be one of: new, reviewing, quoted, accepted, rejected, completed', p_new_status;
  END IF;

  RETURN QUERY
    UPDATE custom_design_requests cdr
    SET status = p_new_status
    WHERE cdr.id = p_request_id
    RETURNING
      cdr.id,
      cdr.user_id,
      cdr.email,
      cdr.name,
      cdr.phone,
      cdr.fixture_type,
      cdr.adapter_type,
      cdr.design_notes,
      cdr.budget_range,
      cdr.status,
      cdr.created_at;
END;
$$;

COMMIT;
