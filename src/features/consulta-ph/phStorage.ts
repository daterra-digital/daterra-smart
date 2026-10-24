import type { TipoCalda, PhCalculationResult } from './phDataMapper';
import { buildPhStructuredValues } from './phDataMapper';
import { buildCalculationRecord, saveCalculationToDb } from '../calculators/core/historyService';
import { enqueueMutation } from '../../services/outbox/outboxService';
import { generateIdempotencyKey } from '../../services/integrations/centralgestMapper';

export async function persistPhRecord(
  ph: number,
  tipoCalda: TipoCalda,
  calcResult: PhCalculationResult
) {
  const { inputs, outputs } = buildPhStructuredValues(ph, tipoCalda, calcResult);

  const record = buildCalculationRecord({
    userId: 'local-user',
    calculatorId: 'calc_ph',
    calculatorVersion: '1.0.0',
    name: `Consulta de pH: ${ph.toFixed(1)} (${calcResult.statusLabel})`,
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
      calculatorId: 'calc_ph',
      ph,
      tipoCalda,
      status: calcResult.status,
      statusLabel: calcResult.statusLabel,
      actionRecommendation: calcResult.actionRecommendation,
      timestamp: new Date().toISOString()
    }
  });

  return record;
}
