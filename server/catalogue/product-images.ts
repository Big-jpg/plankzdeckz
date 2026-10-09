import type { ProductImage } from "@/lib/catalogue";

const imageHost = /^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/;

export function parsePhotoUpdate(value: unknown): ProductImage[] {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid photo update.");
  const raw = value as Record<string, unknown>;
  if (Object.keys(raw).some((key) => key !== "images") || !Array.isArray(raw.images))
    throw new Error("A photo update may contain only images.");
  if (raw.images.length > 12) throw new Error("Use at most 12 images per product.");
  return raw.images.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error("Invalid image.");
    const image = item as Record<string, unknown>;
    const url = typeof image.url === "string" ? image.url.trim() : "";
    const alt = typeof image.alt === "string" ? image.alt.trim() : "";
    if (!alt || alt.length > 180)
      throw new Error("Describe every image in at most 180 characters.");
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new Error("Images must be uploaded to the Plankz image store.");
    }
    if (
      url.length > 1000 ||
      parsed.protocol !== "https:" ||
      !imageHost.test(parsed.hostname) ||
      parsed.username ||
      parsed.password ||
      parsed.port
    )
      throw new Error("Images must be uploaded to the Plankz image store.");
    return { url, alt };
  });
}

// A separate statement prevents a stale photo editor from overwriting sale fields.
export const photoUpdateSql = `UPDATE products SET image_urls=$2::jsonb,
  image_details=$3::jsonb,updated_at=now() WHERE id=$1
  AND (publication_status <> 'published' OR jsonb_array_length($3::jsonb) > 0)
  RETURNING id`;
