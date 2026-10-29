"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import type { PublicCatalogueCategory, PublicCatalogueItem } from "@/lib/public-catalogue";

interface PublicCatalogueCardProps {
  item: PublicCatalogueItem;
  context?: PublicCatalogueCategory;
  wide?: boolean;
  logoOverlay?: boolean;
}

export function PublicCatalogueCard({
  item,
  context,
  wide = false,
  logoOverlay = false,
}: PublicCatalogueCardProps) {
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<string[]>([]);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const photo = item.images[active];
  const href = `/shop/${item.handle}${context ? `?category=${context}` : ""}`;
  const multiple = item.images.length > 1;

  function changePhoto(direction: number) {
    setActive((previous) => (previous + direction + item.images.length) % item.images.length);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!multiple || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      changePhoto(event.key === "ArrowRight" ? 1 : -1);
    }
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

  return (
    <article className="pc-card" data-catalogue-card={item.handle}>
      <div
        className="pc-card-media"
        onKeyDown={handleKeyDown}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
        }}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          touchStart.current = null;
        }}
      >
        <Link className="pc-card-link" href={href} aria-label={`View ${item.title}`}>
          <div className="pc-card-frame">
            {photo && !failed.includes(photo.url) ? (
              <Image
                key={photo.url}
                src={wide || item.category === "boards" ? photo.url : photo.cardUrl}
                alt={photo.alt}
                fill
                sizes={
                  wide || item.category === "boards"
                    ? "(min-width: 1280px) 610px, (min-width: 640px) 48vw, calc(100vw - 40px)"
                    : "(min-width: 1280px) 395px, (min-width: 1024px) 32vw, (min-width: 640px) 48vw, calc(100vw - 40px)"
                }
                className="pc-contained-image"
                onError={() => setFailed((previous) => [...previous, photo.url])}
              />
            ) : (
              <span className="pc-image-unavailable">Photo unavailable</span>
            )}
            {logoOverlay && (
              <Image
                src="/plankz-og-logo.png"
                alt=""
                width={90}
                height={90}
                className="pc-logo-overlay"
              />
            )}
          </div>
          <div className="pc-card-copy">
            <h3>{item.title}</h3>
            <span className="pc-card-arrow" aria-hidden="true">
              <ArrowUpRight size={19} />
            </span>
          </div>
        </Link>
        {multiple && (
          <div className="pc-card-photo-controls" aria-label={`Browse photos of ${item.title}`}>
            <button
              type="button"
              onClick={() => changePhoto(-1)}
              aria-label={`Previous photo of ${item.title}`}
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <span className="pc-card-photo-count" role="status" aria-live="polite">
              {active + 1} / {item.images.length}
            </span>
            <button
              type="button"
              onClick={() => changePhoto(1)}
              aria-label={`Next photo of ${item.title}`}
            >
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {logoOverlay && <p className="pc-board-description">{item.description}</p>}
    </article>
  );
}
