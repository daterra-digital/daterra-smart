import type { ItemStatus, InspecaoEvaluationResult } from './inspecaoDataMapper';
import { buildInspecaoStructuredValues } from './inspecaoDataMapper';
import { buildCalculationRecord, saveCalculationToDb } from '../calculators/core/historyService';
import { enqueueMutation } from '../../services/outbox/outboxService';
import { generateIdempotencyKey } from '../../services/integrations/centralgestMapper';

export async function persistInspecaoRecord(
  answers: Record<string, ItemStatus>,
  calcResult: InspecaoEvaluationResult
) {
  const { inputs, outputs } = buildInspecaoStructuredValues(answers, calcResult);

  const record = buildCalculationRecord({
    userId: 'local-user',
    calculatorId: 'calc_pre_inspecao',
    calculatorVersion: '1.0.0',
    name: `Pré-Inspeção ISO 16122: ${calcResult.statusLabel} (${calcResult.conformityPct}%)`,
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
      calculatorId: 'calc_pre_inspecao',
      answers,
      conformityPct: calcResult.conformityPct,
      conformeCount: calcResult.conformeCount,
      anomaliaCount: calcResult.anomaliaCount,
      status: calcResult.status,
      statusLabel: calcResult.statusLabel,
      recommendation: calcResult.recommendation,
      timestamp: new Date().toISOString()
    }
  });

  return record;
}
