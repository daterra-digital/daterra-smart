/**
 * DATERRA Smart - Subíndices Normalizados do Motor IRD (Fase 1)
 * Cálculo puro (0–100) sem arredondamentos intermédios e sem divisões por zero.
 */

import {
  calculateDeltaT,
  calculateDewPoint,
  calculateWetBulbTemperature
} from '../weather/weatherCalculations.ts';
import type { IrdExposureInput, IrdFallbackFlagCode, IrdOperationInput, IrdWeatherInput } from './irdTypes.ts';
import type { ResolvedNozzleDriftProfile } from './irdNozzleAdapter.ts';
import { IRD_ANTI_ZERO_RISK, IRD_FAIL_CLOSED_RULES, IRD_SCORING_CONSTANTS } from './irdConfig.ts';

export interface MeteoSubIndexResult {
  readonly rawScore: number;
  readonly deltaTC: number;
  readonly wetBulbC: number;
  readonly dewPointC: number;
  readonly effectiveWindKmh: number;
  readonly fallbackFlags: readonly IrdFallbackFlagCode[];
  readonly isStaleWeatherCache: boolean;
  readonly isCalmThermalInversionSuspected: boolean;
}

export interface SpectrumSubIndexResult {
  readonly rawScore: number;
  readonly fallbackFlags: readonly IrdFallbackFlagCode[];
  readonly isOutOfRangePressure: boolean;
  readonly isUnderPressurized: boolean;
}

