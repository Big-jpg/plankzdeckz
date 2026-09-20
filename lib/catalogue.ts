import "server-only";
import { queryOne, queryRows } from "@/server/db/client";
import type { BoardProduct, BoardStyle, MerchProduct, Product, ProductCategory } from "./types";
import { isBoardProduct, isMerchProduct } from "./types";

export type ProductImage = { url: string; alt: string };
export type PublicationStatus = "draft" | "published" | "archived";
export interface ProductRecord {
  id: string;
  handle: string;
  title: string;
  description: string;
  product_type: "board" | "merch";
  price_amount: number;
  currency: string;
  category: string | null;
  image_urls: string[];
  image_details: ProductImage[];
  timber_species: string[];
  board_style: BoardStyle | null;
  length_cm: string | null;
  width_cm: string | null;
  thickness_cm: string | null;
  board_shape: string | null;
  availability_status: "available" | "sold" | "reserved";
  merch_kind: string | null;
  merch_sizes: string[];
  stock_by_size: Record<string, number>;
  stock_quantity: number;
  publication_status: PublicationStatus;
  metadata: Record<string, unknown>;
}

const columns = `id, handle, title, description, product_type, price_amount, currency, category,
  image_urls, image_details, timber_species, board_style, length_cm, width_cm, thickness_cm,
  board_shape, availability_status, merch_kind, merch_sizes, stock_by_size, stock_quantity,
  publication_status, metadata`;

function categoryFor(row: ProductRecord): ProductCategory {
  if (row.product_type === "merch") return "Merch";
  if (row.board_style === "surfskate") return "Surfskate deckz";
  if (row.board_style === "longboard") return "Longboard deckz";
  return "Reclaimed cruisers";
}

export function toProduct(row: ProductRecord): Product {
  const images = row.image_details.length
    ? row.image_details.map((image) => image.url)
    : row.image_urls;
  const dimensions = [row.length_cm, row.width_cm, row.thickness_cm].filter(Boolean).join(" × ");
  const dimensionsDisplay = dimensions ? `${dimensions} cm` : "";
  const common = {
    id: row.id,
    handle: row.handle,
    title: row.title,
    description: row.description,
    price: row.price_amount / 100,
    currency: row.currency.toUpperCase(),
    images,
    imageDetails: row.image_details,
    publicationStatus: row.publication_status,
    stockBySize: row.stock_by_size,
    stockQuantity: row.stock_quantity,
    material: row.timber_species.join(" / "),
    dimensions: dimensionsDisplay,
    colours: [],
    boardStyles: row.board_style
      ? [
          row.board_style === "surfskate"
            ? ("Surfskate" as const)
            : row.board_style === "longboard"
              ? ("Longboard" as const)
              : ("Cruiser" as const),
        ]
      : [],
    inStock:
      row.product_type === "board"
        ? row.availability_status === "available" && row.stock_quantity > 0
        : Object.values(row.stock_by_size).some((quantity) => quantity > 0),
  };
  if (row.product_type === "board") {
    return {
      ...common,
      productType: "board",
      category: categoryFor(row) as BoardProduct["category"],
      availabilityStatus: row.availability_status,
      timberSpecies: row.timber_species,
      boardStyle: row.board_style ?? "cruiser",
      boardShape: row.board_shape ?? "Complete board",
      boardDimensions: {
        display: dimensionsDisplay,
        lengthCm: Number(row.length_cm) || undefined,
        widthCm: Number(row.width_cm) || undefined,
        thicknessCm: Number(row.thickness_cm) || undefined,
      },
      specs: [
        { label: "Shape", value: row.board_shape ?? "Complete board" },
        { label: "Timber", value: row.timber_species.join(" / ") },
        { label: "Dimensions", value: dimensionsDisplay },
      ].filter((item) => item.value),
      galleryNotes: row.description,
    };
  }
  return {
    ...common,
    productType: "merch",
    category: "Merch",
    merchKind: "tee",
    sizes: row.merch_sizes as MerchProduct["sizes"],
    sizeRequired: row.merch_sizes.length > 1,
    fitNotes: typeof row.metadata.fit_notes === "string" ? row.metadata.fit_notes : "",
  };
}

export async function getProducts(): Promise<Product[]> {
  const rows = await queryRows<ProductRecord>(
    `SELECT ${columns} FROM products WHERE publication_status = 'published'
     AND (product_type = 'board' OR merch_kind = 'tee') ORDER BY created_at DESC`,
  );
  return rows.map(toProduct);
}
export async function getAdminProducts(): Promise<ProductRecord[]> {
  return queryRows<ProductRecord>(`SELECT ${columns} FROM products ORDER BY updated_at DESC`);
}
export async function getProductByHandle(
  handle: string,
  includeDraft = false,
): Promise<Product | null> {
  const row = await queryOne<ProductRecord>(
    `SELECT ${columns} FROM products WHERE handle = $1 AND ($2 OR publication_status = 'published')`,
    [handle, includeDraft],
  );
  return row ? toProduct(row) : null;
}
export async function getProductRecord(id: string): Promise<ProductRecord | null> {
  return queryOne<ProductRecord>(`SELECT ${columns} FROM products WHERE id = $1`, [id]);
}
export async function getBoardProducts(): Promise<BoardProduct[]> {
  return (await getProducts()).filter(isBoardProduct);
}
export async function getAvailableBoards(): Promise<BoardProduct[]> {
  return (await getBoardProducts()).filter((board) => board.inStock);
}
export async function getSoldBoards(): Promise<BoardProduct[]> {
  return (await getBoardProducts()).filter((board) => board.availabilityStatus === "sold");
}
export async function getMerchProducts(): Promise<MerchProduct[]> {
  return (await getProducts()).filter(isMerchProduct);
}
export function getCategories(): ProductCategory[] {
  return ["One-of-a-kind boards", "Merch"];
}
export function getCatalogueSource(): "neon" {
  return "neon";
}
