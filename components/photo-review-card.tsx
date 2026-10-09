import Image from "next/image";
import Link from "next/link";
import { photoReviewMessage, type PhotoReviewItem } from "@/lib/photo-review";

export function PhotoReviewCard({ item }: { item: PhotoReviewItem }) {
  const image = item.images[0];
  return (
    <article className="min-w-0">
      <Link
        href={`/photo-review/${item.handle}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#332619]"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-[#eee3d2]">
          <Image
            src={image.url.replace(/-1600\.webp$/, "-800.webp")}
            alt={image.alt}
            fill
            unoptimized
            sizes="(min-width: 1280px) 395px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, calc(100vw - 40px)"
            className="object-contain"
          />
        </div>
        <div className="border-b border-[#3c2b20]/25 py-4">
          <h3 className="break-words font-display text-3xl text-[#332619]">{item.title}</h3>
          <p className="mt-2 text-sm font-semibold text-[#332619]">
            {photoReviewMessage(item.category)}
          </p>
          <p className="mt-3 text-sm font-semibold text-[#2f6963]">View photos →</p>
        </div>
      </Link>
    </article>
  );
}
