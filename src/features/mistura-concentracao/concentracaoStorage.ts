import type { ConcentracaoUnit, ConcentracaoMode, ConcentracaoCalculationResult } from './concentracaoDataMapper';
import { buildConcentracaoStructuredValues } from './concentracaoDataMapper';
import { buildCalculationRecord, saveCalculationToDb } from '../calculators/core/historyService';
import { enqueueMutation } from '../../services/outbox/outboxService';
import { generateIdempotencyKey } from '../../services/integrations/centralgestMapper';
import { LEGACY_UNASSIGNED_MARKER } from '../../types/calculator';

export async function persistConcentracaoRecord(
  concValue: number,
  concUnit: ConcentracaoUnit,
  volPreparar: number,
  mode: ConcentracaoMode,
  volRecomendado: number,
  volAplicado: number,
  calcResult: ConcentracaoCalculationResult,
  userId: string = LEGACY_UNASSIGNED_MARKER
) {
  const { inputs, outputs } = buildConcentracaoStructuredValues(
    concValue,
    concUnit,
    volPreparar,
    mode,
    volRecomendado,
    volAplicado,
    calcResult
  );

  const record = buildCalculationRecord({
    userId,
    calculatorId: 'calc_concentracao',
    calculatorVersion: '1.0.0',
    name: `Concentração ${calcResult.primaryValue} ${calcResult.primaryUnit}/depósito (${concValue} ${concUnit})`,
    inputs,
    outputs
  });

  await saveCalculationToDb(record);

  await enqueueMutation({
    entityId: generateIdempotencyKey(),
    entityType: 'calculation',
    operation: 'CREATE',
    userId,
    payload: {
      calculationId: record.id,
      calculatorId: 'calc_concentracao',
      concValue,
      concUnit,
      volPreparar,
      mode,
      volRecomendado,
      volAplicado,
      primaryValue: calcResult.primaryValue,
      primaryUnit: calcResult.primaryUnit,
      subValue: calcResult.subValue,
      subUnit: calcResult.subUnit,
      timestamp: new Date().toISOString()
    }
  });

  return record;
}