export interface ExposureSubIndexResult {
  readonly rawScore: number;
  readonly fallbackFlags: readonly IrdFallbackFlagCode[];
  readonly isBufferUnconfirmed: boolean;
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function computeWindComponent(effectiveWindKmh: number): number {
  const calmLimit = IRD_FAIL_CLOSED_RULES.calmWindThresholdKmh;
  const calmFloor = IRD_ANTI_ZERO_RISK.minCalmWindComponent;
  if (effectiveWindKmh <= calmLimit) return calmFloor;
  if (effectiveWindKmh >= IRD_SCORING_CONSTANTS.windUpperLinearKmh) return 100;
  const span = IRD_SCORING_CONSTANTS.windUpperLinearKmh - calmLimit;
  return calmFloor + ((effectiveWindKmh - calmLimit) / span) * (100 - calmFloor);
}

function computeDeltaTComponent(deltaTC: number): number {
  if (deltaTC < IRD_FAIL_CLOSED_RULES.lowDeltaTRunoffThresholdC) return 20;
  if (deltaTC <= 6.0) return 10;
  if (deltaTC <= IRD_FAIL_CLOSED_RULES.maxDeltaTAllowedC) return 10 + ((deltaTC - 6.0) / 4.0) * 70;
  return 100;
}

export function computeMeteoSubIndex(weather: IrdWeatherInput): MeteoSubIndexResult {
  const wind = weather.windSpeedKmh as number;
  const gusts = Math.max(weather.windGustsKmh ?? wind, wind);
  const tempC = weather.temperatureC as number;
  const rh = weather.relativeHumidityPct as number;
  const precipMm = weather.precipitationMm ?? 0;

  const wetBulbC = calculateWetBulbTemperature(tempC, rh);
  const deltaTC = calculateDeltaT(tempC, rh);
  const dewPointC = calculateDewPoint(tempC, rh);
  const effectiveWindKmh =
    IRD_SCORING_CONSTANTS.effectiveWindBaseWeight * wind +
    IRD_SCORING_CONSTANTS.effectiveWindGustWeight * gusts;

  const fallbackFlags: IrdFallbackFlagCode[] = [];
  const isCalmThermalInversionSuspected =
    effectiveWindKmh < IRD_FAIL_CLOSED_RULES.calmWindThresholdKmh &&
    deltaTC > IRD_FAIL_CLOSED_RULES.calmWindDeltaTInversionThresholdC;

  if (isCalmThermalInversionSuspected) fallbackFlags.push('CALM_WIND_THERMAL_INVERSION_CAUTION');
  if (deltaTC < IRD_FAIL_CLOSED_RULES.lowDeltaTRunoffThresholdC && rh > IRD_FAIL_CLOSED_RULES.lowDeltaTRunoffHumidityPct) {
    fallbackFlags.push('LOW_DELTA_T_RUNOFF_CAUTION');
  }

  const cacheAge = weather.weatherAgeMinutes ?? null;
  const isStaleWeatherCache =
    weather.weatherSource === 'open_meteo_cache' &&
    (cacheAge === null || cacheAge > IRD_FAIL_CLOSED_RULES.requireManualCheckWhenWeatherCacheOlderThanMin);
  if (isStaleWeatherCache) fallbackFlags.push('WEATHER_CACHE_STALE_CONFIRM_IN_FIELD');

  let rawScore = clamp(
    IRD_SCORING_CONSTANTS.meteoWindWeight * computeWindComponent(effectiveWindKmh) +
      IRD_SCORING_CONSTANTS.meteoDeltaTWeight * computeDeltaTComponent(deltaTC),
    IRD_ANTI_ZERO_RISK.minSubIndexScore,
    100
  );
  if (precipMm > IRD_FAIL_CLOSED_RULES.maxPrecipitationAllowedMm) rawScore = Math.max(rawScore, 95);

  return { rawScore, deltaTC, wetBulbC, dewPointC, effectiveWindKmh, fallbackFlags, isStaleWeatherCache, isCalmThermalInversionSuspected };
}

export function computeSpectrumSubIndex(
  resolved: ResolvedNozzleDriftProfile,
  workingPressureBar: number
): SpectrumSubIndexResult {
  const fallbackFlags: IrdFallbackFlagCode[] = [...resolved.fallbackFlags];
  let baseScore = resolved.baseScore;
  let penalty = 0;
  let deltaP = 0;
  let isOutOfRangePressure = false;
  let isUnderPressurized = false;
  const { pressureMinBar: pMin, pressureMaxBar: pMax, referencePressureBar: pRef } = resolved;

  if (typeof pMax === 'number' && pMax > 0 && workingPressureBar > pMax) {
    isOutOfRangePressure = true;
    penalty = Math.min(35, ((workingPressureBar - pMax) / Math.max(pMax, 0.1)) * 100);
    baseScore = Math.max(baseScore, 75);
    fallbackFlags.push('NOZZLE_OVERPRESSURE_PENALTY');
  } else if (typeof pMin === 'number' && pMin > 0 && workingPressureBar < pMin) {
    isOutOfRangePressure = true;
    isUnderPressurized = true;
    penalty = 15;
    fallbackFlags.push('NOZZLE_UNDERPRESSURE_WARNING');
  } else if (resolved.resolutionTier !== 'lab_dv10' && typeof pRef === 'number' && pRef > 0) {
    deltaP = clamp(((workingPressureBar - pRef) / Math.max(pRef, 0.1)) * 15, -8, 20);
  }

  return {
    rawScore: clamp(baseScore + penalty + deltaP, IRD_ANTI_ZERO_RISK.minSubIndexScore, 100),
    fallbackFlags,
    isOutOfRangePressure,
    isUnderPressurized
  };
}

export function computeOperationSubIndex(operation: IrdOperationInput, hasAirSleeve: boolean): number {
  const speed = operation.travelSpeedKmh as number;
  const height = operation.boomOrReleaseHeightM as number;
  const speedSpan = IRD_SCORING_CONSTANTS.speedUpperLinearKmh - IRD_SCORING_CONSTANTS.speedLowerLinearKmh;
  const speedComponent = 10 + (clamp(speed - IRD_SCORING_CONSTANTS.speedLowerLinearKmh, 0, speedSpan) / speedSpan) * 90;

  const hRef =
    operation.applicationDomain === 'horizontal_boom'
      ? IRD_SCORING_CONSTANTS.referenceHeightBoomM
      : IRD_SCORING_CONSTANTS.referenceHeightOrchardM;
  const heightSpan = 2.0 * hRef;
  const heightComponent = 15 + (clamp(height - hRef, 0, heightSpan) / heightSpan) * 85;
  const sleeveFactor =
    operation.applicationDomain === 'horizontal_boom' && hasAirSleeve
      ? IRD_FAIL_CLOSED_RULES.airSleeveOperationFactor
      : 1.0;

  return clamp((0.5 * speedComponent + 0.5 * heightComponent) * sleeveFactor, IRD_ANTI_ZERO_RISK.minSubIndexScore, 100);
}

export function computeExposureSubIndex(exposure: IrdExposureInput): ExposureSubIndexResult {
  const fallbackFlags: IrdFallbackFlagCode[] = [];
  const defaultBuffer = IRD_FAIL_CLOSED_RULES.defaultProtectiveBufferDistanceM;
  const reqDist = Math.max(exposure.labelMinBufferM ?? defaultBuffer, defaultBuffer);
  const actualDist = exposure.distanceToSensitiveAreaM ?? null;

  let baseExposure: number;
  let isBufferUnconfirmed = false;
  if (actualDist === null) {
    isBufferUnconfirmed = true;
    baseExposure = IRD_FAIL_CLOSED_RULES.unconfirmedBufferExposureScore;
    fallbackFlags.push('BUFFER_DISTANCE_UNCONFIRMED_CONSERVATIVE');
  } else if (actualDist <= reqDist) {
    baseExposure = 100;
  } else {
    baseExposure = clamp((reqDist / actualDist) * 85, IRD_ANTI_ZERO_RISK.minExposureScore, 95);
  }

  const downwindPenalty = exposure.hasDownwindSensitiveTarget ? IRD_FAIL_CLOSED_RULES.unconfirmedBufferDownwindPenalty : 0;
  return {
    rawScore: clamp(baseExposure + downwindPenalty, IRD_ANTI_ZERO_RISK.minExposureScore, 100),
    fallbackFlags,
    isBufferUnconfirmed
  };
}
