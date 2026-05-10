// app/products/[handle]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductByHandle, products } from "@/lib/mock-products";
import { ProductDetail } from "@/components/product-detail";

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = getProductByHandle(handle);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.title,
    description: product.description,
  };
}

export function generateStaticParams() {
  return products.map((p) => ({ handle: p.handle }));
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = getProductByHandle(handle);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
