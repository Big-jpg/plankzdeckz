"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function PaymentReconcileControl({
  orderId,
  attemptId,
}: {
  orderId?: string;
  attemptId?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function reconcile() {
    setBusy(true);
    setError("");
    try {
      const url = attemptId
        ? `/api/admin/checkout-attempts/${attemptId}/reconcile`
        : `/api/admin/orders/${orderId}/reconcile`;
      const response = await fetch(url, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Reconciliation failed.");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Reconciliation failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={reconcile}
        className="rounded-lg border border-charcoal/20 px-3 py-2 text-sm disabled:opacity-50"
      >
        {busy ? "Checking Stripe…" : attemptId ? "Reconcile checkout" : "Refresh refund status"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
