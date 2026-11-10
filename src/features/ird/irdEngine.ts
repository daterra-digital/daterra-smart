/**
 * DATERRA Smart - Motor Puro de Cálculo do Índice de Risco de Deriva (IRD — Fase 1)
 * Função pura determinística sem efeitos colaterais, IO, React, DOM, Dexie ou Firestore.
 */

import type { Nozzle } from '../nozzle-comparison/nozzleComparison.types.ts';
import type { IrdDataConfidence, IrdInput, IrdLegalBlock, IrdResult, IrdRiskClass } from './irdTypes.ts';
import {
  IRD_ANTI_ZERO_RISK,
  IRD_CLASS_BANDS,
  IRD_INPUT_LIMITS,
  IRD_LEGAL_DISCLAIMER,
  IRD_SUBINDEX_WEIGHTS,
  IRD_VERSIONS
} from './irdConfig.ts';
import { resolveNozzleDriftProfile } from './irdNozzleAdapter.ts';
import {
  computeExposureSubIndex,
  computeMeteoSubIndex,
  computeOperationSubIndex,
  computeSpectrumSubIndex
} from './irdSubIndices.ts';
import { evaluateIrdLegalAndWarnings } from './irdLegalGuard.ts';

function inRange(val: number | null | undefined, min: number, max: number): boolean {
  return typeof val === 'number' && Number.isFinite(val) && val >= min && val <= max;
}

function inOptionalRange(val: number | null | undefined, min: number, max: number): boolean {
  return val === undefined || val === null || inRange(val, min, max);
}

