export type LakePoint = { x: number; y: number };

export type LakeShape = {
  id: string;
  path: string;
  viewBox: { width: number; height: number };
  clipInset: { top: number; left: number; right: number; bottom: number };
  /** Up to 12 hand-tuned letter slots in viewBox coordinates, best-first order. */
  slots: LakePoint[];
};

const VB_W = 800;
const VB_H = 250;
const SRC_W = 300;
const SRC_H = 260;

type LakeTemplate = {
  id: string;
  anchors: LakePoint[];
  slots: LakePoint[];
};

function boundsFromPoints(points: LakePoint[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { minX, minY, maxX, maxY };
}

function chaikinRound(points: LakePoint[]): LakePoint[] {
  const n = points.length;
  const rounded: LakePoint[] = [];
  for (let i = 0; i < n; i++) {
    const p0 = points[i];
    const p1 = points[(i + 1) % n];
    rounded.push(
      { x: 0.75 * p0.x + 0.25 * p1.x, y: 0.75 * p0.y + 0.25 * p1.y },
      { x: 0.25 * p0.x + 0.75 * p1.x, y: 0.25 * p0.y + 0.75 * p1.y },
    );
  }
  return rounded;
}

function pointsToSmoothPath(points: LakePoint[], tension = 1.15): string {
  const n = points.length;
  if (n < 3) return '';

  const fmt = (p: LakePoint) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  let d = `M ${fmt(points[0])}`;

  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${fmt(p2)}`;
  }

  return `${d} Z`;
}

function scaleAnchorsToViewBox(anchors: LakePoint[]): LakePoint[] {
  return anchors.map((p) => ({
    x: (p.x / SRC_W) * VB_W,
    y: (p.y / SRC_H) * VB_H,
  }));
}

function anchorsToPath(anchors: LakePoint[]): string {
  return pointsToSmoothPath(chaikinRound(anchors));
}

function computeClipInset(bounds: ReturnType<typeof boundsFromPoints>): LakeShape['clipInset'] {
  const pad = 0.08;
  return {
    top: Math.max(0.12, bounds.minY / VB_H + pad),
    left: Math.max(0.12, bounds.minX / VB_W + pad),
    right: Math.max(0.12, (VB_W - bounds.maxX) / VB_W + pad),
    bottom: Math.max(0.12, (VB_H - bounds.maxY) / VB_H + pad),
  };
}

/** Slots ordered best-first for 7–11 letters; kept well inside the painted lake. */
const LAKE_TEMPLATES: LakeTemplate[] = [
  {
    id: 'sketch',
    anchors: [
      { x: 128, y: 36 },
      { x: 198, y: 30 },
      { x: 272, y: 62 },
      { x: 262, y: 122 },
      { x: 282, y: 182 },
      { x: 212, y: 242 },
      { x: 118, y: 248 },
      { x: 42, y: 208 },
      { x: 18, y: 136 },
      { x: 52, y: 62 },
    ],
    slots: [
      { x: 300, y: 138 },
      { x: 510, y: 138 },
      { x: 400, y: 178 },
      { x: 200, y: 162 },
      { x: 620, y: 162 },
      { x: 340, y: 112 },
      { x: 460, y: 112 },
      { x: 260, y: 198 },
      { x: 540, y: 198 },
      { x: 400, y: 148 },
      { x: 245, y: 152 },
      { x: 555, y: 152 },
    ],
  },
  {
    id: 'puddle',
    anchors: [
      { x: 38, y: 108 },
      { x: 72, y: 58 },
      { x: 148, y: 38 },
      { x: 228, y: 52 },
      { x: 278, y: 108 },
      { x: 268, y: 178 },
      { x: 198, y: 228 },
      { x: 108, y: 238 },
      { x: 42, y: 192 },
      { x: 22, y: 142 },
    ],
    slots: [
      { x: 285, y: 135 },
      { x: 505, y: 135 },
      { x: 395, y: 175 },
      { x: 175, y: 158 },
      { x: 625, y: 158 },
      { x: 330, y: 108 },
      { x: 465, y: 108 },
      { x: 245, y: 195 },
      { x: 555, y: 195 },
      { x: 395, y: 142 },
      { x: 220, y: 148 },
      { x: 570, y: 148 },
    ],
  },
  {
    id: 'cove',
    anchors: [
      { x: 148, y: 28 },
      { x: 228, y: 48 },
      { x: 278, y: 118 },
      { x: 248, y: 198 },
      { x: 168, y: 248 },
      { x: 78, y: 232 },
      { x: 28, y: 168 },
      { x: 38, y: 92 },
      { x: 92, y: 42 },
    ],
    slots: [
      { x: 290, y: 142 },
      { x: 510, y: 142 },
      { x: 400, y: 182 },
      { x: 185, y: 168 },
      { x: 615, y: 168 },
      { x: 345, y: 118 },
      { x: 455, y: 118 },
      { x: 255, y: 200 },
      { x: 545, y: 200 },
      { x: 400, y: 152 },
      { x: 230, y: 158 },
      { x: 570, y: 158 },
    ],
  },
  {
    id: 'lobed',
    anchors: [
      { x: 108, y: 42 },
      { x: 178, y: 22 },
      { x: 258, y: 72 },
      { x: 288, y: 148 },
      { x: 242, y: 228 },
      { x: 148, y: 252 },
      { x: 58, y: 218 },
      { x: 22, y: 148 },
      { x: 48, y: 78 },
    ],
    slots: [
      { x: 295, y: 136 },
      { x: 515, y: 136 },
      { x: 405, y: 176 },
      { x: 190, y: 160 },
      { x: 630, y: 160 },
      { x: 345, y: 115 },
      { x: 465, y: 115 },
      { x: 255, y: 198 },
      { x: 555, y: 198 },
      { x: 405, y: 145 },
      { x: 235, y: 150 },
      { x: 575, y: 150 },
    ],
  },
  {
    id: 'inlet',
    anchors: [
      { x: 162, y: 32 },
      { x: 248, y: 58 },
      { x: 272, y: 132 },
      { x: 218, y: 212 },
      { x: 132, y: 248 },
      { x: 48, y: 202 },
      { x: 18, y: 118 },
      { x: 62, y: 48 },
      { x: 132, y: 72 },
    ],
    slots: [
      { x: 305, y: 140 },
      { x: 520, y: 140 },
      { x: 410, y: 180 },
      { x: 205, y: 165 },
      { x: 625, y: 165 },
      { x: 350, y: 115 },
      { x: 470, y: 115 },
      { x: 265, y: 198 },
      { x: 555, y: 198 },
      { x: 410, y: 150 },
      { x: 250, y: 155 },
      { x: 570, y: 155 },
    ],
  },
  {
    id: 'oxbow',
    anchors: [
      { x: 48, y: 88 },
      { x: 108, y: 42 },
      { x: 198, y: 28 },
      { x: 278, y: 48 },
      { x: 288, y: 118 },
      { x: 248, y: 198 },
      { x: 168, y: 242 },
      { x: 78, y: 228 },
      { x: 28, y: 168 },
      { x: 32, y: 128 },
    ],
    slots: [
      { x: 290, y: 138 },
      { x: 505, y: 138 },
      { x: 395, y: 178 },
      { x: 195, y: 162 },
      { x: 620, y: 162 },
      { x: 335, y: 112 },
      { x: 460, y: 112 },
      { x: 250, y: 198 },
      { x: 545, y: 198 },
      { x: 395, y: 148 },
      { x: 240, y: 152 },
      { x: 560, y: 152 },
    ],
  },
  {
    id: 'shoal',
    anchors: [
      { x: 32, y: 128 },
      { x: 72, y: 72 },
      { x: 158, y: 42 },
      { x: 248, y: 38 },
      { x: 268, y: 108 },
      { x: 278, y: 188 },
      { x: 208, y: 238 },
      { x: 108, y: 248 },
      { x: 38, y: 198 },
    ],
    slots: [
      { x: 280, y: 132 },
      { x: 500, y: 132 },
      { x: 390, y: 172 },
      { x: 170, y: 155 },
      { x: 630, y: 155 },
      { x: 325, y: 105 },
      { x: 455, y: 105 },
      { x: 235, y: 192 },
      { x: 555, y: 192 },
      { x: 390, y: 140 },
      { x: 210, y: 145 },
      { x: 575, y: 145 },
    ],
  },
  {
    id: 'lagoon',
    anchors: [
      { x: 118, y: 48 },
      { x: 198, y: 28 },
      { x: 278, y: 58 },
      { x: 288, y: 138 },
      { x: 248, y: 218 },
      { x: 158, y: 248 },
      { x: 68, y: 218 },
      { x: 28, y: 148 },
      { x: 58, y: 78 },
    ],
    slots: [
      { x: 295, y: 140 },
      { x: 510, y: 140 },
      { x: 400, y: 180 },
      { x: 180, y: 165 },
      { x: 625, y: 165 },
      { x: 340, y: 115 },
      { x: 465, y: 115 },
      { x: 250, y: 200 },
      { x: 550, y: 200 },
      { x: 400, y: 150 },
      { x: 225, y: 155 },
      { x: 575, y: 155 },
    ],
  },
  {
    id: 'creek',
    anchors: [
      { x: 28, y: 108 },
      { x: 88, y: 58 },
      { x: 178, y: 38 },
      { x: 258, y: 62 },
      { x: 278, y: 142 },
      { x: 228, y: 212 },
      { x: 138, y: 248 },
      { x: 48, y: 218 },
      { x: 18, y: 158 },
    ],
    slots: [
      { x: 300, y: 136 },
      { x: 515, y: 136 },
      { x: 405, y: 176 },
      { x: 200, y: 160 },
      { x: 630, y: 160 },
      { x: 345, y: 110 },
      { x: 470, y: 110 },
      { x: 260, y: 196 },
      { x: 560, y: 196 },
      { x: 405, y: 145 },
      { x: 245, y: 150 },
      { x: 575, y: 150 },
    ],
  },
  {
    id: 'basin',
    anchors: [
      { x: 98, y: 38 },
      { x: 188, y: 22 },
      { x: 268, y: 52 },
      { x: 288, y: 128 },
      { x: 258, y: 208 },
      { x: 168, y: 248 },
      { x: 78, y: 232 },
      { x: 32, y: 162 },
      { x: 48, y: 88 },
    ],
    slots: [
      { x: 288, y: 138 },
      { x: 508, y: 138 },
      { x: 398, y: 178 },
      { x: 178, y: 162 },
      { x: 628, y: 162 },
      { x: 332, y: 112 },
      { x: 462, y: 112 },
      { x: 248, y: 198 },
      { x: 552, y: 198 },
      { x: 398, y: 148 },
      { x: 218, y: 152 },
      { x: 572, y: 152 },
    ],
  },
];

function buildLakeShape(template: LakeTemplate): LakeShape {
  const anchors = scaleAnchorsToViewBox(template.anchors);
  const bounds = boundsFromPoints(anchors);

  return {
    id: template.id,
    path: anchorsToPath(anchors),
    viewBox: { width: VB_W, height: VB_H },
    clipInset: computeClipInset(bounds),
    slots: template.slots.map((s) => ({ ...s })),
  };
}

const FIXED_LAKES: LakeShape[] = LAKE_TEMPLATES.map(buildLakeShape);

export const LAKE_COUNT = FIXED_LAKES.length;

export function pickLakeShape(): LakeShape {
  const index = Math.floor(Math.random() * FIXED_LAKES.length);
  return FIXED_LAKES[index];
}

export function getLakeById(id: string): LakeShape | undefined {
  return FIXED_LAKES.find((lake) => lake.id === id);
}
