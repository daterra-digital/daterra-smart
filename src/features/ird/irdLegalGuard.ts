/**
 * DATERRA Smart - Guardião Legal e Operacional do IRD (Fase 1)
 * Bloqueios fail-closed e declaração vinculativa da supremacia do rótulo oficial do produto fitofarmacêutico.
 */

import type { IrdApplicationDomain, IrdInput, IrdLegalBlock, IrdLegalVerdict, IrdNotice } from './irdTypes.ts';
import type { ResolvedNozzleDriftProfile } from './irdNozzleAdapter.ts';
import type { ExposureSubIndexResult, MeteoSubIndexResult, SpectrumSubIndexResult } from './irdSubIndices.ts';
import { IRD_FAIL_CLOSED_RULES } from './irdConfig.ts';

export interface WindThresholds {
  readonly maxWindSafeKmh: number;
  readonly maxWindLimitKmh: number;
}

export interface LegalGuardEvaluation {
  readonly legalVerdict: IrdLegalVerdict;
  readonly blocks: readonly IrdLegalBlock[];
  readonly warnings: readonly IrdNotice[];
  readonly windThresholds: WindThresholds;
}

export function resolveWindThresholds(
  isAirInduction: boolean,
  hasAirSleeve: boolean,
  domain: IrdApplicationDomain,
  isUnderPressurized: boolean
): WindThresholds {
  if (domain === 'horizontal_boom' && hasAirSleeve && !isUnderPressurized) {
    return { maxWindSafeKmh: IRD_FAIL_CLOSED_RULES.windSafeAirSleeveKmh, maxWindLimitKmh: IRD_FAIL_CLOSED_RULES.windLimitAirSleeveKmh };
  }
  if (isAirInduction && !isUnderPressurized) {
    return { maxWindSafeKmh: IRD_FAIL_CLOSED_RULES.windSafeAirInductionKmh, maxWindLimitKmh: IRD_FAIL_CLOSED_RULES.windLimitAirInductionKmh };
  }
  return { maxWindSafeKmh: IRD_FAIL_CLOSED_RULES.windSafeStandardKmh, maxWindLimitKmh: IRD_FAIL_CLOSED_RULES.windLimitStandardKmh };
}

function collectBlocks(
  input: IrdInput,
  resolvedNozzle: ResolvedNozzleDriftProfile,
  meteo: MeteoSubIndexResult,
  windLimitKmh: number
): IrdLegalBlock[] {
  const blocks: IrdLegalBlock[] = [];
  const wind = input.weather.windSpeedKmh as number;
  const gusts = Math.max(input.weather.windGustsKmh ?? wind, wind);
  const precip = input.weather.precipitationMm ?? 0;
  const pressure = input.nozzle.workingPressureBar as number;
  const labelBuffer = input.exposure.labelMinBufferM ?? null;
  const dist = input.exposure.distanceToSensitiveAreaM ?? null;
  const pMax = resolvedNozzle.pressureMaxBar;

  if (labelBuffer !== null && labelBuffer > 0 && dist !== null && dist < labelBuffer) {
    blocks.push({
      code: 'LEGAL_LABEL_BUFFER_VIOLATION',
      messagePt: `Distância informada (${dist} m) inferior à zona tampão mínima do rótulo (${labelBuffer} m).`,
      legalBasisPt: 'Rótulo oficial do produto fitofarmacêutico e legislação aplicável.'
    });
  }
  if (precip > IRD_FAIL_CLOSED_RULES.maxPrecipitationAllowedMm) {
    blocks.push({
      code: 'ACTIVE_RAIN_WASH_BLOCK',
      messagePt: `Precipitação ativa (${precip} mm/h) excede o limite operacional de 0,2 mm/h.`,
      legalBasisPt: 'Boas práticas fitossanitárias na aplicação de produtos.'
    });
  }
  if (wind > windLimitKmh) {
    blocks.push({
      code: 'EXCESSIVE_WIND_BLOCK',
      messagePt: `Vento (${wind} km/h) excede o limite operacional (${windLimitKmh} km/h).`,
      legalBasisPt: 'Boas práticas na aplicação de produtos fitofarmacêuticos.'
    });
  }
  if (gusts > IRD_FAIL_CLOSED_RULES.maxGustLimitKmh) {
    blocks.push({
      code: 'EXCESSIVE_GUST_BLOCK',
      messagePt: `Rajadas (${gusts} km/h) excedem o limite de segurança (${IRD_FAIL_CLOSED_RULES.maxGustLimitKmh} km/h).`,
      legalBasisPt: 'Boas práticas na aplicação de produtos fitofarmacêuticos.'
    });
  }
  if (meteo.deltaTC > IRD_FAIL_CLOSED_RULES.maxDeltaTAllowedC) {
    blocks.push({
      code: 'CRITICAL_DELTA_T_BLOCK',
      messagePt: `Delta T (${meteo.deltaTC} °C) > 10,0 °C provoca evaporação crítica das gotas.`,
      legalBasisPt: 'EPPO — Recomendações psicrométricas de aplicação.'
    });
  }
  if (typeof pMax === 'number' && pMax > 0 && pressure > pMax * IRD_FAIL_CLOSED_RULES.overpressureBlockFactor) {
    blocks.push({
      code: 'EXTREME_OVERPRESSURE_BLOCK',
      messagePt: `Pressão (${pressure} bar) excede em > 25% o limite máximo do bico (${pMax} bar).`,
      legalBasisPt: 'Especificação do fabricante / EN ISO 16122.'
    });
  }
  return blocks;
}

