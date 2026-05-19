// components/custom-board-designer.tsx
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Plus,
  Ruler,
  Save,
  Trash2,
} from "lucide-react";
import {
  BOARD_SHAPES,
  DEFAULT_RESIN_BANDS,
  MAX_BOARD_LENGTH_CM,
  MAX_BOARD_WIDTH_CM,
  MIN_BOARD_LENGTH_CM,
  MIN_BOARD_WIDTH_CM,
  RESIN_PALETTE,
  calculateTruckPositions,
  clampNumber,
  createBoardPath,
  createBoardSvgGeometry,
  resinBandsToSummary,
  roundTo,
  type BoardShapeDefinition,
  type BoardShapeId,
  type BoardSvgGeometry,
  type ResinBandSpec,
  type TruckMountingCluster,
} from "@/lib/custom-board-designer";
import { cn } from "@/lib/utils";
import { useId, useMemo, useRef, useState, type PointerEvent } from "react";

type SubmitState = "idle" | "submitting" | "success" | "error";

type ApiResponse = {
  ok: boolean;
  designId?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
};

type CustomBoardDesignPayload = {
  board_shape: BoardShapeId;
  board_length: number;
  board_width: number;
  truck_positions: TruckMountingCluster[];
  resin_inlay_config: {
    bands: ResinBandSpec[];
    summary: string;
  };
  timber_preference: string | null;
  notes: string | null;
  configurator_payload: Record<string, unknown>;
};

const INITIAL_LENGTH_CM = 84;
const INITIAL_WIDTH_CM = 24;
const FIELD_CLASS =
  "mt-2 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-warm-white placeholder:text-warm-white/35 outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/30";

function formatCm(value: number): string {
  return `${roundTo(value, 1).toFixed(1)} cm`;
}

function numericInputValue(value: number): string {
  return Number.isInteger(value) ? String(value) : String(roundTo(value, 1));
}

function BoardShapeIcon({ shapeId }: { shapeId: BoardShapeId }) {
  const pathD = createBoardPath({
    shapeId,
    boardLeft: 10,
    centerY: 28,
    boardLengthPx: 112,
    boardWidthPx: 34,
  });

  return (
    <svg viewBox="0 0 132 56" aria-hidden="true" className="h-12 w-full overflow-visible">
      <path
        d={pathD}
        className="fill-teal/20 stroke-teal"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
      {shapeId === "kicktail" && (
        <path
          d="M 17 14 C 24 23, 24 33, 17 42"
          className="fill-none stroke-coral"
          strokeDasharray="3 3"
          strokeWidth="2"
        />
      )}
    </svg>
  );
}

