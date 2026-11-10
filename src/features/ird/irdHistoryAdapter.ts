/**
 * DATERRA Smart - Adaptador Offline de Histórico do IRD (Fase 1)
 * Persistência local em calculation_history_v2 (Dexie v10) via historyService.ts,
 * com isolamento estrito por userId, eliminação lógica e zero chamadas Firestore/Outbox.
 */

import { db, type DaterraDatabase } from '../../db/db.ts';
import {
  type CalculationContext,
  type CalculationHistoryRecord,
  type PhysicalDimension,
  type StructuredValue,
  LEGACY_UNASSIGNED_MARKER,
  MAX_ACTIVE_CALCULATIONS_PER_TOOL
} from '../../types/calculator.ts';
import {
  buildCalculationRecord,
  evaluateHistoryQuota,
  markCalculationAsDeleted,
  saveCalculationToDb,
  softDeleteCalculationInDb
} from '../calculators/core/historyService.ts';
import type { IrdAssessmentResult, IrdInput } from './irdTypes.ts';
import { IRD_LEGAL_DISCLAIMER, IRD_VERSIONS } from './irdConfig.ts';

export const IRD_CALCULATOR_ID = IRD_VERSIONS.calculatorId; // 'calc_ird'
export const IRD_CALCULATOR_VERSION = IRD_VERSIONS.formulaVersion; // '1.0.0'

export interface SaveIrdAssessmentOptions {
  readonly name?: string;
  readonly notes?: string;
  readonly tags?: string[];
  readonly context?: CalculationContext;
  readonly parentCalculationId?: string | null;
}

export function isValidIrdOwnerId(userId?: string | null): userId is string {
  if (typeof userId !== 'string') return false;
  const trimmed = userId.trim();
  return trimmed.length > 0 && trimmed !== LEGACY_UNASSIGNED_MARKER && trimmed !== 'local-user';
}

function assertValidOwnerId(userId?: string | null): string {
  if (!isValidIrdOwnerId(userId)) {
    throw new Error('Identificador userId inválido ou proibido para histórico IRD.');
  }
  return userId.trim();
}

function sv(
  localId: string,
  rawValue: number | string,
  unit: string,
  dimension: PhysicalDimension,
  canonicalKey: string,
  label: string,
  source: 'user_input' | 'calculated_output' | 'preset_default'
): StructuredValue {
  return {
    rawValue,
    unit,
    normalizedValue: typeof rawValue === 'number' ? rawValue : null,
    normalizedUnit: typeof rawValue === 'number' ? unit : null,
    dimension,
    canonicalKey,
    label,
    source,
    localId,
    calculatorId: IRD_CALCULATOR_ID,
    calculatorVersion: IRD_CALCULATOR_VERSION
  };
}

