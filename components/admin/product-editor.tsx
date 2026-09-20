"use client";
import { upload } from "@vercel/blob/client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import type { ProductInput } from "@/server/catalogue/product-input";

const blank: ProductInput = {
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
};
const steps = ["Type", "Details", "Photos", "Preview"];
const field = "mt-1 w-full rounded-xl border border-charcoal/20 bg-white px-3 py-2.5 text-charcoal";
const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export function ProductEditor({ id, initial }: { id?: string; initial?: ProductInput }) {
  const router = useRouter();
  const [data, setData] = useState<ProductInput>(initial ?? blank);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  function update<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setData((current) => ({ ...current, [key]: value }));
  }
  async function save(publicationStatus: ProductInput["publicationStatus"]) {
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
      update("publicationStatus", publicationStatus);
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
  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= data.images.length) return;
    const images = [...data.images];
    [images[index], images[target]] = [images[target], images[index]];
    update("images", images);
  }
  return (
    <section className="mx-auto max-w-4xl space-y-7">
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
            <fieldset>
              <legend className="mb-2 font-bold">What are you adding?</legend>
              <div className="flex flex-wrap gap-3">
                {(["board", "merch"] as const).map((kind) => (
                  <label key={kind} className="rounded-xl border bg-white px-4 py-3">
                    <input
                      type="radio"
                      checked={data.productType === kind}
                      onChange={() => update("productType", kind)}
                      disabled={!!id}
                    />{" "}
                    {kind === "board" ? "One of a kind complete deck" : "OG logo tee"}
                  </label>
                ))}
              </div>
            </fieldset>
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
                {(["S", "M", "L", "XL"] as const).map((size) => (
                  <label key={size} className="block font-semibold">
                    Size {size} stock
                    <input
                      type="number"
                      min="0"
                      className={field}
                      value={data.stockBySize[size] ?? 0}
                      onChange={(event) =>
                        update("stockBySize", {
                          ...data.stockBySize,
                          [size]: Number(event.target.value),
                        })
                      }
                    />
                  </label>
                ))}
                <label className="block font-semibold sm:col-span-2">
                  Fit notes
                  <input
                    className={field}
                    value={data.fitNotes}
                    onChange={(event) => update("fitNotes", event.target.value)}
                  />
                </label>
              </>
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
              {data.productType === "board" ? data.availabilityStatus : "OG tee"}
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
            onClick={() => save(data.publicationStatus === "published" ? "published" : "draft")}
            className="rounded-full border border-charcoal px-5 py-3 font-bold"
          >
            {data.publicationStatus === "published" ? "Save changes" : "Save draft"}
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
