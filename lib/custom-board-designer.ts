// lib/custom-board-designer.ts
// Pure custom-board designer contracts and geometry helpers shared by UI and API validation.

export const BOARD_SHAPE_IDS = [
  "fish",
  "oval",
  "pintail",
  "scalloped",
  "diamond-tail",
  "kicktail",
] as const;

export type BoardShapeId = (typeof BOARD_SHAPE_IDS)[number];

export interface BoardShapeDefinition {
  id: BoardShapeId;
  label: string;
  shortLabel: string;
  description: string;
  ridingStyle: string;
  truckMounting: string;
  truckProfile: TruckProfile;
}

export interface TruckProfile {
  frontCenterPercentFromTail: number;
  rearCenterPercentFromTail: number;
  mountPattern: "standard-new-school";
  mountingNote: string;
}

export interface ResinBandSpec {
  id: string;
  positionPercent: number;
  widthPercent: number;
  color: string;
}

export interface TruckMountingCluster {
  id: "rear" | "front";
  label: string;
  centerFromTailCm: number;
  centerPercentFromTail: number;
  holes: TruckMountingHole[];
}

export interface TruckMountingHole {
  id: string;
  xFromTailCm: number;
  yFromCenterCm: number;
}

export interface BoardSvgGeometry {
  viewBoxWidth: number;
  viewBoxHeight: number;
  boardLeft: number;
  boardTop: number;
  boardLengthPx: number;
  boardWidthPx: number;
  centerY: number;
  pathD: string;
}

export interface BoardPathInput {
  shapeId: BoardShapeId;
  boardLeft: number;
  centerY: number;
  boardLengthPx: number;
  boardWidthPx: number;
}

export const MIN_BOARD_LENGTH_CM = 70;
export const MAX_BOARD_LENGTH_CM = 100;
export const MIN_BOARD_WIDTH_CM = 20;
export const MAX_BOARD_WIDTH_CM = 28;

export const DEFAULT_RESIN_BANDS: ResinBandSpec[] = [
  {
    id: "band-1",
    positionPercent: 50,
    widthPercent: 5,
    color: "#7ECFC0",
  },
];

export const RESIN_PALETTE = [
  { label: "Lagoon teal", value: "#7ECFC0" },
  { label: "Coral blush", value: "#F5A0A0" },
  { label: "Gold dust", value: "#f5be33" },
  { label: "Deep navy", value: "#203a49" },
  { label: "Copper timber", value: "#A87445" },
  { label: "Shell white", value: "#FFF8ED" },
] as const;

