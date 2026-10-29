import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/admin-auth";
import { getOrderById } from "@/server/db/contracts";
import { refreshOrderRefunds } from "@/server/commerce/refunds";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await checkAdminAuth();
  if (!admin.ok) return NextResponse.json({ error: admin.reason }, { status: admin.status });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id))
    return NextResponse.json({ error: "Invalid order." }, { status: 400 });
  try {
    const order = await getOrderById(id);
    if (!order?.stripe_payment_intent_id)
      return NextResponse.json({ error: "No linked Stripe payment." }, { status: 404 });
    await refreshOrderRefunds(order.stripe_payment_intent_id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Stripe reconciliation failed. No stock was changed." },
      { status: 502 },
    );
  }
}
