import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/admin-auth";
import { queryOne } from "@/server/db/client";
import { parseProductInput } from "@/server/catalogue/product-input";

export const runtime = "nodejs";
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await checkAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: auth.status });
  try {
    const { id } = await context.params;
    const input = parseProductInput(await request.json());
    const row = await queryOne<{ id: string }>(
      `UPDATE products SET
      handle=$2,title=$3,description=$4,price_amount=$5,image_urls=$6::jsonb,
      image_details=$7::jsonb,timber_species=$8,board_style=$9,length_cm=$10,width_cm=$11,
      thickness_cm=$12,board_shape=$13,availability_status=$14,merch_sizes=$15,
      stock_by_size=$16::jsonb,stock_quantity=$17,publication_status=$18,
      metadata=$19::jsonb,updated_at=now()
      WHERE id=$1 AND handle=$2 AND product_type=$20 AND NOT EXISTS
      (SELECT 1 FROM board_checkout_holds h WHERE h.product_id=products.id AND h.expires_at>now())
      AND NOT EXISTS
      (SELECT 1 FROM merch_checkout_holds h WHERE h.product_id=products.id AND h.expires_at>now())
      RETURNING id`,
      [
        id,
        input.handle,
        input.title,
        input.description,
        input.priceAmount,
        JSON.stringify(input.images.map((image) => image.url)),
        JSON.stringify(input.images),
        input.timberSpecies,
        input.boardStyle,
        input.lengthCm,
        input.widthCm,
        input.thicknessCm,
        input.boardShape || null,
        input.availabilityStatus,
        input.productType === "merch" ? Object.keys(input.stockBySize) : [],
        JSON.stringify(input.stockBySize),
        input.productType === "board" ? input.stockQuantity : 0,
        input.publicationStatus,
        JSON.stringify({ fit_notes: input.fitNotes }),
        input.productType,
      ],
    );
    if (!row)
      return NextResponse.json(
        { error: "Product unavailable or held in checkout." },
        { status: 409 },
      );
    return NextResponse.json({ id: row.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save product.";
    return NextResponse.json(
      { error: message },
      { status: message.includes("duplicate key") ? 409 : 400 },
    );
  }
}
