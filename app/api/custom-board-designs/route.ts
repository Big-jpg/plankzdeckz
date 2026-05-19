// app/api/custom-board-designs/route.ts
// Authenticated persistence endpoint for Phase 5 interactive custom board designs.

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createCustomBoardDesign } from "@/server/db/contracts";
import { onCustomBoardDesigned } from "@/server/hooks/buyer-events";
import {
  MAX_BOARD_LENGTH_CM,
  MAX_BOARD_WIDTH_CM,
  MIN_BOARD_LENGTH_CM,
  MIN_BOARD_WIDTH_CM,
  calculateTruckPositions,
  clampNumber,
  isBoardShapeId,
  roundTo,
  type ResinBandSpec,
} from "@/lib/custom-board-designer";

type CustomBoardDesignRequestBody = {
  board_shape?: unknown;
  board_length?: unknown;
  board_width?: unknown;
  truck_positions?: unknown;
  resin_inlay_config?: unknown;
  timber_preference?: unknown;
  notes?: unknown;
  configurator_payload?: unknown;
};

type FieldErrors = Record<string, string>;

type SessionUserWithId = {
  id?: string | null;
  email?: string | null;
  name?: string | null;
};

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseNullableString(value: unknown, maxLength: number): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function parseFiniteNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

function validateResinBands(config: unknown, errors: FieldErrors): { bands: ResinBandSpec[]; summary: string } {
  if (!isPlainRecord(config)) {
    errors.resin_inlay_config = "Resin inlay configuration is required.";
    return { bands: [], summary: "No resin bands selected" };
  }

  const bandsValue = config.bands;
  const summaryValue = config.summary;

  if (!Array.isArray(bandsValue)) {
    errors.resin_inlay_config = "Resin bands must be an array.";
    return { bands: [], summary: "No resin bands selected" };
  }

  const bands: ResinBandSpec[] = [];

  bandsValue.forEach((bandValue, index) => {
    if (!isPlainRecord(bandValue)) {
      errors[`resin_band_${index}`] = `Resin band ${index + 1} is invalid.`;
      return;
    }

    const id = typeof bandValue.id === "string" && bandValue.id.trim() ? bandValue.id : `band-${index + 1}`;
    const position = parseFiniteNumber(bandValue.positionPercent);
    const width = parseFiniteNumber(bandValue.widthPercent);
    const color = typeof bandValue.color === "string" ? bandValue.color.trim() : "";

    if (position === null || position < 0 || position > 100) {
      errors[`resin_band_${index}_position`] = `Resin band ${index + 1} position must be between 0 and 100 percent.`;
    }

    if (width === null || width < 1 || width > 14) {
      errors[`resin_band_${index}_width`] = `Resin band ${index + 1} width must be between 1 and 14 percent.`;
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      errors[`resin_band_${index}_color`] = `Resin band ${index + 1} colour must be a six-digit hex value.`;
    }

    if (position !== null && width !== null && /^#[0-9A-Fa-f]{6}$/.test(color)) {
      bands.push({
        id,
        positionPercent: roundTo(clampNumber(position, 0, 100), 1),
        widthPercent: roundTo(clampNumber(width, 1, 14), 1),
        color,
      });
    }
  });

  return {
    bands,
    summary:
      typeof summaryValue === "string" && summaryValue.trim()
        ? summaryValue.trim().slice(0, 1000)
        : bands.length === 0
          ? "No resin bands selected"
          : bands
              .map(
                (band, index) =>
                  `Band ${index + 1}: ${band.positionPercent}% across width, ${band.widthPercent}% thickness, ${band.color}`,
              )
              .join("; "),
  };
}

export async function POST(request: Request) {
  const session = await auth();
  const sessionUser = session?.user as SessionUserWithId | undefined;
  const customerId = sessionUser?.id ?? null;

  if (!customerId) {
    return NextResponse.json(
      { ok: false, error: "Sign in is required before submitting a custom board design." },
      { status: 401 },
    );
  }

  let body: CustomBoardDesignRequestBody;

  try {
    body = (await request.json()) as CustomBoardDesignRequestBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON request body." }, { status: 400 });
  }

  const fieldErrors: FieldErrors = {};

  if (!isBoardShapeId(body.board_shape)) {
    fieldErrors.board_shape = "Board shape must be one of Fish, Oval, Pintail, Scalloped, Diamond tail, or Kicktail.";
  }

  const boardLength = parseFiniteNumber(body.board_length);
  const boardWidth = parseFiniteNumber(body.board_width);

  if (boardLength === null || boardLength < MIN_BOARD_LENGTH_CM || boardLength > MAX_BOARD_LENGTH_CM) {
    fieldErrors.board_length = `Board length must be between ${MIN_BOARD_LENGTH_CM} and ${MAX_BOARD_LENGTH_CM} cm.`;
  }

  if (boardWidth === null || boardWidth < MIN_BOARD_WIDTH_CM || boardWidth > MAX_BOARD_WIDTH_CM) {
    fieldErrors.board_width = `Board width must be between ${MIN_BOARD_WIDTH_CM} and ${MAX_BOARD_WIDTH_CM} cm.`;
  }

  const resinConfig = validateResinBands(body.resin_inlay_config, fieldErrors);

  if (Object.keys(fieldErrors).length > 0 || !isBoardShapeId(body.board_shape) || boardLength === null || boardWidth === null) {
    return NextResponse.json(
      { ok: false, error: "Custom board design validation failed.", fieldErrors },
      { status: 400 },
    );
  }

  const canonicalTruckPositions = calculateTruckPositions(body.board_shape, boardLength);
  const timberPreference = parseNullableString(body.timber_preference, 500);
  const notes = parseNullableString(body.notes, 4000);
  const configuratorPayload = isPlainRecord(body.configurator_payload)
    ? {
        ...body.configurator_payload,
        server_verified_at: new Date().toISOString(),
        submitted_by: {
          customer_id: customerId,
          email: sessionUser?.email ?? null,
        },
      }
    : {
        server_verified_at: new Date().toISOString(),
        submitted_by: {
          customer_id: customerId,
          email: sessionUser?.email ?? null,
        },
      };

  try {
    const designId = await createCustomBoardDesign({
      customer_id: customerId,
      board_shape: body.board_shape,
      board_length: roundTo(boardLength, 1),
      board_width: roundTo(boardWidth, 1),
      truck_positions: canonicalTruckPositions,
      resin_inlay_config: resinConfig,
      timber_preference: timberPreference,
      notes,
      status: "submitted",
      configurator_payload: configuratorPayload,
    });

    if (!designId) {
      return NextResponse.json(
        { ok: false, error: "The design could not be saved." },
        { status: 500 },
      );
    }

    await onCustomBoardDesigned({
      userId: customerId,
      email: sessionUser?.email ?? null,
      designId,
      boardShape: body.board_shape,
      boardLength: roundTo(boardLength, 1),
      boardWidth: roundTo(boardWidth, 1),
    });

    return NextResponse.json({ ok: true, designId });
  } catch (error) {
    console.error("Failed to create custom board design", error);
    return NextResponse.json(
      { ok: false, error: "The design could not be saved." },
      { status: 500 },
    );
  }
}
