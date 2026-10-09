import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PhotoReviewCard } from "@/components/photo-review-card";
import { getPhotoReviewItems, photoReviewCategories } from "@/lib/photo-review";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Photo review",
  description: "Local review of supplied Plankz photography. These previews cannot be purchased.",
  robots: { index: false, follow: false },
};

export default async function PhotoReviewPage() {
  const items = await getPhotoReviewItems();
  if (!items.length) notFound();

  const populatedCategories = photoReviewCategories.filter((category) =>
    items.some((item) => item.category === category.key),
  );

  return (
    <div className="bg-[#f8f2e5] text-[#332619]" data-photo-review>
      <header className="border-b border-[#332619]/15 px-5 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[.3em] text-[#2f6963]">
            Local photo review
          </p>
          <h1 className="mt-4 font-display text-6xl sm:text-8xl">Deckz & wares.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8">
            Supplied photographs for review. Every item here is a photo preview and cannot be
            purchased. Jackets are not available for sale.
          </p>
          <nav aria-label="Photo categories" className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
            {populatedCategories.map((category) => (
              <Link
                key={category.key}
                href={`#${category.key}`}
                className="border-b border-[#332619] pb-1 font-semibold focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                {category.title}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {populatedCategories.map((category, index) => (
        <section
          key={category.key}
          id={category.key}
          className={`scroll-mt-24 px-5 py-12 sm:py-16 ${index % 2 ? "bg-[#e7d9c5]" : ""}`}
        >
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-8 font-display text-5xl">{category.title}</h2>
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {items
                .filter((item) => item.category === category.key)
                .map((item) => (
                  <PhotoReviewCard key={item.handle} item={item} />
                ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
