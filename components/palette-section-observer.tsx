// components/palette-section-observer.tsx
"use client";

import { useEffect, useRef } from "react";

export type PaletteName = "dark" | "sand";

export const palettes: Record<PaletteName, Record<string, string>> = {
  dark: {
    "--plankz-page-bg-a": "#132321",
    "--plankz-page-bg-b": "#203a49",
    "--plankz-page-bg-c": "#132321",
    "--plankz-page-accent-a": "#7ecfc0",
    "--plankz-page-accent-b": "#f5a0a0",
    "--foreground": "#f4efe6",
  },
  sand: {
    "--plankz-page-bg-a": "#fff8ed",
    "--plankz-page-bg-b": "#f4efe6",
    "--plankz-page-bg-c": "#ead8b8",
    "--plankz-page-accent-a": "#a87445",
    "--plankz-page-accent-b": "#7ecfc0",
    "--foreground": "#243230",
  },
};

function applyPalette(palette: PaletteName) {
  const root = document.documentElement;
  const body = document.body;

  Object.entries(palettes[palette]).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });

  body.dataset.plankzPalette = palette;
}

type PaletteSectionObserverProps = {
  palette: PaletteName;
};

export function PaletteSectionObserver({ palette }: PaletteSectionObserverProps) {
  const markerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const marker = markerRef.current;
    const section = marker?.parentElement;

    if (!section) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      applyPalette(palette);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          applyPalette(palette);
        }
      },
      { rootMargin: "-35% 0px -45%", threshold: 0 },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, [palette]);

  return <span ref={markerRef} aria-hidden="true" className="hidden" />;
}
