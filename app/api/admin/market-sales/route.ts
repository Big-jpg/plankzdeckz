import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/admin-auth";
import { parseMarketSaleInput } from "@/server/commerce/market-sale-input";
import { MarketSaleConflict, recordMarketSale } from "@/server/commerce/market-sales";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const admin = await checkAdminAuth();
  if (!admin.ok) return NextResponse.json({ error: admin.reason }, { status: admin.status });
  let input;
  try {
    input = parseMarketSaleInput(await request.json());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid sale." },
      { status: 400 },
    );
  }
  try {
    const sale = await recordMarketSale(input, admin.email);
    return NextResponse.json({ sale }, { status: sale.status === "needs_review" ? 202 : 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof MarketSaleConflict
            ? error.message
            : "The sale could not be saved. Retry with the same form before recording it again.",
      },
      { status: error instanceof MarketSaleConflict ? 409 : 500 },
    );
  }
}
