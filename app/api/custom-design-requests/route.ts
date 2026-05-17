// app/api/custom-design-requests/route.ts
// Persists custom board requests through the stored procedure contract, then fires buyer hooks.

import { NextResponse, type NextRequest } from "next/server";
import { createCustomDesignRequest } from "@/server/db/contracts";
import { onCustomDesignRequested } from "@/server/hooks/buyer-events";

export const runtime = "nodejs";

type CustomDesignRequestResponse = {
  ok: boolean;
  requestId?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
};

const BOARD_STYLES = ["cruiser", "longboard", "surfskate", "custom"] as const;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringField(
  record: Record<string, unknown>,
  key: string,
  options: { required?: boolean; maxLength?: number } = {},
): { value: string | null; error?: string } {
  const value = record[key];
  const required = options.required ?? false;
  const maxLength = options.maxLength ?? 1000;

  if (typeof value !== "string") {
    return required ? { value: null, error: "This field is required." } : { value: null };
  }

  const trimmed = value.trim();

  if (required && trimmed.length === 0) {
    return { value: null, error: "This field is required." };
  }

  if (trimmed.length > maxLength) {
    return { value: null, error: `Must be ${maxLength} characters or fewer.` };
  }

  return { value: trimmed.length > 0 ? trimmed : null };
}

function numericField(
  record: Record<string, unknown>,
  key: string,
  options: { max?: number } = {},
): { value: number | null; error?: string } {
  const rawValue = record[key];

  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return { value: null };
  }

  const parsed = typeof rawValue === "number" ? rawValue : Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return { value: null, error: "Enter a positive number." };
  }

  if (options.max !== undefined && parsed > options.max) {
    return { value: null, error: `Must be ${options.max} or less.` };
  }

  return { value: parsed };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildDesignNotes(params: {
  intendedUse: string;
  boardStyle: string;
  boardShape: string;
  boardLength: number | null;
  boardWidth: number | null;
  timberPreference: string | null;
  resinInlayPreference: string | null;
  notes: string | null;
  uploadInstructionAcknowledged: boolean;
}): string {
  return [
    `Intended use: ${params.intendedUse}`,
    `Board style: ${params.boardStyle}`,
    `Board shape: ${params.boardShape}`,
    `Length: ${params.boardLength ?? "Not supplied"} cm`,
    `Width: ${params.boardWidth ?? "Not supplied"} cm`,
    `Timber preference: ${params.timberPreference ?? "Not supplied"}`,
    `Resin inlay preference: ${params.resinInlayPreference ?? "Not supplied"}`,
    `Notes: ${params.notes ?? "Not supplied"}`,
    `Reference images: ${
      params.uploadInstructionAcknowledged
        ? "Customer was instructed to email reference photos or sketches."
        : "Customer has not acknowledged the reference image email instruction."
    }`,
  ].join("\n");
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<CustomDesignRequestResponse>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const record = asRecord(body);
  const fieldErrors: Record<string, string> = {};

  const name = stringField(record, "name", { required: true, maxLength: 160 });
  const email = stringField(record, "email", { required: true, maxLength: 320 });
  const phone = stringField(record, "phone", { required: true, maxLength: 80 });
  const intendedUse = stringField(record, "intended_use", { required: true, maxLength: 160 });
  const boardStyle = stringField(record, "board_style", { required: true, maxLength: 80 });
  const boardShape = stringField(record, "board_shape", { required: true, maxLength: 500 });
  const boardLength = numericField(record, "board_length", { max: 300 });
  const boardWidth = numericField(record, "board_width", { max: 100 });
  const timberPreference = stringField(record, "timber_preference", { maxLength: 500 });
  const resinInlayPreference = stringField(record, "resin_inlay_preference", { maxLength: 500 });
  const notes = stringField(record, "notes", { maxLength: 2000 });

  for (const [field, result] of Object.entries({
    name,
    email,
    phone,
    intended_use: intendedUse,
    board_style: boardStyle,
    board_shape: boardShape,
    board_length: boardLength,
    board_width: boardWidth,
    timber_preference: timberPreference,
    resin_inlay_preference: resinInlayPreference,
    notes,
  })) {
    if (result.error) fieldErrors[field] = result.error;
  }

  if (email.value && !isValidEmail(email.value)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (boardStyle.value && !BOARD_STYLES.includes(boardStyle.value as (typeof BOARD_STYLES)[number])) {
    fieldErrors.board_style = "Select one of the supported board styles.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      { ok: false, error: "Custom deck request validation failed.", fieldErrors },
      { status: 422 },
    );
  }

  const uploadInstructionAcknowledged = record.upload_instruction_acknowledged === true;
  const designNotes = buildDesignNotes({
    intendedUse: intendedUse.value ?? "Not supplied",
    boardStyle: boardStyle.value ?? "Not supplied",
    boardShape: boardShape.value ?? "Not supplied",
    boardLength: boardLength.value,
    boardWidth: boardWidth.value,
    timberPreference: timberPreference.value,
    resinInlayPreference: resinInlayPreference.value,
    notes: notes.value,
    uploadInstructionAcknowledged,
  });

  const requestId = await createCustomDesignRequest({
    email: email.value ?? "",
    name: name.value,
    phone: phone.value,
    intended_use: intendedUse.value,
    board_style: boardStyle.value as "cruiser" | "surfskate" | "longboard" | "custom" | null,
    board_shape: boardShape.value,
    board_length: boardLength.value,
    board_width: boardWidth.value,
    timber_preference: timberPreference.value,
    resin_inlay_preference: resinInlayPreference.value,
    design_notes: designNotes,
    budget_range: null,
  });

  if (!requestId) {
    return NextResponse.json(
      { ok: false, error: "Custom design request was not persisted." },
      { status: 500 },
    );
  }

  await onCustomDesignRequested({
    custom_design_request_id: requestId,
    email: email.value ?? "",
    phone: phone.value,
    name: name.value,
    intended_use: intendedUse.value,
    board_style: boardStyle.value,
    board_shape: boardShape.value,
    board_length: boardLength.value,
    board_width: boardWidth.value,
    timber_preference: timberPreference.value,
    resin_inlay_preference: resinInlayPreference.value,
  });

  return NextResponse.json({ ok: true, requestId }, { status: 201 });
}
