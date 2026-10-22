"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { MarketSaleRecord } from "@/server/commerce/market-sales";

export interface MarketProductOption {
  id: string;
  title: string;
  productType: string;
  publicationStatus: string;
  stockQuantity: number;
  stockBySize: Record<string, number>;
  priceAmount: number;
}

interface Line {
  key: string;
  productId: string;
  size: string;
  quantity: string;
  amount: string;
}
const blankLine = (): Line => ({
  key: crypto.randomUUID(),
  productId: "",
  size: "",
  quantity: "1",
  amount: "",
});
function perthDate(value: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Australia/Perth",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .format(new Date(value))
    .replace(" ", "T");
}

export function MarketSaleForm({
  products,
  initial,
  requestId,
  defaultSoldAt,
}: {
  products: MarketProductOption[];
  initial?: MarketSaleRecord;
  requestId: string;
  defaultSoldAt: string;
}) {
  const router = useRouter();
  const [sale, setSale] = useState(initial);
  const [reference, setReference] = useState(initial?.payment_reference ?? "");
  const [email, setEmail] = useState(initial?.customer_email ?? "");
  const [soldAt, setSoldAt] = useState(() => perthDate(defaultSoldAt));
  const [lines, setLines] = useState<Line[]>(() =>
    initial
      ? initial.items.map((item, index) => ({
          key: String(index),
          productId: item.productId,
          size: item.size ?? "",
          quantity: String(item.quantity),
          amount: (item.lineAmount / 100).toFixed(2),
        }))
      : [{ key: "initial", productId: "", size: "", quantity: "1", amount: "" }],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function updateLine(key: string, changes: Partial<Line>) {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...changes } : line)),
    );
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        sale ? `/api/admin/market-sales/${sale.id}/reconcile` : "/api/admin/market-sales",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId,
            paymentReference: reference,
            customerEmail: email || null,
            soldAt: new Date(`${soldAt}:00+08:00`).toISOString(),
            expectedRevision: sale?.revision,
            items: lines.map((line) => ({
              productId: line.productId,
              size: line.size || null,
              quantity: Number(line.quantity),
              lineAmount: Math.round(Number(line.amount) * 100),
            })),
          }),
        },
      );
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "The sale could not be saved.");
      const saved = body.sale as MarketSaleRecord;
      setSale(saved);
      if (saved.status === "needs_review")
        setError(saved.error ?? "The sale is saved and needs review. Stock has not changed.");
      if (!initial) router.push(`/admin/market-sales/${saved.id}`);
      router.refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "The sale could not be saved.");
    } finally {
      setBusy(false);
    }
  }
  const field = "mt-1 w-full rounded-lg border border-charcoal/20 bg-white px-3 py-2 text-sm";
  return (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-2xl border border-charcoal/10 bg-white p-6"
    >
      <p className="text-sm leading-6 text-charcoal/70">
        Unpublish all stock taken to the event before accepting payment. Record the product lines
        and actual amount paid in Stripe. Online reservations must be resolved first.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Stripe payment reference
          <input
            className={field}
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            required
            placeholder="pi_… or ch_…"
            maxLength={255}
          />
        </label>
        <label className="text-sm font-medium">
          Sale date and time (Perth)
          <input
            className={field}
            type="datetime-local"
            value={soldAt}
            onChange={(event) => setSoldAt(event.target.value)}
            required
          />
        </label>
        <label className="text-sm font-medium sm:col-span-2">
          Customer email (optional)
          <input
            className={field}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={254}
          />
        </label>
      </div>
      <div className="space-y-4">
        {lines.map((line, index) => {
          const product = products.find((option) => option.id === line.productId);
          return (
            <fieldset key={line.key} className="rounded-xl border border-charcoal/10 p-4">
              <legend className="px-1 text-sm font-semibold">Sale line {index + 1}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm sm:col-span-2">
                  Product
                  <select
                    className={field}
                    value={line.productId}
                    required
                    onChange={(event) => {
                      const selected = products.find((option) => option.id === event.target.value);
                      updateLine(line.key, {
                        productId: event.target.value,
                        size:
                          selected?.productType === "merch"
                            ? (Object.keys(selected.stockBySize)[0] ?? "")
                            : "",
                        quantity: "1",
                        amount: selected ? (selected.priceAmount / 100).toFixed(2) : "",
                      });
                    }}
                  >
                    <option value="">Choose a product</option>
                    {products.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.title} · {option.publicationStatus}
                      </option>
                    ))}
                  </select>
                </label>
                {product?.productType === "merch" && (
                  <label className="text-sm">
                    Size / stock variant
                    <select
                      className={field}
                      value={line.size}
                      required
                      onChange={(event) => updateLine(line.key, { size: event.target.value })}
                    >
                      <option value="">Choose a variant</option>
                      {Object.entries(product.stockBySize).map(([size, stock]) => (
                        <option key={size} value={size}>
                          {size} · {stock} in stock
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <label className="text-sm">
                  Quantity
                  <input
                    className={field}
                    type="number"
                    min={1}
                    max={product?.productType === "board" ? 1 : 1000}
                    step={1}
                    value={line.quantity}
                    onChange={(event) => updateLine(line.key, { quantity: event.target.value })}
                    required
                  />
                </label>
                <label className="text-sm">
                  Actual line total (AUD)
                  <input
                    className={field}
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={line.amount}
                    onChange={(event) => updateLine(line.key, { amount: event.target.value })}
                    required
                  />
                </label>
              </div>
              {product?.publicationStatus !== "draft" && product && (
                <p className="mt-2 text-sm text-amber-800">
                  This product must be a draft before the sale can be reconciled.
                </p>
              )}
              {lines.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setLines((current) => current.filter((item) => item.key !== line.key))
                  }
                  className="mt-3 text-sm underline"
                >
                  Remove line
                </button>
              )}
            </fieldset>
          );
        })}
      </div>
      <button
        type="button"
        disabled={lines.length >= 20 || busy}
        onClick={() => setLines((current) => [...current, blankLine()])}
        className="text-sm font-semibold underline"
      >
        Add sale line
      </button>
      <p className="text-sm font-semibold">
        Sale total:{" "}
        {new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(
          lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0),
        )}
      </p>
      {error && (
        <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          {error}
        </p>
      )}
      <button
        disabled={busy || !requestId || !lines.length}
        className="rounded-lg bg-charcoal px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {busy
          ? "Verifying payment…"
          : sale
            ? "Save corrections and retry verification"
            : "Record and verify payment"}
      </button>
    </form>
  );
}

