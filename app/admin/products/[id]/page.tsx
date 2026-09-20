import { notFound } from "next/navigation";
import { getProductRecord } from "@/lib/catalogue";
import { recordToInput } from "@/server/catalogue/product-input";
import { ProductEditor } from "@/components/admin/product-editor";
export const dynamic = "force-dynamic";
export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const product = await getProductRecord(id);
  if (!product) notFound();
  return <ProductEditor id={id} initial={recordToInput(product)} />;
}
