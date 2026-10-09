import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import FadeContent from "@/components/react-bits/fade-content";
import { PublicCatalogueCard } from "@/components/public-catalogue-card";
import { PublicCatalogueGallery } from "@/components/public-catalogue-gallery";
import {
  PUBLIC_CATALOGUE,
  PUBLIC_CATALOGUE_CATEGORIES,
  getPublicCatalogueItemByHandle,
} from "@/lib/public-catalogue";
import "../catalogue.css";

interface PublicCatalogueDetailProps {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ category?: string | string[] }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return PUBLIC_CATALOGUE.map((item) => ({ handle: item.handle }));
}

export async function generateMetadata({ params }: PublicCatalogueDetailProps): Promise<Metadata> {
  const { handle } = await params;
  const item = getPublicCatalogueItemByHandle(handle);
  if (!item) return {};
  const photo = item.images[0];
  return {
    title: item.title,
    description: `${item.description} Online sales are currently closed.`,
    alternates: { canonical: `/shop/${item.handle}` },
    openGraph: {
      title: `${item.title} | Plankz Deckz`,
      description: item.description,
      type: "website",
      images: [{ url: photo.url, width: photo.width, height: photo.height, alt: photo.alt }],
    },
  };
}

export default async function PublicCatalogueDetail({
  params,
  searchParams,
}: PublicCatalogueDetailProps) {
  const { handle } = await params;
  const item = getPublicCatalogueItemByHandle(handle);
  if (!item) notFound();
  const query = await searchParams;
  const context = PUBLIC_CATALOGUE_CATEGORIES.find((category) => category.key === query.category);
  const category = PUBLIC_CATALOGUE_CATEGORIES.find((entry) => entry.key === item.category)!;
  const backHref = context ? `/shop?category=${context.key}#catalogue` : `/shop#${item.category}`;
  const backLabel = context ? `Back to ${context.title.toLowerCase()}` : "Back to the catalogue";
  const related = PUBLIC_CATALOGUE.filter(
    (entry) => entry.category === item.category && entry.id !== item.id,
  ).slice(0, 3);

  return (
    <div className="public-catalogue pc-detail" data-public-catalogue>
      <div className="pc-wrap">
        <Link href={backHref} className="pc-back-link">
          <ArrowLeft size={16} aria-hidden="true" /> {backLabel}
        </Link>
        <div className="pc-detail-layout">
          <FadeContent className="pc-detail-heading">
            <p className="pc-eyebrow">
              {category.title} / {item.images.length}{" "}
              {item.images.length === 1 ? "photo" : "photos"}
            </p>
            <h1>{item.title}</h1>
          </FadeContent>
          <PublicCatalogueGallery title={item.title} images={item.images} />
          <FadeContent className="pc-detail-copy">
            <p className="pc-detail-description">{item.description}</p>
            <div className="pc-sale-note">
              <ArrowUpRight size={20} aria-hidden="true" />
              <div>
                <p>Online sales are currently closed</p>
                <p>
                  {item.category === "jackets"
                    ? "This jacket is not available for sale."
                    : "This is a photo catalogue. You cannot purchase this item here."}
                </p>
              </div>
            </div>
            <Link href={backHref} className="pc-text-link">
              Keep looking <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </FadeContent>
        </div>

        {related.length > 0 && (
          <section className="pc-related" aria-labelledby="related-heading">
            <div className="pc-related-heading">
              <h2 id="related-heading">More {category.title.toLowerCase()}.</h2>
              <Link className="pc-text-link" href={`/shop?category=${item.category}#catalogue`}>
                View all {category.title.toLowerCase()}{" "}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <div className="pc-grid pc-related-grid">
              {related.map((entry) => (
                <PublicCatalogueCard key={entry.id} item={entry} context={item.category} />
              ))}
            </div>
          </section>
        )}
        <div className="pc-detail-end">
          <Link className="pc-text-link" href="/shop#catalogue">
            <ArrowLeft size={16} aria-hidden="true" /> The whole collection
          </Link>
        </div>
      </div>
    </div>
  );
}
