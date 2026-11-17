import type { FullWeatherData } from '../weather/types.ts';
import { assessWeatherDriftReading } from '../weather/utils/weatherDriftEvaluator.ts';
import type { DriftReadingEvaluation } from '../weather/utils/weatherDriftTypes.ts';
import type { AnyIrdKeypadField } from './irdKeypadMeta.ts';
import type { IrdCalibrationBlockState, IrdExposureBlockState, IrdNozzleBlockState } from './irdOriginTypes.ts';
import type { IrdWeatherInput, IrdWeatherSource } from './irdTypes.ts';

export function buildActiveWeatherInput(
  manualSource: IrdWeatherSource | null,
  manualWeather: IrdWeatherInput,
  weatherData: FullWeatherData | null,
  weatherAgeMin: number | null
): IrdWeatherInput {
  const src: IrdWeatherSource =
    manualSource ?? (weatherData ? (weatherData.current.isCached ? 'open_meteo_cache' : 'open_meteo_live') : 'manual_field');
  if (src === 'manual_field') {
    return { ...manualWeather, weatherSource: 'manual_field', weatherAgeMinutes: 0 };
  }
  const q = weatherData?.current?.telemetryQuality;
  const c = weatherData?.current;
  return {
    windSpeedKmh: q ? q.rawWindSpeedKmh : (c?.windSpeedKmh ?? null),
    windGustsKmh: q ? q.rawWindGustsKmh : (c?.windGustsKmh ?? null),
    temperatureC: q ? q.rawTemperatureC : (c?.temperatureC ?? null),
    relativeHumidityPct: q ? q.rawHumidityPercent : (c?.humidityPercent ?? null),
    precipitationMm: q ? q.rawPrecipitationMm : (c?.precipitationMm ?? null),
    weatherSource: src,
    weatherAgeMinutes: weatherAgeMin,
    weatherTimestamp: weatherData?.fetchedAt ?? null
  };
}

export function buildWeatherDriftEval(
  manualSource: IrdWeatherSource | null,
  activeWeather: IrdWeatherInput,
  weatherData: FullWeatherData | null,
  weatherAgeMin: number | null
): DriftReadingEvaluation | null {
  if (manualSource === 'manual_field') {
    if (
      activeWeather.windSpeedKmh === null ||
      activeWeather.temperatureC === null ||
      activeWeather.relativeHumidityPct === null
    ) {
      return null;
    }
    return assessWeatherDriftReading({
      temperatureC: activeWeather.temperatureC,
      apparentTempC: activeWeather.temperatureC,
      humidityPercent: activeWeather.relativeHumidityPct,
      windSpeedKmh: activeWeather.windSpeedKmh,
      windDirectionDeg: 0,
      windDirectionText: '',
      windGustsKmh: activeWeather.windGustsKmh ?? activeWeather.windSpeedKmh,
      precipitationMm: activeWeather.precipitationMm ?? 0,
      weatherCode: 0,
      weatherLabel: '',
      dewPointC: 0,
      deltaT: 0,
      vpdKpa: 0,
      sprayEvaluation: { level: 'optimal', badgeLabel: '', title: '', reason: '', deltaT: 0, windSpeedKmh: 0, windGustsKmh: 0, humidityPercent: 0 },
      updatedAt: 'Manual',
      telemetryQuality: {
        isComplete: true,
        isGustEstimated: activeWeather.windGustsKmh === null,
        hasRealGustReading: activeWeather.windGustsKmh !== null,
        missingFields: [],
        precipUnit: 'mm',
        precipTemporalKind: 'current_interval_accumulated',
        rawTemperatureC: activeWeather.temperatureC,
        rawHumidityPercent: activeWeather.relativeHumidityPct,
        rawWindSpeedKmh: activeWeather.windSpeedKmh,
        rawWindGustsKmh: activeWeather.windGustsKmh ?? activeWeather.windSpeedKmh,
        rawPrecipitationMm: activeWeather.precipitationMm ?? 0
      }
    });
  }
  return weatherData?.current
    ? assessWeatherDriftReading(weatherData.current, { isCached: weatherData.current.isCached, cacheAgeMinutes: weatherAgeMin })
    : null;
}

export function buildIrdWeatherSummary(
  activeWeather: IrdWeatherInput,
  weatherAgeMin: number | null,
  locationName: string,
  weatherEval: DriftReadingEvaluation | null
) {
  return {
    sourceLabel:
      activeWeather.weatherSource === 'manual_field'
        ? 'Manual em campo'
        : activeWeather.weatherSource === 'open_meteo_cache'
          ? `Cache local${weatherAgeMin !== null ? ` (${weatherAgeMin} min)` : ''}`
          : 'API Open-Meteo',
    locationName,
    isStaleCache: activeWeather.weatherSource === 'open_meteo_cache' && (weatherAgeMin === null || weatherAgeMin > 20),
    isLegacyCache: weatherEval?.validity === 'unverified_legacy_cache'
  };
}

export function getIrdKeypadInitialValue(
  field: AnyIrdKeypadField,
  activeWeather: IrdWeatherInput,
  calibration: IrdCalibrationBlockState,
  nozzle: IrdNozzleBlockState,
  exposure: IrdExposureBlockState
): string {
  if (field === 'windSpeedKmh' || field === 'windGustsKmh' || field === 'temperatureC' || field === 'relativeHumidityPct' || field === 'precipitationMm') {
    return activeWeather[field] !== null && activeWeather[field] !== undefined ? String(activeWeather[field]) : '';
  }
  if (field === 'certifiedDriftReductionPct') {
    return nozzle.certifiedReduction.reductionPct !== null ? String(nozzle.certifiedReduction.reductionPct) : '';
  }
  if (field === 'distanceToSensitiveAreaM') {
    return exposure.distanceToSensitiveAreaM !== null ? String(exposure.distanceToSensitiveAreaM) : '';
  }
  if (field === 'labelMinBufferM') {
    return exposure.labelBufferKnown && exposure.labelMinBufferM !== null ? String(exposure.labelMinBufferM) : '';
  }
  const m = calibration.manual;
  const val = m[field];
  return val !== null && val !== undefined ? String(val) : '';
}
