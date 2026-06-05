// components/scroll-reel.tsx
"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type SlideFrom = "left" | "right";

type ScrollReelProps = {
  src?: string;
  mp4Src?: string;
  posterSrc: string;
  alt: string;
  slideFrom?: SlideFrom;
  priority?: boolean;
  className?: string;
  mediaClassName?: string;
  posterClassName?: string;
};

function sourceType(src: string) {
  if (src.endsWith(".mp4") || src.endsWith(".m4v")) {
    return "video/mp4";
  }

  return undefined;
}

export function ScrollReel({
  src,
  mp4Src,
  posterSrc,
  alt,
  slideFrom = "right",
  priority = false,
  className,
  mediaClassName,
  posterClassName,
}: ScrollReelProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(priority);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [canPlayVideo, setCanPlayVideo] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [enhanceSlideIn, setEnhanceSlideIn] = useState(false);
  const [hasEntered, setHasEntered] = useState(true);

  const sources = useMemo(() => {
    const reelSources: Array<{ src: string; type?: string }> = [];

    if (mp4Src) {
      reelSources.push({ src: mp4Src, type: "video/mp4" });
    }

    if (src) {
      reelSources.push({ src, type: sourceType(src) });
    }

    return reelSources;
  }, [mp4Src, src]);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function handleMotionPreferenceChange() {
      const shouldReduce = motionQuery.matches;
      setPrefersReducedMotion(shouldReduce);

      if (shouldReduce) {
        setEnhanceSlideIn(false);
        setHasEntered(true);
      }
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

    const { top } = node.getBoundingClientRect();
    const startsBelowViewport = top > window.innerHeight;

    if (startsBelowViewport) {
      setEnhanceSlideIn(true);
      setHasEntered(false);
    } else {
      setEnhanceSlideIn(false);
      setHasEntered(true);
    }
  }, [prefersReducedMotion]);

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
          observer.disconnect();
        }
      },
      { rootMargin: "160px 0px -8%", threshold: 0.01 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [prefersReducedMotion]);

  const translateClass = slideFrom === "left" ? "-translate-x-[14vw]" : "translate-x-[14vw]";
  const motionClass =
    enhanceSlideIn && !hasEntered && !prefersReducedMotion
      ? `${translateClass} opacity-90`
      : "translate-x-0 opacity-100";

  const shouldRenderVideo = shouldLoadVideo && !prefersReducedMotion && !videoFailed && sources.length > 0;

  return (
    <figure
      ref={rootRef}
      className={cn(
        "group relative block w-full overflow-hidden rounded-[2rem] border border-ivory/12 bg-warm-black/72 shadow-[0_28px_70px_rgba(0,0,0,0.22)] transition-[opacity,transform] duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform",
        motionClass,
        className,
      )}
    >
      <div className={cn("relative block aspect-[4/3] min-h-[18rem] w-full overflow-hidden", mediaClassName)}>
        <Image
          src={posterSrc}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 78vw, 75vw"
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
            width={1280}
            height={720}
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

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(126,207,192,0.08),transparent_34%,rgba(168,116,69,0.12)_78%,rgba(19,35,33,0.18))] mix-blend-soft-light" />
      </div>
    </figure>
  );
}
