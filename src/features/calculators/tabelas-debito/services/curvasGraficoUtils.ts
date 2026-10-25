import type { Nozzle } from '../../../nozzle-comparison/nozzleComparison.types.ts';

export interface CurveSegmentPaths {
  pathIn: string;
  pathOutLow: string;
  pathOutHigh: string;
}

export function generatePoints(
  nozzle: Nozzle | undefined,
  fromP: number,
  toP: number,
  step = 0.25
): { p: number; q: number }[] {
  if (!nozzle || fromP >= toP) return [];
  const p0 = nozzle.referencePressureBar || 3.0;
  const q0 = nozzle.nominalFlowLMin || 1.0;
  const pts: { p: number; q: number }[] = [];

  for (let p = fromP; p < toP; p += step) {
    pts.push({ p, q: q0 * Math.sqrt(p / p0) });
  }
  pts.push({ p: toP, q: q0 * Math.sqrt(toP / p0) });
  return pts;
}

export function pointsToSvgPath(
  pts: { p: number; q: number }[],
  toSvgX: (p: number) => number,
  toSvgY: (q: number) => number
): string {
  if (pts.length === 0) return '';
  return pts
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(pt.p).toFixed(1)} ${toSvgY(pt.q).toFixed(1)}`)
    .join(' ');
}

export function buildNozzleSegmentedPaths(
  nozzle: Nozzle | undefined,
  maxP: number,
  toSvgX: (p: number) => number,
  toSvgY: (q: number) => number
): CurveSegmentPaths {
  if (!nozzle) {
    return { pathIn: '', pathOutLow: '', pathOutHigh: '' };
  }

  const pMin = nozzle.pressureMinBar ?? 1.5;
  const pMax = nozzle.pressureMaxBar ?? 20.0;

  // 1. Segmento inferior fora de escala [0.5, pMin]
  const ptsLow = pMin > 0.5 ? generatePoints(nozzle, 0.5, Math.min(pMin, maxP)) : [];

  // 2. Segmento homologado [pMin, min(pMax, maxP)]
  const inStart = Math.min(pMin, maxP);
  const inEnd = Math.min(pMax, maxP);
  const ptsIn = inEnd > inStart ? generatePoints(nozzle, inStart, inEnd) : [];

  // 3. Segmento superior fora de escala [pMax, maxP]
  const ptsHigh = maxP > pMax ? generatePoints(nozzle, pMax, maxP) : [];

  return {
    pathIn: pointsToSvgPath(ptsIn, toSvgX, toSvgY),
    pathOutLow: pointsToSvgPath(ptsLow, toSvgX, toSvgY),
    pathOutHigh: pointsToSvgPath(ptsHigh, toSvgX, toSvgY)
  };
}

export function getDiamondSvgPath(cx: number, cy: number, r: number): string {
  return `M ${cx} ${(cy - r).toFixed(1)} L ${(cx + r).toFixed(1)} ${cy} L ${cx} ${(cy + r).toFixed(1)} L ${(cx - r).toFixed(1)} ${cy} Z`;
}
