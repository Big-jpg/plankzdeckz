// components/scroll-reel.tsx
"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type SlideFrom = "left" | "right";

type ScrollReelProps = {
  src?: string;
  webmSrc?: string;
  mp4Src?: string;
  posterSrc: string;
  alt: string;
  label?: string;
  eyebrow?: string;
  caption?: string;
  slideFrom?: SlideFrom;
  priority?: boolean;
  className?: string;
  mediaClassName?: string;
  posterClassName?: string;
};

function sourceType(src: string) {
  if (src.endsWith(".webm")) {
    return "video/webm";
  }

  if (src.endsWith(".mp4") || src.endsWith(".m4v")) {
    return "video/mp4";
  }

  return undefined;
}

export function ScrollReel({
  src,
  webmSrc,
  mp4Src,
  posterSrc,
  alt,
  label,
  eyebrow,
  caption,
  slideFrom = "right",
  priority = false,
  className,
  mediaClassName,
  posterClassName,
}: ScrollReelProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(priority);
  const [hasEntered, setHasEntered] = useState(priority);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [canPlayVideo, setCanPlayVideo] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const sources = useMemo(() => {
    const reelSources: Array<{ src: string; type?: string }> = [];

    if (webmSrc) {
      reelSources.push({ src: webmSrc, type: "video/webm" });
    }

    if (mp4Src) {
      reelSources.push({ src: mp4Src, type: "video/mp4" });
    }

    if (src) {
      reelSources.push({ src, type: sourceType(src) });
    }

    return reelSources;
  }, [mp4Src, src, webmSrc]);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function handleMotionPreferenceChange() {
      setPrefersReducedMotion(motionQuery.matches);
    }

    handleMotionPreferenceChange();
    motionQuery.addEventListener("change", handleMotionPreferenceChange);

    return () => {
      motionQuery.removeEventListener("change", handleMotionPreferenceChange);
    };
  }, []);

  useEffect(() => {
    const node = rootRef.current;

    if (!node || prefersReducedMotion) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      const fallbackTimer = setTimeout(() => {
        setShouldLoadVideo(true);
        setHasEntered(true);
      }, 0);

      return () => {
        clearTimeout(fallbackTimer);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadVideo(true);
          setHasEntered(true);
        }
      },
      { rootMargin: "220px 0px 140px" },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [prefersReducedMotion]);

  const translateClass = slideFrom === "left" ? "-translate-x-8" : "translate-x-8";
  const motionClass = prefersReducedMotion
    ? "translate-x-0 opacity-100"
    : hasEntered
      ? "translate-x-0 opacity-100"
      : `${translateClass} opacity-0`;

  const shouldRenderVideo = shouldLoadVideo && !prefersReducedMotion && !videoFailed && sources.length > 0;

  return (
    <figure
      ref={rootRef}
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border border-ivory/12 bg-warm-black/72 shadow-[0_28px_70px_rgba(0,0,0,0.22)] transition-[opacity,transform] duration-700 ease-out will-change-transform",
        motionClass,
        className,
      )}
    >
      <div className={cn("relative aspect-[4/3] min-h-[18rem] overflow-hidden", mediaClassName)}>
        <Image
          src={posterSrc}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 620px"
          priority={priority}
          className={cn("object-cover", posterClassName)}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,248,237,0.2),transparent_30%),linear-gradient(180deg,rgba(19,35,33,0.08),rgba(19,35,33,0.58))]" />

        {shouldRenderVideo ? (
          <video
            aria-label={alt}
            autoPlay
            loop
            muted
            playsInline
            poster={posterSrc}
            preload="metadata"
            onCanPlay={() => setCanPlayVideo(true)}
            onError={() => setVideoFailed(true)}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
              canPlayVideo ? "opacity-100" : "opacity-0",
            )}
          >
            {sources.map((source) => (
              <source key={source.src} src={source.src} type={source.type} />
            ))}
          </video>
        ) : null}

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(126,207,192,0.12),transparent_32%,rgba(168,116,69,0.16)_78%,rgba(19,35,33,0.22))] mix-blend-soft-light" />

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <div className="rounded-3xl border border-warm-white/18 bg-warm-black/58 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)] backdrop-blur-sm">
            {eyebrow ? (
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-coral/88">{eyebrow}</p>
            ) : null}
            {label ? <figcaption className="mt-1 font-display text-2xl tracking-[0.08em] text-warm-white">{label}</figcaption> : null}
            {caption ? <p className="mt-2 text-sm leading-relaxed text-ivory/74">{caption}</p> : null}
          </div>
        </div>
      </div>
    </figure>
  );
}
