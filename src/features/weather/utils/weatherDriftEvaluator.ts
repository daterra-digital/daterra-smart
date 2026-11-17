import { computeMeteoSubIndex } from '../../ird/irdSubIndices.ts';
import type { CurrentWeather, HourlyForecastItem, WeatherTelemetryQuality } from '../types.ts';
import { filterFutureHours, getEffectiveDateIso } from '../services/weatherTimeService.ts';
import type {
  DriftPotentialBand, DriftValidity, DriftReadingEvaluation,
  HourlyDriftPoint, FavorableDriftWindow, FavorableDriftSummary, FavorableUnavailableReason
} from './weatherDriftTypes.ts';

export type {
  DriftPotentialBand, DriftValidity, DriftReadingEvaluation,
  HourlyDriftPoint, FavorableDriftWindow, FavorableDriftSummary
};

function classifyBand(score: number): { band: DriftPotentialBand; label: string } {
  if (score <= 25) return { band: 'BAIXO', label: 'Baixo' };
  if (score <= 50) return { band: 'MODERADO', label: 'Moderado' };
  if (score <= 75) return { band: 'ELEVADO', label: 'Elevado' };
  return { band: 'CRITICO', label: 'Crítico' };
}

function isFin(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function buildFactorText(wind: number, gust: number, deltaTC: number, precipMm: number, effWindKmh: number, isInversion: boolean): string {
  if (precipMm > 0.2) return 'Precipitação acumulada > 0,2 mm eleva o potencial ao patamar crítico.';
  if (isInversion) return 'Vento muito fraco (< 2 km/h) com ΔT > 6 °C: atenção a possível inversão térmica.';
  if (effWindKmh >= 14) return `Vento efetivo a 10 m (${effWindKmh.toFixed(1)} km/h) domina o potencial meteorológico.`;
  if (deltaTC > 8) return `Delta T elevado (${deltaTC.toFixed(1)} °C) favorece evaporação rápida de gotas finas.`;
  if (deltaTC < 2) return `Delta T baixo (${deltaTC.toFixed(1)} °C): secagem lenta na folhagem.`;
  return `Vento a ${Math.round(wind)} km/h (raj. ${Math.round(gust)} km/h) e ΔT estável (${deltaTC.toFixed(1)} °C).`;
}

export function assessWeatherDriftReading(
  item: CurrentWeather | HourlyForecastItem,
  options: { isCached?: boolean; cacheAgeMinutes?: number | null } = {}
): DriftReadingEvaluation {
  const q: WeatherTelemetryQuality | undefined = item.telemetryQuality;
  const legacyInvalid = !q;

  const wind = q ? q.rawWindSpeedKmh : (isFin(item.windSpeedKmh) ? item.windSpeedKmh : null);
  const gust = q ? q.rawWindGustsKmh : (isFin(item.windGustsKmh) ? item.windGustsKmh : null);
  const temp = q ? q.rawTemperatureC : (isFin(item.temperatureC) ? item.temperatureC : null);
  const rh = q ? q.rawHumidityPercent : (isFin(item.humidityPercent) ? item.humidityPercent : null);
  const precip = q ? q.rawPrecipitationMm : (isFin(item.precipitationMm) ? item.precipitationMm : null);

  if (q && !q.isComplete) {
    return {
      status: 'INSUFFICIENT_DATA', validity: 'insufficient_missing_fields', score: null, band: null,
      bandLabelPt: 'Sem leitura', dominantFactorPt: `Dados ausentes (${q.missingFields.join(', ')}); não convertidos em zero.`,
      deltaTC: null, windKmh: wind, gustsKmh: gust, humidityPct: rh, precipMm: precip,
      isCalmInversionSuspected: false, isEligibleForFavorableWindow: false
    };
  }
  if (q && q.isGustEstimated) {
    return {
      status: 'INSUFFICIENT_DATA', validity: 'incomplete_estimated_gust', score: null, band: null,
      bandLabelPt: 'Incompleto', dominantFactorPt: 'Rajada não medida pela API; estimativa excluída da classificação e janelas.',
      deltaTC: null, windKmh: wind, gustsKmh: null, humidityPct: rh, precipMm: precip,
      isCalmInversionSuspected: false, isEligibleForFavorableWindow: false
    };
  }
  if (wind === null || gust === null || temp === null || rh === null || precip === null || rh <= 0 || rh > 100) {
    return {
      status: 'INSUFFICIENT_DATA', validity: 'insufficient_missing_fields', score: null, band: null,
      bandLabelPt: 'Sem leitura', dominantFactorPt: 'Leitura meteorológica incompleta ou fora de domínio físico.',
      deltaTC: null, windKmh: wind, gustsKmh: gust, humidityPct: rh, precipMm: precip,
      isCalmInversionSuspected: false, isEligibleForFavorableWindow: false
    };
  }

  const sub = computeMeteoSubIndex({
    windSpeedKmh: wind, windGustsKmh: gust, temperatureC: temp, relativeHumidityPct: rh, precipitationMm: precip,
    weatherSource: options.isCached ? 'open_meteo_cache' : 'open_meteo_live', weatherAgeMinutes: options.cacheAgeMinutes ?? null
  });
  const score = Math.round(sub.rawScore);
  const { band, label } = classifyBand(score);
  const validity: DriftValidity = legacyInvalid ? 'unverified_legacy_cache' : 'valid_complete';

  return {
    status: 'VALID', validity, score, band, bandLabelPt: label,
    dominantFactorPt: buildFactorText(wind, gust, sub.deltaTC, precip, sub.effectiveWindKmh, sub.isCalmThermalInversionSuspected),
    deltaTC: sub.deltaTC, windKmh: wind, gustsKmh: gust, humidityPct: rh, precipMm: precip,
    isCalmInversionSuspected: sub.isCalmThermalInversionSuspected,
    isEligibleForFavorableWindow: validity === 'valid_complete' && score <= 25 && precip <= 0.2 && !sub.isCalmThermalInversionSuspected
  };
}

export function buildHourlyDriftSeries(
  hourlyFull: HourlyForecastItem[],
  currentHourIso: string,
  selectedDateIso: string | null,
  options: { isCached?: boolean; cacheAgeMinutes?: number | null } = {}
): HourlyDriftPoint[] {
  const todayIso = getEffectiveDateIso();
  const isToday = !selectedDateIso || selectedDateIso === todayIso;
  const scoped = isToday
    ? filterFutureHours(hourlyFull, currentHourIso, 24)
    : hourlyFull.filter((h) => h.timeIso.startsWith(selectedDateIso) && h.timeIso >= currentHourIso);

  return scoped.map((h) => ({ timeIso: h.timeIso, timeFormatted: h.timeFormatted, evaluation: assessWeatherDriftReading(h, options) }));
}

function isNextHour(prevIso: string, currIso: string): boolean {
  const a = new Date(prevIso).getTime();
  const b = new Date(currIso).getTime();
  return Number.isFinite(a) && Number.isFinite(b) && Math.round((b - a) / 3600000) === 1;
}

function formatWindowDayLabel(startIso: string): string {
  const datePart = startIso.slice(0, 10);
  const todayIso = getEffectiveDateIso();
  if (datePart === todayIso) return 'Hoje';
  try {
    const d = new Date(`${datePart}T12:00:00`);
    const label = d.toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  } catch { return datePart; }
}

function buildWindowRationale(streak: readonly HourlyDriftPoint[]): string {
  const winds = streak.map((s) => s.evaluation.windKmh as number);
  const gusts = streak.map((s) => s.evaluation.gustsKmh as number);
  const dts = streak.map((s) => s.evaluation.deltaTC as number);
  const minW = Math.round(Math.min(...winds));
  const maxW = Math.round(Math.max(...winds));
  const maxG = Math.round(Math.max(...gusts));
  const minDt = Math.min(...dts).toFixed(1).replace('.', ',');
  const maxDt = Math.max(...dts).toFixed(1).replace('.', ',');
  return `Vento ${minW}–${maxW} km/h · Rajada máx. ${maxG} km/h · ΔT ${minDt}–${maxDt} °C`;
}

export function findFavorableDriftPeriods(
  points: readonly HourlyDriftPoint[],
  options: { isStaleOrLegacyCache?: boolean } = {}
): FavorableDriftSummary {
  const hasLegacy = Boolean(options.isStaleOrLegacyCache) || points.some((p) => p.evaluation.validity === 'unverified_legacy_cache');
  const validHoursCount = points.filter((p) => p.evaluation.status === 'VALID' && p.evaluation.validity === 'valid_complete').length;
  const periods: FavorableDriftWindow[] = [];
  let streak: HourlyDriftPoint[] = [];
  let hasSingleIsolatedHour = false;
  let excludedIncompleteCount = 0;

  const flush = () => {
    if (streak.length >= 2) {
      periods.push({
        startIso: streak[0].timeIso,
        endIso: streak[streak.length - 1].timeIso,
        dayLabelPt: formatWindowDayLabel(streak[0].timeIso),
        startTime: streak[0].timeFormatted,
        endTime: streak[streak.length - 1].timeFormatted,
        hoursCount: streak.length,
        maxScore: Math.max(...streak.map((s) => s.evaluation.score as number)),
        rationalePt: buildWindowRationale(streak)
      });
    } else if (streak.length === 1) hasSingleIsolatedHour = true;
    streak = [];
  };

  for (const pt of points) {
    if (pt.evaluation.status !== 'VALID' || pt.evaluation.validity === 'unverified_legacy_cache') excludedIncompleteCount++;
    if (!hasLegacy && pt.evaluation.isEligibleForFavorableWindow) {
      if (streak.length > 0 && !isNextHour(streak[streak.length - 1].timeIso, pt.timeIso)) flush();
      streak.push(pt);
    } else flush();
  }
  flush();

  const unavailableReason: FavorableUnavailableReason = hasLegacy
    ? 'stale_or_legacy_cache'
    : periods.length > 0
      ? 'ok'
      : validHoursCount < 2
        ? 'insufficient_forecast'
        : 'no_window_found';

  return { periods, hasSingleIsolatedHour, excludedIncompleteCount, validHoursCount, unavailableReason };
}
