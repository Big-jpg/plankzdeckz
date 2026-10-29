import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/admin-auth";
import { pool } from "@/server/db/client";
import { parseProductInput } from "@/server/catalogue/product-input";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const auth = await checkAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: auth.status });
  const client = await pool.connect();
  try {
    const input = parseProductInput(await request.json());
    await client.query("BEGIN");
    const row = (
      await client.query<{ id: string; revision: number }>(
        `INSERT INTO products
      (handle,title,description,product_type,price_amount,currency,category,image_urls,image_details,
       timber_species,board_style,length_cm,width_cm,thickness_cm,board_shape,availability_status,
       merch_kind,merch_sizes,stock_by_size,stock_quantity,publication_status,metadata)
      VALUES ($1,$2,$3,$4,$5,'aud',$6,$7::jsonb,$8::jsonb,$9,$10,$11,$12,$13,$14,$15,
              $16,$17,$18::jsonb,$19,$20,$21::jsonb) RETURNING id,revision`,
        [
          input.handle,
          input.title,
          input.description,
          input.productType,
          input.priceAmount,
          input.productType === "board" ? "One-of-a-kind boards" : "Merch",
          JSON.stringify(input.images.map((image) => image.url)),
          JSON.stringify(input.images),
          input.timberSpecies,
          input.boardStyle,
          input.lengthCm,
          input.widthCm,
          input.thicknessCm,
          input.boardShape || null,
          input.availabilityStatus,
          input.merchKind,
          input.productType === "merch" ? Object.keys(input.stockBySize) : [],
          JSON.stringify(input.stockBySize),
          input.productType === "board" ? input.stockQuantity : 0,
          input.publicationStatus,
          JSON.stringify({
            fit_notes: input.fitNotes,
            sales_unit_label: input.salesUnitLabel,
            hat_pricing_family: input.hatPricingFamily ?? null,
          }),
        ],
      )
    ).rows[0];
    const stocks = input.productType === "board" ? { "": input.stockQuantity } : input.stockBySize;
    for (const [variant, quantity] of Object.entries(stocks)) {
      if (!quantity) continue;
      await client.query(
        `INSERT INTO inventory_adjustments
        (product_id,variant_key,quantity_delta,before_quantity,after_quantity,reason,operator_email)
        VALUES ($1,$2,$3,0,$3,'Initial stock',$4)`,
        [row.id, variant, quantity, auth.email],
      );
    }
    await client.query("COMMIT");
    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    const message = error instanceof Error ? error.message : "Could not save product.";
    return NextResponse.json(
      { error: message },
      { status: message.includes("duplicate key") ? 409 : 400 },
    );
  } finally {
    client.release();
  }
}
