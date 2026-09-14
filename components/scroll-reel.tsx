// components/scroll-reel.tsx
"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type SlideFrom = "left" | "right";

type PlaybackPreferences = {
  reducedMotion: boolean;
  saveData: boolean;
};

type DataConnection = EventTarget & { readonly saveData?: boolean };

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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Priority applies to the poster, not to video before browser preferences are known.
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [preferences, setPreferences] = useState<PlaybackPreferences | null>(null);
  const [canPlayVideo, setCanPlayVideo] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [enhanceSlideIn, setEnhanceSlideIn] = useState(false);
  const [hasEntered, setHasEntered] = useState(true);

  const prefersReducedMotion = preferences?.reducedMotion ?? true;
  const allowVideo = preferences !== null && !preferences.reducedMotion && !preferences.saveData;

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
    const connection = (navigator as Navigator & { connection?: DataConnection }).connection;

    function handlePreferencesChange() {
      const reducedMotion = motionQuery.matches;
      const saveData = connection?.saveData === true;
      setPreferences({ reducedMotion, saveData });

      if (reducedMotion || saveData) {
        setIsInView(false);
        setShouldLoadVideo(false);
        setCanPlayVideo(false);
        setEnhanceSlideIn(false);
        setHasEntered(true);
      }
    }

    handlePreferencesChange();
    motionQuery.addEventListener("change", handlePreferencesChange);
    connection?.addEventListener?.("change", handlePreferencesChange);

    return () => {
      motionQuery.removeEventListener("change", handlePreferencesChange);
      connection?.removeEventListener?.("change", handlePreferencesChange);
    };
  }, []);

  useEffect(() => {
    const node = rootRef.current;

    if (!node || !allowVideo || !("IntersectionObserver" in window)) {
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
  }, [allowVideo]);

  useEffect(() => {
    const node = rootRef.current;

    // Without visibility observation, retain the poster rather than starting every reel.
    if (!node || !allowVideo || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);

        if (entry.isIntersecting) {
          setShouldLoadVideo(true);
          setHasEntered(true);
        }
      },
      { threshold: 0.01 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [allowVideo]);

  const shouldRenderVideo = shouldLoadVideo && allowVideo && !videoFailed && sources.length > 0;

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !shouldRenderVideo) {
      return;
    }

    const updatePlayback = () => {
      if (isInView && !document.hidden) {
        // Autoplay can be denied even for muted media. The poster remains the fallback.
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    };

    updatePlayback();
    document.addEventListener("visibilitychange", updatePlayback);

    return () => {
      document.removeEventListener("visibilitychange", updatePlayback);
      video.pause();
    };
  }, [isInView, shouldRenderVideo]);

  const translateClass = slideFrom === "left" ? "-translate-x-[14vw]" : "translate-x-[14vw]";
  const motionClass =
    enhanceSlideIn && !hasEntered && !prefersReducedMotion
      ? `${translateClass} opacity-90`
      : "translate-x-0 opacity-100";

  return (
    <figure
      ref={rootRef}
      data-reel-policy={preferences === null ? "pending" : allowVideo ? "allowed" : "poster"}
      className={cn(
        "group relative block w-full overflow-hidden rounded-[2rem] border border-ivory/12 bg-warm-black/72 shadow-[0_28px_70px_rgba(0,0,0,0.22)] transition-[opacity,transform] duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
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
            ref={videoRef}
            aria-label={alt}
            loop
            muted
            playsInline
            preload="metadata"
            width={1280}
            height={720}
            onPlaying={() => setCanPlayVideo(true)}
            onPause={() => setCanPlayVideo(false)}
            onError={() => setVideoFailed(true)}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-500 motion-reduce:transition-none",
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
