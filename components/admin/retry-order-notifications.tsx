"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function RetryOrderNotifications({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  return (
    <div className="mt-4">
      <button
        type="button"
        disabled={pending}
        className="rounded-lg bg-charcoal px-4 py-2 text-sm font-semibold text-warm-white disabled:opacity-50"
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            try {
              const response = await fetch(`/api/admin/orders/${orderId}/notifications/retry`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: "{}",
              });
              const result = await response.json();
              setMessage(
                response.ok
                  ? "Email attempt finished. Check the status below; inbox delivery is not confirmed."
                  : (result.error ?? "Email retry failed."),
              );
              router.refresh();
            } catch {
              setMessage("Email status is unknown. Refresh the order before retrying.");
            }
          });
        }}
      >
        {pending ? "Attempting email…" : "Retry pending or failed emails"}
      </button>
      {message ? (
        <p role="status" className="mt-2 text-sm text-charcoal/70">
          {message}
        </p>
      ) : null}
    </div>
  );
}
