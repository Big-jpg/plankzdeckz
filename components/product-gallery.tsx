"use client";
import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/types";

export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const photos = product.imageDetails?.length
    ? product.imageDetails
    : product.images.map((url, index) => ({ url, alt: `${product.title}, view ${index + 1}` }));
  if (!photos.length) return null;
  const selected = photos[Math.min(active, photos.length - 1)];
  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#e7d9c5]">
        <Image
          src={selected.url}
          alt={selected.alt || product.title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-contain"
        />
      </div>
      {photos.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {photos.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show ${image.alt || `photo ${index + 1}`}`}
              aria-pressed={active === index}
              className={`relative aspect-square overflow-hidden border-2 ${active === index ? "border-[#332619]" : "border-transparent"}`}
            >
              <Image src={image.url} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
