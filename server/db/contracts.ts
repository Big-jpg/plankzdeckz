// server/db/contracts.ts
// PLANKZ DECKZ — Typed database contract layer.
// Route handlers call these functions; they do NOT write raw SQL.
// Each function maps to a stored procedure/function in PostgreSQL.

import { queryOne, queryRows } from "./client";

// =============================================================================
// Types
// =============================================================================

export interface Order {
  id: string;
  user_id: string | null;
  email: string;
  buyer_name: string | null;
  phone: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  status: string;
  fulfilment_method: string;
  subtotal_amount: number;
  total_amount: number;
  currency: string;
  pickup_status: string;
  created_at: string;
  updated_at: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  shopify_product_id: string | null;
  shopify_variant_id: string | null;
  title: string;
  variant_title: string | null;
  quantity: number;
  unit_amount: number;
  total_amount: number;
  image_url: string | null;
  product_type: "board" | "merch";
  board_style: "cruiser" | "surfskate" | "longboard" | null;
  merch_size: string | null;
  customisation_notes: string | null;
  material: string | null;
  colour: string | null;
  metadata: Record<string, unknown>;
}

export interface OrderSummary {
  id: string;
  email: string;
  buyer_name: string | null;
  stripe_checkout_session_id: string | null;
  status: string;
  fulfilment_method: string;
  total_amount: number;
  currency: string;
  pickup_status: string;
  created_at: string;
  item_count: number;
}

export interface StripeEventRecord {
  id: string;
  stripe_event_id: string;
  event_type: string;
  processed: boolean;
  is_new: boolean;
}

export interface PickupRequest {
  id: string;
  order_id: string;
  requested_by: string;
  preferred_date: string | null;
  preferred_time: string | null;
  status: string;
  created_at: string;
}

export interface PickupStatusResult {
  order_id: string;
  pickup_status: string;
  updated_at: string;
}

