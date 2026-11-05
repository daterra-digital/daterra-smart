/**
 * DATERRA Smart - Adaptador Canónico de Histórico: Aplicação Manual
 * Interoperabilidade com Dexie (calculation_history_v2) (< 200 LOC)
 */

import type { CalculationHistoryRecord } from '../../../types/calculator';
import {
  buildCalculationRecord,
  saveCalculationToDb,
  evaluateHistoryQuota,
  softDeleteCalculationInDb,
  updateCalculationMetadataInDb,
  clearCalculatorHistoryInDb
} from '../../calculators/core/historyService';
import type { ManualCalculationState, ManualCalculationOutput } from '../aplicacaoManualTypes';
import {
  MANUAL_CALC_ID,
  MANUAL_CALC_VERSION,
  buildManualStructuredInputs,
  buildManualStructuredOutputs
} from './manualHistoryMappers';

export { MANUAL_CALC_ID, MANUAL_CALC_VERSION, buildManualStructuredInputs, buildManualStructuredOutputs };

export async function saveManualCalculation(
  userId: string,
  state: ManualCalculationState,
  output: ManualCalculationOutput,
  existingRecords: CalculationHistoryRecord[] = []
): Promise<CalculationHistoryRecord> {
  const quota = evaluateHistoryQuota(MANUAL_CALC_ID, userId, existingRecords);
  if (quota.isLimitReached) {
    throw new Error('history_quota_exceeded');
  }

  const inputs = buildManualStructuredInputs(state);
  const outputs = buildManualStructuredOutputs(output);

  const record = buildCalculationRecord({
    userId,
    calculatorId: MANUAL_CALC_ID,
    calculatorVersion: MANUAL_CALC_VERSION,
    inputs,
    outputs,
    parentCalculationId: state.parentCalculationId || null
  });

  await saveCalculationToDb(record);
  return record;
}

export function extractManualStateFromRecord(record: CalculationHistoryRecord): ManualCalculationState {
  const getNum = (key: string): number | undefined => {
    const val = record.inputs[key]?.rawValue;
    return val !== undefined && val !== null && val !== '' ? Number(val) : undefined;
  };
  const getStr = (key: string): string | undefined => {
    const val = record.inputs[key]?.rawValue;
    return val !== undefined && val !== null ? String(val) : undefined;
  };

  const mode = getStr('mode') as any;
  const productState = getStr('productState') as any;
  const rotuloValue = getNum('rotuloValue');
  const rotuloUnit = record.inputs['rotuloValue']?.unit || '';
  const caldaPrepararL = getNum('caldaPrepararL');
  const plantStage = getStr('plantStage') as any;
  const hasEnsaio = getStr('hasEnsaio') === 'true';
  const areaMethod = getStr('areaMethod') as any;
  const areaConhecidaM2 = getNum('areaConhecidaM2');
  const faixaComprimentoM = getNum('faixaComprimentoM');
  const faixaLarguraM = getNum('faixaLarguraM');
  const aguaGastaL = getNum('aguaGastaL');
  const recVolumeLHa = getNum('recVolumeLHa');
  const recOrigin = getStr('recOrigin') as any;

  return {
    mode,
    productState,
    rotuloValue,
    rotuloUnit,
    caldaPrepararL,
    plantStage,
    hasEnsaio,
    areaMethod,
    areaConhecidaM2,
    faixaComprimentoM,
    faixaLarguraM,
    aguaGastaL,
    hasRecVolume: recVolumeLHa !== undefined,
    recVolumeLHa,
    recOrigin,
    parentCalculationId: record.id
  };
}

export { softDeleteCalculationInDb, updateCalculationMetadataInDb, clearCalculatorHistoryInDb };
