// app/api/custom-design-requests/route.ts
// Persists custom design requests through the stored procedure contract, then fires Phase 7 buyer hook.

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

const ADAPTER_TYPES = ["Cruiser", "Longboard", "Surfskate", "Custom / not sure"] as const;

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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildDesignNotes(params: {
  fixtureType: string;
  adapterType: string;
  desiredShadeStyle: string;
  dimensions: string | null;
  colourMaterialPreference: string | null;
  notes: string | null;
  uploadInstructionAcknowledged: boolean;
}): string {
  return [
    `Intended use: ${params.fixtureType}`,
    `Board type: ${params.adapterType}`,
    `Desired deck style: ${params.desiredShadeStyle}`,
    `Dimensions if known: ${params.dimensions ?? "Not supplied"}`,
    `Timber/finish preference: ${params.colourMaterialPreference ?? "Not supplied"}`,
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
  const fixtureType = stringField(record, "fixture_type", { required: true, maxLength: 160 });
  const adapterType = stringField(record, "adapter_type", { required: true, maxLength: 80 });
  const desiredShadeStyle = stringField(record, "desired_shade_style", {
    required: true,
    maxLength: 500,
  });
  const dimensions = stringField(record, "dimensions", { maxLength: 240 });
  const colourMaterialPreference = stringField(record, "colour_material_preference", {
    maxLength: 500,
  });
  const notes = stringField(record, "notes", { maxLength: 2000 });

  for (const [field, result] of Object.entries({
    name,
    email,
    phone,
    fixture_type: fixtureType,
    adapter_type: adapterType,
    desired_shade_style: desiredShadeStyle,
    dimensions,
    colour_material_preference: colourMaterialPreference,
    notes,
  })) {
    if (result.error) fieldErrors[field] = result.error;
  }

  if (email.value && !isValidEmail(email.value)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (
    adapterType.value &&
    !ADAPTER_TYPES.includes(adapterType.value as (typeof ADAPTER_TYPES)[number])
  ) {
    fieldErrors.adapter_type = "Select one of the supported adapter types.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      { ok: false, error: "Custom deck request validation failed.", fieldErrors },
      { status: 422 },
    );
  }

  const uploadInstructionAcknowledged = record.upload_instruction_acknowledged === true;
  const designNotes = buildDesignNotes({
    fixtureType: fixtureType.value ?? "Not supplied",
    adapterType: adapterType.value ?? "Not supplied",
    desiredShadeStyle: desiredShadeStyle.value ?? "Not supplied",
    dimensions: dimensions.value,
    colourMaterialPreference: colourMaterialPreference.value,
    notes: notes.value,
    uploadInstructionAcknowledged,
  });

  const requestId = await createCustomDesignRequest({
    email: email.value ?? "",
    name: name.value,
    phone: phone.value,
    fixture_type: fixtureType.value,
    adapter_type: adapterType.value,
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
    fixture_type: fixtureType.value,
    adapter_type: adapterType.value,
    desired_shade_style: desiredShadeStyle.value,
    dimensions: dimensions.value,
    colour_material_preference: colourMaterialPreference.value,
  });

  return NextResponse.json({ ok: true, requestId }, { status: 201 });
}
