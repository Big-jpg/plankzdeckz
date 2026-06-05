// components/palette-section.tsx
import type { CSSProperties, ReactNode } from "react";
import { PaletteSectionObserver, palettes, type PaletteName } from "@/components/palette-section-observer";
import { cn } from "@/lib/utils";

type PaletteSectionProps = {
  palette: PaletteName;
  className?: string;
  children: ReactNode;
};

export function PaletteSection({ palette, className, children }: PaletteSectionProps) {
  return (
    <section
      data-palette={palette}
      style={palettes[palette] as CSSProperties}
      className={cn("plankz-palette-section", className)}
    >
      <PaletteSectionObserver palette={palette} />
      {children}
    </section>
  );
}