export function buildIrdStructuredInputs(input: IrdInput, result: IrdAssessmentResult): Record<string, StructuredValue> {
  const { weather, nozzle, operation, exposure } = input;
  return {
    formulaVersion: sv('formulaVersion', result.versions.formulaVersion, '', 'text', 'ird_formula_version', 'Versão da Fórmula', 'preset_default'),
    rulesetVersion: sv('rulesetVersion', result.versions.rulesetVersion, '', 'text', 'ird_ruleset_version', 'Versão das Regras', 'preset_default'),
    nozzleCatalogVersion: sv('nozzleCatalogVersion', result.versions.nozzleCatalogVersion, '', 'text', 'nozzle_catalog_version', 'Versão do Catálogo', 'preset_default'),
    weatherSource: sv('weatherSource', weather.weatherSource ?? 'manual_field', '', 'text', 'weather_source', 'Origem Meteorológica', 'user_input'),
    weatherAgeMinutes: sv('weatherAgeMinutes', weather.weatherAgeMinutes ?? 0, 'min', 'time', 'weather_age_min', 'Idade da Previsão', 'user_input'),
    windSpeedKmh: sv('windSpeedKmh', weather.windSpeedKmh ?? 0, 'km/h', 'speed', 'wind_speed', 'Velocidade do Vento', 'user_input'),
    windGustsKmh: sv('windGustsKmh', weather.windGustsKmh ?? weather.windSpeedKmh ?? 0, 'km/h', 'speed', 'wind_gusts', 'Rajada de Vento', 'user_input'),
    temperatureC: sv('temperatureC', weather.temperatureC ?? 0, '°C', 'text', 'air_temperature', 'Temperatura do Ar', 'user_input'),
    relativeHumidityPct: sv('relativeHumidityPct', weather.relativeHumidityPct ?? 0, '%', 'percentage', 'relative_humidity', 'Humidade Relativa', 'user_input'),
    precipitationMm: sv('precipitationMm', weather.precipitationMm ?? 0, 'mm/h', 'text', 'precipitation', 'Precipitação', 'user_input'),
    nozzleId: sv('nozzleId', nozzle.nozzleId ?? 'custom', '', 'text', 'nozzle_id', 'Identificador do Bico', 'user_input'),
    nozzleType: sv('nozzleType', nozzle.nozzleType ?? 'não especificado', '', 'text', 'nozzle_type', 'Tipo de Bico', 'user_input'),
    workingPressureBar: sv('workingPressureBar', nozzle.workingPressureBar ?? 0, 'bar', 'pressure', 'working_pressure', 'Pressão de Trabalho', 'user_input'),
    hasAirSleeve: sv('hasAirSleeve', nozzle.hasAirSleeve ? 'sim' : 'nao', '', 'text', 'air_sleeve', 'Manga de Ar', 'user_input'),
    applicationDomain: sv('applicationDomain', operation.applicationDomain, '', 'text', 'application_domain', 'Domínio de Aplicação', 'user_input'),
    travelSpeedKmh: sv('travelSpeedKmh', operation.travelSpeedKmh ?? 0, 'km/h', 'speed', 'travel_speed', 'Velocidade de Avanço', 'user_input'),
    boomOrReleaseHeightM: sv('boomOrReleaseHeightM', operation.boomOrReleaseHeightM ?? 0, 'm', 'length', 'boom_height', 'Altura da Barra / Libertação', 'user_input'),
    distanceToSensitiveAreaM: sv('distanceToSensitiveAreaM', exposure.distanceToSensitiveAreaM ?? 'nao_confirmada', 'm', 'length', 'buffer_distance_actual', 'Distância a Área Sensível', 'user_input'),
    labelMinBufferM: sv('labelMinBufferM', exposure.labelMinBufferM ?? 0, 'm', 'length', 'label_min_buffer', 'Zona Tampão do Rótulo SIFITO', 'user_input'),
    hasDownwindSensitiveTarget: sv('hasDownwindSensitiveTarget', exposure.hasDownwindSensitiveTarget ? 'sim' : 'nao', '', 'text', 'downwind_target', 'Alvo Sensível a Sotavento', 'user_input')
  };
}

