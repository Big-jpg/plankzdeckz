"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProductInput } from "@/server/catalogue/product-input";
import { isClothing } from "@/lib/types";

export function ProductQuickActions({ id, initial }: { id: string; initial: ProductInput }) {
  const router = useRouter();
  const [product, setProduct] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedSize, setSelectedSize] = useState(
    Object.keys(initial.stockBySize)[0] ?? "One size",
  );
  const [quantity, setQuantity] = useState(
    initial.stockBySize[Object.keys(initial.stockBySize)[0]] ?? 0,
  );
  const [reason, setReason] = useState("");

  async function save(next: ProductInput) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...next, adjustmentReason: reason }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not update product.");
      setProduct({ ...next, revision: result.revision, adjustmentReason: "" });
      setReason("");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update product.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <label className="sr-only" htmlFor={`status-${id}`}>
        Publication status
      </label>
      <select
        id={`status-${id}`}
        disabled={busy}
        value={product.publicationStatus}
        onChange={(event) =>
          save({
            ...product,
            publicationStatus: event.target.value as ProductInput["publicationStatus"],
          })
        }
        className="rounded-lg border border-charcoal/20 bg-white px-2 py-2 capitalize"
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </select>
      {product.productType === "board" ? (
        <button
          type="button"
          disabled={busy || !reason.trim()}
          onClick={() =>
            save({
              ...product,
              availabilityStatus: product.availabilityStatus === "sold" ? "available" : "sold",
              stockQuantity: product.availabilityStatus === "sold" ? 1 : 0,
            })
          }
          className="rounded-lg border border-charcoal/20 px-3 py-2"
        >
          {product.availabilityStatus === "sold" ? "Restock board" : "Mark sold adjustment"}
        </button>
      ) : (
        <>
          {isClothing(product.merchKind) && (
            <>
              <label htmlFor={`size-${id}`} className="sr-only">
                Merchandise size
              </label>
              <select
                id={`size-${id}`}
                value={selectedSize}
                onChange={(event) => {
                  setSelectedSize(event.target.value);
                  setQuantity(product.stockBySize[event.target.value] ?? 0);
                }}
                className="rounded-lg border border-charcoal/20 bg-white px-2 py-2"
              >
                {Object.keys(product.stockBySize).map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </>
          )}
          <label htmlFor={`stock-${id}`} className="sr-only">
            Stock quantity
          </label>
          <input
            id={`stock-${id}`}
            type="number"
            min="0"
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="w-16 rounded-lg border border-charcoal/20 bg-white px-2 py-2"
          />
          <button
            type="button"
            disabled={busy || !reason.trim() || !Number.isSafeInteger(quantity) || quantity < 0}
            onClick={() =>
              save({
                ...product,
                stockBySize: { ...product.stockBySize, [selectedSize]: quantity },
              })
            }
            className="rounded-lg border border-charcoal/20 px-3 py-2"
          >
            Save stock
          </button>
        </>
      )}
      <label className="sr-only" htmlFor={`reason-${id}`}>
        Stock adjustment reason
      </label>
      <input
        id={`reason-${id}`}
        value={reason}
        maxLength={500}
        placeholder="Stock adjustment reason"
        onChange={(event) => setReason(event.target.value)}
        className="rounded-lg border border-charcoal/20 px-2 py-2"
      />
      {message && (
        <span role="alert" className="text-red-700">
          {message}
        </span>
      )}
    </div>
  );
}
