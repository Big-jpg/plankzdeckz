"use client";
import { upload } from "@vercel/blob/client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useState, type ChangeEvent } from "react";
import type { ProductInput } from "@/server/catalogue/product-input";
import { MERCH_KINDS, isClothing, isSizeLabel, type MerchKind } from "@/lib/types";
import { applyWaresPreset, canApplyWaresPreset, WARES_PRESETS } from "./wares-presets";
import { HAT_PRICING, isHatPricingFamily } from "@/lib/hat-pricing";

const blank: ProductInput = {
  revision: 0,
  handle: "",
  title: "",
  description: "",
  productType: "board",
  priceAmount: 0,
  publicationStatus: "draft",
  images: [],
  boardStyle: "cruiser",
  boardShape: "",
  timberSpecies: [],
  lengthCm: null,
  widthCm: null,
  thicknessCm: null,
  availabilityStatus: "available",
  stockQuantity: 1,
  stockBySize: { S: 0, M: 0, L: 0, XL: 0 },
  fitNotes: "",
  merchKind: null,
  salesUnitLabel: "",
  hatPricingFamily: null,
  adjustmentReason: "",
};
const steps = ["Type", "Details", "Photos", "Preview"];
const field = "mt-1 w-full rounded-xl border border-charcoal/20 bg-white px-3 py-2.5 text-charcoal";
const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function isPhotoOnlyProductSave(
  saved: ProductInput,
  current: ProductInput,
  publicationStatus: ProductInput["publicationStatus"],
): boolean {
  function productFields(input: ProductInput): string {
    const fields = Object.entries(input)
      .filter(([key]) => key !== "images")
      .map(([key, value]) => [
        key,
        key === "stockBySize"
          ? Object.entries(value as ProductInput["stockBySize"]).sort(([a], [b]) =>
              a.localeCompare(b),
            )
          : value,
      ])
      .sort(([a], [b]) => String(a).localeCompare(String(b)));
    return JSON.stringify(fields);
  }
  return (
    publicationStatus === saved.publicationStatus && productFields(saved) === productFields(current)
  );
}

