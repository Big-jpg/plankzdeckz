import type { ProductImage, ProductRecord, PublicationStatus } from "@/lib/catalogue";
import { isClothing, isMerchKind, isSizeLabel, type MerchKind } from "@/lib/types";

export interface ProductInput {
  revision: number;
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
  merchKind: MerchKind | null;
  salesUnitLabel: string;
  adjustmentReason: string;
}

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
  if (
    !Number.isSafeInteger(raw.priceAmount) ||
    (raw.priceAmount as number) < 0 ||
    (raw.priceAmount as number) > 2_147_483_647
  )
    throw new Error("Enter a valid price in cents.");
  if (
    !Number.isSafeInteger(raw.stockQuantity) ||
    (raw.stockQuantity as number) < 0 ||
    (raw.stockQuantity as number) > 2_147_483_647
  )
    throw new Error("Enter a valid stock quantity.");
  const productType = raw.productType === "merch" ? "merch" : "board";
  const merchKind = isMerchKind(raw.merchKind) ? raw.merchKind : null;
  if (productType === "merch" && !merchKind) throw new Error("Choose a merchandise category.");
  if (productType === "board" && (raw.stockQuantity as number) > 1)
    throw new Error("A unique board can have stock of zero or one.");
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
        if (
          parsed.protocol !== "https:" ||
          !imageHost.test(parsed.hostname) ||
          parsed.username ||
          parsed.password ||
          parsed.port
        )
          throw new Error("Images must be uploaded to the Plankz image store.");
        return { url, alt: string(image.alt, 180) };
      })
    : [];
  if (images.length > 12) throw new Error("Use at most 12 images per product.");
  const stockBySize: Record<string, number> = {};
  if (raw.stockBySize && typeof raw.stockBySize === "object" && !Array.isArray(raw.stockBySize)) {
    for (const [size, quantity] of Object.entries(raw.stockBySize)) {
      if (!isSizeLabel(size)) throw new Error("Use distinct size labels of at most 32 characters.");
      if (
        !Number.isSafeInteger(quantity) ||
        (quantity as number) < 0 ||
        (quantity as number) > 2_147_483_647
      )
        throw new Error(`Enter valid stock for size ${size}.`);
      stockBySize[size] = quantity as number;
    }
  }
  if (Object.keys(stockBySize).length > 20) throw new Error("Use at most 20 sizes.");
  if (
    productType === "merch" &&
    !isClothing(merchKind) &&
    (publicationStatus === "published" || Object.keys(stockBySize).length > 0) &&
    (Object.keys(stockBySize).length !== 1 || !Object.hasOwn(stockBySize, "One size"))
  )
    throw new Error("Enter a stock quantity for this merchandise product.");
  const boardStyle = ["cruiser", "surfskate", "longboard"].includes(String(raw.boardStyle))
    ? (raw.boardStyle as ProductInput["boardStyle"])
    : null;
  const input: ProductInput = {
    revision:
      Number.isSafeInteger(raw.revision) && (raw.revision as number) >= 0
        ? (raw.revision as number)
        : 0,
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
    merchKind: productType === "merch" ? merchKind : null,
    salesUnitLabel: string(raw.salesUnitLabel, 120),
    adjustmentReason: string(raw.adjustmentReason, 500),
  };
  if (publicationStatus === "published") {
    if (input.priceAmount < 1)
      throw new Error("A published product needs a positive price in cents.");
    if (!input.images.length || input.images.some((image) => !image.alt))
      throw new Error("Add photos and describe every image before publishing.");
    if (!input.description) throw new Error("Add a description before publishing.");
    if (
      productType === "board" &&
      (!boardStyle || !input.boardShape || !input.timberSpecies.length)
    )
      throw new Error("Add the board style, shape, and timber before publishing.");
    if (productType === "board" && input.availabilityStatus === "sold" && input.stockQuantity !== 0)
      throw new Error("A sold board must have stock of zero.");
    if (productType === "merch" && (!Object.keys(stockBySize).length || !input.salesUnitLabel))
      throw new Error("Describe the unit or pack sold and enter its stock before publishing.");
  }
  return input;
}

export function recordToInput(row: ProductRecord): ProductInput {
  return {
    revision: row.revision,
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
    merchKind: isMerchKind(row.merch_kind) ? row.merch_kind : null,
    salesUnitLabel:
      typeof row.metadata.sales_unit_label === "string" ? row.metadata.sales_unit_label : "",
    adjustmentReason: "",
  };
}

export function inventoryChanges(
  row: Pick<ProductRecord, "product_type" | "stock_quantity" | "stock_by_size">,
  input: ProductInput,
) {
  const before = row.product_type === "board" ? { "": row.stock_quantity } : row.stock_by_size;
  const after = input.productType === "board" ? { "": input.stockQuantity } : input.stockBySize;
  return [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .map((variant) => ({ variant, before: before[variant] ?? 0, after: after[variant] ?? 0 }))
    .filter((change) => change.before !== change.after);
}
