import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Custom design is paused." }, { status: 410 });
}
