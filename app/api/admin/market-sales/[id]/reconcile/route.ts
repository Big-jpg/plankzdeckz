import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/admin-auth";
import { isUuid, parseMarketSaleInput } from "@/server/commerce/market-sale-input";
import { MarketSaleConflict, recordMarketSale } from "@/server/commerce/market-sales";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await checkAdminAuth();
  if (!admin.ok) return NextResponse.json({ error: admin.reason }, { status: admin.status });
  const { id } = await context.params;
  if (!isUuid(id)) return NextResponse.json({ error: "Sale not found." }, { status: 404 });
  let input;
  try {
    input = parseMarketSaleInput({ ...(await request.json()), requestId: id });
    if (input.expectedRevision === undefined) throw new Error("Reload the sale before retrying.");
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid sale." },
      { status: 400 },
    );
  }
  try {
    const sale = await recordMarketSale(input, admin.email, true);
    return NextResponse.json({ sale }, { status: sale.status === "needs_review" ? 202 : 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof MarketSaleConflict
            ? error.message
            : "The sale could not be reconciled. Its saved record remains available for review.",
      },
      { status: error instanceof MarketSaleConflict ? 409 : 500 },
    );
  }
}