function collectWarnings(
  input: IrdInput,
  meteo: MeteoSubIndexResult,
  spectrum: SpectrumSubIndexResult,
  exposure: ExposureSubIndexResult
): IrdNotice[] {
  const warnings: IrdNotice[] = [
    {
      code: 'LABEL_SUPREMACY_DGAV_SIFITO',
      severity: 'info',
      messagePt: 'Prevalecem sempre as indicações do rótulo oficial do produto fitofarmacêutico.'
    },
    {
      code: 'NOT_ISO_22866_CERTIFIED',
      severity: 'info',
      messagePt: 'Índice heurístico orientador; não constitui certificação legal nem ensaio ISO 22866.'
    }
  ];

  if (input.weather.weatherSource !== 'manual_field' || meteo.isStaleWeatherCache) {
    warnings.push({
      code: 'CONFIRM_WIND_WITH_ANEMOMETER',
      severity: meteo.isStaleWeatherCache ? 'warning' : 'info',
      messagePt: 'Confirme velocidade e direção real do vento no terreno com anemómetro antes de abrir o depósito.'
    });
  }
  if (meteo.isCalmThermalInversionSuspected) {
    warnings.push({
      code: 'THERMAL_INVERSION_SUSPECTED',
      severity: 'warning',
      messagePt: 'Vento < 2 km/h com Delta T > 6 °C: risco potencial de inversão térmica e deriva imprevisível.'
    });
  }
  if (spectrum.isOutOfRangePressure) {
    warnings.push({
      code: 'SUBOPTIMAL_PRESSURE_SPECTRUM',
      severity: 'warning',
      messagePt: 'Pressão fora da faixa recomendada do bico altera o espectro de gotas e a cobertura.'
    });
  }
  if ((input.operation.travelSpeedKmh as number) > 10) {
    warnings.push({
      code: 'HIGH_SPEED_BOOM_DRIFT',
      severity: 'warning',
      messagePt: 'Velocidade de avanço > 10 km/h aumenta oscilação de barra e risco de deriva.'
    });
  }
  if (exposure.isBufferUnconfirmed || input.exposure.hasDownwindSensitiveTarget) {
    warnings.push({
      code: 'DOWNWIND_SENSITIVE_EXPOSURE',
      severity: 'warning',
      messagePt: 'Confirme ausência de culturas vizinhas sensíveis, linhas de água ou habitações a sotavento.'
    });
  }
  return warnings;
}

export function evaluateIrdLegalAndWarnings(params: {
  readonly input: IrdInput;
  readonly resolvedNozzle: ResolvedNozzleDriftProfile;
  readonly meteo: MeteoSubIndexResult;
  readonly spectrum: SpectrumSubIndexResult;
  readonly exposure: ExposureSubIndexResult;
  readonly rawWeightedScore: number;
}): LegalGuardEvaluation {
  const { input, resolvedNozzle, meteo, spectrum, exposure, rawWeightedScore } = params;
  const windThresholds = resolveWindThresholds(
    resolvedNozzle.isAirInduction,
    Boolean(input.nozzle.hasAirSleeve),
    input.operation.applicationDomain,
    spectrum.isUnderPressurized
  );

  const blocks = collectBlocks(input, resolvedNozzle, meteo, windThresholds.maxWindLimitKmh);
  const warnings = collectWarnings(input, meteo, spectrum, exposure);

  const hasCautionState =
    meteo.isCalmThermalInversionSuspected ||
    meteo.isStaleWeatherCache ||
    exposure.isBufferUnconfirmed ||
    spectrum.isOutOfRangePressure ||
    input.exposure.hasDownwindSensitiveTarget ||
    (input.weather.windSpeedKmh as number) > windThresholds.maxWindSafeKmh ||
    rawWeightedScore > 25;

  const legalVerdict: IrdLegalVerdict =
    blocks.length > 0 ? 'BLOQUEADO' : hasCautionState ? 'RESTRITO_MITIGAR' : 'PERMITIDO_CONFORME_ROTULO';

  return { legalVerdict, blocks, warnings, windThresholds };
}