function roundOne(val: number): number {
  return Number(val.toFixed(1));
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function classifyScore(score: number): IrdRiskClass {
  if (score <= IRD_CLASS_BANDS.BAIXO.maxScore) return 'BAIXO';
  if (score <= IRD_CLASS_BANDS.MODERADO.maxScore) return 'MODERADO';
  if (score <= IRD_CLASS_BANDS.ELEVADO.maxScore) return 'ELEVADO';
  return 'CRITICO_BLOQUEADO';
}

function validateInput(input: IrdInput | null | undefined): { blocks: IrdLegalBlock[]; invalidFields: string[] } {
  if (!input?.weather || !input?.nozzle || !input?.operation || !input?.exposure) {
    return {
      blocks: [{ code: 'INVALID_INPUT_RANGE', messagePt: 'Estrutura de entrada incompleta para cálculo do IRD.', legalBasisPt: 'Política fail-closed DATERRA Smart.' }],
      invalidFields: ['input']
    };
  }

  const { weather, nozzle, operation, exposure } = input;
  const blocks: IrdLegalBlock[] = [];
  const invalidFields: string[] = [];

  if (!inRange(weather.windSpeedKmh, IRD_INPUT_LIMITS.windSpeedKmh.min, IRD_INPUT_LIMITS.windSpeedKmh.max)) invalidFields.push('weather.windSpeedKmh');
  if (!inRange(weather.temperatureC, IRD_INPUT_LIMITS.temperatureC.min, IRD_INPUT_LIMITS.temperatureC.max)) invalidFields.push('weather.temperatureC');
  if (!inRange(weather.relativeHumidityPct, IRD_INPUT_LIMITS.relativeHumidityPct.min, IRD_INPUT_LIMITS.relativeHumidityPct.max)) invalidFields.push('weather.relativeHumidityPct');

  if (invalidFields.length > 0) {
    blocks.push({
      code: 'MISSING_CRITICAL_WEATHER_DATA',
      messagePt: 'Dados meteorológicos críticos em falta ou inválidos (vento, temperatura e humidade relativa obrigatórios).',
      legalBasisPt: 'Política fail-closed: proibida avaliação sem leitura meteorológica válida.'
    });
  }

  if (!inOptionalRange(weather.windGustsKmh, IRD_INPUT_LIMITS.windGustsKmh.min, IRD_INPUT_LIMITS.windGustsKmh.max)) invalidFields.push('weather.windGustsKmh');
  if (!inOptionalRange(weather.precipitationMm, IRD_INPUT_LIMITS.precipitationMm.min, IRD_INPUT_LIMITS.precipitationMm.max)) invalidFields.push('weather.precipitationMm');

  if (
    typeof nozzle.workingPressureBar !== 'number' ||
    !Number.isFinite(nozzle.workingPressureBar) ||
    nozzle.workingPressureBar <= IRD_INPUT_LIMITS.workingPressureBar.minExclusive ||
    nozzle.workingPressureBar > IRD_INPUT_LIMITS.workingPressureBar.max
  ) {
    invalidFields.push('nozzle.workingPressureBar');
    blocks.push({
      code: 'MISSING_WORKING_PRESSURE',
      messagePt: 'Pressão de trabalho obrigatória (> 0 a 50 bar); nunca é assumido 3,0 bar por omissão.',
      legalBasisPt: 'Regra de integridade técnica DATERRA Smart.'
    });
  }

  if (!inRange(operation.travelSpeedKmh, IRD_INPUT_LIMITS.travelSpeedKmh.min, IRD_INPUT_LIMITS.travelSpeedKmh.max)) invalidFields.push('operation.travelSpeedKmh');
  if (!inRange(operation.boomOrReleaseHeightM, IRD_INPUT_LIMITS.boomOrReleaseHeightM.min, IRD_INPUT_LIMITS.boomOrReleaseHeightM.max)) invalidFields.push('operation.boomOrReleaseHeightM');
  if (!inOptionalRange(exposure.distanceToSensitiveAreaM, IRD_INPUT_LIMITS.distanceToSensitiveAreaM.min, IRD_INPUT_LIMITS.distanceToSensitiveAreaM.max)) invalidFields.push('exposure.distanceToSensitiveAreaM');
  if (!inOptionalRange(exposure.labelMinBufferM, IRD_INPUT_LIMITS.distanceToSensitiveAreaM.min, IRD_INPUT_LIMITS.distanceToSensitiveAreaM.max)) invalidFields.push('exposure.labelMinBufferM');

  if (invalidFields.length > 0 && blocks.length === 0) {
    blocks.push({
      code: 'INVALID_INPUT_RANGE',
      messagePt: `Parâmetros operacionais inválidos ou fora dos limites físicos: ${invalidFields.join(', ')}.`,
      legalBasisPt: 'Política fail-closed DATERRA Smart.'
    });
  }

  return { blocks, invalidFields };
}

export function calculateDriftRiskIndex(input: IrdInput, catalogNozzle?: Nozzle): IrdResult {
  const validation = validateInput(input);
  if (validation.invalidFields.length > 0) {
    return {
      status: 'FAIL_CLOSED_INCOMPLETE',
      versions: IRD_VERSIONS,
      irdScore: null,
      irdClass: 'CRITICO_BLOQUEADO',
      legalVerdict: 'BLOQUEADO',
      blocks: validation.blocks,
      missingOrInvalidFields: validation.invalidFields,
      legalDisclaimer: IRD_LEGAL_DISCLAIMER
    };
  }

  const workingPressureBar = input.nozzle.workingPressureBar as number;
  const resolvedNozzle = resolveNozzleDriftProfile(input.nozzle, workingPressureBar, catalogNozzle);
  const meteo = computeMeteoSubIndex(input.weather);
  const spectrum = computeSpectrumSubIndex(resolvedNozzle, workingPressureBar);
  const operationScore = computeOperationSubIndex(input.operation, Boolean(input.nozzle.hasAirSleeve));
  const exposure = computeExposureSubIndex(input.exposure);

  const rawWeightedScore =
    IRD_SUBINDEX_WEIGHTS.meteo * meteo.rawScore +
    IRD_SUBINDEX_WEIGHTS.espectro * spectrum.rawScore +
    IRD_SUBINDEX_WEIGHTS.operacao * operationScore +
    IRD_SUBINDEX_WEIGHTS.exposicao * exposure.rawScore;

  const legal = evaluateIrdLegalAndWarnings({ input, resolvedNozzle, meteo, spectrum, exposure, rawWeightedScore });
  const clampedScore = Math.round(clamp(rawWeightedScore, IRD_ANTI_ZERO_RISK.minGlobalScore, IRD_ANTI_ZERO_RISK.maxGlobalScore));
  const irdScore = legal.legalVerdict === 'BLOQUEADO' ? Math.max(IRD_ANTI_ZERO_RISK.blockedMinimumGlobalScore, clampedScore) : clampedScore;

  let dataConfidenceLevel: IrdDataConfidence = resolvedNozzle.confidence;
  if (meteo.isStaleWeatherCache || exposure.isBufferUnconfirmed || spectrum.isOutOfRangePressure) {
    dataConfidenceLevel = 'REDUZIDA';
  }

  return {
    status: 'CALCULATED',
    versions: IRD_VERSIONS,
    irdScore,
    irdClass: classifyScore(irdScore),
    subIndices: {
      meteo: roundOne(meteo.rawScore),
      espectro: roundOne(spectrum.rawScore),
      operacao: roundOne(operationScore),
      exposicao: roundOne(exposure.rawScore)
    },
    derived: {
      deltaTC: meteo.deltaTC,
      wetBulbC: meteo.wetBulbC,
      dewPointC: meteo.dewPointC,
      effectiveWindKmh: roundOne(meteo.effectiveWindKmh),
      maxWindSafeKmh: legal.windThresholds.maxWindSafeKmh,
      maxWindLimitKmh: legal.windThresholds.maxWindLimitKmh,
      nozzleResolutionTier: resolvedNozzle.resolutionTier,
      dv10UsedUm: resolvedNozzle.dv10UsedUm,
      dv50UsedUm: resolvedNozzle.dv50UsedUm,
      dv90UsedUm: resolvedNozzle.dv90UsedUm,
      dropletSource: resolvedNozzle.dropletSource,
      dropletConfidence: resolvedNozzle.dropletConfidence
    },
    legalVerdict: legal.legalVerdict,
    blocks: legal.blocks,
    fallbackFlags: Array.from(new Set([...meteo.fallbackFlags, ...spectrum.fallbackFlags, ...exposure.fallbackFlags])),
    warnings: [...legal.warnings, ...resolvedNozzle.warnings],
    dataConfidenceLevel,
    legalDisclaimer: IRD_LEGAL_DISCLAIMER
  };
}