export function ProductEditor({ id, initial }: { id?: string; initial?: ProductInput }) {
  const router = useRouter();
  const fieldId = useId();
  const presetId = `${fieldId}-wares-preset`;
  const salesUnitId = `${fieldId}-sales-unit`;
  const [data, setData] = useState<ProductInput>(initial ?? blank);
  const [saved, setSaved] = useState<ProductInput>(initial ?? blank);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [newSize, setNewSize] = useState("");
  function update<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setData((current) => ({ ...current, [key]: value }));
  }
  async function save(publicationStatus: ProductInput["publicationStatus"]) {
    // Preview saves must not send stale sale fields when only photos were edited.
    if (id && isPhotoOnlyProductSave(saved, data, publicationStatus)) {
      await savePhotos();
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(id ? `/api/admin/products/${id}` : "/api/admin/products", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, publicationStatus }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not save product.");
      const next = { ...data, publicationStatus, revision: result.revision, adjustmentReason: "" };
      setData(next);
      setSaved(next);
      setMessage("Saved.");
      router.refresh();
      if (!id) router.replace(`/admin/products/${result.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save product.");
    } finally {
      setBusy(false);
    }
  }
  async function addImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 12 * 1024 * 1024
    ) {
      setMessage("Use a JPG, PNG, or WebP under 12 MB.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const blob = await upload(`products/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/products/upload",
      });
      update("images", [...data.images, { url: blob.url, alt: "" }]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }
  async function savePhotos() {
    if (!id) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: data.images }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not save photos.");
      // Photo saves may follow a sale; never give stale stock the sale's newer revision.
      const unchanged = result.revision === data.revision + 1;
      if (unchanged) setData((current) => ({ ...current, revision: result.revision }));
      setSaved((current) => ({
        ...current,
        images: data.images,
        revision: unchanged ? result.revision : current.revision,
      }));
      setMessage(
        unchanged
          ? "Photos saved. Price, stock, and publication status are unchanged."
          : "Photos saved. Product changed elsewhere; reload before changing product details or stock.",
      );
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save photos.");
    } finally {
      setBusy(false);
    }
  }
  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= data.images.length) return;
    const images = [...data.images];
    [images[index], images[target]] = [images[target], images[index]];
    update("images", images);
  }
  return (
    <section aria-label="Product editor" className="mx-auto max-w-4xl space-y-7">
      <Link href="/admin/products" className="text-sm font-semibold underline">
        ← Products
      </Link>
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-copper">Product editor</p>
        <h2 className="font-display text-4xl">{id ? "Edit product" : "Add product"}</h2>
      </div>
      <nav aria-label="Product steps" className="grid grid-cols-4 gap-2">
        {steps.map((name, index) => (
          <button
            key={name}
            type="button"
            onClick={() => setStep(index)}
            className={`rounded-xl px-3 py-3 text-sm font-bold ${step === index ? "bg-charcoal text-white" : "bg-white text-charcoal"}`}
          >
            {index + 1}. {name}
          </button>
        ))}
      </nav>
      <div className="rounded-3xl border border-charcoal/15 bg-ivory/60 p-5 sm:p-8">
        {step === 0 && (
          <div className="space-y-5">
            {!id && !initial && (
              <div className="font-semibold">
                <label htmlFor={presetId} className="block">
                  Start from the supplied WARES list
                </label>
                <select
                  id={presetId}
                  aria-describedby={`${presetId}-help`}
                  className={field}
                  defaultValue=""
                  disabled={busy || !canApplyWaresPreset(data)}
                  onChange={(event) =>
                    setData((current) => applyWaresPreset(current, event.target.value, id))
                  }
                >
                  <option value="">Choose a product, or enter your own below</option>
                  {WARES_PRESETS.map((preset) => (
                    <option key={preset.handle} value={preset.handle}>
                      {preset.title} — proposed AUD ${(preset.priceAmount / 100).toFixed(2)}
                    </option>
                  ))}
                </select>
                <p id={`${presetId}-help`} className="mt-2 text-sm font-normal">
                  Starts an unsaved draft with the supplied description and proposed retail price.
                  Confirm the colour, sale unit, sizes, stock and photos before publishing.
                </p>
              </div>
            )}
            <fieldset>
              <legend className="mb-2 font-bold">What are you adding?</legend>
              <div className="flex flex-wrap gap-3">
                {(["board", "merch"] as const).map((kind) => (
                  <label key={kind} className="rounded-xl border bg-white px-4 py-3">
                    <input
                      type="radio"
                      checked={data.productType === kind}
                      onChange={() =>
                        setData((current) => ({
                          ...current,
                          productType: kind,
                          merchKind: kind === "merch" ? "tee" : null,
                          hatPricingFamily: null,
                          stockBySize: (kind === "merch"
                            ? { S: 0, M: 0, L: 0, XL: 0 }
                            : {}) as Record<string, number>,
                        }))
                      }
                      disabled={!!id}
                    />{" "}
                    {kind === "board" ? "One of a kind complete deck" : "Merchandise"}
                  </label>
                ))}
              </div>
            </fieldset>
            {data.productType === "merch" && (
              <label className="block font-semibold">
                Category
                <select
                  className={field}
                  value={data.merchKind ?? ""}
                  onChange={(event) => {
                    const kind = event.target.value as MerchKind;
                    setData((current) => ({
                      ...current,
                      merchKind: kind,
                      hatPricingFamily: kind === "hat" ? current.hatPricingFamily : null,
                      stockBySize: (isClothing(kind)
                        ? { S: 0, M: 0, L: 0, XL: 0 }
                        : { "One size": 0 }) as Record<string, number>,
                    }));
                  }}
                >
                  <option value="" disabled>
                    Choose a category
                  </option>
                  {MERCH_KINDS.map((kind) => (
                    <option key={kind} value={kind}>
                      {
                        {
                          tee: "Tees",
                          hat: "Hats",
                          jacket: "Jackets",
                          bearings: "Bearings",
                          sticker: "Stickers",
                          truck: "Trucks",
                          wheel: "Wheels",
                        }[kind]
                      }
                    </option>
                  ))}
                </select>
                <span className="mt-2 block text-sm font-normal">
                  Use a separate product for each colour, design or sale pack.
                </span>
              </label>
            )}
            <label className="block font-semibold">
              Name
              <input
                className={field}
                value={data.title}
                onChange={(event) =>
                  setData((current) => ({
                    ...current,
                    title: event.target.value,
                    handle: current.title ? current.handle : slug(event.target.value),
                  }))
                }
              />
            </label>
            <label className="block font-semibold">
              URL handle
              <input
                className={field}
                value={data.handle}
                disabled={!!id}
                onChange={(event) => update("handle", slug(event.target.value))}
              />
            </label>
          </div>
        )}
        {step === 1 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block font-semibold sm:col-span-2">
              Description
              <textarea
                rows={5}
                className={field}
                value={data.description}
                onChange={(event) => update("description", event.target.value)}
              />
            </label>
            <label className="block font-semibold">
              Price (AUD)
              <input
                type="number"
                min="0"
                step=".01"
                className={field}
                value={data.priceAmount ? data.priceAmount / 100 : ""}
                onChange={(event) =>
                  update("priceAmount", Math.round(Number(event.target.value) * 100))
                }
              />
            </label>
            {data.productType === "board" ? (
              <>
                <label className="block font-semibold">
                  Style
                  <select
                    className={field}
                    value={data.boardStyle ?? "cruiser"}
                    onChange={(event) =>
                      update("boardStyle", event.target.value as ProductInput["boardStyle"])
                    }
                  >
                    <option value="cruiser">Cruiser</option>
                    <option value="surfskate">Surfskate</option>
                    <option value="longboard">Longboard</option>
                  </select>
                </label>
                <label className="block font-semibold">
                  Shape
                  <input
                    className={field}
                    value={data.boardShape}
                    onChange={(event) => update("boardShape", event.target.value)}
                  />
                </label>
                <label className="block font-semibold">
                  Timber species, comma separated
                  <input
                    className={field}
                    value={data.timberSpecies.join(", ")}
                    onChange={(event) =>
                      update(
                        "timberSpecies",
                        event.target.value
                          .split(",")
                          .map((part) => part.trim())
                          .filter(Boolean),
                      )
                    }
                  />
                </label>
                {(["lengthCm", "widthCm", "thicknessCm"] as const).map((key) => (
                  <label key={key} className="block font-semibold capitalize">
                    {key.replace("Cm", "")} (cm)
                    <input
                      type="number"
                      min="0"
                      step=".01"
                      className={field}
                      value={data[key] ?? ""}
                      onChange={(event) =>
                        update(key, event.target.value ? Number(event.target.value) : null)
                      }
                    />
                  </label>
                ))}
                <label className="block font-semibold">
                  Availability
                  <select
                    className={field}
                    value={data.availabilityStatus}
                    onChange={(event) =>
                      update(
                        "availabilityStatus",
                        event.target.value as ProductInput["availabilityStatus"],
                      )
                    }
                  >
                    <option value="available">Available</option>
                    <option value="sold">Sold, show in gallery</option>
                  </select>
                </label>
                <label className="block font-semibold">
                  Stock
                  <input
                    type="number"
                    min="0"
                    max="1"
                    className={field}
                    value={data.stockQuantity}
                    onChange={(event) => update("stockQuantity", Number(event.target.value))}
                  />
                </label>
              </>
            ) : (
              <>
                {data.merchKind === "hat" && (
                  <label className="block font-semibold sm:col-span-2">
                    Hat quantity pricing
                    <select
                      className={field}
                      value={data.hatPricingFamily ?? ""}
                      onChange={(event) =>
                        update(
                          "hatPricingFamily",
                          isHatPricingFamily(event.target.value) ? event.target.value : null,
                        )
                      }
                    >
                      <option value="">None — retail price only</option>
                      <option value="trad">Trad — $25 retail; 2+ at $22.50 each</option>
                      <option value="cord">Cord — $40 retail; 2–4 at $37.50, 5+ at $31 each</option>
                    </select>
                    <span className="mt-1 block text-sm font-normal">
                      Use only when one sale unit is one hat. Colours in the same family share
                      quantity pricing; Trad and Cord quantities stay separate.
                      {data.hatPricingFamily &&
                        ` Set the retail price to AUD $${(HAT_PRICING[data.hatPricingFamily].retailUnitAmount / 100).toFixed(2)} before publishing.`}
                    </span>
                  </label>
                )}
                <div className="font-semibold sm:col-span-2">
                  <label htmlFor={salesUnitId} className="block">
                    Unit or pack sold
                  </label>
                  <input
                    id={salesUnitId}
                    aria-describedby={`${salesUnitId}-help`}
                    className={field}
                    value={data.salesUnitLabel}
                    maxLength={120}
                    placeholder="For example: one cap, set of 8 bearings, pack of 3 stickers"
                    onChange={(event) => update("salesUnitLabel", event.target.value)}
                  />
                  <p id={`${salesUnitId}-help`} className="mt-1 text-sm font-normal">
                    The price and stock count apply to this exact unit or pack.
                  </p>
                </div>
                {(isClothing(data.merchKind) ? Object.keys(data.stockBySize) : ["One size"]).map(
                  (size) => (
                    <div key={size}>
                      <label className="block font-semibold">
                        {isClothing(data.merchKind) ? `Size ${size} stock` : "Stock quantity"}
                        <input
                          type="number"
                          min="0"
                          className={field}
                          value={data.stockBySize[size] ?? ""}
                          placeholder="Confirm quantity"
                          onChange={(event) => {
                            const stock = { ...data.stockBySize };
                            if (event.target.value === "") delete stock[size];
                            else stock[size] = Number(event.target.value);
                            update("stockBySize", stock);
                          }}
                        />
                      </label>
                      {isClothing(data.merchKind) && (
                        <button
                          type="button"
                          className="mt-2 text-sm underline"
                          onClick={() => {
                            const stock = { ...data.stockBySize };
                            delete stock[size];
                            update("stockBySize", stock);
                          }}
                        >
                          Remove size {size}
                        </button>
                      )}
                    </div>
                  ),
                )}
                {isClothing(data.merchKind) && (
                  <div className="sm:col-span-2">
                    <label className="block font-semibold">
                      Add size
                      <input
                        className={field}
                        value={newSize}
                        maxLength={32}
                        onChange={(event) => setNewSize(event.target.value)}
                      />
                    </label>
                    <button
                      type="button"
                      className="mt-2 underline"
                      disabled={
                        !isSizeLabel(newSize.trim()) ||
                        Object.hasOwn(data.stockBySize, newSize.trim())
                      }
                      onClick={() => {
                        update("stockBySize", { ...data.stockBySize, [newSize.trim()]: 0 });
                        setNewSize("");
                      }}
                    >
                      Add size
                    </button>
                  </div>
                )}
                {isClothing(data.merchKind) && (
                  <label className="block font-semibold sm:col-span-2">
                    Fit notes
                    <input
                      className={field}
                      value={data.fitNotes}
                      onChange={(event) => update("fitNotes", event.target.value)}
                    />
                  </label>
                )}
              </>
            )}
            {id && (
              <label className="block font-semibold sm:col-span-2">
                Stock adjustment reason
                <input
                  className={field}
                  value={data.adjustmentReason}
                  maxLength={500}
                  placeholder="Required when changing stock or board availability"
                  onChange={(event) => update("adjustmentReason", event.target.value)}
                />
                <span className="mt-1 block text-sm font-normal">
                  Use Record market sale for paid market transactions. Refunds do not restock items.
                </span>
              </label>
            )}
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-charcoal/70">
              Put the main product shot first, then add grip side, detail, and lifestyle views.
            </p>
            <label className="inline-block cursor-pointer rounded-full bg-charcoal px-5 py-3 font-bold text-white">
              Add photo
              <input
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={addImage}
              />
            </label>
            {data.images.map((image, index) => (
              <div
                key={image.url}
                className="flex flex-wrap items-center gap-4 rounded-xl bg-white p-3"
              >
                <Image
                  src={image.url}
                  alt=""
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-lg object-cover"
                />
                <div className="min-w-48 flex-1">
                  <p className="text-sm font-bold">
                    {index === 0 ? "Primary photo" : `Photo ${index + 1}`}
                  </p>
                  <input
                    aria-label={`Description for photo ${index + 1}`}
                    placeholder="Describe this image"
                    className={field}
                    value={image.alt}
                    onChange={(event) =>
                      update(
                        "images",
                        data.images.map((entry, i) =>
                          i === index ? { ...entry, alt: event.target.value } : entry,
                        ),
                      )
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => move(index, -1)}>
                    ↑
                  </button>
                  <button type="button" onClick={() => move(index, 1)}>
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      update(
                        "images",
                        data.images.filter((_, i) => i !== index),
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {step === 3 && (
          <div className="space-y-5">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-copper">
              Customer preview
            </p>
            {data.images[0] && (
              <Image
                src={data.images[0].url}
                alt={data.images[0].alt}
                width={900}
                height={650}
                className="max-h-[28rem] w-full rounded-2xl object-contain"
              />
            )}
            <h3 className="font-display text-4xl">{data.title || "Untitled product"}</h3>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(
                data.priceAmount / 100,
              )}
            </p>
            <p className="whitespace-pre-line leading-7">{data.description}</p>
            <p className="font-semibold">
              Local pickup only ·{" "}
              {data.productType === "board" ? data.availabilityStatus : data.salesUnitLabel}
            </p>
          </div>
        )}
      </div>
      {message && (
        <p role="status" className="rounded-xl bg-white p-4">
          {message}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
          className="rounded-full border px-5 py-3"
        >
          Back
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              id && step === 2
                ? savePhotos()
                : save(data.publicationStatus === "published" ? "published" : "draft")
            }
            className="rounded-full border border-charcoal px-5 py-3 font-bold"
          >
            {id && step === 2
              ? "Save photos only"
              : data.publicationStatus === "published"
                ? "Save changes"
                : "Save draft"}
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="rounded-full bg-charcoal px-5 py-3 font-bold text-white"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => save("published")}
              className="rounded-full bg-copper px-5 py-3 font-bold text-white"
            >
              Publish
            </button>
          )}
          {id && (
            <button
              type="button"
              disabled={busy}
              onClick={() => save("archived")}
              className="rounded-full border border-charcoal px-5 py-3"
            >
              Archive
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
