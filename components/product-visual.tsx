// components/product-visual.tsx
import Image from "next/image";
import type { ProductType } from "@/lib/types";
import { cn } from "@/lib/utils";

function SkateboardFallback({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 120"
      role="img"
      aria-hidden="true"
      className={cn("h-28 w-52 text-charcoal/32", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M34 63C45 33 74 20 111 20s65 13 76 43c5 15-7 29-22 24-15-6-32-9-54-9s-39 3-54 9c-15 5-28-9-23-24Z"
        fill="currentColor"
        opacity="0.16"
      />
      <path
        d="M35 62C47 34 76 22 111 22s63 12 75 40c5 13-7 25-20 20-16-6-34-9-55-9s-39 3-55 9c-13 5-26-7-21-20Z"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M76 52h70" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M78 91h68" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <circle cx="74" cy="96" r="9" fill="currentColor" opacity="0.4" />
      <circle cx="148" cy="96" r="9" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function ShirtFallback({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      role="img"
      aria-hidden="true"
      className={cn("h-28 w-28 text-charcoal/32", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M55 24c6 8 14 12 25 12s19-4 25-12l34 17-14 31-18-7v68H53V65l-18 7-14-31 34-17Z"
        fill="currentColor"
        opacity="0.16"
      />
      <path
        d="M55 24c6 8 14 12 25 12s19-4 25-12l34 17-14 31-18-7v68H53V65l-18 7-14-31 34-17Z"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M64 49c5 4 10 6 16 6s11-2 16-6" stroke="currentColor" strokeWidth="5" />
      <circle cx="80" cy="87" r="14" stroke="currentColor" strokeWidth="5" opacity="0.5" />
    </svg>
  );
}

export function ProductVisual({
  productType,
  title,
  images,
  className,
  imageClassName,
  priority = false,
  sizes = "(max-width: 1024px) 100vw, 50vw",
}: {
  productType: ProductType;
  title: string;
  images: string[];
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const imageUrl = images[0];

  return (
    <div
      className={cn(
        "relative flex overflow-hidden rounded-[1.75rem] border border-charcoal/8 bg-ivory/55 shadow-[0_18px_45px_rgba(19,35,33,0.06)]",
        className,
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          className={cn("object-contain p-5 drop-shadow-[0_18px_28px_rgba(19,35,33,0.16)] sm:p-6", imageClassName)}
          sizes={sizes}
          priority={priority}
        />
      ) : (
        <div className="woodgrain-soft absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(126,207,192,0.18),transparent_32%),radial-gradient(circle_at_76%_78%,rgba(245,160,160,0.11),transparent_28%)]" />
          <div className="relative">
            {productType === "board" ? <SkateboardFallback /> : <ShirtFallback />}
            <p className="mt-4 max-w-[14rem] text-xs font-semibold uppercase tracking-[0.22em] text-charcoal/44">
              Photo coming soon
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
