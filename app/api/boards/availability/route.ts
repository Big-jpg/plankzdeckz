// app/api/boards/availability/route.ts
// Returns whether a one-of-a-kind board can be added to cart right now.

import { NextResponse, type NextRequest } from "next/server";
import { getProductByHandle } from "@/lib/catalogue";
import { isBoardProduct } from "@/lib/types";
import { findBoardHandlesInActiveCheckoutSessions } from "@/server/stripe/reservations";

export const runtime = "nodejs";

interface BoardAvailabilityResponse {
  available: boolean;
  message: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<BoardAvailabilityResponse>> {
  const handle = request.nextUrl.searchParams.get("handle")?.trim();

  if (!handle) {
    return NextResponse.json(
      { available: false, message: "Missing board handle." },
      { status: 400 },
    );
  }

  const product = await getProductByHandle(handle);

  if (!product || !isBoardProduct(product)) {
    return NextResponse.json(
      { available: false, message: "Board not found." },
      { status: 404 },
    );
  }

  if (!product.inStock || product.availabilityStatus === "sold") {
    return NextResponse.json(
      { available: false, message: "This board has already been sold." },
      { status: 409 },
    );
  }

  if (product.availabilityStatus === "reserved") {
    return NextResponse.json(
      { available: false, message: "This board is currently reserved." },
      { status: 409 },
    );
  }

  const reservedHandles = await findBoardHandlesInActiveCheckoutSessions([product.handle]);

  if (reservedHandles.has(product.handle)) {
    return NextResponse.json(
      {
        available: false,
        message: "This board is currently held in another checkout session. Please try again shortly.",
      },
      { status: 409 },
    );
  }

  return NextResponse.json({ available: true, message: "Board is available." }, { status: 200 });
}
