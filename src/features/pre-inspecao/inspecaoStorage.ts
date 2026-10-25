import type { ItemStatus, InspecaoEvaluationResult } from './types/inspecaoTypes';
import { buildInspecaoStructuredValues } from './inspecaoDataMapper';
import { buildCalculationRecord, saveCalculationToDb } from '../calculators/core/historyService';
import { enqueueMutation } from '../../services/outbox/outboxService';
import { generateIdempotencyKey } from '../../services/integrations/centralgestMapper';

export async function persistInspecaoRecord(
  answers: Record<string, ItemStatus>,
  calcResult: InspecaoEvaluationResult,
  equipmentTitle = 'Pulverizador'
) {
  const { inputs, outputs } = buildInspecaoStructuredValues(answers, calcResult);

  const styleLabel =
    calcResult.evaluationStyle === 'dgav_oficial' ? 'DGAV IPP' : 'ISO 16122';

  const record = buildCalculationRecord({
    userId: 'local-user',
    calculatorId: 'calc_pre_inspecao',
    calculatorVersion: '2.0.0',
    name: `Pré-Inspeção (${equipmentTitle} • ${styleLabel}): ${calcResult.statusLabel} (${calcResult.conformityPct}%)`,
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
      equipmentId: calcResult.equipmentId || 'barras_horizontais',
      evaluationStyle: calcResult.evaluationStyle || 'iso_16122',
      equipmentTitle,
      answers,
      conformityPct: calcResult.conformityPct,
      conformeCount: calcResult.conformeCount,
      anomaliaCount: calcResult.anomaliaCount,
      pendenteCount: calcResult.pendenteCount,
      status: calcResult.status,
      statusLabel: calcResult.statusLabel,
      recommendation: calcResult.recommendation,
      timestamp: new Date().toISOString()
    }
  });

  return record;
}