export const BOARD_SHAPES: BoardShapeDefinition[] = [
  {
    id: "fish",
    label: "Fish",
    shortLabel: "Fish",
    description: "Wide, flat nose with a split swallow tail for stable coastal cruising.",
    ridingStyle: "Stable cruiser, relaxed carving, forgiving underfoot.",
    truckMounting: "Centres pushed slightly toward the swallow tail for a loose surfy stance.",
    truckProfile: {
      frontCenterPercentFromTail: 72,
      rearCenterPercentFromTail: 30,
      mountPattern: "standard-new-school",
      mountingNote: "Relaxed 42% wheelbase bias with rear truck near the split tail.",
    },
  },
  {
    id: "oval",
    label: "Oval",
    shortLabel: "Oval",
    description: "Classic egg outline with predictable rail curves and even stance balance.",
    ridingStyle: "Versatile all-rounder, beginner friendly, smooth and predictable.",
    truckMounting: "Balanced truck centres for a neutral wheelbase and easy push stance.",
    truckProfile: {
      frontCenterPercentFromTail: 72,
      rearCenterPercentFromTail: 28,
      mountPattern: "standard-new-school",
      mountingNote: "Symmetric all-round mounting with predictable response.",
    },
  },
  {
    id: "pintail",
    label: "Pintail",
    shortLabel: "Pintail",
    description: "Narrow pointed tail with a fuller front half to reduce wheel bite at speed.",
    ridingStyle: "Downhill and speed oriented, long smooth lines, calmer rail transitions.",
    truckMounting: "Longer wheelbase with the rear truck moved forward from the narrow tail.",
    truckProfile: {
      frontCenterPercentFromTail: 74,
      rearCenterPercentFromTail: 32,
      mountPattern: "standard-new-school",
      mountingNote: "Longer speed-biased wheelbase clear of the tapered tail.",
    },
  },
  {
    id: "scalloped",
    label: "Scalloped",
    shortLabel: "Scallop",
    description: "Concave side cut-outs create stronger foot reference points on the rails.",
    ridingStyle: "Enhanced grip for aggressive carving and performance-focused riding.",
    truckMounting: "Centres sit just inside the widest lobes for carving leverage.",
    truckProfile: {
      frontCenterPercentFromTail: 71,
      rearCenterPercentFromTail: 29,
      mountPattern: "standard-new-school",
      mountingNote: "Carve-biased stance aligned to the scalloped grip zones.",
    },
  },
  {
    id: "diamond-tail",
    label: "Diamond tail",
    shortLabel: "Diamond",
    description: "Angular diamond tail with rounded forward volume for quick surf-inspired turns.",
    ridingStyle: "Responsive turning, quick transitions, sharp directional feedback.",
    truckMounting: "Rear truck sits close enough to the diamond tail to keep the board lively.",
    truckProfile: {
      frontCenterPercentFromTail: 72,
      rearCenterPercentFromTail: 29,
      mountPattern: "standard-new-school",
      mountingNote: "Responsive surf-style stance with a tight rear pivot.",
    },
  },
  {
    id: "kicktail",
    label: "Kicktail",
    shortLabel: "Kicktail",
    description: "Upturned tail end shown in plan view with a blunt tail and lifted tail line.",
    ridingStyle: "Trick-capable cruiser, street and park hybrid, most versatile for tricks.",
    truckMounting: "Rear truck is biased forward to leave working kicktail leverage behind it.",
    truckProfile: {
      frontCenterPercentFromTail: 69,
      rearCenterPercentFromTail: 28,
      mountPattern: "standard-new-school",
      mountingNote: "Leaves usable tail leverage behind the rear truck.",
    },
  },
];

export function getBoardShape(shapeId: string): BoardShapeDefinition | null {
  return BOARD_SHAPES.find((shape) => shape.id === shapeId) ?? null;
}

