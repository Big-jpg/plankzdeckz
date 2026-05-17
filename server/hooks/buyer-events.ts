// server/hooks/buyer-events.ts
// PLANKZ DECKZ — Buyer event hooks and operational notification stubs.

import { recordBuyerEvent } from "@/server/db/contracts";

export type BuyerEventType =
  | "cart_created"
  | "checkout_started"
  | "payment_confirmed"
  | "order_created"
  | "adapter_selected"
  | "pickup_requested"
  | "order_ready_for_pickup"
  | "order_collected"
  | "custom_design_requested"
  | "custom_design_status_updated";

export interface BuyerHookResult {
  eventId: string | null;
  eventType: BuyerEventType;
  timestamp: string;
}

interface BuyerHookContext {
  eventType: BuyerEventType;
  email?: string | null;
  phone?: string | null;
  userId?: string | null;
  orderId?: string | null;
  payload?: object;
  sendShopifyOrderSync?: boolean;
}

export interface OnCartCreatedParams {
  cart_id?: string | null;
  email?: string | null;
  phone?: string | null;
  user_id?: string | null;
  product_id?: string | null;
  product_handle?: string | null;
  product_title?: string | null;
  selected_adapter?: string | null;
  item_count?: number | null;
  currency?: string | null;
  subtotal_amount?: number | null;
}

export interface OnCheckoutStartedParams {
  stripe_checkout_session_id: string;
  email?: string | null;
  phone?: string | null;
  user_id?: string | null;
  item_count: number;
  subtotal_amount: number;
  total_amount: number;
  currency: string;
  board_handles: string[];
  merch_items: string[];
  cart_fingerprint: string;
}

export interface OnPaymentConfirmedParams {
  order_id?: string | null;
  stripe_checkout_session_id: string;
  stripe_payment_intent_id?: string | null;
  email?: string | null;
  phone?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  payment_status?: string | null;
}

export interface OnOrderCreatedParams {
  order_id: string;
  email: string;
  phone?: string | null;
  user_id?: string | null;
  stripe_checkout_session_id?: string | null;
  stripe_payment_intent_id?: string | null;
  status: string;
  total_amount: number;
  currency: string;
  item_count?: number | null;
}

export interface OnAdapterSelectedParams {
  email?: string | null;
  phone?: string | null;
  user_id?: string | null;
  product_id?: string | null;
  product_handle?: string | null;
  product_title?: string | null;
  adapter_type: string;
}

export interface OnPickupRequestedParams {
  order_id: string;
  pickup_request_id?: string | null;
  email?: string | null;
  phone?: string | null;
  user_id?: string | null;
  requested_by?: string | null;
  preferred_date?: string | null;
  preferred_time?: string | null;
}

export interface OnPickupStatusParams {
  order_id: string;
  email?: string | null;
  phone?: string | null;
  user_id?: string | null;
  pickup_status?: string | null;
}

export interface OnCustomDesignRequestedParams {
  custom_design_request_id: string;
  email: string;
  phone?: string | null;
  user_id?: string | null;
  name?: string | null;
  fixture_type?: string | null;
  adapter_type?: string | null;
  desired_shade_style?: string | null;
  dimensions?: string | null;
  colour_material_preference?: string | null;
}

export interface OnCustomDesignStatusChangedParams {
  custom_design_request_id: string;
  email: string;
  phone?: string | null;
  user_id?: string | null;
  previous_status?: string | null;
  status: string;
  name?: string | null;
  fixture_type?: string | null;
  adapter_type?: string | null;
}

function normalizePayload(payload: object | undefined): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(payload ?? {}).filter(([, value]) => value !== undefined),
  );
}

function logJson(payload: Record<string, unknown>): void {
  console.log(JSON.stringify(payload));
}

