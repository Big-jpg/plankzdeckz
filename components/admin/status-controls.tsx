// components/admin/status-controls.tsx
// Client controls for Admin-Lite status mutations.

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const PICKUP_STATUSES = ["pending", "ready", "collected", "cancelled"] as const;
const CUSTOM_REQUEST_STATUSES = [
  "new",
  "reviewing",
  "quoted",
  "accepted",
  "rejected",
  "completed",
] as const;

type StatusControlProps = {
  id: string;
  currentStatus: string;
};

function labelFor(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " ");
}

async function postStatus(url: string, body: Record<string, string>) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => null)) as { error?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "Status update failed.");
  }
}

export function PickupStatusControl({ id, currentStatus }: StatusControlProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3 rounded-xl border border-charcoal/10 bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage(null);
        startTransition(async () => {
          try {
            await postStatus(`/api/admin/orders/${id}/pickup-status`, { pickup_status: status });
            setMessage("Pickup status updated.");
            router.refresh();
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "Pickup status update failed.");
          }
        });
      }}
    >
      <label className="block text-sm font-semibold text-charcoal" htmlFor="pickup_status">
        Pickup status
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          id="pickup_status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="min-h-11 rounded-lg border border-charcoal/15 bg-ivory px-3 text-sm text-charcoal outline-none transition focus:border-amber"
        >
          {PICKUP_STATUSES.map((option) => (
            <option key={option} value={option}>
              {labelFor(option)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isPending || status === currentStatus}
          className="rounded-lg bg-charcoal px-4 py-2 text-sm font-semibold text-warm-white transition hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Updating..." : "Update pickup"}
        </button>
      </div>
      {message ? <p className="text-sm text-charcoal/70">{message}</p> : null}
    </form>
  );
}

export function CustomRequestStatusControl({ id, currentStatus }: StatusControlProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3 rounded-xl border border-charcoal/10 bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage(null);
        startTransition(async () => {
          try {
            await postStatus(`/api/admin/custom-requests/${id}/status`, { status });
            setMessage("Custom request status updated.");
            router.refresh();
          } catch (error) {
            setMessage(
              error instanceof Error ? error.message : "Custom request status update failed.",
            );
          }
        });
      }}
    >
      <label className="block text-sm font-semibold text-charcoal" htmlFor={`custom_status_${id}`}>
        Request status
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          id={`custom_status_${id}`}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="min-h-11 rounded-lg border border-charcoal/15 bg-ivory px-3 text-sm text-charcoal outline-none transition focus:border-amber"
        >
          {CUSTOM_REQUEST_STATUSES.map((option) => (
            <option key={option} value={option}>
              {labelFor(option)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isPending || status === currentStatus}
          className="rounded-lg bg-charcoal px-4 py-2 text-sm font-semibold text-warm-white transition hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Updating..." : "Update status"}
        </button>
      </div>
      {message ? <p className="text-sm text-charcoal/70">{message}</p> : null}
    </form>
  );
}
