import type { ProductImage, ProductRecord, PublicationStatus } from "@/lib/catalogue";

export interface ProductInput {
  handle: string;
  title: string;
  description: string;
  productType: "board" | "merch";
  priceAmount: number;
  publicationStatus: PublicationStatus;
  images: ProductImage[];
  boardStyle: "cruiser" | "surfskate" | "longboard" | null;
  boardShape: string;
  timberSpecies: string[];
  lengthCm: number | null;
  widthCm: number | null;
  thicknessCm: number | null;
  availabilityStatus: "available" | "sold";
  stockQuantity: number;
  stockBySize: Record<string, number>;
  fitNotes: string;
}

const sizes = ["S", "M", "L", "XL", "One size"];
const imageHost = /^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/;
function string(value: unknown, max = 500): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function whole(value: unknown): number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : 0;
}
function length(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}
export function parseProductInput(value: unknown): ProductInput {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid product.");
  const raw = value as Record<string, unknown>;
  if (raw.productType !== "board" && raw.productType !== "merch")
    throw new Error("Choose a product type.");
  if (!Number.isSafeInteger(raw.priceAmount) || (raw.priceAmount as number) < 0)
    throw new Error("Enter a valid price in cents.");
  if (!Number.isSafeInteger(raw.stockQuantity) || (raw.stockQuantity as number) < 0)
    throw new Error("Enter a valid stock quantity.");
  const productType = raw.productType === "merch" ? "merch" : "board";
  const publicationStatus: PublicationStatus =
    raw.publicationStatus === "published" || raw.publicationStatus === "archived"
      ? raw.publicationStatus
      : "draft";
  const handle = string(raw.handle, 100).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(handle))
    throw new Error("Enter a URL handle using lowercase letters, numbers, and hyphens.");
  const title = string(raw.title, 120);
  if (!title) throw new Error("Enter a product name.");
  const images = Array.isArray(raw.images)
    ? raw.images.map((item) => {
        if (!item || typeof item !== "object") throw new Error("Invalid image.");
        const image = item as Record<string, unknown>;
        const url = string(image.url, 1000);
        const parsed = new URL(url);
        if (parsed.protocol !== "https:" || !imageHost.test(parsed.hostname))
          throw new Error("Images must be uploaded to the Plankz image store.");
        return { url, alt: string(image.alt, 180) };
      })
    : [];
  if (images.length > 12) throw new Error("Use at most 12 images per product.");
  const stockBySize: Record<string, number> = {};
  if (raw.stockBySize && typeof raw.stockBySize === "object" && !Array.isArray(raw.stockBySize)) {
    for (const [size, quantity] of Object.entries(raw.stockBySize)) {
      if (sizes.includes(size)) {
        if (!Number.isSafeInteger(quantity) || (quantity as number) < 0)
          throw new Error(`Enter valid stock for size ${size}.`);
        stockBySize[size] = quantity as number;
      }
    }
  }
  const boardStyle = ["cruiser", "surfskate", "longboard"].includes(String(raw.boardStyle))
    ? (raw.boardStyle as ProductInput["boardStyle"])
    : null;
  const input: ProductInput = {
    handle,
    title,
    description: string(raw.description, 4000),
    productType,
    priceAmount: whole(raw.priceAmount),
    publicationStatus,
    images,
    boardStyle,
    boardShape: string(raw.boardShape, 120),
    timberSpecies: Array.isArray(raw.timberSpecies)
      ? raw.timberSpecies
          .map((item) => string(item, 60))
          .filter(Boolean)
          .slice(0, 8)
      : [],
    lengthCm: length(raw.lengthCm),
    widthCm: length(raw.widthCm),
    thicknessCm: length(raw.thicknessCm),
    availabilityStatus: raw.availabilityStatus === "sold" ? "sold" : "available",
    stockQuantity: whole(raw.stockQuantity),
    stockBySize,
    fitNotes: string(raw.fitNotes, 1000),
  };
  if (publicationStatus === "published") {
    if (input.priceAmount < 100)
      throw new Error("A published product needs a price of at least $1.");
    if (!input.images.length || !input.images[0].alt)
      throw new Error("Add a primary image and description before publishing.");
    if (!input.description) throw new Error("Add a description before publishing.");
    if (
      productType === "board" &&
      (!boardStyle || !input.boardShape || !input.timberSpecies.length)
    )
      throw new Error("Add the board style, shape, and timber before publishing.");
    if (
      productType === "board" &&
      input.availabilityStatus === "available" &&
      input.stockQuantity !== 1
    )
      throw new Error("A purchasable board must have stock of one.");
    if (productType === "merch" && !Object.values(stockBySize).some((quantity) => quantity > 0))
      throw new Error("Add stock for at least one tee size before publishing.");
  }
  return input;
}

export function recordToInput(row: ProductRecord): ProductInput {
  return {
    handle: row.handle,
    title: row.title,
    description: row.description,
    productType: row.product_type,
    priceAmount: row.price_amount,
    publicationStatus: row.publication_status,
    images: row.image_details,
    boardStyle: row.board_style,
    boardShape: row.board_shape ?? "",
    timberSpecies: row.timber_species,
    lengthCm: Number(row.length_cm) || null,
    widthCm: Number(row.width_cm) || null,
    thicknessCm: Number(row.thickness_cm) || null,
    availabilityStatus: row.availability_status === "sold" ? "sold" : "available",
    stockQuantity: row.stock_quantity,
    stockBySize: row.stock_by_size,
    fitNotes: typeof row.metadata.fit_notes === "string" ? row.metadata.fit_notes : "",
  };
}
