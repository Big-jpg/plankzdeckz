"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Maximize2, X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import type { PublicCatalogueImage } from "@/lib/public-catalogue";

interface PublicCatalogueGalleryProps {
  title: string;
  images: readonly PublicCatalogueImage[];
}

export function PublicCatalogueGallery({ title, images }: PublicCatalogueGalleryProps) {
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [failed, setFailed] = useState<string[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const expandButton = useRef<HTMLButtonElement>(null);
  const thumbnails = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const photo = images[active];
  const multiple = images.length > 1;

  useEffect(() => {
    if (!expanded) return;
    const modal = dialog.current;
    const trigger = expandButton.current;
    const previousOverflow = document.body.style.overflow;
    modal?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      modal?.close();
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [expanded]);

  function changePhoto(direction: number) {
    setActive((previous) => (previous + direction + images.length) % images.length);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!multiple || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      event.stopPropagation();
      changePhoto(event.key === "ArrowRight" ? 1 : -1);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      event.stopPropagation();
      setActive(event.key === "Home" ? 0 : images.length - 1);
    }
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "Tab") {
      const controls =
        event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not([disabled])");
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (
        (!event.shiftKey && document.activeElement === last) ||
        (event.shiftKey && document.activeElement === first)
      ) {
        event.preventDefault();
        event.stopPropagation();
        (event.shiftKey ? last : first)?.focus();
      }
      return;
    }
    handleKeyDown(event);
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

  if (!photo) {
    return (
      <div className="pc-gallery" role="region" aria-label={`Photos of ${title}`}>
        <p className="pc-empty-photos">Photos are not available for this item.</p>
      </div>
    );
  }

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
        {!failed.includes(photo.url) ? (
          <Image
            key={photo.url}
            src={photo.url}
            alt={photo.alt}
            fill
            priority={active === 0}
            sizes="(min-width: 1280px) 760px, (min-width: 1024px) 62vw, calc(100vw - 40px)"
            className="pc-contained-image"
            data-gallery-image
            onError={() => setFailed((previous) => [...previous, photo.url])}
          />
        ) : (
          <p className="pc-image-unavailable">Photo unavailable. Choose another photo below.</p>
        )}
        <button
          ref={expandButton}
          type="button"
          className="pc-expand-photo"
          onClick={() => setExpanded(true)}
          aria-label={`Expand photos of ${title}`}
        >
          <Maximize2 size={16} aria-hidden="true" /> Expand photos
        </button>
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
      <dialog
        ref={dialog}
        className="pc-lightbox"
        aria-label={`Full-size photos of ${title}`}
        onClose={() => setExpanded(false)}
        onKeyDown={handleDialogKeyDown}
      >
        <div className="pc-lightbox-heading">
          <h2>{title}</h2>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label="Close full-size photos"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <div
          className="pc-lightbox-frame"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={() => {
            touchStart.current = null;
          }}
        >
          {expanded && !failed.includes(photo.url) ? (
            <Image
              key={photo.url}
              src={photo.url}
              alt={photo.alt}
              fill
              sizes="95vw"
              className="pc-contained-image"
              data-expanded-image
              onError={() => setFailed((previous) => [...previous, photo.url])}
            />
          ) : expanded ? (
            <p className="pc-image-unavailable">Photo unavailable. Choose another photo.</p>
          ) : null}
        </div>
        <div className="pc-gallery-controls">
          <button
            type="button"
            disabled={!multiple}
            onClick={() => changePhoto(-1)}
            aria-label="Previous full-size photo"
          >
            <ArrowLeft size={19} aria-hidden="true" />
          </button>
          <p role="status" aria-live="polite" aria-atomic="true">
            {active + 1} / {images.length}
          </p>
          <button
            type="button"
            disabled={!multiple}
            onClick={() => changePhoto(1)}
            aria-label="Next full-size photo"
          >
            <ArrowRight size={19} aria-hidden="true" />
          </button>
        </div>
        <div className="pc-lightbox-thumbnails" aria-label="Choose a full-size photo">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              aria-label={`Show full-size photo ${index + 1}`}
              aria-pressed={active === index}
              onClick={() => setActive(index)}
            >
              <Image
                src={image.thumbnailUrl}
                alt=""
                fill
                sizes="80px"
                className="pc-contained-image"
              />
            </button>
          ))}
        </div>
      </dialog>
    </div>
  );
}
