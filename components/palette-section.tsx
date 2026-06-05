// components/palette-section.tsx
"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type PaletteName = "dark" | "sand";

type PaletteSectionProps = {
  palette: PaletteName;
  className?: string;
  children: ReactNode;
};

const palettes: Record<PaletteName, Record<string, string>> = {
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

export function PaletteSection({ palette, className, children }: PaletteSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = sectionRef.current;

    if (!node) {
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

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [palette]);

  return (
    <section
      ref={sectionRef}
      data-palette={palette}
      style={palettes[palette] as CSSProperties}
      className={cn("plankz-palette-section", className)}
    >
      {children}
    </section>
  );
}
