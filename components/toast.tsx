// components/toast.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  /** Auto-dismiss duration in ms. Default 3000. */
  duration?: number;
}

export function Toast({ message, visible, onClose, duration = 3000 }: ToastProps) {
  const [show, setShow] = useState(false);
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (enterTimer.current) clearTimeout(enterTimer.current);
    if (exitTimer.current) clearTimeout(exitTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    if (!visible) return;

    clearTimers();

    enterTimer.current = setTimeout(() => setShow(true), 10);
    exitTimer.current = setTimeout(() => {
      setShow(false);
      closeTimer.current = setTimeout(onClose, 300);
    }, duration);

    return clearTimers;
  }, [visible, duration, onClose, clearTimers]);

  const handleDismiss = useCallback(() => {
    clearTimers();
    setShow(false);
    closeTimer.current = setTimeout(onClose, 300);
  }, [onClose, clearTimers]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-lg border border-charcoal/10 bg-warm-white px-4 py-3 shadow-lg transition-all duration-300",
        show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      )}
    >
      <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
      <p className="text-sm font-medium text-charcoal">{message}</p>
      <button
        type="button"
        onClick={handleDismiss}
        className="ml-2 rounded p-1 text-charcoal/40 transition-colors hover:text-charcoal"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
