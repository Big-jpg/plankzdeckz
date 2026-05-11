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
  type ReactNode,
} from "react";
import {
  type CartItem,
  type CartState,
  EMPTY_CART,
  CART_STORAGE_KEY,
  cartItemKey,
} from "./cart-types";

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type CartAction =
  | { type: "HYDRATE"; payload: CartState }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { key: string } }
  | { type: "SET_QUANTITY"; payload: { key: string; quantity: number } }
  | { type: "SET_LED_ACKNOWLEDGED"; payload: boolean }
  | { type: "CLEAR_CART" };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;

    case "ADD_ITEM": {
      const newItem = action.payload;
      const key = cartItemKey(newItem);
      const existing = state.items.findIndex((i) => cartItemKey(i) === key);
      if (existing >= 0) {
        const updated = [...state.items];
        updated[existing] = {
          ...updated[existing],
          quantity: updated[existing].quantity + newItem.quantity,
          // Update notes in case the customer changed them
          fixtureNotes: newItem.fixtureNotes || updated[existing].fixtureNotes,
          customisationNotes: newItem.customisationNotes || updated[existing].customisationNotes,
        };
        return { ...state, items: updated };
      }
      return { ...state, items: [...state.items, newItem] };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => cartItemKey(i) !== action.payload.key),
      };

    case "SET_QUANTITY": {
      const { key, quantity } = action.payload;
      if (quantity < 1) {
        return {
          ...state,
          items: state.items.filter((i) => cartItemKey(i) !== key),
        };
      }
      return {
        ...state,
        items: state.items.map((i) => (cartItemKey(i) === key ? { ...i, quantity } : i)),
      };
    }

    case "SET_LED_ACKNOWLEDGED":
      return { ...state, ledAcknowledged: action.payload };

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
  /** Total number of items (sum of quantities). */
  itemCount: number;
  /** Subtotal in the cart's currency (assumes single currency). */
  subtotal: number;
  /** Currency code from the first item, or "AUD" as default. */
  currency: string;
  addItem: (item: CartItem) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  setLedAcknowledged: (value: boolean) => void;
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
  const [drawerOpen, setDrawerOpen] = useReducer((_: boolean, next: boolean) => next, false);

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

  const addItem = useCallback((item: CartItem) => {
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

  const setLedAcknowledged = useCallback(
    (value: boolean) => dispatch({ type: "SET_LED_ACKNOWLEDGED", payload: value }),
    [],
  );

  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const itemCount = useMemo(
    () => state.items.reduce((sum, i) => sum + i.quantity, 0),
    [state.items],
  );

  const subtotal = useMemo(
    () => state.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [state.items],
  );

  const currency = state.items[0]?.currency ?? "AUD";

  const value = useMemo<CartContextValue>(
    () => ({
      state,
      itemCount,
      subtotal,
      currency,
      addItem,
      removeItem,
      setQuantity,
      setLedAcknowledged,
      clearCart,
      drawerOpen,
      openDrawer,
      closeDrawer,
    }),
    [
      state,
      itemCount,
      subtotal,
      currency,
      addItem,
      removeItem,
      setQuantity,
      setLedAcknowledged,
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
