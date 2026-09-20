import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Custom requests are paused." }, { status: 410 });
}
