export type DriftPotentialBand = 'BAIXO' | 'MODERADO' | 'ELEVADO' | 'CRITICO';

export type DriftValidity =
  | 'valid_complete'
  | 'insufficient_missing_fields'
  | 'incomplete_estimated_gust'
  | 'unverified_legacy_cache';

export type DriftChartSeriesKey = 'wind' | 'deltaT' | 'humidity' | 'precip';

export const DRIFT_BAND_CSS: Record<DriftPotentialBand, string> = {
  BAIXO: 'bg-emerald-200 text-slate-950 border-emerald-300',
  MODERADO: 'bg-amber-200 text-slate-950 border-amber-300',
  ELEVADO: 'bg-orange-300 text-slate-950 border-orange-400',
  CRITICO: 'bg-rose-500 text-white border-rose-400'
};

export const DRIFT_SERIES_OPTIONS: ReadonlyArray<{ key: DriftChartSeriesKey; label: string; marker: string }> = [
  { key: 'wind', label: 'Vento / Rajada (km/h · entrada)', marker: '▲/◇' },
  { key: 'deltaT', label: 'Delta T (°C · derivada)', marker: '■' },
  { key: 'humidity', label: 'Humidade (% · entrada)', marker: '◆' },
  { key: 'precip', label: 'Precipitação (mm · entrada)', marker: '▮' }
];

export interface DriftReadingEvaluation {
  readonly status: 'VALID' | 'INSUFFICIENT_DATA';
  readonly validity: DriftValidity;
  readonly score: number | null;
  readonly band: DriftPotentialBand | null;
  readonly bandLabelPt: string;
  readonly dominantFactorPt: string;
  readonly deltaTC: number | null;
  readonly windKmh: number | null;
  readonly gustsKmh: number | null;
  readonly windDirectionDeg: number | null;
  readonly gustFactor: number | null;
  readonly isHighGustFactor: boolean;
  readonly humidityPct: number | null;
  readonly precipMm: number | null;
  readonly hasPrecipitationBlock: boolean;
  readonly isCalmInversionSuspected: boolean;
  readonly isEligibleForFavorableWindow: boolean;
}

export interface HourlyDriftPoint {
  readonly timeIso: string;
  readonly timeFormatted: string;
  readonly evaluation: DriftReadingEvaluation;
}

export interface FavorableDriftWindow {
  readonly startIso: string;
  readonly endIso: string;
  readonly dayLabelPt: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly hoursCount: number;
  readonly maxScore: number;
  readonly rationalePt: string;
}

export type FavorableUnavailableReason =
  | 'ok'
  | 'stale_or_legacy_cache'
  | 'insufficient_forecast'
  | 'no_window_found';

export interface FavorableDriftSummary {
  readonly periods: readonly FavorableDriftWindow[];
  readonly hasSingleIsolatedHour: boolean;
  readonly excludedIncompleteCount: number;
  readonly validHoursCount: number;
  readonly unavailableReason: FavorableUnavailableReason;
}
