import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/admin-auth";
import { reconcileCheckoutAttempt } from "@/server/commerce/checkout";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await checkAdminAuth();
  if (!admin.ok) return NextResponse.json({ error: admin.reason }, { status: admin.status });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id))
    return NextResponse.json({ error: "Invalid checkout attempt." }, { status: 400 });
  try {
    return NextResponse.json({ status: await reconcileCheckoutAttempt(id) });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Reconciliation failed; stock remains reserved.",
      },
      { status: 409 },
    );
  }
}
