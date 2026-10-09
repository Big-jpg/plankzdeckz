import Link from "next/link";
import { ProductGallery } from "@/components/product-gallery";
import {
  photoReviewCategories,
  photoReviewMessage,
  type PhotoReviewItem,
} from "@/lib/photo-review";

export function PhotoReviewDetail({ item }: { item: PhotoReviewItem }) {
  const category = photoReviewCategories.find((entry) => entry.key === item.category);
  return (
    <div className="bg-[#f8f2e5] px-5 py-10 text-[#332619] sm:py-16" data-photo-review>
      <div className="mx-auto max-w-7xl">
        <Link
          href={`/photo-review#${item.category}`}
          className="inline-block border-b border-[#332619] pb-1 font-semibold focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          ← All photo previews
        </Link>
        <div className="mt-8 grid min-w-0 gap-9 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div className="min-w-0" data-photo-gallery>
            <ProductGallery
              key={item.handle}
              product={{
                title: item.title,
                images: item.images.map((image) => image.url),
                imageDetails: item.images,
              }}
              sizes="(min-width: 1280px) 650px, (min-width: 1024px) 55vw, calc(100vw - 40px)"
              unoptimized
              thumbnailUrls={item.images.map((image) =>
                image.url.replace(/-1600\.webp$/, "-320.webp"),
              )}
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[.3em] text-[#2f6963]">
              {category?.title} · Photo preview
            </p>
            <h1 className="mt-4 break-words font-display text-5xl sm:text-7xl">{item.title}</h1>
            <p className="mt-6 border-y border-[#332619]/20 py-4 text-base font-semibold">
              {photoReviewMessage(item.category)}
            </p>
            <p className="mt-6 whitespace-pre-line text-lg leading-8">{item.description}</p>
            <p className="mt-6 text-sm leading-6 text-[#332619]/75">
              These photographs are shown for review. Sales details have not been confirmed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
