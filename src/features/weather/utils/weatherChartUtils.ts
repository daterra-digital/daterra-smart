// src/features/weather/utils/weatherChartUtils.ts
import { formatDecimalPt } from './windDirection.ts';

export interface ChartScaleOptions {
  forceZeroMin?: boolean;
  fixedMin?: number;
  fixedMax?: number;
  padRange?: number;
}

export interface ChartLayout {
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
}

export interface ChartScaleResult {
  min: number;
  max: number;
  range: number;
  step: number;
  ticks: number[];
}

export interface ChartPoint {
  x: number;
  y: number;
  value: number;
  index: number;
}

/**
 * Calcula escala matemática limpa (nice scale) com passos de 1, 2 ou 5 * 10^n
 * evitando divisão por zero e rótulos duplicados por arredondamento.
 */
export function calcChartScale(values: number[], options: ChartScaleOptions = {}): ChartScaleResult {
  const { forceZeroMin = false, fixedMin, fixedMax, padRange = 1 } = options;

  if (!values.length) {
    const min = fixedMin ?? 0;
    const max = fixedMax ?? 1;
    const range = Math.max(0.001, max - min);
    return { min, max, range, step: range / 4, ticks: [min, max] };
  }

  let min = Math.min(...values);
  let max = Math.max(...values);

  if (fixedMin !== undefined) min = fixedMin;
  if (fixedMax !== undefined) max = fixedMax;
  if (forceZeroMin && min > 0) min = 0;

  if (min === max) {
    if (min === 0) {
      max = padRange > 0 ? padRange : 1;
    } else {
      min -= padRange;
      max += padRange;
    }
  }

  const rawRange = Math.max(0.001, max - min);
  const rawStep = rawRange / 3.5;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
  const norm = rawStep / mag;

  let step: number;
  if (norm < 1.5) step = 1 * mag;
  else if (norm < 3.5) step = 2 * mag;
  else if (norm < 7.5) step = 5 * mag;
  else step = 10 * mag;
  step = Math.round(step * 100) / 100;

  const niceMin = forceZeroMin ? 0 : Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const range = Math.max(0.001, niceMax - niceMin);

  const ticks: number[] = [];
  for (let val = niceMin; val <= niceMax + step * 0.001; val += step) {
    ticks.push(Math.round(val * 100) / 100);
  }

  return {
    min: Math.round(niceMin * 100) / 100,
    max: Math.round(niceMax * 100) / 100,
    range,
    step,
    ticks
  };
}

/**
 * Mapeia valores para coordenadas (x, y) no espaço SVG.
 */
export function calcPointCoordinates(
  values: number[],
  scale: ChartScaleResult,
  layout: ChartLayout
): ChartPoint[] {
  const { width, height, padding } = layout;
  const plotWidth = Math.max(10, width - padding.left - padding.right);
  const plotHeight = Math.max(10, height - padding.top - padding.bottom);
  const count = values.length;

  if (count === 0) return [];

  return values.map((val, i) => {
    const x = count === 1
      ? padding.left + plotWidth / 2
      : padding.left + (i / (count - 1)) * plotWidth;

    const normalized = (val - scale.min) / scale.range;
    const clamped = Math.max(0, Math.min(1, isNaN(normalized) ? 0 : normalized));
    const y = padding.top + plotHeight - clamped * plotHeight;

    return {
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      value: val,
      index: i
    };
  });
}

/**
 * Gera caminho SVG de linha poligonal sem curvas artificiais que distorçam extremos.
 */
export function generateSvgLinePath(points: Array<{ x: number; y: number }>): string {
  if (!points.length) return '';
  return points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');
}

/**
 * Gera caminho SVG de área preenchida fechada com base na linha inferior do gráfico.
 */
export function generateSvgAreaPath(points: Array<{ x: number; y: number }>, baseY: number): string {
  if (points.length < 2) return '';
  const linePart = generateSvgLinePath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${linePart} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;
}

/**
 * Formata números com vírgula em PT-PT e trata nulos honestamente.
 */
export function formatChartMetric(val: number | null | undefined, unit = ''): string {
  if (val == null || isNaN(val)) return '--';
  const formatted = formatDecimalPt(val);
  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Formata tick com casas decimais apenas se o passo for fracionário, sem -0.
 */
export function formatTick(val: number, step = 1): string {
  if (Math.abs(val) < 1e-6) return '0';
  if (step % 1 === 0) return String(Math.round(val));
  const rounded = Math.round(val * 10) / 10;
  return String(rounded).replace('.', ',');
}

/**
 * Seleciona índices legíveis do eixo X evitando qualquer sobreposição entre rótulos.
 */
export function getVisibleXAxisIndices(points: Array<{ x: number }>, minDistance = 46): number[] {
  const count = points.length;
  if (count <= 1) return count === 1 ? [0] : [];

  const chosen: number[] = [0];
  for (let i = 1; i < count - 1; i++) {
    const lastX = points[chosen[chosen.length - 1]].x;
    const nextX = points[count - 1].x;
    if (points[i].x - lastX >= minDistance && nextX - points[i].x >= minDistance) {
      chosen.push(i);
    }
  }

  const lastX = points[chosen[chosen.length - 1]].x;
  if (points[count - 1].x - lastX < minDistance && chosen.length > 1) {
    chosen.pop();
  }
  chosen.push(count - 1);
  return chosen;
}
