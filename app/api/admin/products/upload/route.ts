import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/admin-auth";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const result = await handleUpload({
      body: (await request.json()) as HandleUploadBody,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const auth = await checkAdminAuth();
        if (!auth.ok) throw new Error("Admin access required.");
        if (!pathname.startsWith("products/")) throw new Error("Invalid image path.");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: 12 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: auth.email,
        };
      },
      onUploadCompleted: async () => undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 },
    );
  }
}
