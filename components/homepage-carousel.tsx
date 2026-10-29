"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type TouchEvent,
} from "react";

interface HomepageSlide {
  title: string;
  href: string;
  image: { url: string; alt: string };
}

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function HomepageCarousel({ slides }: { slides: readonly HomepageSlide[] }) {
  const [active, setActive] = useState(0);
  const [rotating, setRotating] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [failedImages, setFailedImages] = useState<readonly string[]>([]);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
  const multiple = slides.length > 1;
  const playing = rotating && !reducedMotion && multiple;
  const slide = slides[active % slides.length];

  useEffect(() => {
    if (!playing || hovered || focused) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((previous) => (previous + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [playing, hovered, focused, slides.length]);

  function select(index: number) {
    setRotating(false);
    setActive((index + slides.length) % slides.length);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!multiple || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      select(active + (event.key === "ArrowRight" ? 1 : -1));
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      select(event.key === "Home" ? 0 : slides.length - 1);
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
      select(active + (horizontal < 0 ? 1 : -1));
    }
  }

  if (!slide) return null;

  return (
    <section
      className="homepage-carousel min-w-0"
      aria-label="Featured board photographs"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <div
        className="touch-pan-y"
        onTouchStart={(event) => {
          const touch = event.touches[0];
          touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
        }}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          touchStart.current = null;
        }}
      >
        <Link href={slide.href} aria-label={`View ${slide.title}`}>
          <div className="relative aspect-[4/3] bg-[#f8f2e5]" data-homepage-slide>
            {failedImages.includes(slide.image.url) ? (
              <div
                className="absolute inset-0 flex items-center justify-center border border-brand-brown/15 p-8 text-center"
                role="status"
              >
                Photograph unavailable. View {slide.title} for more photographs.
              </div>
            ) : (
              <Image
                key={slide.image.url}
                src={slide.image.url}
                alt={slide.image.alt}
                fill
                sizes="(min-width: 1280px) 660px, (min-width: 1024px) 55vw, calc(100vw - 40px)"
                className="object-contain"
                priority={active === 0}
                onError={() => setFailedImages((previous) => [...previous, slide.image.url])}
              />
            )}
          </div>
          <div className="flex justify-between gap-4 border-b-2 border-brand-brown py-4">
            <span className="font-display text-2xl">{slide.title}</span>
            <span className="font-semibold">View photos →</span>
          </div>
        </Link>
      </div>
      {multiple && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="carousel-control"
              onClick={() => select(active - 1)}
              aria-label="Previous featured photograph"
            >
              <ArrowLeft size={19} aria-hidden="true" />
            </button>
            <p
              className="min-w-12 text-center text-xs"
              aria-live={playing ? "off" : "polite"}
              aria-atomic="true"
            >
              {active + 1} / {slides.length}
            </p>
            <button
              type="button"
              className="carousel-control"
              onClick={() => select(active + 1)}
              aria-label="Next featured photograph"
            >
              <ArrowRight size={19} aria-hidden="true" />
            </button>
          </div>
          <div className="flex" aria-label="Choose a featured photograph">
            {slides.map((entry, index) => (
              <button
                key={entry.href}
                type="button"
                className="carousel-dot"
                aria-label={`Show featured photograph ${index + 1}: ${entry.title}`}
                aria-pressed={active === index}
                onClick={() => select(index)}
              >
                <span aria-hidden="true" />
              </button>
            ))}
          </div>
          <button
            type="button"
            className="carousel-control gap-2 px-3 text-xs"
            disabled={reducedMotion}
            onClick={() => setRotating((previous) => !previous)}
            aria-label={
              reducedMotion
                ? "Automatic rotation disabled for reduced motion"
                : playing
                  ? "Pause automatic rotation"
                  : "Resume automatic rotation"
            }
          >
            {playing ? (
              <Pause size={15} aria-hidden="true" />
            ) : (
              <Play size={15} aria-hidden="true" />
            )}
            {reducedMotion ? "Motion off" : playing ? "Pause" : "Resume"}
          </button>
        </div>
      )}
      <p className="mt-3 text-xs leading-5 text-brand-brown/65">
        Board photographs · lifestyle images to follow
      </p>
    </section>
  );
}
