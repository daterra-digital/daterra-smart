/**
 * DATERRA Smart - Configuração Versionada e Imutável do IRD (Fase 1)
 * Sem dependências de React, DOM, Firestore ou Dexie.
 */

import type {
  IrdClassBand,
  IrdConfigVersions,
  IrdDropletClassCode,
  IrdLegalDisclaimer,
  IrdRiskClass,
  IrdSubIndexWeights
} from './irdTypes.ts';

export const IRD_FORMULA_VERSION = '1.0.0' as const;
export const IRD_RULESET_VERSION = 'heuristic-v1' as const;
export const NOZZLE_CATALOG_VERSION = '2026-09-02' as const;

export const IRD_VERSIONS: IrdConfigVersions = Object.freeze({
  formulaVersion: IRD_FORMULA_VERSION,
  rulesetVersion: IRD_RULESET_VERSION,
  nozzleCatalogVersion: NOZZLE_CATALOG_VERSION,
  configMode: 'dgav_conservador',
  calculatorId: 'calc_ird'
});

/**
 * Pesos dos 4 subíndices de risco de deriva (soma = 1.00).
 */
export const IRD_SUBINDEX_WEIGHTS: IrdSubIndexWeights = Object.freeze({
  meteo: 0.35,
  espectro: 0.30,
  operacao: 0.20,
  exposicao: 0.15
});

/**
 * Faixas canónicas de classificação do Índice de Risco de Deriva (1–100).
 * Nunca existe pontuação 0 para pulverização ativa (política anti-risco-zero).
 */
export const IRD_CLASS_BANDS: Readonly<Record<IrdRiskClass, IrdClassBand>> = Object.freeze({
  BAIXO: Object.freeze({
    riskClass: 'BAIXO',
    minScore: 1,
    maxScore: 25,
    labelPt: 'Risco Baixo'
  }),
  MODERADO: Object.freeze({
    riskClass: 'MODERADO',
    minScore: 26,
    maxScore: 50,
    labelPt: 'Risco Moderado'
  }),
  ELEVADO: Object.freeze({
    riskClass: 'ELEVADO',
    minScore: 51,
    maxScore: 75,
    labelPt: 'Risco Elevado'
  }),
  CRITICO_BLOQUEADO: Object.freeze({
    riskClass: 'CRITICO_BLOQUEADO',
    minScore: 76,
    maxScore: 100,
    labelPt: 'Risco Crítico / Bloqueado'
  })
});

/**
 * Guardas anti-risco-zero: nenhum bico, pressão ou calma atmosférica produz IRD = 0.
 */
export const IRD_ANTI_ZERO_RISK = Object.freeze({
  allowZeroRisk: false,
  minGlobalScore: 1,
  maxGlobalScore: 100,
  minSubIndexScore: 10,
  minExposureScore: 15,
  minCalmWindComponent: 20,
  calmThermalInversionComponent: 45,
  minSafeNozzleFallbackScore: 30,
  blockedMinimumGlobalScore: 80
});

/**
 * Pontuação base por classe BCPC / ISO 25358 de espectro de gotas.
 */
export const IRD_DROPLET_CLASS_SCORES: Readonly<Record<IrdDropletClassCode, number>> = Object.freeze({
  VF: 95,
  F: 78,
  M: 55,
  C: 35,
  VC: 20,
  XC: 12,
  UC: 10,
  EC: 12
});

/**
 * Pontuação conservadora de fallback quando apenas driftHazardLevel existe no catálogo.
 * "Inexistente" no catálogo é normalizado para 30 (nunca 0).
 */
export const IRD_DRIFT_SENSITIVITY_FALLBACK_SCORES = Object.freeze({
  LOWER: 30,
  INTERMEDIATE: 55,
  HIGHER: 85,
  UNAVAILABLE: 85,
  CONSERVATIVE_NO_NOZZLE_STANDARD: 78,
  CONSERVATIVE_DECLARED_AIR_INDUCTION: 35
});

/**
 * Regras fail-closed e limiares operacionais EPPO e de boas práticas vigentes no projeto.
 */
export const IRD_FAIL_CLOSED_RULES = Object.freeze({
  requireExplicitWeatherInputs: true,
  requireExplicitWorkingPressureBar: true,
  neverAssumeDefaultPressureBar: true,
  requireManualCheckWhenWeatherCacheOlderThanMin: 20,
  defaultProtectiveBufferDistanceM: 5.0,
  unconfirmedBufferExposureScore: 75,
  unconfirmedBufferDownwindPenalty: 15,
  maxPrecipitationAllowedMm: 0.2,
  maxDeltaTAllowedC: 10.0,
  lowDeltaTRunoffThresholdC: 2.0,
  lowDeltaTRunoffHumidityPct: 90,
  calmWindThresholdKmh: 2.0,
  calmWindDeltaTInversionThresholdC: 6.0,
  windSafeStandardKmh: 10,
  windLimitStandardKmh: 14,
  windSafeAirInductionKmh: 14,
  windLimitAirInductionKmh: 18,
  windSafeAirSleeveKmh: 16,
  windLimitAirSleeveKmh: 20,
  maxGustLimitKmh: 25,
  aerialLegalMaxWindMs: 4.17,
  overpressureBlockFactor: 1.25,
  airSleeveOperationFactor: 0.85
});

/**
 * Limites físicos válidos de entrada para rejeição fail-closed de valores absurdos ou NaN.
 */
export const IRD_INPUT_LIMITS = Object.freeze({
  windSpeedKmh: Object.freeze({ min: 0, max: 150 }),
  windGustsKmh: Object.freeze({ min: 0, max: 200 }),
  temperatureC: Object.freeze({ min: -20, max: 55 }),
  relativeHumidityPct: Object.freeze({ min: 1, max: 100 }),
  precipitationMm: Object.freeze({ min: 0, max: 500 }),
  workingPressureBar: Object.freeze({ minExclusive: 0, max: 50 }),
  travelSpeedKmh: Object.freeze({ min: 0.5, max: 40 }),
  boomOrReleaseHeightM: Object.freeze({ min: 0.1, max: 15 }),
  distanceToSensitiveAreaM: Object.freeze({ min: 0, max: 10000 })
});

/**
 * Limites geométricos e físicos do modelo por subíndice.
 */
export const IRD_SCORING_CONSTANTS = Object.freeze({
  meteoWindWeight: 0.65,
  meteoDeltaTWeight: 0.35,
  effectiveWindBaseWeight: 0.70,
  effectiveWindGustWeight: 0.30,
  windUpperLinearKmh: 18.0,
  dv10UpperRefUm: 220,
  dv10LowerRefUm: 40,
  referenceHeightBoomM: 0.5,
  referenceHeightOrchardM: 1.0,
  speedLowerLinearKmh: 4.0,
  speedUpperLinearKmh: 16.0
});

/**
 * Declaração jurídica e normativa obrigatória associada a qualquer saída do IRD.
 */
export const IRD_LEGAL_DISCLAIMER: IrdLegalDisclaimer = Object.freeze({
  isIso22866Certified: false,
  isLegalComplianceCertificate: false,
  dgavSifitoPrevails: true,
  statementPt:
    'O Índice de Risco de Deriva (IRD) é um indicador heurístico de apoio à decisão e não constitui certificação legal nem ensaio de conformidade com a norma ISO 22866. Prevalecem sempre as indicações do rótulo oficial do produto fitofarmacêutico, bem como a verificação meteorológica presencial no campo.'
});