export function isBoardShapeId(value: unknown): value is BoardShapeId {
  return typeof value === "string" && BOARD_SHAPE_IDS.includes(value as BoardShapeId);
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function roundTo(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function createBoardSvgGeometry(
  shapeId: BoardShapeId,
  boardLengthCm: number,
  boardWidthCm: number,
): BoardSvgGeometry {
  const viewBoxWidth = 1040;
  const viewBoxHeight = 420;
  const boardLengthPx = 700 + ((boardLengthCm - MIN_BOARD_LENGTH_CM) / 30) * 210;
  const boardWidthPx = 170 + ((boardWidthCm - MIN_BOARD_WIDTH_CM) / 8) * 80;
  const boardLeft = (viewBoxWidth - boardLengthPx) / 2;
  const centerY = viewBoxHeight / 2;
  const boardTop = centerY - boardWidthPx / 2;

  return {
    viewBoxWidth,
    viewBoxHeight,
    boardLeft,
    boardTop,
    boardLengthPx,
    boardWidthPx,
    centerY,
    pathD: createBoardPath({ shapeId, boardLeft, centerY, boardLengthPx, boardWidthPx }),
  };
}

export function createBoardPath({
  shapeId,
  boardLeft,
  centerY,
  boardLengthPx,
  boardWidthPx,
}: BoardPathInput): string {
  const x0 = boardLeft;
  const x1 = boardLeft + boardLengthPx;
  const y = centerY;
  const w = boardWidthPx;

  switch (shapeId) {
    case "fish":
      return [
        `M ${x0 + boardLengthPx * 0.06} ${y - w * 0.34}`,
        `C ${x0 + boardLengthPx * 0.18} ${y - w * 0.53}, ${x0 + boardLengthPx * 0.68} ${y - w * 0.55}, ${x1 - boardLengthPx * 0.08} ${y - w * 0.43}`,
        `C ${x1 - boardLengthPx * 0.01} ${y - w * 0.32}, ${x1 + boardLengthPx * 0.01} ${y - w * 0.12}, ${x1 - boardLengthPx * 0.02} ${y}`,
        `C ${x1 + boardLengthPx * 0.01} ${y + w * 0.12}, ${x1 - boardLengthPx * 0.01} ${y + w * 0.32}, ${x1 - boardLengthPx * 0.08} ${y + w * 0.43}`,
        `C ${x0 + boardLengthPx * 0.68} ${y + w * 0.55}, ${x0 + boardLengthPx * 0.18} ${y + w * 0.53}, ${x0 + boardLengthPx * 0.06} ${y + w * 0.34}`,
        `L ${x0 + boardLengthPx * 0.005} ${y + w * 0.17}`,
        `L ${x0 + boardLengthPx * 0.045} ${y}`,
        `L ${x0 + boardLengthPx * 0.005} ${y - w * 0.17}`,
        "Z",
      ].join(" ");
    case "oval":
      return [
        `M ${x0} ${y}`,
        `C ${x0} ${y - w * 0.56}, ${x1} ${y - w * 0.56}, ${x1} ${y}`,
        `C ${x1} ${y + w * 0.56}, ${x0} ${y + w * 0.56}, ${x0} ${y}`,
        "Z",
      ].join(" ");
    case "pintail":
      return [
        `M ${x0} ${y}`,
        `C ${x0 + boardLengthPx * 0.16} ${y - w * 0.42}, ${x0 + boardLengthPx * 0.64} ${y - w * 0.58}, ${x1 - boardLengthPx * 0.09} ${y - w * 0.48}`,
        `C ${x1 + boardLengthPx * 0.015} ${y - w * 0.32}, ${x1 + boardLengthPx * 0.015} ${y + w * 0.32}, ${x1 - boardLengthPx * 0.09} ${y + w * 0.48}`,
        `C ${x0 + boardLengthPx * 0.64} ${y + w * 0.58}, ${x0 + boardLengthPx * 0.16} ${y + w * 0.42}, ${x0} ${y}`,
        "Z",
      ].join(" ");
    case "scalloped":
      return [
        `M ${x0 + boardLengthPx * 0.03} ${y}`,
        `C ${x0 + boardLengthPx * 0.07} ${y - w * 0.42}, ${x0 + boardLengthPx * 0.2} ${y - w * 0.54}, ${x0 + boardLengthPx * 0.32} ${y - w * 0.43}`,
        `C ${x0 + boardLengthPx * 0.42} ${y - w * 0.31}, ${x0 + boardLengthPx * 0.49} ${y - w * 0.31}, ${x0 + boardLengthPx * 0.58} ${y - w * 0.43}`,
        `C ${x0 + boardLengthPx * 0.72} ${y - w * 0.58}, ${x0 + boardLengthPx * 0.92} ${y - w * 0.5}, ${x1} ${y}`,
        `C ${x0 + boardLengthPx * 0.92} ${y + w * 0.5}, ${x0 + boardLengthPx * 0.72} ${y + w * 0.58}, ${x0 + boardLengthPx * 0.58} ${y + w * 0.43}`,
        `C ${x0 + boardLengthPx * 0.49} ${y + w * 0.31}, ${x0 + boardLengthPx * 0.42} ${y + w * 0.31}, ${x0 + boardLengthPx * 0.32} ${y + w * 0.43}`,
        `C ${x0 + boardLengthPx * 0.2} ${y + w * 0.54}, ${x0 + boardLengthPx * 0.07} ${y + w * 0.42}, ${x0 + boardLengthPx * 0.03} ${y}`,
        "Z",
      ].join(" ");
    case "diamond-tail":
      return [
        `M ${x0} ${y}`,
        `L ${x0 + boardLengthPx * 0.08} ${y - w * 0.42}`,
        `C ${x0 + boardLengthPx * 0.25} ${y - w * 0.56}, ${x0 + boardLengthPx * 0.74} ${y - w * 0.55}, ${x1 - boardLengthPx * 0.06} ${y - w * 0.42}`,
        `C ${x1 + boardLengthPx * 0.02} ${y - w * 0.26}, ${x1 + boardLengthPx * 0.02} ${y + w * 0.26}, ${x1 - boardLengthPx * 0.06} ${y + w * 0.42}`,
        `C ${x0 + boardLengthPx * 0.74} ${y + w * 0.55}, ${x0 + boardLengthPx * 0.25} ${y + w * 0.56}, ${x0 + boardLengthPx * 0.08} ${y + w * 0.42}`,
        "Z",
      ].join(" ");
    case "kicktail":
      return [
        `M ${x0 + boardLengthPx * 0.07} ${y - w * 0.42}`,
        `C ${x0 + boardLengthPx * 0.22} ${y - w * 0.54}, ${x0 + boardLengthPx * 0.72} ${y - w * 0.55}, ${x1 - boardLengthPx * 0.07} ${y - w * 0.42}`,
        `C ${x1 + boardLengthPx * 0.02} ${y - w * 0.26}, ${x1 + boardLengthPx * 0.02} ${y + w * 0.26}, ${x1 - boardLengthPx * 0.07} ${y + w * 0.42}`,
        `C ${x0 + boardLengthPx * 0.72} ${y + w * 0.55}, ${x0 + boardLengthPx * 0.22} ${y + w * 0.54}, ${x0 + boardLengthPx * 0.07} ${y + w * 0.42}`,
        `Q ${x0 - boardLengthPx * 0.015} ${y}, ${x0 + boardLengthPx * 0.07} ${y - w * 0.42}`,
        "Z",
      ].join(" ");
  }
}

export function calculateTruckPositions(
  shapeId: BoardShapeId,
  boardLengthCm: number,
): TruckMountingCluster[] {
  const shape = getBoardShape(shapeId) ?? BOARD_SHAPES[0];
  const xSpacing = 4.2;
  const ySpacing = 3.8;

  const clusters: Omit<TruckMountingCluster, "holes">[] = [
    {
      id: "rear",
      label: "Rear truck",
      centerPercentFromTail: shape.truckProfile.rearCenterPercentFromTail,
      centerFromTailCm: roundTo((shape.truckProfile.rearCenterPercentFromTail / 100) * boardLengthCm, 1),
    },
    {
      id: "front",
      label: "Front truck",
      centerPercentFromTail: shape.truckProfile.frontCenterPercentFromTail,
      centerFromTailCm: roundTo((shape.truckProfile.frontCenterPercentFromTail / 100) * boardLengthCm, 1),
    },
  ];

  return clusters.map((cluster) => ({
    ...cluster,
    holes: [
      {
        id: `${cluster.id}-front-left`,
        xFromTailCm: roundTo(cluster.centerFromTailCm - xSpacing / 2, 1),
        yFromCenterCm: roundTo(-ySpacing / 2, 1),
      },
      {
        id: `${cluster.id}-front-right`,
        xFromTailCm: roundTo(cluster.centerFromTailCm - xSpacing / 2, 1),
        yFromCenterCm: roundTo(ySpacing / 2, 1),
      },
      {
        id: `${cluster.id}-rear-left`,
        xFromTailCm: roundTo(cluster.centerFromTailCm + xSpacing / 2, 1),
        yFromCenterCm: roundTo(-ySpacing / 2, 1),
      },
      {
        id: `${cluster.id}-rear-right`,
        xFromTailCm: roundTo(cluster.centerFromTailCm + xSpacing / 2, 1),
        yFromCenterCm: roundTo(ySpacing / 2, 1),
      },
    ],
  }));
}

export function resinBandsToSummary(bands: ResinBandSpec[]): string {
  if (bands.length === 0) return "No resin bands selected";

  return bands
    .map(
      (band, index) =>
        `Band ${index + 1}: ${roundTo(band.positionPercent, 1)}% from tail, ${roundTo(
          band.widthPercent,
          1,
        )}% width, ${band.color}`,
    )
    .join("; ");
}
