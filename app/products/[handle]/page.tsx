// app/products/[handle]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductByHandle, getProducts } from "@/lib/catalogue";
import { ProductDetail } from "@/components/product-detail";

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) return { title: "Product Not Found" };
  const productImage = product.images[0] ?? "/og-product-placeholder.svg";

  return {
    title: product.title,
    description: product.description,
    alternates: {
      canonical: `/products/${product.handle}`,
    },
    openGraph: {
      type: "website",
      title: product.title,
      description: product.description,
      url: `/products/${product.handle}`,
      images: [
        {
          url: productImage,
          width: 1200,
          height: 630,
          alt: `${product.title} by PLANKZ DECKZ`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.description,
      images: [productImage],
    },
  };
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ handle: p.handle }));
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
