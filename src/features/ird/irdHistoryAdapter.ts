/**
 * DATERRA Smart - Adaptador Offline de Histórico do IRD (Fase 1)
 * Persistência local em calculation_history_v2 (Dexie v10) via historyService.ts,
 * com isolamento estrito por userId, eliminação lógica e zero chamadas remotas.
 */

import { db, type DaterraDatabase } from '../../db/db.ts';
import {
  type CalculationContext,
  type CalculationHistoryRecord,
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
import { IRD_VERSIONS } from './irdConfig.ts';
import { buildIrdStructuredInputs, buildIrdStructuredOutputs, type IrdSaveOriginTrace } from './irdHistorySnapshot.ts';

export { buildIrdStructuredInputs, buildIrdStructuredOutputs, type IrdSaveOriginTrace };
export const IRD_CALCULATOR_ID = IRD_VERSIONS.calculatorId; // 'calc_ird'
export const IRD_CALCULATOR_VERSION = IRD_VERSIONS.formulaVersion; // '1.0.0'

export interface SaveIrdAssessmentOptions {
  readonly name?: string;
  readonly notes?: string;
  readonly tags?: string[];
  readonly context?: CalculationContext;
  readonly parentCalculationId?: string | null;
  readonly originTrace?: IrdSaveOriginTrace;
}

export function isValidIrdOwnerId(userId?: string | null): userId is string {
  if (typeof userId !== 'string') return false;
  const trimmed = userId.trim();
  return trimmed.length > 0 && trimmed !== LEGACY_UNASSIGNED_MARKER && trimmed !== 'local-user' && trimmed !== 'unassigned';
}

function assertValidOwnerId(userId?: string | null): string {
  if (!isValidIrdOwnerId(userId)) {
    throw new Error('Identificador userId inválido ou proibido para histórico IRD.');
  }
  return userId.trim();
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
    inputs: buildIrdStructuredInputs(input, result, options.originTrace),
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