function ShapeSelector({
  selectedShapeId,
  onSelect,
}: {
  selectedShapeId: BoardShapeId;
  onSelect: (shapeId: BoardShapeId) => void;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal">Step 1</p>
          <h2 className="mt-2 font-display text-3xl tracking-wide text-amber">Choose the outline</h2>
        </div>
        <Ruler className="h-6 w-6 text-coral" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {BOARD_SHAPES.map((shape) => {
          const selected = shape.id === selectedShapeId;

          return (
            <button
              key={shape.id}
              type="button"
              onClick={() => onSelect(shape.id)}
              className={cn(
                "group rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-teal/70 hover:bg-teal/10",
                selected
                  ? "border-teal bg-teal/15 shadow-lg shadow-teal/10"
                  : "border-white/10 bg-black/20",
              )}
            >
              <BoardShapeIcon shapeId={shape.id} />
              <div className="mt-3 flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-warm-white">{shape.label}</h3>
                {selected && <CheckCircle2 className="h-5 w-5 shrink-0 text-teal" />}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-warm-white/60">{shape.description}</p>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber/80">
                {shape.ridingStyle}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DimensionControls({
  boardLengthCm,
  boardWidthCm,
  onLengthChange,
  onWidthChange,
}: {
  boardLengthCm: number;
  boardWidthCm: number;
  onLengthChange: (value: number) => void;
  onWidthChange: (value: number) => void;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal">Step 2</p>
      <h2 className="mt-2 font-display text-3xl tracking-wide text-amber">Set dimensions</h2>

      <div className="mt-6 space-y-6">
        <div>
          <div className="flex items-end justify-between gap-4">
            <label className="text-sm font-semibold text-warm-white" htmlFor="board-length">
              Deck length
            </label>
            <span className="font-display text-3xl tracking-wide text-teal">
              {formatCm(boardLengthCm)}
            </span>
          </div>
          <input
            id="board-length"
            type="range"
            min={MIN_BOARD_LENGTH_CM}
            max={MAX_BOARD_LENGTH_CM}
            step="0.5"
            value={boardLengthCm}
            onChange={(event) => onLengthChange(Number(event.target.value))}
            className="mt-3 w-full accent-teal"
          />
          <div className="mt-2 flex justify-between text-xs text-warm-white/50">
            <span>{MIN_BOARD_LENGTH_CM} cm</span>
            <span>{MAX_BOARD_LENGTH_CM} cm</span>
          </div>
        </div>

        <div>
          <div className="flex items-end justify-between gap-4">
            <label className="text-sm font-semibold text-warm-white" htmlFor="board-width">
              Deck width
            </label>
            <span className="font-display text-3xl tracking-wide text-coral">
              {formatCm(boardWidthCm)}
            </span>
          </div>
          <input
            id="board-width"
            type="range"
            min={MIN_BOARD_WIDTH_CM}
            max={MAX_BOARD_WIDTH_CM}
            step="0.5"
            value={boardWidthCm}
            onChange={(event) => onWidthChange(Number(event.target.value))}
            className="mt-3 w-full accent-coral"
          />
          <div className="mt-2 flex justify-between text-xs text-warm-white/50">
            <span>{MIN_BOARD_WIDTH_CM} cm</span>
            <span>{MAX_BOARD_WIDTH_CM} cm</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function BoardRenderer({
  selectedShape,
  geometry,
  boardLengthCm,
  boardWidthCm,
  resinBands,
  truckPositions,
  activeBandId,
  onActiveBandChange,
  onBandPositionChange,
}: {
  selectedShape: BoardShapeDefinition;
  geometry: BoardSvgGeometry;
  boardLengthCm: number;
  boardWidthCm: number;
  resinBands: ResinBandSpec[];
  truckPositions: TruckMountingCluster[];
  activeBandId: string | null;
  onActiveBandChange: (bandId: string | null) => void;
  onBandPositionChange: (bandId: string, positionPercent: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const clipPathId = useId();
  const timberGradientId = useId();
  const resinGradientId = useId();

  function pointerToBandPercent(event: PointerEvent<SVGElement>): number | null {
    const svg = svgRef.current;
    if (!svg) return null;

    const matrix = svg.getScreenCTM();
    if (!matrix) return null;

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const local = point.matrixTransform(matrix.inverse());
    const percent = ((local.y - geometry.boardTop) / geometry.boardWidthPx) * 100;
    return clampNumber(percent, 0, 100);
  }

  function handlePointerMove(event: PointerEvent<SVGElement>): void {
    if (!activeBandId) return;
    const nextPercent = pointerToBandPercent(event);
    if (nextPercent === null) return;
    onBandPositionChange(activeBandId, nextPercent);
  }

  function startBandDrag(event: PointerEvent<SVGRectElement>, bandId: string): void {
    event.currentTarget.setPointerCapture(event.pointerId);
    onActiveBandChange(bandId);
    const nextPercent = pointerToBandPercent(event);
    if (nextPercent !== null) onBandPositionChange(bandId, nextPercent);
  }

  const cmToPxX = geometry.boardLengthPx / boardLengthCm;
  const cmToPxY = geometry.boardWidthPx / boardWidthCm;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-teal/20 bg-[radial-gradient(circle_at_50%_0%,rgba(126,207,192,0.25),transparent_45%),linear-gradient(135deg,#0b1615_0%,#132321_52%,#203a49_100%)] p-4 shadow-2xl shadow-black/40 sm:p-6">
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal">Live builder spec</p>
          <h2 className="mt-2 font-display text-4xl tracking-wide text-amber sm:text-5xl">
            {selectedShape.label} bespoke deck
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-warm-white/65">
            Drag longitudinal resin bands directly across the deck width, then submit the exact
            measured specification for workshop review.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-warm-white/45">Current size</p>
          <p className="mt-1 font-display text-3xl tracking-wide text-teal">
            {formatCm(boardLengthCm)} × {formatCm(boardWidthCm)}
          </p>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${geometry.viewBoxWidth} ${geometry.viewBoxHeight}`}
        role="img"
        aria-label={`${selectedShape.label} custom deck preview with resin inlay and truck mounting holes`}
        className="relative mt-6 h-auto w-full select-none overflow-visible"
        onPointerMove={handlePointerMove}
        onPointerUp={() => onActiveBandChange(null)}
        onPointerCancel={() => onActiveBandChange(null)}
        onPointerLeave={() => onActiveBandChange(null)}
      >
        <defs>
          <clipPath id={clipPathId}>
            <path d={geometry.pathD} />
          </clipPath>
          <linearGradient id={timberGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5f3b20" />
            <stop offset="18%" stopColor="#a87445" />
            <stop offset="34%" stopColor="#d9c3a2" />
            <stop offset="51%" stopColor="#7b4f2b" />
            <stop offset="67%" stopColor="#c4925a" />
            <stop offset="84%" stopColor="#ead8b8" />
            <stop offset="100%" stopColor="#6e4728" />
          </linearGradient>
          <linearGradient id={resinGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.52)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0.12)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.28)" />
          </linearGradient>
          <filter id="designer-shadow" x="-15%" y="-30%" width="130%" height="160%">
            <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#000000" floodOpacity="0.45" />
          </filter>
        </defs>

        <ellipse
          cx={geometry.viewBoxWidth / 2}
          cy={geometry.centerY + geometry.boardWidthPx * 0.58}
          rx={geometry.boardLengthPx * 0.45}
          ry={geometry.boardWidthPx * 0.18}
          fill="rgba(0,0,0,0.35)"
        />

        <g filter="url(#designer-shadow)">
          <path d={geometry.pathD} fill={`url(#${timberGradientId})`} stroke="#f5be33" strokeWidth="4" />
          <g clipPath={`url(#${clipPathId})`}>
            {Array.from({ length: 12 }).map((_, index) => (
              <rect
                key={index}
                x={geometry.boardLeft - 18}
                y={geometry.boardTop + (geometry.boardWidthPx / 12) * index}
                width={geometry.boardLengthPx + 36}
                height={Math.max(2, geometry.boardWidthPx / 30)}
                fill={index % 2 === 0 ? "rgba(255,248,237,0.12)" : "rgba(36,50,48,0.16)"}
              />
            ))}
            {resinBands.map((band) => {
              const bandY = geometry.boardTop + (band.positionPercent / 100) * geometry.boardWidthPx;
              const bandHeight = Math.max(8, (band.widthPercent / 100) * geometry.boardWidthPx);

              return (
                <g key={band.id}>
                  <rect
                    x={geometry.boardLeft - 18}
                    y={bandY - bandHeight / 2}
                    width={geometry.boardLengthPx + 36}
                    height={bandHeight}
                    fill={band.color}
                    opacity="0.92"
                  />
                  <rect
                    x={geometry.boardLeft - 18}
                    y={bandY - bandHeight / 2}
                    width={geometry.boardLengthPx + 36}
                    height={bandHeight}
                    fill={`url(#${resinGradientId})`}
                    opacity="0.65"
                  />
                </g>
              );
            })}
          </g>
          <path d={geometry.pathD} fill="none" stroke="rgba(255,248,237,0.72)" strokeWidth="1.5" />
        </g>

        {shapeKicktailLine(selectedShape.id, geometry)}

        {truckPositions.map((cluster) => {
          const centerX = geometry.boardLeft + (cluster.centerFromTailCm / boardLengthCm) * geometry.boardLengthPx;
          const plateWidth = 7.2 * cmToPxX;
          const plateHeight = 5.4 * cmToPxY;

          return (
            <g key={cluster.id}>
              <rect
                x={centerX - plateWidth / 2}
                y={geometry.centerY - plateHeight / 2}
                width={plateWidth}
                height={plateHeight}
                rx="8"
                fill="rgba(19,35,33,0.46)"
                stroke="rgba(255,248,237,0.55)"
                strokeDasharray="7 5"
                strokeWidth="1.5"
              />
              {cluster.holes.map((hole) => (
                <circle
                  key={hole.id}
                  cx={geometry.boardLeft + hole.xFromTailCm * cmToPxX}
                  cy={geometry.centerY + hole.yFromCenterCm * cmToPxY}
                  r="5.5"
                  fill="#132321"
                  stroke="#7ECFC0"
                  strokeWidth="2.5"
                />
              ))}
              <text
                x={centerX}
                y={geometry.centerY - plateHeight / 2 - 14}
                textAnchor="middle"
                className="fill-warm-white text-[16px] font-semibold"
              >
                {cluster.label}: {formatCm(cluster.centerFromTailCm)} from tail
              </text>
            </g>
          );
        })}

        {resinBands.map((band) => {
          const bandY = geometry.boardTop + (band.positionPercent / 100) * geometry.boardWidthPx;
          const dragHeight = Math.max(24, (band.widthPercent / 100) * geometry.boardWidthPx + 18);

          return (
            <g key={`${band.id}-handle`}>
              <rect
                x={geometry.boardLeft - 34}
                y={bandY - dragHeight / 2}
                width={geometry.boardLengthPx + 68}
                height={dragHeight}
                fill="transparent"
                className="cursor-ns-resize"
                onPointerDown={(event) => startBandDrag(event, band.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={() => onActiveBandChange(null)}
              />
              <line
                x1={geometry.boardLeft - 30}
                x2={geometry.boardLeft - 8}
                y1={bandY}
                y2={bandY}
                stroke={activeBandId === band.id ? "#F5A0A0" : "#7ECFC0"}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <text
                x={geometry.boardLeft - 38}
                y={bandY + 5}
                textAnchor="end"
                className="pointer-events-none fill-warm-white text-[15px] font-bold"
              >
                {roundTo(band.positionPercent, 0)}%
              </text>
            </g>
          );
        })}
      </svg>

      <div className="relative mt-4 grid grid-cols-1 gap-3 text-sm text-warm-white/65 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="font-semibold text-warm-white">Mounting profile</p>
          <p className="mt-1 leading-relaxed">{selectedShape.truckMounting}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="font-semibold text-warm-white">Ride feel</p>
          <p className="mt-1 leading-relaxed">{selectedShape.ridingStyle}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="font-semibold text-warm-white">Resin layout</p>
          <p className="mt-1 leading-relaxed">{resinBandsToSummary(resinBands)}</p>
        </div>
      </div>
    </section>
  );
}

function shapeKicktailLine(shapeId: BoardShapeId, geometry: BoardSvgGeometry) {
  if (shapeId !== "kicktail") return null;

  return (
    <path
      d={`M ${geometry.boardLeft + geometry.boardLengthPx * 0.095} ${
        geometry.centerY - geometry.boardWidthPx * 0.4
      } C ${geometry.boardLeft + geometry.boardLengthPx * 0.14} ${
        geometry.centerY - geometry.boardWidthPx * 0.12
      }, ${geometry.boardLeft + geometry.boardLengthPx * 0.14} ${
        geometry.centerY + geometry.boardWidthPx * 0.12
      }, ${geometry.boardLeft + geometry.boardLengthPx * 0.095} ${
        geometry.centerY + geometry.boardWidthPx * 0.4
      }`}
      fill="none"
      stroke="#F5A0A0"
      strokeWidth="4"
      strokeDasharray="10 8"
      strokeLinecap="round"
    />
  );
}

function ResinDesigner({
  resinBands,
  activeBandId,
  onActiveBandChange,
  onAddBand,
  onRemoveBand,
  onBandChange,
}: {
  resinBands: ResinBandSpec[];
  activeBandId: string | null;
  onActiveBandChange: (bandId: string | null) => void;
  onAddBand: () => void;
  onRemoveBand: (bandId: string) => void;
  onBandChange: (bandId: string, patch: Partial<ResinBandSpec>) => void;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal">Step 3</p>
          <h2 className="mt-2 font-display text-3xl tracking-wide text-amber">Resin inlay bands</h2>
        </div>
        <button
          type="button"
          onClick={onAddBand}
          className="inline-flex items-center gap-2 rounded-full bg-teal px-4 py-2 text-sm font-semibold text-charcoal transition hover:bg-teal/90"
        >
          <Plus className="h-4 w-4" /> Add band
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {resinBands.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-5 text-sm leading-relaxed text-warm-white/60">
            No resin bands selected. Add a band to place a longitudinal inlay running nose-to-tail along the board.
          </div>
        ) : (
          resinBands.map((band, index) => (
            <div
              key={band.id}
              className={cn(
                "rounded-2xl border p-4 transition",
                activeBandId === band.id ? "border-coral bg-coral/10" : "border-white/10 bg-black/20",
              )}
              onFocus={() => onActiveBandChange(band.id)}
              onBlur={() => onActiveBandChange(null)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10"
                    style={{ backgroundColor: band.color }}
                    aria-hidden="true"
                  >
                    <span className="h-1.5 w-7 rounded-full bg-charcoal/65" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-warm-white">Band {index + 1}</h3>
                    <p className="text-xs text-warm-white/45">Drag across the deck width or edit exact values.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveBand(band.id)}
                  className="rounded-full border border-white/10 p-2 text-warm-white/55 transition hover:border-coral hover:text-coral"
                  aria-label={`Remove resin band ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-warm-white/55">
                    Position across width
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.5"
                      value={band.positionPercent}
                      onChange={(event) =>
                        onBandChange(band.id, { positionPercent: Number(event.target.value) })
                      }
                      className="min-w-0 flex-1 accent-teal"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={numericInputValue(roundTo(band.positionPercent, 1))}
                      onChange={(event) =>
                        onBandChange(band.id, {
                          positionPercent: clampNumber(Number(event.target.value), 0, 100),
                        })
                      }
                      className="w-20 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-warm-white outline-none focus:border-teal"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-warm-white/55">
                    Band thickness
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="14"
                      step="0.5"
                      value={band.widthPercent}
                      onChange={(event) =>
                        onBandChange(band.id, { widthPercent: Number(event.target.value) })
                      }
                      className="min-w-0 flex-1 accent-coral"
                    />
                    <input
                      type="number"
                      min="1"
                      max="14"
                      step="0.5"
                      value={numericInputValue(roundTo(band.widthPercent, 1))}
                      onChange={(event) =>
                        onBandChange(band.id, {
                          widthPercent: clampNumber(Number(event.target.value), 1, 14),
                        })
                      }
                      className="w-20 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-warm-white outline-none focus:border-coral"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warm-white/55">
                  Colour palette
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {RESIN_PALETTE.map((colour) => (
                    <button
                      key={colour.value}
                      type="button"
                      onClick={() => onBandChange(band.id, { color: colour.value })}
                      className={cn(
                        "h-9 w-9 rounded-full border transition hover:scale-105",
                        colour.value.toLowerCase() === band.color.toLowerCase()
                          ? "border-warm-white ring-2 ring-teal"
                          : "border-white/20",
                      )}
                      style={{ backgroundColor: colour.value }}
                      aria-label={`Set band ${index + 1} colour to ${colour.label}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function PreferencePanel({
  timberPreference,
  notes,
  onTimberPreferenceChange,
  onNotesChange,
}: {
  timberPreference: string;
  notes: string;
  onTimberPreferenceChange: (value: string) => void;
  onNotesChange: (value: string) => void;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal">Step 4</p>
      <h2 className="mt-2 font-display text-3xl tracking-wide text-amber">Builder preferences</h2>
      <div className="mt-5 space-y-4">
        <div>
          <label className="text-sm font-semibold text-warm-white" htmlFor="timber-preference">
            Timber preference
          </label>
          <input
            id="timber-preference"
            type="text"
            value={timberPreference}
            onChange={(event) => onTimberPreferenceChange(event.target.value)}
            placeholder="Reclaimed mixed timber, warm timber finish, pale rails..."
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-warm-white" htmlFor="design-notes">
            Notes for Blair and Corey
          </label>
          <textarea
            id="design-notes"
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            rows={5}
            placeholder="Rider stance, truck hardware assumptions, grip finish, pickup timing, surf-culture references, or display-only notes."
            className={FIELD_CLASS}
          />
        </div>
      </div>
    </section>
  );
}

function DesignSummary({
  selectedShape,
  boardLengthCm,
  boardWidthCm,
  resinBands,
  truckPositions,
  timberPreference,
  notes,
  authenticated,
  submitState,
  submitMessage,
  designId,
  onSubmit,
}: {
  selectedShape: BoardShapeDefinition;
  boardLengthCm: number;
  boardWidthCm: number;
  resinBands: ResinBandSpec[];
  truckPositions: TruckMountingCluster[];
  timberPreference: string;
  notes: string;
  authenticated: boolean;
  submitState: SubmitState;
  submitMessage: string | null;
  designId: string | null;
  onSubmit: () => Promise<void>;
}) {
  return (
    <aside className="sticky top-24 rounded-[2rem] border border-amber/30 bg-[linear-gradient(160deg,rgba(19,35,33,0.96),rgba(32,58,73,0.94))] p-5 shadow-2xl shadow-black/30">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal">Specification card</p>
      <h2 className="mt-2 font-display text-3xl tracking-wide text-amber">Builder-ready summary</h2>
      <p className="mt-3 text-sm leading-relaxed text-warm-white/62">
        This card is the working specification submitted to the workshop. Truck holes and resin
        bands are captured as measured JSON through the stored procedure contract.
      </p>

      <dl className="mt-5 space-y-4 text-sm">
        <SummaryRow label="Shape" value={`${selectedShape.label} — ${selectedShape.ridingStyle}`} />
        <SummaryRow label="Dimensions" value={`${formatCm(boardLengthCm)} long × ${formatCm(boardWidthCm)} wide`} />
        <SummaryRow label="Truck mounting" value={selectedShape.truckProfile.mountingNote} />
        <SummaryRow
          label="Truck centres"
          value={truckPositions
            .map((cluster) => `${cluster.label}: ${formatCm(cluster.centerFromTailCm)} from tail`)
            .join("; ")}
        />
        <SummaryRow label="Resin inlay" value={resinBandsToSummary(resinBands)} />
        <SummaryRow label="Timber" value={timberPreference.trim() || "No timber preference supplied"} />
        <SummaryRow label="Notes" value={notes.trim() || "No additional notes supplied"} />
      </dl>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
        <p className="flex items-start gap-2 text-sm font-semibold text-warm-white">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
          Login gate
        </p>
        <p className="mt-2 text-sm leading-relaxed text-warm-white/60">
          Browsing and designing are public. Saving the specification requires sign-in so the
          design can be linked to a customer record.
        </p>
      </div>

      {authenticated ? (
        <button
          type="button"
          onClick={() => void onSubmit()}
          disabled={submitState === "submitting"}
          className={cn(
            "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition",
            submitState === "submitting"
              ? "cursor-wait bg-teal/50 text-charcoal"
              : "bg-teal text-charcoal hover:bg-teal/90",
          )}
        >
          <Save className="h-4 w-4" />
          {submitState === "submitting" ? "Saving design..." : "Save custom board design"}
        </button>
      ) : (
        <Link
          href="/login?callbackUrl=/custom-designer"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-semibold text-charcoal transition hover:bg-coral/90"
        >
          Sign in to submit <ChevronRight className="h-4 w-4" />
        </Link>
      )}

      {submitMessage && (
        <div
          className={cn(
            "mt-4 rounded-2xl border px-4 py-3 text-sm leading-relaxed",
            submitState === "success"
              ? "border-teal/35 bg-teal/10 text-teal"
              : "border-coral/35 bg-coral/10 text-coral",
          )}
        >
          <p>{submitMessage}</p>
          {designId && <p className="mt-1 text-xs opacity-80">Design ID: {designId}</p>}
        </div>
      )}
    </aside>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-warm-white/45">{label}</dt>
      <dd className="mt-2 leading-relaxed text-warm-white/78">{value}</dd>
    </div>
  );
}

export function CustomBoardDesigner() {
  const { data: session, status } = useSession();
  const [selectedShapeId, setSelectedShapeId] = useState<BoardShapeId>("fish");
  const [boardLengthCm, setBoardLengthCm] = useState(INITIAL_LENGTH_CM);
  const [boardWidthCm, setBoardWidthCm] = useState(INITIAL_WIDTH_CM);
  const [resinBands, setResinBands] = useState<ResinBandSpec[]>(DEFAULT_RESIN_BANDS);
  const [activeBandId, setActiveBandId] = useState<string | null>(null);
  const [timberPreference, setTimberPreference] = useState("");
  const [notes, setNotes] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [designId, setDesignId] = useState<string | null>(null);

  const selectedShape = useMemo(
    () => BOARD_SHAPES.find((shape) => shape.id === selectedShapeId) ?? BOARD_SHAPES[0],
    [selectedShapeId],
  );

  const geometry = useMemo(
    () => createBoardSvgGeometry(selectedShapeId, boardLengthCm, boardWidthCm),
    [selectedShapeId, boardLengthCm, boardWidthCm],
  );

  const truckPositions = useMemo(
    () => calculateTruckPositions(selectedShapeId, boardLengthCm),
    [selectedShapeId, boardLengthCm],
  );

  const authenticated = status === "authenticated" && Boolean(session?.user);

  function updateBand(bandId: string, patch: Partial<ResinBandSpec>): void {
    setResinBands((current) =>
      current.map((band) =>
        band.id === bandId
          ? {
              ...band,
              ...patch,
              positionPercent:
                patch.positionPercent === undefined
                  ? band.positionPercent
                  : roundTo(clampNumber(patch.positionPercent, 0, 100), 1),
              widthPercent:
                patch.widthPercent === undefined
                  ? band.widthPercent
                  : roundTo(clampNumber(patch.widthPercent, 1, 14), 1),
            }
          : band,
      ),
    );
  }

  function addBand(): void {
    setResinBands((current) => {
      const nextIndex = current.length + 1;
      const paletteColour = RESIN_PALETTE[current.length % RESIN_PALETTE.length]?.value ?? "#7ECFC0";
      return [
        ...current,
        {
          id: `band-${Date.now()}-${nextIndex}`,
          positionPercent: clampNumber(38 + nextIndex * 10, 10, 90),
          widthPercent: 6,
          color: paletteColour,
        },
      ];
    });
  }

  function removeBand(bandId: string): void {
    setResinBands((current) => current.filter((band) => band.id !== bandId));
    setActiveBandId((current) => (current === bandId ? null : current));
  }

  function buildSubmissionPayload(): CustomBoardDesignPayload {
    const resinConfig = {
      bands: resinBands.map((band) => ({
        ...band,
        positionPercent: roundTo(band.positionPercent, 1),
        widthPercent: roundTo(band.widthPercent, 1),
      })),
      summary: resinBandsToSummary(resinBands),
    };

    return {
      board_shape: selectedShape.id,
      board_length: roundTo(boardLengthCm, 1),
      board_width: roundTo(boardWidthCm, 1),
      truck_positions: truckPositions,
      resin_inlay_config: resinConfig,
      timber_preference: timberPreference.trim() || null,
      notes: notes.trim() || null,
      configurator_payload: {
        version: "phase-5-custom-designer-v1.1-longitudinal-resin",
        generated_at: new Date().toISOString(),
        selected_shape: selectedShape,
        dimensions: {
          length_cm: roundTo(boardLengthCm, 1),
          width_cm: roundTo(boardWidthCm, 1),
        },
        truck_positions: truckPositions,
        resin_inlay_config: resinConfig,
        builder_preferences: {
          timber_preference: timberPreference.trim() || null,
          notes: notes.trim() || null,
        },
      },
    };
  }

  async function submitDesign(): Promise<void> {
    setSubmitState("submitting");
    setSubmitMessage(null);
    setDesignId(null);

    try {
      const response = await fetch("/api/custom-board-designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildSubmissionPayload()),
      });
      const payload = (await response.json()) as ApiResponse;

      if (!response.ok || !payload.ok) {
        setSubmitState("error");
        const detail = payload.fieldErrors
          ? ` ${Object.values(payload.fieldErrors).join(" ")}`
          : "";
        setSubmitMessage(payload.error ? `${payload.error}${detail}` : "Unable to save this design.");
        return;
      }

      setSubmitState("success");
      setDesignId(payload.designId ?? null);
      setSubmitMessage(
        "Your custom board design has been saved for workshop review. The full SVG-derived spec, truck positions, and resin inlay JSON were recorded.",
      );
    } catch {
      setSubmitState("error");
      setSubmitMessage("Unable to save this design. Please try again or contact PLANKZ DECKZ.");
    }
  }

  return (
    <div className="bg-[linear-gradient(180deg,#07100f_0%,#132321_36%,#0f1f1d_100%)] text-warm-white">
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_20%_10%,rgba(126,207,192,0.55),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(245,160,160,0.38),transparent_26%),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:auto,auto,92px_92px,92px_92px]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-teal">
              Interactive Custom Board Designer
            </p>
            <h1 className="mt-4 font-display text-5xl tracking-wide text-amber drop-shadow-[0_2px_0_rgba(0,0,0,0.35)] sm:text-7xl">
              Shape your own Deckz
            </h1>
            <p className="mt-5 text-lg leading-8 text-warm-white/72">
              Build a bespoke reclaimed-timber board visually: choose the outline, tune the
              dimensions, place lengthwise resin inlays, and generate a workshop-ready specification
              for Blair and Corey.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
              <BoardRenderer
                selectedShape={selectedShape}
                geometry={geometry}
                boardLengthCm={boardLengthCm}
                boardWidthCm={boardWidthCm}
                resinBands={resinBands}
                truckPositions={truckPositions}
                activeBandId={activeBandId}
                onActiveBandChange={setActiveBandId}
                onBandPositionChange={(bandId, positionPercent) => updateBand(bandId, { positionPercent })}
              />

              <ResinDesigner
                resinBands={resinBands}
                activeBandId={activeBandId}
                onActiveBandChange={setActiveBandId}
                onAddBand={addBand}
                onRemoveBand={removeBand}
                onBandChange={updateBand}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ShapeSelector selectedShapeId={selectedShapeId} onSelect={setSelectedShapeId} />
              <div className="space-y-6">
                <DimensionControls
                  boardLengthCm={boardLengthCm}
                  boardWidthCm={boardWidthCm}
                  onLengthChange={(value) =>
                    setBoardLengthCm(clampNumber(value, MIN_BOARD_LENGTH_CM, MAX_BOARD_LENGTH_CM))
                  }
                  onWidthChange={(value) =>
                    setBoardWidthCm(clampNumber(value, MIN_BOARD_WIDTH_CM, MAX_BOARD_WIDTH_CM))
                  }
                />
                <PreferencePanel
                  timberPreference={timberPreference}
                  notes={notes}
                  onTimberPreferenceChange={setTimberPreference}
                  onNotesChange={setNotes}
                />
              </div>
            </div>
          </div>

          <DesignSummary
            selectedShape={selectedShape}
            boardLengthCm={boardLengthCm}
            boardWidthCm={boardWidthCm}
            resinBands={resinBands}
            truckPositions={truckPositions}
            timberPreference={timberPreference}
            notes={notes}
            authenticated={authenticated}
            submitState={submitState}
            submitMessage={submitMessage}
            designId={designId}
            onSubmit={submitDesign}
          />
        </div>
      </section>
    </div>
  );
}
