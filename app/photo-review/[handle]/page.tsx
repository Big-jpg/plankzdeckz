import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PhotoReviewDetail } from "@/components/photo-review-detail";
import { getPhotoReviewItem } from "@/lib/photo-review";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const item = await getPhotoReviewItem(handle);
  return {
    title: item ? `${item.title} · Photo review` : "Photo preview not found",
    description: "Local photo preview. This item cannot be purchased.",
    robots: { index: false, follow: false },
  };
}

export default async function PhotoReviewItemPage({ params }: Props) {
  const { handle } = await params;
  const item = await getPhotoReviewItem(handle);
  if (!item) notFound();
  return <PhotoReviewDetail item={item} />;
}
