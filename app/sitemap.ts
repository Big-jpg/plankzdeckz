// app/sitemap.ts
import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalogue";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://plankzdeckz.com";

const publicRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/products", changeFrequency: "weekly", priority: 0.9 },
  { path: "/custom", changeFrequency: "monthly", priority: 0.8 },
  { path: "/our-story", changeFrequency: "monthly", priority: 0.8 },
  { path: "/gallery", changeFrequency: "monthly", priority: 0.7 },
  { path: "/merch", changeFrequency: "monthly", priority: 0.7 },
  { path: "/materials", changeFrequency: "monthly", priority: 0.7 },
  { path: "/production", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/pickup", changeFrequency: "monthly", priority: 0.5 },
  { path: "/shipping", changeFrequency: "monthly", priority: 0.5 },
  { path: "/returns", changeFrequency: "yearly", priority: 0.4 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const products = await getProducts();

  return [
    ...publicRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/products/${product.handle}`),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
