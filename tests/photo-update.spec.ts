import { expect, test } from "@playwright/test";
import { parsePhotoUpdate, photoUpdateSql } from "../server/catalogue/product-images";

const image = {
  url: "https://plankz-test.public.blob.vercel-storage.com/products/photo.webp",
  alt: "Board underside",
};

test("photo updates preserve the requested image order and descriptions", () => {
  const second = { ...image, url: image.url.replace("photo", "top"), alt: "Board top" };
  expect(parsePhotoUpdate({ images: [second, image] })).toEqual([second, image]);
});

test("photo-only updates reject sale-field changes and invalid image locations", () => {
  for (const field of [
    "priceAmount",
    "stockQuantity",
    "stockBySize",
    "publicationStatus",
    "metadata",
  ]) {
    expect(() => parsePhotoUpdate({ images: [image], [field]: 1 })).toThrow("only images");
  }
  for (const url of [
    "/photo-review/images/photo.webp",
    "https://example.com/photo.webp",
    "http://plankz-test.public.blob.vercel-storage.com/photo.webp",
  ]) {
    expect(() => parsePhotoUpdate({ images: [{ ...image, url }] })).toThrow("image store");
  }
  expect(() => parsePhotoUpdate({ images: [{ ...image, alt: "" }] })).toThrow(
    "Describe every image",
  );
});

test("photo update writes only photography fields and retains a published lead photo", () => {
  const assignments = photoUpdateSql.split(" SET ")[1].split(" WHERE ")[0];
  expect(assignments.split(",").map((assignment) => assignment.trim().split("=")[0])).toEqual([
    "image_urls",
    "image_details",
    "updated_at",
  ]);
  expect(photoUpdateSql).toContain(
    "publication_status <> 'published' OR jsonb_array_length($3::jsonb) > 0",
  );
});
