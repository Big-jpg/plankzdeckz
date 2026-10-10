"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Maximize2 } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import type { PublicCatalogueImage } from "@/lib/public-catalogue";

interface PublicCatalogueGalleryProps {
  title: string;
  images: readonly PublicCatalogueImage[];
}

export function PublicCatalogueGallery({ title, images }: PublicCatalogueGalleryProps) {
  const [active, setActive] = useState(0);
  const thumbnails = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const photo = images[active];
  const multiple = images.length > 1;

  function changePhoto(direction: number) {
    setActive((previous) => (previous + direction + images.length) % images.length);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!multiple || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      changePhoto(event.key === "ArrowRight" ? 1 : -1);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setActive(event.key === "Home" ? 0 : images.length - 1);
    }
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0];
    touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStart.current;
    const end = event.changedTouches[0];
    touchStart.current = null;
    if (!multiple || !start || !end) return;
    const horizontal = end.clientX - start.x;
    const vertical = end.clientY - start.y;
    if (Math.abs(horizontal) > 50 && Math.abs(horizontal) > Math.abs(vertical) * 1.5) {
      changePhoto(horizontal < 0 ? 1 : -1);
    }
  }

  useEffect(() => {
    const row = thumbnails.current;
    const selected = row?.querySelector<HTMLButtonElement>(`[data-photo-index="${active}"]`);
    if (!row || !selected) return;
    const left = selected.offsetLeft - row.offsetLeft;
    if (left < row.scrollLeft || left + selected.offsetWidth > row.scrollLeft + row.clientWidth) {
      row.scrollTo({
        left: Math.max(0, left - (row.clientWidth - selected.offsetWidth) / 2),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    }
  }, [active]);

  return (
    <div
      className="pc-gallery"
      role="region"
      aria-label={`Photos of ${title}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div
        className="pc-gallery-frame"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          touchStart.current = null;
        }}
      >
        <Image
          src={photo.url}
          alt={photo.alt}
          fill
          priority={active === 0}
          sizes="(min-width: 1280px) 760px, (min-width: 1024px) 62vw, calc(100vw - 40px)"
          className="pc-contained-image"
          data-gallery-image
        />
        <a
          className="pc-full-photo"
          href={photo.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open larger photo ${active + 1} in a new tab`}
        >
          <Maximize2 size={13} aria-hidden="true" /> Larger photo
        </a>
      </div>
      {multiple && (
        <div className="pc-gallery-controls">
          <button type="button" onClick={() => changePhoto(-1)} aria-label="Previous photo">
            <ArrowLeft size={19} aria-hidden="true" />
          </button>
          <p role="status" aria-live="polite" aria-atomic="true">
            {String(active + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </p>
          <button type="button" onClick={() => changePhoto(1)} aria-label="Next photo">
            <ArrowRight size={19} aria-hidden="true" />
          </button>
        </div>
      )}
      {multiple && (
        <div className="pc-gallery-thumbnails" ref={thumbnails} aria-label="Choose a photo">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              data-photo-index={index}
              aria-label={`Show photo ${index + 1}: ${image.alt}`}
              aria-pressed={active === index}
              onClick={() => setActive(index)}
            >
              <Image
                src={image.thumbnailUrl}
                alt=""
                unoptimized
                loading="eager"
                fill
                sizes="80px"
                className="pc-contained-image"
              />
            </button>
          ))}
        </div>
      )}
      <noscript>
        <ul className="pc-gallery-fallback">
          {images.map((image, index) => (
            <li key={image.url}>
              <a href={image.url}>
                Photo {index + 1}: {image.alt}
              </a>
            </li>
          ))}
        </ul>
      </noscript>
    </div>
  );
}
