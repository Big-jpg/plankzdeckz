import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PublicCatalogueCategory, PublicCatalogueItem } from "@/lib/public-catalogue";

interface PublicCatalogueCardProps {
  item: PublicCatalogueItem;
  context?: PublicCatalogueCategory;
  wide?: boolean;
}

export function PublicCatalogueCard({ item, context, wide = false }: PublicCatalogueCardProps) {
  const photo = item.images[0];
  const href = `/shop/${item.handle}${context ? `?category=${context}` : ""}`;

  return (
    <article className={`pc-card${wide ? " pc-card--wide" : ""}`} data-catalogue-card={item.handle}>
      <Link className="pc-card-link" href={href}>
        <div className="pc-card-frame">
          <Image
            src={wide || item.category === "boards" ? photo.url : photo.cardUrl}
            alt={photo.alt}
            fill
            sizes={
              wide || item.category === "boards"
                ? "(min-width: 1280px) 610px, (min-width: 640px) 48vw, calc(100vw - 40px)"
                : "(min-width: 1280px) 395px, (min-width: 1024px) 32vw, (min-width: 640px) 48vw, calc(100vw - 40px)"
            }
            className="pc-contained-image"
          />
          <span className="pc-photo-count">
            {item.images.length} {item.images.length === 1 ? "photo" : "photos"}
          </span>
        </div>
        <div className="pc-card-copy">
          <div>
            <h3>{item.title}</h3>
            {wide && <p className="pc-card-description">{item.description}</p>}
            <span className="pc-card-action">View the photos</span>
            {item.category === "jackets" && <p className="pc-card-note">Not available for sale</p>}
          </div>
          <span className="pc-card-arrow" aria-hidden="true">
            <ArrowUpRight size={19} />
          </span>
        </div>
      </Link>
    </article>
  );
}
