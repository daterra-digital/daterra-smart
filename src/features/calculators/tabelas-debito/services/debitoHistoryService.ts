import { buildDebitoStructuredValues } from '../debitoTypes';
import type { IsoNozzleColor, IsoFlowCalculationResult, DebitoHubMode } from '../debitoTypes';
import type { Nozzle } from '../../../nozzle-comparison/nozzleComparison.types';
import {
  buildCalculationRecord,
  saveCalculationToDb
} from '../../core/historyService';
import { enqueueMutation } from '../../../../services/outbox/outboxService';
import { generateIdempotencyKey } from '../../../../services/integrations/centralgestMapper';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../../db/db';
import { LEGACY_UNASSIGNED_MARKER } from '../../../../types/calculator';

export function useDebitoHistory(userId?: string) {
  return useLiveQuery(async () => {
    try {
      if (!db || !db.calculation_history_v2 || !userId) return [];
      return await db.calculation_history_v2
        .filter((r) => r.calculatorId === 'calc_tabelas_debito' && r.userId === userId && !r.isDeleted)
        .reverse()
        .sortBy('createdAt');
    } catch {
      return [];
    }
  }, [userId]) ?? [];
}

export interface SaveDebitoHistoryParams {
  activeMode: DebitoHubMode;
  selectedIsoNozzle: IsoNozzleColor;
  unitarioPressure: number;
  unitarioFlow: IsoFlowCalculationResult;
  nozzleA?: Nozzle;
  nozzleB?: Nozzle;
  compPressure: number;
  userId?: string;
}

export async function saveDebitoHistory({
  activeMode,
  selectedIsoNozzle,
  unitarioPressure,
  unitarioFlow,
  nozzleA,
  nozzleB,
  compPressure,
  userId = LEGACY_UNASSIGNED_MARKER
}: SaveDebitoHistoryParams): Promise<void> {
  const { inputs, outputs } = buildDebitoStructuredValues(selectedIsoNozzle, unitarioPressure, unitarioFlow);
  const title = activeMode === 'comparador'
    ? `Comparador: ${nozzleA?.model || 'A'} vs ${nozzleB?.model || 'B'} @ ${compPressure} bar`
    : `Bico ISO ${selectedIsoNozzle.code}: ${unitarioFlow.flowLMin} L/min @ ${unitarioPressure} bar`;

  const record = buildCalculationRecord({
    userId,
    calculatorId: 'calc_tabelas_debito',
    calculatorVersion: '2.0.0',
    name: title,
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
      calculatorId: 'calc_tabelas_debito',
      activeMode,
      title,
      timestamp: new Date().toISOString()
    }
  });
}
