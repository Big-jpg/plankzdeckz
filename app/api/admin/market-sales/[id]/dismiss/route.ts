import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/admin-auth";
import { isUuid } from "@/server/commerce/market-sale-input";
import { dismissMarketSale, MarketSaleConflict } from "@/server/commerce/market-sales";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await checkAdminAuth();
  if (!admin.ok) return NextResponse.json({ error: admin.reason }, { status: admin.status });
  const { id } = await context.params;
  if (!isUuid(id)) return NextResponse.json({ error: "Sale not found." }, { status: 404 });
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";
  if (
    reason.length < 10 ||
    reason.length > 1000 ||
    !Number.isSafeInteger(body?.expectedRevision) ||
    body.expectedRevision < 0 ||
    body.stockChecked !== true
  )
    return NextResponse.json(
      { error: "Explain the duplicate or mistake and confirm physical stock has been checked." },
      { status: 400 },
    );
  try {
    return NextResponse.json({
      sale: await dismissMarketSale(id, body.expectedRevision, reason, admin.email),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof MarketSaleConflict
            ? error.message
            : "The record could not be dismissed.",
      },
      { status: error instanceof MarketSaleConflict ? 409 : 500 },
    );
  }
}
