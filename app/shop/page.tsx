import type { Metadata } from "next";
import Link from "next/link";
import FadeContent from "@/components/react-bits/fade-content";
import { PublicCatalogueCard } from "@/components/public-catalogue-card";
import { PUBLIC_CATALOGUE, PUBLIC_CATALOGUE_CATEGORIES } from "@/lib/public-catalogue";
import { getProducts } from "@/lib/catalogue";
import { SALES_ENABLED } from "@/lib/commerce-config";
import { commerceCategory } from "@/lib/commerce-categories";
import { isPurchasableProduct } from "@/lib/sellability";
import type { Product } from "@/lib/types";
import { ProductVisual } from "@/components/product-visual";
import "./catalogue.css";

export const metadata: Metadata = {
  title: "Deckz & wares",
  description: "Plankz boards, hats, tees, jackets, hardware and stickers.",
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
    : PUBLIC_CATALOGUE_CATEGORIES.filter((category) =>
        PUBLIC_CATALOGUE.some((item) => item.category === category.key),
      );
  let available: Product[] = [];
  let commerceUnavailable = false;
  if (SALES_ENABLED) {
    try {
      available = (await getProducts()).filter(
        (product) =>
          isPurchasableProduct(product) && (!selected || commerceCategory(product) === selected),
      );
    } catch {
      commerceUnavailable = true;
    }
  }

  return (
    <div className="public-catalogue" data-public-catalogue>
      <header className="pc-shop-heading pc-wrap">
        <FadeContent>
          <h1>Deckz &amp; wares</h1>
        </FadeContent>
        {!SALES_ENABLED && <p className="pc-sales-status">Online sales are currently closed</p>}
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

      {SALES_ENABLED && (
        <section
          id="available-products"
          className="pc-section"
          aria-labelledby="available-products-heading"
        >
          <div className="pc-wrap">
            <div className="pc-section-heading">
              <h2 id="available-products-heading">Available products</h2>
            </div>
            {commerceUnavailable ? (
              <p role="status">
                Product availability could not be loaded. Please try again shortly.
              </p>
            ) : available.length ? (
              <div className="pc-grid">
                {available.map((product) => (
                  <article key={product.id} data-commerce-product={product.handle}>
                    <Link href={`/products/${product.handle}`} className="block">
                      <ProductVisual
                        productType={product.productType}
                        title={product.title}
                        images={product.images}
                        className="aspect-[4/5] border-0 bg-transparent shadow-none"
                        imageClassName="object-contain"
                      />
                      <h3 className="mt-4 text-xl font-semibold">{product.title}</h3>
                      <p>
                        {new Intl.NumberFormat("en-AU", {
                          style: "currency",
                          currency: product.currency,
                        }).format(product.price)}
                      </p>
                      {product.productType === "merch" && product.salesUnitLabel && (
                        <p className="text-sm">Per {product.salesUnitLabel}</p>
                      )}
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <p>No products are currently available in this category.</p>
            )}
          </div>
        </section>
      )}

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
              {items.length === 0 && <p>Photographs have not yet been supplied for this category.</p>}
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
