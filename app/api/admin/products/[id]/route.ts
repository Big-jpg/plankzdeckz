import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/admin-auth";
import { pool, queryOne } from "@/server/db/client";
import type { ProductRecord } from "@/lib/catalogue";
import { inventoryChanges, parseProductInput } from "@/server/catalogue/product-input";
import { parsePhotoUpdate, photoUpdateSql } from "@/server/catalogue/product-images";

export const runtime = "nodejs";
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await checkAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: auth.status });
  try {
    const { id } = await context.params;
    const images = parsePhotoUpdate(await request.json());
    const row = await queryOne<{ id: string; revision: number }>(photoUpdateSql, [
      id,
      JSON.stringify(images.map((image) => image.url)),
      JSON.stringify(images),
    ]);
    if (!row)
      return NextResponse.json(
        { error: "Product not found, or a published product would have no photos." },
        { status: 409 },
      );
    return NextResponse.json({ id: row.id, revision: row.revision });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save photos." },
      { status: 400 },
    );
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await checkAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: auth.status });
  const client = await pool.connect();
  try {
    const { id } = await context.params;
    const raw = await request.json();
    if (!Number.isSafeInteger(raw?.revision) || raw.revision < 0)
      return NextResponse.json({ error: "Reload the product before saving." }, { status: 409 });
    const input = parseProductInput(raw);
    await client.query("BEGIN");
    const existing = (
      await client.query<ProductRecord>("SELECT * FROM products WHERE id=$1 FOR UPDATE", [id])
    ).rows[0];
    if (
      !existing ||
      existing.revision !== input.revision ||
      existing.handle !== input.handle ||
      existing.product_type !== input.productType
    ) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Product changed. Reload it before saving." },
        { status: 409 },
      );
    }
    const held = await client.query(
      `SELECT 1 FROM board_checkout_holds WHERE product_id=$1
      UNION ALL SELECT 1 FROM merch_checkout_holds WHERE product_id=$1 LIMIT 1`,
      [id],
    );
    if (held.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Product is held in checkout. Reconcile or expire the checkout before editing." },
        { status: 409 },
      );
    }
    const changes = inventoryChanges(existing, input);
    const availabilityChanged = existing.availability_status !== input.availabilityStatus;
    if ((changes.length || availabilityChanged) && !input.adjustmentReason) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Give a reason for the stock or availability adjustment." },
        { status: 422 },
      );
    }
    const pending = await client.query(
      `SELECT 1 FROM market_sales WHERE status='needs_review'
      AND items @> jsonb_build_array(jsonb_build_object('productId',$1::text)) LIMIT 1`,
      [id],
    );
    if (
      pending.rowCount &&
      (changes.length || availabilityChanged || input.publicationStatus === "published")
    ) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Resolve the outstanding market sale before changing stock or publishing." },
        { status: 409 },
      );
    }
    const row = (
      await client.query<{ id: string; revision: number }>(
        `UPDATE products SET
      handle=$2,title=$3,description=$4,price_amount=$5,image_urls=$6::jsonb,
      image_details=$7::jsonb,timber_species=$8,board_style=$9,length_cm=$10,width_cm=$11,
      thickness_cm=$12,board_shape=$13,availability_status=$14,merch_sizes=$15,
      stock_by_size=$16::jsonb,stock_quantity=$17,publication_status=$18,
      metadata=metadata || $19::jsonb,merch_kind=$21,updated_at=now(),revision=revision+1
      WHERE id=$1 AND handle=$2 AND product_type=$20 RETURNING id, revision`,
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
          JSON.stringify({
            fit_notes: input.fitNotes,
            sales_unit_label: input.salesUnitLabel,
            hat_pricing_family: input.hatPricingFamily ?? null,
          }),
          input.productType,
          input.merchKind,
        ],
      )
    ).rows[0];
    const audit = changes.length
      ? changes
      : availabilityChanged
        ? [{ variant: "", before: existing.stock_quantity, after: input.stockQuantity }]
        : [];
    for (const change of audit) {
      await client.query(
        `INSERT INTO inventory_adjustments
        (product_id,variant_key,quantity_delta,before_quantity,after_quantity,reason,operator_email)
        VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          id,
          change.variant,
          change.after - change.before,
          change.before,
          change.after,
          input.adjustmentReason,
          auth.email,
        ],
      );
    }
    await client.query("COMMIT");
    return NextResponse.json(row);
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
