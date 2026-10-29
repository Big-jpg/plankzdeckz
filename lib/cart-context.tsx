// lib/cart-context.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  type CartItem,
  type CartState,
  type CartQuote,
  EMPTY_CART,
  CART_STORAGE_KEY,
  cartItemKey,
} from "./cart-types";
import { SALES_ENABLED } from "./commerce-config";

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type CartAction =
  | { type: "HYDRATE"; payload: CartState }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { key: string } }
  | { type: "SET_QUANTITY"; payload: { key: string; quantity: number } }
  | { type: "CLEAR_CART" };

// ---------------------------------------------------------------------------
// Reducer helpers
// ---------------------------------------------------------------------------

function itemQuantity(item: CartItem, requestedQuantity: number): number {
  if ((item.productType ?? "board") === "board") return 1;
  return Math.max(1, requestedQuantity);
}

function normaliseItem(item: CartItem): CartItem {
  return {
    ...item,
    quantity: itemQuantity(item, item.quantity),
  };
}

function normaliseState(state: CartState): CartState {
  return {
    items: Array.isArray(state.items) ? state.items.map(normaliseItem) : [],
  };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return normaliseState(action.payload);

    case "ADD_ITEM": {
      const newItem = normaliseItem(action.payload);
      const key = cartItemKey(newItem);
      const existing = state.items.findIndex((item) => cartItemKey(item) === key);

      if (existing >= 0) {
        const updated = [...state.items];
        updated[existing] = {
          ...updated[existing],
          quantity:
            (updated[existing].productType ?? "board") === "board"
              ? 1
              : updated[existing].quantity + newItem.quantity,
        };
        return { ...state, items: updated };
      }

      return { ...state, items: [...state.items, newItem] };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => cartItemKey(item) !== action.payload.key),
      };

    case "SET_QUANTITY": {
      const { key, quantity } = action.payload;
      if (quantity < 1) {
        return {
          ...state,
          items: state.items.filter((item) => cartItemKey(item) !== key),
        };
      }

      return {
        ...state,
        items: state.items.map((item) =>
          cartItemKey(item) === key ? { ...item, quantity: itemQuantity(item, quantity) } : item,
        ),
      };
    }

    case "CLEAR_CART":
      return EMPTY_CART;

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context value
// ---------------------------------------------------------------------------

interface CartContextValue {
  state: CartState;
  isHydrated: boolean;
  /** Total number of items (sum of quantities). */
  itemCount: number;
  /** Subtotal in the cart's currency (assumes single currency). */
  subtotal: number;
  /** Currency code from the first item, or "AUD" as default. */
  currency: string;
  /** Current server quote; never reused after cart contents change. */
  quote: CartQuote | null;
  quoteStatus: "idle" | "loading" | "ready" | "error";
  quoteError: string | null;
  retryQuote: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  /** Whether the mini-cart drawer is open. */
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, EMPTY_CART);
  const hydrated = useRef(false);
  const [isHydrated, markHydrated] = useReducer(() => true, false);
  const [drawerOpen, setDrawerOpen] = useReducer((_: boolean, next: boolean) => next, false);
  const [quoteRevision, refreshQuote] = useReducer((revision: number) => revision + 1, 0);
  const [quoteResult, setQuoteResult] = useState<{
    key: string;
    items: CartState["items"];
    quote: CartQuote | null;
    error: string | null;
  } | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartState;
        if (parsed && Array.isArray(parsed.items)) {
          dispatch({ type: "HYDRATE", payload: parsed });
        }
      }
    } catch {
      // Corrupted storage — start fresh
    }
    hydrated.current = true;
    markHydrated();
  }, []);

  // Persist to localStorage on every state change (after hydration)
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or unavailable — silent fail
    }
  }, [state]);

  const cartBody = JSON.stringify({ items: state.items });
  const quoteKey = `${quoteRevision}:${cartBody}`;
  const needsQuote = SALES_ENABLED && isHydrated && state.items.length > 0;

  useEffect(() => {
    if (!needsQuote) return;
    const controller = new AbortController();
    async function loadQuote() {
      try {
        const response = await fetch("/api/cart/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: cartBody,
          signal: controller.signal,
        });
        const payload = await response.json();
        if (!response.ok || payload.valid !== true) {
          throw new Error(
            payload.errors?.find((error: { message?: string }) => error.message)?.message ??
              "Your cart could not be priced. Please review its items and try again.",
          );
        }
        if (
          ![payload.verifiedSubtotal, payload.retailSubtotal, payload.discountAmount].every(
            (amount) => typeof amount === "number" && Number.isFinite(amount) && amount >= 0,
          ) ||
          payload.currency !== "AUD" ||
          !Array.isArray(payload.lineQuotes)
        ) {
          throw new Error("The cart price could not be confirmed. Please try again.");
        }
        if (!controller.signal.aborted) {
          setQuoteResult({
            key: quoteKey,
            items: state.items,
            quote: payload as CartQuote,
            error: null,
          });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setQuoteResult({
            key: quoteKey,
            items: state.items,
            quote: null,
            error: error instanceof Error ? error.message : "Your cart price could not be loaded.",
          });
        }
      }
    }
    void loadQuote();
    return () => controller.abort();
  }, [needsQuote, cartBody, quoteKey, state.items]);

  const currentQuote =
    needsQuote && quoteResult?.key === quoteKey && quoteResult.items === state.items
      ? quoteResult
      : null;
  const quote = currentQuote?.quote ?? null;
  const quoteError = currentQuote?.error ?? null;
  const quoteStatus = !needsQuote ? "idle" : !currentQuote ? "loading" : quote ? "ready" : "error";
  const retryQuote = useCallback(() => refreshQuote(), []);

  const addItem = useCallback((item: CartItem) => {
    if (!SALES_ENABLED) return;
    dispatch({ type: "ADD_ITEM", payload: item });
    setDrawerOpen(true);
  }, []);

  const removeItem = useCallback(
    (key: string) => dispatch({ type: "REMOVE_ITEM", payload: { key } }),
    [],
  );

  const setQuantity = useCallback(
    (key: string, quantity: number) =>
      dispatch({ type: "SET_QUANTITY", payload: { key, quantity } }),
    [],
  );

  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);

  const openDrawer = useCallback(() => {
    if (SALES_ENABLED) setDrawerOpen(true);
  }, []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const itemCount = useMemo(
    () => state.items.reduce((sum, item) => sum + item.quantity, 0),
    [state.items],
  );

  const subtotal = useMemo(
    () => state.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [state.items],
  );

  const currency = state.items[0]?.currency ?? "AUD";

  const value = useMemo<CartContextValue>(
    () => ({
      state,
      isHydrated,
      itemCount,
      subtotal,
      currency,
      quote,
      quoteStatus,
      quoteError,
      retryQuote,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      drawerOpen,
      openDrawer,
      closeDrawer,
    }),
    [
      state,
      isHydrated,
      itemCount,
      subtotal,
      currency,
      quote,
      quoteStatus,
      quoteError,
      retryQuote,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      drawerOpen,
      openDrawer,
      closeDrawer,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a <CartProvider>");
  }
  return ctx;
}