export function buildIrdStructuredOutputs(result: IrdAssessmentResult): Record<string, StructuredValue> {
  return {
    irdScore: sv('irdScore', result.irdScore, 'pts', 'count', 'ird_score', 'Índice de Risco de Deriva', 'calculated_output'),
    irdClass: sv('irdClass', result.irdClass, '', 'text', 'ird_class', 'Classe de Risco IRD', 'calculated_output'),
    subMeteo: sv('subMeteo', result.subIndices.meteo, 'pts', 'count', 'ird_sub_meteo', 'Subíndice Meteorológico', 'calculated_output'),
    subEspectro: sv('subEspectro', result.subIndices.espectro, 'pts', 'count', 'ird_sub_espectro', 'Subíndice Espectro de Gotas', 'calculated_output'),
    subOperacao: sv('subOperacao', result.subIndices.operacao, 'pts', 'count', 'ird_sub_operacao', 'Subíndice Operacional', 'calculated_output'),
    subExposicao: sv('subExposicao', result.subIndices.exposicao, 'pts', 'count', 'ird_sub_exposicao', 'Subíndice Exposição Ambiental', 'calculated_output'),
    deltaTC: sv('deltaTC', result.derived.deltaTC, '°C', 'text', 'delta_t', 'Delta T', 'calculated_output'),
    effectiveWindKmh: sv('effectiveWindKmh', result.derived.effectiveWindKmh, 'km/h', 'speed', 'effective_wind', 'Vento Efetivo', 'calculated_output'),
    nozzleResolutionTier: sv('nozzleResolutionTier', result.derived.nozzleResolutionTier, '', 'text', 'nozzle_resolution_tier', 'Nível de Evidência do Bico', 'calculated_output'),
    legalVerdict: sv('legalVerdict', result.legalVerdict, '', 'text', 'ird_legal_verdict', 'Veredicto Operacional', 'calculated_output'),
    dataConfidenceLevel: sv('dataConfidenceLevel', result.dataConfidenceLevel, '', 'text', 'ird_data_confidence', 'Nível de Confiança dos Dados', 'calculated_output'),
    fallbackFlags: sv('fallbackFlags', JSON.stringify(result.fallbackFlags), '', 'text', 'ird_fallback_flags', 'Regras de Precaução Acionadas', 'calculated_output'),
    blocks: sv('blocks', JSON.stringify(result.blocks), '', 'text', 'ird_blocks', 'Bloqueios Registados', 'calculated_output'),
    warnings: sv('warnings', JSON.stringify(result.warnings), '', 'text', 'ird_warnings', 'Avisos e Restrições', 'calculated_output'),
    legalDisclaimer: sv('legalDisclaimer', IRD_LEGAL_DISCLAIMER.statementPt, '', 'text', 'dgav_sifito_disclaimer', 'Prevalência do Rótulo DGAV/SIFITO (Não ISO 22866)', 'preset_default')
  };
}

export async function listIrdHistory(
  userId: string | null | undefined,
  targetDb: DaterraDatabase = db
): Promise<CalculationHistoryRecord[]> {
  if (!isValidIrdOwnerId(userId)) return [];
  const cleanUserId = userId.trim();

  const records = await targetDb.calculation_history_v2
    .where('userId')
    .equals(cleanUserId)
    .filter((r) => r.calculatorId === IRD_CALCULATOR_ID && r.userId === cleanUserId && r.isDeleted === false)
    .toArray();

  records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return records.slice(0, MAX_ACTIVE_CALCULATIONS_PER_TOOL);
}

export async function saveIrdAssessment(
  userId: string | null | undefined,
  input: IrdInput,
  result: IrdAssessmentResult,
  options: SaveIrdAssessmentOptions = {},
  targetDb: DaterraDatabase = db
): Promise<CalculationHistoryRecord> {
  const cleanUserId = assertValidOwnerId(userId);
  if (result.status !== 'CALCULATED') {
    throw new Error('Apenas avaliações IRD calculadas podem ser guardadas no histórico.');
  }

  const activeRecords = await listIrdHistory(cleanUserId, targetDb);
  const quota = evaluateHistoryQuota(IRD_CALCULATOR_ID, cleanUserId, activeRecords);
  if (quota.isLimitReached) {
    throw new Error('history_quota_exceeded');
  }

  const record = buildCalculationRecord({
    userId: cleanUserId,
    calculatorId: IRD_CALCULATOR_ID,
    calculatorVersion: IRD_CALCULATOR_VERSION,
    inputs: buildIrdStructuredInputs(input, result),
    outputs: buildIrdStructuredOutputs(result),
    name: options.name,
    notes: options.notes,
    tags: options.tags,
    context: options.context,
    parentCalculationId: options.parentCalculationId ?? null
  });

  if (targetDb === db) {
    await saveCalculationToDb(record);
  } else {
    await targetDb.calculation_history_v2.put(record);
  }
  return record;
}

export async function softDeleteIrdAssessment(
  id: string,
  userId: string | null | undefined,
  targetDb: DaterraDatabase = db
): Promise<boolean> {
  const cleanUserId = assertValidOwnerId(userId);
  const existing = await targetDb.calculation_history_v2.get(id);
  if (!existing || existing.userId !== cleanUserId || existing.calculatorId !== IRD_CALCULATOR_ID) {
    return false;
  }

  if (targetDb === db) {
    await softDeleteCalculationInDb(id);
  } else {
    await targetDb.calculation_history_v2.put(markCalculationAsDeleted(existing));
  }
  return true;
}