export function MarketSaleDismiss({ sale }: { sale: MarketSaleRecord }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [stockChecked, setStockChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      className="space-y-4 rounded-2xl border border-charcoal/10 bg-white p-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        try {
          const response = await fetch(`/api/admin/market-sales/${sale.id}/dismiss`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ expectedRevision: sale.revision, reason, stockChecked }),
          });
          const body = await response.json();
          if (!response.ok) throw new Error(body.error ?? "Could not dismiss this record.");
          router.refresh();
        } catch (failure) {
          setError(failure instanceof Error ? failure.message : "Could not dismiss this record.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h3 className="text-lg font-semibold">Dismiss a duplicate or mistaken record</h3>
      <p className="text-sm text-charcoal/70">
        Dismissal preserves this record and does not adjust stock. A physically sold item must first
        be reconciled through the correct order. Do not dismiss a real unreconciled sale to
        republish its stock.
      </p>
      <label className="block text-sm">
        Reason
        <textarea
          className="mt-1 w-full rounded-lg border border-charcoal/20 px-3 py-2"
          required
          minLength={10}
          maxLength={1000}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          required
          checked={stockChecked}
          onChange={(event) => setStockChecked(event.target.checked)}
        />
        I have checked physical stock and the relevant order; this record is a duplicate or mistake.
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-800">
          {error}
        </p>
      )}
      <button
        disabled={busy}
        className="rounded-lg border border-charcoal/30 px-4 py-2 text-sm font-semibold disabled:opacity-50"
      >
        {busy ? "Saving…" : "Dismiss with audit note"}
      </button>
    </form>
  );
}