async function runBuyerHook({
  eventType,
  email = null,
  phone = null,
  userId = null,
  orderId = null,
  payload,
  sendShopifyOrderSync = false,
}: BuyerHookContext): Promise<BuyerHookResult> {
  const timestamp = new Date().toISOString();
  const eventData = {
    ...normalizePayload(payload),
    hook_name: eventType,
    timestamp,
  };

  const logPayload = {
    level: "info",
    subsystem: "buyer_hooks",
    event_type: eventType,
    timestamp,
    user_id: userId,
    order_id: orderId,
    email,
    phone,
    payload: eventData,
  };

  try {
    const eventId = await recordBuyerEvent({
      event_type: eventType,
      event_data: eventData,
      email,
      user_id: userId,
      order_id: orderId,
    });

    logJson({ ...logPayload, buyer_event_id: eventId });
    console.log(`EMAIL STUB: would send ${eventType} to ${email ?? "unknown email"}`);
    console.log(`SMS STUB: would send ${eventType} to ${phone ?? "unknown phone"}`);

    if (sendShopifyOrderSync && orderId) {
      console.log(`SHOPIFY SYNC STUB: would sync order ${orderId}`);
    }

    return { eventId, eventType, timestamp };
  } catch (error) {
    logJson({
      ...logPayload,
      level: "error",
      error: error instanceof Error ? error.message : "Buyer hook failed.",
    });

    return { eventId: null, eventType, timestamp };
  }
}

export function onCartCreated(params: OnCartCreatedParams): Promise<BuyerHookResult> {
  return runBuyerHook({
    eventType: "cart_created",
    email: params.email,
    phone: params.phone,
    userId: params.user_id,
    payload: params,
  });
}

export function onCheckoutStarted(params: OnCheckoutStartedParams): Promise<BuyerHookResult> {
  return runBuyerHook({
    eventType: "checkout_started",
    email: params.email,
    phone: params.phone,
    userId: params.user_id,
    payload: params,
  });
}

export function onPaymentConfirmed(params: OnPaymentConfirmedParams): Promise<BuyerHookResult> {
  return runBuyerHook({
    eventType: "payment_confirmed",
    email: params.email,
    phone: params.phone,
    orderId: params.order_id,
    payload: params,
    sendShopifyOrderSync: Boolean(params.order_id),
  });
}

export function onOrderCreated(params: OnOrderCreatedParams): Promise<BuyerHookResult> {
  return runBuyerHook({
    eventType: "order_created",
    email: params.email,
    phone: params.phone,
    userId: params.user_id,
    orderId: params.order_id,
    payload: params,
    sendShopifyOrderSync: true,
  });
}

export function onAdapterSelected(params: OnAdapterSelectedParams): Promise<BuyerHookResult> {
  return runBuyerHook({
    eventType: "adapter_selected",
    email: params.email,
    phone: params.phone,
    userId: params.user_id,
    payload: params,
  });
}

export function onPickupRequested(params: OnPickupRequestedParams): Promise<BuyerHookResult> {
  return runBuyerHook({
    eventType: "pickup_requested",
    email: params.email,
    phone: params.phone,
    userId: params.user_id,
    orderId: params.order_id,
    payload: params,
    sendShopifyOrderSync: true,
  });
}

export function onOrderReadyForPickup(params: OnPickupStatusParams): Promise<BuyerHookResult> {
  return runBuyerHook({
    eventType: "order_ready_for_pickup",
    email: params.email,
    phone: params.phone,
    userId: params.user_id,
    orderId: params.order_id,
    payload: params,
    sendShopifyOrderSync: true,
  });
}

export function onOrderCollected(params: OnPickupStatusParams): Promise<BuyerHookResult> {
  return runBuyerHook({
    eventType: "order_collected",
    email: params.email,
    phone: params.phone,
    userId: params.user_id,
    orderId: params.order_id,
    payload: params,
    sendShopifyOrderSync: true,
  });
}

export function onCustomDesignRequested(
  params: OnCustomDesignRequestedParams,
): Promise<BuyerHookResult> {
  return runBuyerHook({
    eventType: "custom_design_requested",
    email: params.email,
    phone: params.phone,
    userId: params.user_id,
    payload: params,
  });
}

export function onCustomDesignStatusChanged(
  params: OnCustomDesignStatusChangedParams,
): Promise<BuyerHookResult> {
  return runBuyerHook({
    eventType: "custom_design_status_updated",
    email: params.email,
    phone: params.phone,
    userId: params.user_id,
    payload: params,
  });
}
