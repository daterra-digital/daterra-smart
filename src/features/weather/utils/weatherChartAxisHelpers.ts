// src/features/weather/utils/weatherChartAxisHelpers.ts

export interface DayChangeMarker {
  index: number;
  x: number;
  label: string;
}

const WEEKDAY_SHORT_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;

/**
 * Seleciona estritamente horas alternadas de 2 em 2 horas (0, 2, 4, ...),
 * garantindo uma hora visível e a seguinte oculta sem colisões de texto.
 */
export function getAlternatingHourIndices(count: number): number[] {
  if (!Number.isFinite(count) || count <= 0) return [];
  const indices: number[] = [];
  for (let i = 0; i < count; i += 2) {
    indices.push(i);
  }
  return indices;
}

/**
 * Formata a etiqueta discreta de mudança de dia no topo da linha vertical `00:00` (ex.: `Qui, 19/11`).
 */
export function formatDayChangeBadge(timeIso: string): string {
  const datePart = timeIso.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) return datePart;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(utcDate.getTime())) return datePart;
  const weekday = WEEKDAY_SHORT_PT[utcDate.getUTCDay()] ?? '';
  const dd = String(day).padStart(2, '0');
  const mm = String(month).padStart(2, '0');
  return weekday ? `${weekday}, ${dd}/${mm}` : `${dd}/${mm}`;
}

/**
 * Localiza posições de mudança de dia (`00:00` ou alteração da data civil face à hora anterior)
 * para desenhar a linha vertical tracejada subtil e respetiva etiqueta superior.
 */
export function findDayChangeMarkers(
  hours: ReadonlyArray<{ timeIso: string; timeFormatted: string }>,
  xs: ReadonlyArray<number>
): DayChangeMarker[] {
  const markers: DayChangeMarker[] = [];
  const len = Math.min(hours.length, xs.length);
  for (let i = 1; i < len; i++) {
    const curr = hours[i];
    const prev = hours[i - 1];
    const currDate = curr.timeIso.slice(0, 10);
    const prevDate = prev.timeIso.slice(0, 10);
    const isMidnight = curr.timeFormatted === '00:00';
    const isDateRollover = Boolean(currDate && prevDate && currDate !== prevDate);
    if (isMidnight || isDateRollover) {
      markers.push({
        index: i,
        x: xs[i],
        label: formatDayChangeBadge(curr.timeIso)
      });
    }
  }
  return markers;
}

/**
 * Mapeia `clientX` de um toque ou cursor sobre o SVG para o índice horário mais próximo.
 */
export function findClosestPointIndexByClientX(
  svgEl: { getBoundingClientRect: () => { left: number; width: number } } | null,
  clientX: number,
  svgWidth: number,
  xs: ReadonlyArray<number>
): number | null {
  if (!svgEl || !xs.length || !Number.isFinite(clientX)) return null;
  const rect = svgEl.getBoundingClientRect();
  if (!rect.width) return null;
  const svgX = ((clientX - rect.left) / rect.width) * svgWidth;
  let closestIdx = 0;
  let minDiff = Infinity;
  for (let i = 0; i < xs.length; i++) {
    const diff = Math.abs(xs[i] - svgX);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = i;
    }
  }
  return closestIdx;
}