export interface CustomDesignRequest {
  id: string;
  user_id: string | null;
  email: string;
  name: string | null;
  phone: string | null;
  intended_use: string | null;
  board_style: "cruiser" | "surfskate" | "longboard" | "custom" | null;
  board_shape: string | null;
  board_length: number | null;
  board_width: number | null;
  timber_preference: string | null;
  resin_inlay_preference: string | null;
  design_notes: string;
  budget_range: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CustomBoardDesign {
  id: string;
  customer_id: string | null;
  customer_email?: string | null;
  customer_name?: string | null;
  board_shape: string;
  board_length: number;
  board_width: number;
  truck_positions: unknown;
  resin_inlay_config: unknown;
  timber_preference: string | null;
  notes: string | null;
  status: string;
  configurator_payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AdminDashboardOverview {
  recent_orders_count: number;
  pending_pickups_count: number;
  new_custom_requests_count: number;
  pending_board_designs_count: number;
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  email_verified: string | null;
  image: string | null;
}

export interface Session {
  session_id: string;
  session_token: string;
  session_expires: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  email_verified: string | null;
  user_image: string | null;
}

export interface VerificationToken {
  identifier: string;
  token: string;
  expires: string;
}

// =============================================================================
// Order Contracts
// =============================================================================

export interface CreateOrderParams {
  email: string;
  buyer_name: string | null;
  phone: string | null;
  stripe_checkout_session_id: string;
  stripe_payment_intent_id: string | null;
  status: string;
  fulfilment_method: string;
  subtotal_amount: number;
  total_amount: number;
  currency: string;
  user_id?: string | null;
}

export interface CreateOrderResult {
  id: string;
  email: string;
  buyer_name: string | null;
  stripe_checkout_session_id: string;
  status: string;
  created_at: string;
  is_new: boolean;
}

/**
 * Create an order from a Stripe checkout session.
 * Idempotent: returns existing order if session ID already exists.
 */
export async function createOrderFromStripeSession(
  params: CreateOrderParams,
): Promise<CreateOrderResult | null> {
  return queryOne<CreateOrderResult>(
    `SELECT * FROM create_order_from_stripe_session($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      params.email,
      params.buyer_name,
      params.phone,
      params.stripe_checkout_session_id,
      params.stripe_payment_intent_id,
      params.status,
      params.fulfilment_method,
      params.subtotal_amount,
      params.total_amount,
      params.currency,
      params.user_id ?? null,
    ],
  );
}

export interface CreateOrderItemParams {
  order_id: string;
  shopify_product_id: string | null;
  shopify_variant_id: string | null;
  title: string;
  variant_title: string | null;
  quantity: number;
  unit_amount: number;
  total_amount: number;
  image_url: string | null;
  product_type: "board" | "merch";
  board_style: "cruiser" | "surfskate" | "longboard" | null;
  merch_size: string | null;
  customisation_notes: string | null;
  material: string | null;
  colour: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Insert a single board or merch order item.
 * The metadata field carries source catalogue and checkout metadata that does
 * not deserve a first-class order_items column.
 */
export async function createOrderItem(params: CreateOrderItemParams): Promise<string | null> {
  const result = await queryOne<{ create_order_item: string }>(
    `SELECT create_order_item($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
    [
      params.order_id,
      params.shopify_product_id,
      params.shopify_variant_id,
      params.title,
      params.variant_title,
      params.quantity,
      params.unit_amount,
      params.total_amount,
      params.image_url,
      params.product_type,
      params.board_style,
      params.merch_size,
      params.customisation_notes,
      params.material,
      params.colour,
      JSON.stringify(params.metadata ?? {}),
    ],
  );
  return result?.create_order_item ?? null;
}

// =============================================================================
// Stripe Event Contracts
// =============================================================================

/**
 * Record a raw Stripe webhook event. Idempotent.
 */
export async function recordStripeEvent(
  stripeEventId: string,
  eventType: string,
  payload: unknown,
): Promise<StripeEventRecord | null> {
  return queryOne<StripeEventRecord>(`SELECT * FROM record_stripe_event($1, $2, $3)`, [
    stripeEventId,
    eventType,
    JSON.stringify(payload),
  ]);
}

/**
 * Mark a Stripe event as processed.
 */
export async function markStripeEventProcessed(stripeEventId: string): Promise<boolean> {
  const result = await queryOne<{ mark_stripe_event_processed: boolean }>(
    `SELECT mark_stripe_event_processed($1)`,
    [stripeEventId],
  );
  return result?.mark_stripe_event_processed ?? false;
}

// =============================================================================
// Pickup Contracts
// =============================================================================

export interface CreatePickupRequestParams {
  order_id: string;
  requested_by: string;
  preferred_date?: string | null;
  preferred_time?: string | null;
  notes?: string | null;
}

/**
 * Create a pickup request for an order.
 */
export async function createPickupRequest(
  params: CreatePickupRequestParams,
): Promise<PickupRequest | null> {
  return queryOne<PickupRequest>(`SELECT * FROM create_pickup_request($1, $2, $3, $4, $5)`, [
    params.order_id,
    params.requested_by,
    params.preferred_date ?? null,
    params.preferred_time ?? null,
    params.notes ?? null,
  ]);
}

/**
 * Update pickup status on an order.
 * Valid statuses: pending, ready, collected, cancelled
 */
export async function updatePickupStatus(
  orderId: string,
  newStatus: string,
): Promise<PickupStatusResult | null> {
  return queryOne<PickupStatusResult>(`SELECT * FROM update_pickup_status($1, $2)`, [
    orderId,
    newStatus,
  ]);
}

// =============================================================================
// Custom Design Request Contracts
// =============================================================================

export interface CreateCustomDesignRequestParams {
  email: string;
  name: string | null;
  phone: string | null;
  intended_use: string | null;
  board_style: "cruiser" | "surfskate" | "longboard" | "custom" | null;
  board_shape: string | null;
  board_length: number | null;
  board_width: number | null;
  timber_preference: string | null;
  resin_inlay_preference: string | null;
  design_notes: string;
  budget_range: string | null;
  user_id?: string | null;
}

/**
 * Insert a custom board request.
 */
export async function createCustomDesignRequest(
  params: CreateCustomDesignRequestParams,
): Promise<string | null> {
  const result = await queryOne<{ create_custom_design_request: string }>(
    `SELECT create_custom_design_request($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      params.email,
      params.name,
      params.phone,
      params.intended_use,
      params.board_style,
      params.board_shape,
      params.board_length,
      params.board_width,
      params.timber_preference,
      params.resin_inlay_preference,
      params.design_notes,
      params.budget_range,
      params.user_id ?? null,
    ],
  );
  return result?.create_custom_design_request ?? null;
}

/**
 * Retrieve custom design requests for admin review.
 */
export async function getCustomDesignRequestsAdmin(
  limit = 50,
  offset = 0,
  statusFilter: string | null = null,
): Promise<CustomDesignRequest[]> {
  return queryRows<CustomDesignRequest>(
    `SELECT * FROM get_custom_design_requests_admin($1, $2, $3)`,
    [limit, offset, statusFilter],
  );
}

/**
 * Retrieve one custom design request by ID for admin mutation context.
 */
export async function getCustomDesignRequestById(
  requestId: string,
): Promise<CustomDesignRequest | null> {
  return queryOne<CustomDesignRequest>(`SELECT * FROM get_custom_design_request_by_id($1)`, [
    requestId,
  ]);
}

/**
 * Update a custom design request status through the stored procedure.
 * Valid statuses: new, reviewing, quoted, accepted, rejected, completed
 */
export async function updateCustomDesignRequestStatus(
  requestId: string,
  newStatus: string,
): Promise<CustomDesignRequest | null> {
  return queryOne<CustomDesignRequest>(
    `SELECT * FROM update_custom_design_request_status($1, $2)`,
    [requestId, newStatus],
  );
}

export interface CreateCustomBoardDesignParams {
  customer_id: string | null;
  board_shape: string;
  board_length: number;
  board_width: number;
  truck_positions: unknown;
  resin_inlay_config: unknown;
  timber_preference: string | null;
  notes: string | null;
  status?: string | null;
  configurator_payload?: Record<string, unknown> | null;
}

/**
 * Persist a Phase 5 custom board configurator design.
 */
export async function createCustomBoardDesign(
  params: CreateCustomBoardDesignParams,
): Promise<string | null> {
  const result = await queryOne<{ create_custom_board_design: string }>(
    `SELECT create_custom_board_design($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      params.customer_id,
      params.board_shape,
      params.board_length,
      params.board_width,
      JSON.stringify(params.truck_positions ?? []),
      JSON.stringify(params.resin_inlay_config ?? {}),
      params.timber_preference,
      params.notes,
      params.status ?? "submitted",
      JSON.stringify(params.configurator_payload ?? {}),
    ],
  );
  return result?.create_custom_board_design ?? null;
}

export async function updateCustomBoardDesignStatus(
  designId: string,
  newStatus: string,
): Promise<CustomBoardDesign | null> {
  return queryOne<CustomBoardDesign>(`SELECT * FROM update_custom_board_design_status($1, $2)`, [
    designId,
    newStatus,
  ]);
}

export async function getCustomBoardDesignsAdmin(
  limit = 50,
  offset = 0,
  statusFilter: string | null = null,
): Promise<CustomBoardDesign[]> {
  return queryRows<CustomBoardDesign>(`SELECT * FROM get_custom_board_designs_admin($1, $2, $3)`, [
    limit,
    offset,
    statusFilter,
  ]);
}

// =============================================================================
// Buyer Event Contracts
// =============================================================================

export interface RecordBuyerEventParams {
  event_type: string;
  event_data: Record<string, unknown>;
  email?: string | null;
  user_id?: string | null;
  order_id?: string | null;
}

/**
 * Record a buyer analytics event.
 */
export async function recordBuyerEvent(params: RecordBuyerEventParams): Promise<string | null> {
  const result = await queryOne<{ record_buyer_event: string }>(
    `SELECT record_buyer_event($1, $2, $3, $4, $5)`,
    [
      params.event_type,
      JSON.stringify(params.event_data),
      params.email ?? null,
      params.user_id ?? null,
      params.order_id ?? null,
    ],
  );
  return result?.record_buyer_event ?? null;
}

// =============================================================================
// Order Query Contracts
// =============================================================================

/**
 * Retrieve admin dashboard counts.
 */
export async function getAdminDashboardOverview(): Promise<AdminDashboardOverview | null> {
  return queryOne<AdminDashboardOverview>(`SELECT * FROM get_admin_dashboard_overview()`);
}

/**
 * Retrieve a single order with its items.
 */
export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  const row = await queryOne<Order & { items: OrderItem[] | string }>(
    `SELECT * FROM get_order_by_id($1)`,
    [orderId],
  );
  if (!row) return null;

  // items comes back as jsonb; pg driver may return it as parsed or string
  const items = typeof row.items === "string" ? (JSON.parse(row.items) as OrderItem[]) : row.items;

  return { ...row, items };
}

/**
 * Retrieve a single order with its items by Stripe checkout session ID.
 */
export async function getOrderByCheckoutSession(
  stripeCheckoutSessionId: string,
): Promise<OrderWithItems | null> {
  const row = await queryOne<Order & { items: OrderItem[] | string }>(
    `SELECT * FROM get_order_by_checkout_session($1)`,
    [stripeCheckoutSessionId],
  );
  if (!row) return null;

  // items comes back as jsonb; pg driver may return it as parsed or string
  const items = typeof row.items === "string" ? (JSON.parse(row.items) as OrderItem[]) : row.items;

  return { ...row, items };
}

/**
 * Retrieve all orders for a given email address.
 */
export async function getOrdersForEmail(
  email: string,
  limit = 50,
  offset = 0,
): Promise<OrderSummary[]> {
  return queryRows<OrderSummary>(`SELECT * FROM get_orders_for_email($1, $2, $3)`, [
    email,
    limit,
    offset,
  ]);
}

/**
 * Retrieve recent orders for admin dashboard.
 */
export async function getRecentOrdersAdmin(
  limit = 50,
  offset = 0,
  statusFilter: string | null = null,
): Promise<OrderSummary[]> {
  return queryRows<OrderSummary>(`SELECT * FROM get_recent_orders_admin($1, $2, $3)`, [
    limit,
    offset,
    statusFilter,
  ]);
}

// =============================================================================
// Auth Contracts
// =============================================================================

export interface CreateUserParams {
  name: string | null;
  email: string;
  email_verified?: string | null;
  image?: string | null;
}

export async function createUser(params: CreateUserParams): Promise<User | null> {
  return queryOne<User>(`SELECT * FROM create_user($1, $2, $3, $4)`, [
    params.name,
    params.email,
    params.email_verified ?? null,
    params.image ?? null,
  ]);
}

export async function getUserById(userId: string): Promise<User | null> {
  return queryOne<User>(`SELECT * FROM get_user_by_id($1)`, [userId]);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return queryOne<User>(`SELECT * FROM get_user_by_email($1)`, [email]);
}

export interface LinkAccountParams {
  user_id: string;
  type: string;
  provider: string;
  provider_account_id: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
}

export async function linkAccount(params: LinkAccountParams): Promise<string | null> {
  const result = await queryOne<{ link_account: string }>(
    `SELECT link_account($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      params.user_id,
      params.type,
      params.provider,
      params.provider_account_id,
      params.refresh_token ?? null,
      params.access_token ?? null,
      params.expires_at ?? null,
      params.token_type ?? null,
      params.scope ?? null,
      params.id_token ?? null,
      params.session_state ?? null,
    ],
  );
  return result?.link_account ?? null;
}

export async function createSession(
  sessionToken: string,
  userId: string,
  expires: string,
): Promise<Session | null> {
  return queryOne<Session>(`SELECT * FROM create_session($1, $2, $3)`, [
    sessionToken,
    userId,
    expires,
  ]);
}

export async function getSessionAndUser(sessionToken: string): Promise<Session | null> {
  return queryOne<Session>(`SELECT * FROM get_session_and_user($1)`, [sessionToken]);
}

export async function deleteSession(sessionToken: string): Promise<boolean> {
  const result = await queryOne<{ delete_session: boolean }>(`SELECT delete_session($1)`, [
    sessionToken,
  ]);
  return result?.delete_session ?? false;
}

export async function createVerificationToken(
  identifier: string,
  token: string,
  expires: string,
): Promise<VerificationToken | null> {
  return queryOne<VerificationToken>(`SELECT * FROM create_verification_token($1, $2, $3)`, [
    identifier,
    token,
    expires,
  ]);
}

export async function useVerificationToken(
  identifier: string,
  token: string,
): Promise<VerificationToken | null> {
  return queryOne<VerificationToken>(`SELECT * FROM use_verification_token($1, $2)`, [
    identifier,
    token,
  ]);
}

export interface UpdateUserParams {
  user_id: string;
  name?: string | null;
  email?: string | null;
  email_verified?: string | null;
  image?: string | null;
}

export async function updateUser(params: UpdateUserParams): Promise<User | null> {
  return queryOne<User>(`SELECT * FROM update_user($1, $2, $3, $4, $5)`, [
    params.user_id,
    params.name ?? null,
    params.email ?? null,
    params.email_verified ?? null,
    params.image ?? null,
  ]);
}

export async function deleteUser(userId: string): Promise<boolean> {
  const result = await queryOne<{ delete_user: boolean }>(`SELECT delete_user($1)`, [userId]);
  return result?.delete_user ?? false;
}
