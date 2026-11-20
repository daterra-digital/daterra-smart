import { computeMeteoSubIndex } from '../../ird/irdSubIndices.ts';
import type { CurrentWeather, HourlyForecastItem, WeatherTelemetryQuality } from '../types.ts';
import { filterFutureHours, getEffectiveDateIso } from '../services/weatherTimeService.ts';
import { formatDecimalPt } from './windDirection.ts';
import { buildDriftFactorText, isInversionTimeWindow } from './weatherDriftTextHelpers.ts';
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

function makeInsufficient(
  validity: DriftValidity,
  bandLabelPt: string,
  dominantFactorPt: string,
  windKmh: number | null,
  gustsKmh: number | null,
  windDirectionDeg: number | null,
  humidityPct: number | null,
  precipMm: number | null
): DriftReadingEvaluation {
  return {
    status: 'INSUFFICIENT_DATA', validity, score: null, band: null, bandLabelPt, dominantFactorPt,
    deltaTC: null, windKmh, gustsKmh, windDirectionDeg, gustFactor: null, isHighGustFactor: false,
    humidityPct, precipMm, hasPrecipitationBlock: precipMm !== null && precipMm > 0.2,
    isCalmInversionSuspected: false, isEligibleForFavorableWindow: false
  };
}

export function assessWeatherDriftReading(
  item: CurrentWeather | HourlyForecastItem,
  options: { isCached?: boolean; cacheAgeMinutes?: number | null } = {}
): DriftReadingEvaluation {
  const q: WeatherTelemetryQuality | undefined = item.telemetryQuality;
  const legacyInvalid = !q;

  const wind = q ? q.rawWindSpeedKmh : (isFin(item.windSpeedKmh) ? item.windSpeedKmh : null);
  const gust = q ? q.rawWindGustsKmh : (isFin(item.windGustsKmh) ? item.windGustsKmh : null);
  const windDir = q && q.rawWindDirectionDeg !== undefined ? q.rawWindDirectionDeg : (isFin(item.windDirectionDeg) ? item.windDirectionDeg : null);
  const temp = q ? q.rawTemperatureC : (isFin(item.temperatureC) ? item.temperatureC : null);
  const rh = q ? q.rawHumidityPercent : (isFin(item.humidityPercent) ? item.humidityPercent : null);
  const precip = q ? q.rawPrecipitationMm : (isFin(item.precipitationMm) ? item.precipitationMm : null);

  if (q && !q.isComplete) {
    return makeInsufficient('insufficient_missing_fields', 'Sem leitura', `Dados ausentes (${q.missingFields.join(', ')}); não convertidos em zero.`, wind, gust, windDir, rh, precip);
  }
  if (q && q.isGustEstimated) {
    return makeInsufficient('incomplete_estimated_gust', 'Incompleto', 'Rajada não medida pela API; estimativa excluída da classificação e janelas.', wind, null, windDir, rh, precip);
  }
  if (wind === null || gust === null || temp === null || rh === null || precip === null || rh <= 0 || rh > 100) {
    return makeInsufficient('insufficient_missing_fields', 'Sem leitura', 'Leitura meteorológica incompleta ou fora de domínio físico.', wind, gust, windDir, rh, precip);
  }

  // Separação física: precipitação > 0,2 mm/h aciona bloqueio de lavagem sem inflacionar o índice de deriva atmosférica
  const sub = computeMeteoSubIndex({
    windSpeedKmh: wind, windGustsKmh: gust, temperatureC: temp, relativeHumidityPct: rh, precipitationMm: 0,
    weatherSource: options.isCached ? 'open_meteo_cache' : 'open_meteo_live', weatherAgeMinutes: options.cacheAgeMinutes ?? null
  });
  const score = Math.round(sub.rawScore);
  const { band, label } = classifyBand(score);
  const validity: DriftValidity = legacyInvalid ? 'unverified_legacy_cache' : 'valid_complete';
  const gustFactor = wind > 0 ? Math.round((gust / wind) * 10) / 10 : null;
  const isHighGustFactor = gustFactor !== null && gustFactor > 1.8;
  const hasPrecipitationBlock = precip > 0.2;
  const timeIso = 'timeIso' in item ? item.timeIso : undefined;
  const isNocturnalInversion = sub.deltaTC < 2.0 && wind < 3.5 && isInversionTimeWindow(timeIso);
  const isInversion = sub.isCalmThermalInversionSuspected || isNocturnalInversion;

  return {
    status: 'VALID', validity, score, band, bandLabelPt: label,
    dominantFactorPt: buildDriftFactorText(wind, gust, sub.deltaTC, precip, sub.effectiveWindKmh, isInversion, gustFactor),
    deltaTC: sub.deltaTC, windKmh: wind, gustsKmh: gust, windDirectionDeg: windDir,
    gustFactor, isHighGustFactor, humidityPct: rh, precipMm: precip, hasPrecipitationBlock,
    isCalmInversionSuspected: isInversion,
    isEligibleForFavorableWindow: validity === 'valid_complete' && score <= 25 && !hasPrecipitationBlock && !isInversion
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
  const minW = formatDecimalPt(Math.min(...winds));
  const maxW = formatDecimalPt(Math.max(...winds));
  const maxG = formatDecimalPt(Math.max(...gusts));
  const minDt = formatDecimalPt(Math.min(...dts));
  const maxDt = formatDecimalPt(Math.max(...dts));
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
