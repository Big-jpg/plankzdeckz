// app/api/admin/custom-requests/[id]/status/route.ts
// Admin custom design request status mutation endpoint. All writes go through stored procedures.

import { NextResponse, type NextRequest } from "next/server";
import { checkAdminAuth } from "@/lib/admin-auth";
import { getCustomDesignRequestById, updateCustomDesignRequestStatus } from "@/server/db/contracts";
import { onCustomDesignStatusChanged } from "@/server/hooks/buyer-events";

export const runtime = "nodejs";

const VALID_CUSTOM_REQUEST_STATUSES = [
  "new",
  "reviewing",
  "quoted",
  "accepted",
  "rejected",
  "completed",
] as const;

type CustomRequestStatus = (typeof VALID_CUSTOM_REQUEST_STATUSES)[number];

type CustomRequestStatusResponse = {
  ok: boolean;
  requestId?: string;
  status?: CustomRequestStatus;
  previousStatus?: string;
  error?: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function isCustomRequestStatus(value: unknown): value is CustomRequestStatus {
  return (
    typeof value === "string" &&
    VALID_CUSTOM_REQUEST_STATUSES.includes(value as CustomRequestStatus)
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<CustomRequestStatusResponse>> {
  const admin = await checkAdminAuth();

  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.reason }, { status: admin.status });
  }

  const { id } = await params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const record = asRecord(body);
  const status = record.status;

  if (!isCustomRequestStatus(status)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Invalid custom request status. Must be one of: new, reviewing, quoted, accepted, rejected, completed.",
      },
      { status: 422 },
    );
  }

  const existingRequest = await getCustomDesignRequestById(id);

  if (!existingRequest) {
    return NextResponse.json(
      { ok: false, error: "Custom design request not found." },
      { status: 404 },
    );
  }

  const previousStatus = existingRequest.status;
  const updatedRequest = await updateCustomDesignRequestStatus(id, status);

  if (!updatedRequest) {
    return NextResponse.json(
      { ok: false, error: "Custom design request status was not updated." },
      { status: 500 },
    );
  }

  if (previousStatus !== status) {
    await onCustomDesignStatusChanged({
      custom_design_request_id: updatedRequest.id,
      email: updatedRequest.email,
      phone: updatedRequest.phone,
      user_id: updatedRequest.user_id,
      previous_status: previousStatus,
      status: updatedRequest.status,
      name: updatedRequest.name,
      intended_use: updatedRequest.intended_use,
      board_style: updatedRequest.board_style,
      board_shape: updatedRequest.board_shape,
    });
  }

  return NextResponse.json({
    ok: true,
    requestId: updatedRequest.id,
    status,
    previousStatus,
  });
}
