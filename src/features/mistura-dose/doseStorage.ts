import type { DoseUnitMode, DoseCalculationResult } from './doseDataMapper';
import { buildDoseStructuredValues } from './doseDataMapper';
import { buildCalculationRecord, saveCalculationToDb } from '../calculators/core/historyService';
import { enqueueMutation } from '../../services/outbox/outboxService';
import { generateIdempotencyKey } from '../../services/integrations/centralgestMapper';

export async function persistDoseRecord(
  volPreparar: number,
  doseValue: number,
  unitMode: DoseUnitMode,
  volCalda: number,
  calcResult: DoseCalculationResult
) {
  const { inputs, outputs } = buildDoseStructuredValues(
    volPreparar,
    doseValue,
    unitMode,
    volCalda,
    calcResult
  );

  const doseUnit = unitMode === 'solid' ? 'kg/ha' : 'L/ha';
  const record = buildCalculationRecord({
    userId: 'local-user',
    calculatorId: 'calc_dose',
    calculatorVersion: '1.0.0',
    name: `Mistura ${calcResult.primaryValue} ${calcResult.primaryUnit}/depósito (${doseValue} ${doseUnit})`,
    inputs,
    outputs
  });

  await saveCalculationToDb(record);

  await enqueueMutation({
    entityId: generateIdempotencyKey(),
    entityType: 'calculation',
    operation: 'CREATE',
    payload: {
      calculationId: record.id,
      calculatorId: 'calc_dose',
      volPreparar,
      doseValue,
      unitMode,
      volCalda,
      primaryValue: calcResult.primaryValue,
      primaryUnit: calcResult.primaryUnit,
      subValue: calcResult.subValue,
      subUnit: calcResult.subUnit,
      areaTratadaHa: calcResult.area_tratada_ha,
      timestamp: new Date().toISOString()
    }
  });

  return record;
}
