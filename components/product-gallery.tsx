"use client";
import Image from "next/image";
import { useState } from "react";

interface GalleryProduct {
  title: string;
  images: string[];
  imageDetails?: Array<{ url: string; alt: string; width?: number; height?: number }>;
}

export function ProductGallery({
  product,
  sizes = "(min-width: 1280px) 640px, (min-width: 1024px) 55vw, calc(100vw - 32px)",
  unoptimized = false,
  thumbnailUrls,
}: {
  product: GalleryProduct;
  sizes?: string;
  unoptimized?: boolean;
  thumbnailUrls?: string[];
}) {
  const [active, setActive] = useState(0);
  const photos = product.imageDetails?.length
    ? product.imageDetails
    : product.images.map((url, index) => ({ url, alt: `${product.title}, view ${index + 1}` }));
  if (!photos.length) return null;
  const selectedIndex = Math.min(active, photos.length - 1);
  const selected = photos[selectedIndex];
  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#e7d9c5]">
        <Image
          src={selected.url}
          alt={selected.alt || product.title}
          fill
          priority={selectedIndex === 0}
          unoptimized={unoptimized}
          sizes={sizes}
          className="object-contain"
        />
      </div>
      {photos.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5" aria-label="Product photos">
          {photos.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show ${image.alt || `photo ${index + 1}`}`}
              aria-pressed={selectedIndex === index}
              className={`relative aspect-square overflow-hidden border-2 bg-[#e7d9c5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#332619] ${selectedIndex === index ? "border-[#332619]" : "border-transparent"}`}
            >
              <Image
                src={thumbnailUrls?.[index] ?? image.url}
                alt=""
                fill
                sizes="120px"
                unoptimized={unoptimized}
                className="object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
