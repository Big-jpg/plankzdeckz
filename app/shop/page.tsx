import type { Metadata } from "next";
import Link from "next/link";
import FadeContent from "@/components/react-bits/fade-content";
import { PublicCatalogueCard } from "@/components/public-catalogue-card";
import { PUBLIC_CATALOGUE, PUBLIC_CATALOGUE_CATEGORIES } from "@/lib/public-catalogue";
import "./catalogue.css";

export const metadata: Metadata = {
  title: "Deckz & wares",
  description: "Plankz boards, hats, tees, jackets, bearings and stickers.",
  alternates: { canonical: "/shop" },
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

  return (
    <div className="public-catalogue" data-public-catalogue>
      <header className="pc-shop-heading pc-wrap">
        <FadeContent>
          <h1>Deckz &amp; wares</h1>
        </FadeContent>
        <p className="pc-sales-status">Online sales are currently closed</p>
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

      {categories.map((category, index) => {
        const items = PUBLIC_CATALOGUE.filter((item) => item.category === category.key);
        return (
          <section
            key={category.key}
            id={category.key}
            className={`pc-section pc-section--${category.key}${selected ? " pc-section--filtered" : ""}`}
            aria-labelledby={selected ? undefined : `heading-${category.key}`}
            aria-label={selected ? category.title : undefined}
          >
            {category.key !== "boards" && (selected || index === 1) && (
              <span id="merch" className="pc-anchor" aria-hidden="true" />
            )}
            <div className="pc-wrap">
              {!selected && (
                <FadeContent className="pc-section-heading">
                  <h2 id={`heading-${category.key}`}>{category.title}</h2>
                </FadeContent>
              )}
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
    </div>
  );
}
