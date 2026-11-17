// src/features/perfis/services/cultureDateUtils.ts
// Utilitários determinísticos de data civil (DD-MM-AAAA <-> YYYY-MM-DD) para momentos de Cultura.

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DISPLAY_DATE_RE = /^(\d{2})[-/](\d{2})[-/](\d{4})$/;

function isValidCalendarParts(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const dt = new Date(Date.UTC(year, month - 1, day));
  return (
    dt.getUTCFullYear() === year &&
    dt.getUTCMonth() === month - 1 &&
    dt.getUTCDate() === day
  );
}

export function isValidIsoCivilDate(value: string | null | undefined): boolean {
  if (!value) return false;
  const match = ISO_DATE_RE.exec(value.trim());
  if (!match) return false;
  return isValidCalendarParts(Number(match[1]), Number(match[2]), Number(match[3]));
}

export function parseDdMmYyyyToIso(display: string): string | null {
  const trimmed = display.trim();
  if (!trimmed) return null;
  if (isValidIsoCivilDate(trimmed)) return trimmed;
  const match = DISPLAY_DATE_RE.exec(trimmed);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (!isValidCalendarParts(year, month, day)) return null;
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function formatIsoCivilToDdMmYyyy(iso: string | null | undefined): string {
  if (!iso || !isValidIsoCivilDate(iso)) {
    return 'Data desconhecida (legado)';
  }
  const [y, m, d] = iso.trim().split('-');
  return `${d}-${m}-${y}`;
}

export function todayIsoCivil(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export interface SortableMomentDateItem {
  id?: number;
  observedAt: string | null;
  updatedAt?: string;
}

export function compareMomentsByDateDesc(a: SortableMomentDateItem, b: SortableMomentDateItem): number {
  const aValid = a.observedAt && isValidIsoCivilDate(a.observedAt) ? a.observedAt : null;
  const bValid = b.observedAt && isValidIsoCivilDate(b.observedAt) ? b.observedAt : null;

  if (aValid && bValid && aValid !== bValid) {
    return bValid.localeCompare(aValid);
  }
  if (aValid && !bValid) return -1;
  if (!aValid && bValid) return 1;

  const updCompare = (b.updatedAt || '').localeCompare(a.updatedAt || '');
  if (updCompare !== 0) return updCompare;

  return (b.id ?? 0) - (a.id ?? 0);
}

/** Ordem cronológica crescente (mais antigo -> mais recente); datas inválidas/legado ficam primeiro. */
export function compareMomentsByDateAsc(a: SortableMomentDateItem, b: SortableMomentDateItem): number {
  return -compareMomentsByDateDesc(a, b);
}

/** Momento cronologicamente mais recente: max(observedAt) válido; desempate por updatedAt e id. */
export function findLatestChronologicalMoment<T extends SortableMomentDateItem>(moments: T[]): T | undefined {
  return [...moments].sort(compareMomentsByDateDesc)[0];
}

/**
 * Indica se um momento com `observedAt` seria o mais recente entre os restantes (empate de data => é o mais recente).
 * `excludeId` retira da comparação o próprio momento em revisão.
 */
export function isChronologicallyLatest(
  observedAt: string | null,
  moments: SortableMomentDateItem[],
  excludeId?: number
): boolean {
  const others = moments.filter((m) => excludeId === undefined || m.id !== excludeId);
  const latest = findLatestChronologicalMoment(others);
  if (!latest) return true;
  const candidate = observedAt && isValidIsoCivilDate(observedAt) ? observedAt : null;
  const reference = latest.observedAt && isValidIsoCivilDate(latest.observedAt) ? latest.observedAt : null;
  if (candidate && reference) return candidate >= reference;
  if (candidate) return true;
  return !reference;
}
