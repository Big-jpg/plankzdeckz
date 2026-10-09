import "server-only";

import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { cache } from "react";

export const photoReviewCategories = [
  { key: "boards", title: "Boards" },
  { key: "hats", title: "Hats" },
  { key: "tees", title: "Tees" },
  { key: "jackets", title: "Jackets" },
  { key: "hardware", title: "Hardware" },
  { key: "stickers", title: "Stickers" },
] as const;

export type PhotoReviewCategory = (typeof photoReviewCategories)[number]["key"];

export interface PhotoReviewImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

/** A photo display record cannot carry price, stock or checkout fields. */
export interface PhotoReviewItem {
  handle: string;
  title: string;
  category: PhotoReviewCategory;
  description: string;
  purchasable: false;
  images: PhotoReviewImage[];
}

const itemKeys = ["handle", "title", "category", "description", "purchasable", "images"];
const imageKeys = ["url", "alt", "width", "height"];
const localImageUrl = /^\/photo-review\/images\/[a-f0-9]{12}-1600\.webp$/;

function hasExactKeys(value: unknown, keys: string[]): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length === keys.length &&
    keys.every((key) => Object.hasOwn(value, key))
  );
}

function isText(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

function isImage(value: unknown): value is PhotoReviewImage {
  if (!hasExactKeys(value, imageKeys)) return false;
  return (
    typeof value.url === "string" &&
    localImageUrl.test(value.url) &&
    isText(value.alt, 500) &&
    typeof value.width === "number" &&
    Number.isSafeInteger(value.width) &&
    value.width > 0 &&
    value.width <= 8_000 &&
    typeof value.height === "number" &&
    Number.isSafeInteger(value.height) &&
    value.height > 0 &&
    value.height <= 8_000
  );
}

function isItem(value: unknown): value is PhotoReviewItem {
  if (!hasExactKeys(value, itemKeys)) return false;
  return (
    typeof value.handle === "string" &&
    /^photo-review-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.handle) &&
    value.handle.length <= 100 &&
    isText(value.title, 200) &&
    photoReviewCategories.some((category) => category.key === value.category) &&
    isText(value.description, 2_000) &&
    value.purchasable === false &&
    Array.isArray(value.images) &&
    value.images.length > 0 &&
    value.images.length <= 20 &&
    value.images.every(isImage) &&
    new Set(value.images.map((image) => image.url)).size === value.images.length
  );
}

export function photoReviewMessage(category: PhotoReviewCategory): string {
  return category === "jackets"
    ? "Not available for sale"
    : "Photo preview — not available to purchase";
}

export const getPhotoReviewItems = cache(async (): Promise<PhotoReviewItem[]> => {
  if (process.env.NODE_ENV !== "development") return [];

  const manifestPath = join(process.cwd(), ".photo-intake", "display-catalogue.json");
  try {
    const manifestStat = await stat(manifestPath);
    if (!manifestStat.isFile() || manifestStat.size > 1_048_576) return [];
    const manifest: unknown = JSON.parse(await readFile(manifestPath, "utf8"));
    if (!hasExactKeys(manifest, ["items"]) || !Array.isArray(manifest.items)) return [];
    if (manifest.items.length > 200 || !manifest.items.every(isItem)) return [];
    if (new Set(manifest.items.map((item) => item.handle)).size !== manifest.items.length)
      return [];
    return manifest.items;
  } catch {
    return [];
  }
});

export async function getPhotoReviewItem(handle: string): Promise<PhotoReviewItem | undefined> {
  return (await getPhotoReviewItems()).find((item) => item.handle === handle);
}
