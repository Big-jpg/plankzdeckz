import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import FadeContent from "@/components/react-bits/fade-content";
import { PublicCatalogueCard } from "@/components/public-catalogue-card";
import {
  PUBLIC_CATALOGUE,
  PUBLIC_CATALOGUE_CATEGORIES,
  type PublicCatalogueCategory,
} from "@/lib/public-catalogue";
import "./catalogue.css";

export const metadata: Metadata = {
  title: "Deckz & wares",
  description:
    "A closer look at Plankz boards, hats, tees, jackets, bearings and stickers. Browse the photo collection. Online sales are currently closed.",
  alternates: { canonical: "/shop" },
};

const introductions: Record<PublicCatalogueCategory, string> = {
  boards: "Each deck, from more than one angle.",
  hats: "Five colours. One familiar mark.",
  tees: "The Plankz mark, front and back.",
  jackets: "A closer look at the beige and olive jackets. Not available for sale.",
  bearings: "A closer look at the smaller details.",
  stickers: "Three designs, photographed individually and together.",
};

interface ShopPageProps {
  searchParams: Promise<{ category?: string | string[] }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const query = await searchParams;
  const selected = PUBLIC_CATALOGUE_CATEGORIES.find(
    (category) => category.key === query.category,
  )?.key;
  const categories = selected
    ? PUBLIC_CATALOGUE_CATEGORIES.filter((category) => category.key === selected)
    : PUBLIC_CATALOGUE_CATEGORIES;
  const selectedItems = selected
    ? PUBLIC_CATALOGUE.filter((item) => item.category === selected)
    : PUBLIC_CATALOGUE;
  const lead = PUBLIC_CATALOGUE.find((item) => item.category === "boards")!;
  const leadPhoto = lead.images[0];

  return (
    <div className="public-catalogue" data-public-catalogue>
      <header className="pc-intro pc-wrap">
        <FadeContent className="pc-intro-copy">
          <p className="pc-eyebrow">Plankz Deckz / The photo catalogue</p>
          <h1>
            Deckz &amp;
            <br />
            <span>wares.</span>
          </h1>
          <p className="pc-intro-description">
            The boards, the wear, the little extras.
            <br />
            Take a closer look at Plankz.
          </p>
          <p className="pc-sales-status">
            <span aria-hidden="true" /> Online sales are currently closed
          </p>
          <Link className="pc-text-link" href="#catalogue">
            Explore the photos <ArrowDown size={16} aria-hidden="true" />
          </Link>
        </FadeContent>
        <FadeContent className="pc-intro-photo" delay={0.1}>
          <Link
            className="pc-feature-link"
            href={`/shop/${lead.handle}${selected ? `?category=${selected}` : ""}`}
          >
            <div className="pc-feature-frame">
              <Image
                src={leadPhoto.url}
                alt={leadPhoto.alt}
                fill
                priority
                sizes="(min-width: 1280px) 660px, (min-width: 768px) 55vw, calc(100vw - 40px)"
                className="pc-contained-image"
              />
              <span className="pc-feature-index">01 / Deckz</span>
            </div>
            <div className="pc-feature-caption">
              <span>Good from every angle.</span>
              <span>
                View {lead.title.toLowerCase()}
                <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            </div>
          </Link>
        </FadeContent>
      </header>

      <div className="pc-category-bar" id="catalogue">
        <nav className="pc-wrap pc-category-links" aria-label="Catalogue categories">
          <Link href="/shop#catalogue" aria-current={!selected ? "page" : undefined}>
            All <span>{PUBLIC_CATALOGUE.length}</span>
          </Link>
          {PUBLIC_CATALOGUE_CATEGORIES.map((category) => (
            <Link
              key={category.key}
              href={`/shop?category=${category.key}#catalogue`}
              aria-current={selected === category.key ? "page" : undefined}
            >
              {category.title}
              <span>
                {PUBLIC_CATALOGUE.filter((item) => item.category === category.key).length}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="pc-wrap pc-collection-summary">
        <p>
          {String(selectedItems.length).padStart(2, "0")} to explore /{" "}
          {selected
            ? PUBLIC_CATALOGUE_CATEGORIES.find((category) => category.key === selected)!.title
            : "The whole collection"}
        </p>
        <p>Look around. Nothing here can be purchased online.</p>
      </div>

      {categories.map((category, index) => {
        const items = PUBLIC_CATALOGUE.filter((item) => item.category === category.key);
        const collectionNumber =
          PUBLIC_CATALOGUE_CATEGORIES.findIndex((entry) => entry.key === category.key) + 1;

        return (
          <section
            key={category.key}
            id={category.key}
            className={`pc-section pc-section--${category.key}`}
            aria-labelledby={`heading-${category.key}`}
          >
            {category.key !== "boards" && (selected || index === 1) && (
              <span id="merch" className="pc-anchor" aria-hidden="true" />
            )}
            <div className="pc-wrap">
              <FadeContent className="pc-section-heading">
                <div>
                  <p className="pc-eyebrow">
                    Collection / {String(collectionNumber).padStart(2, "0")}
                  </p>
                  <h2 id={`heading-${category.key}`}>
                    {category.title}
                    <span>{String(items.length).padStart(2, "0")}</span>
                  </h2>
                </div>
                <p>{introductions[category.key]}</p>
              </FadeContent>
              <div className={`pc-grid pc-grid--${category.key}`}>
                {items.map((item) => (
                  <PublicCatalogueCard
                    key={item.id}
                    item={item}
                    context={selected}
                    wide={items.length === 1}
                  />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <div className="pc-wrap pc-end-note">
        <p className="pc-eyebrow">That&apos;s the collection.</p>
        <h2>Thanks for having a look.</h2>
        <Link className="pc-text-link" href="/our-story">
          A little more about Plankz <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
