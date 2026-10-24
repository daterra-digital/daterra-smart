import type { EppoDoseInputsState, EppoDoseCalculationResult } from './eppoDoseDataMapper';
import { buildEppoDoseStructuredValues } from './eppoDoseDataMapper';
import { buildCalculationRecord, saveCalculationToDb } from '../calculators/core/historyService';
import { enqueueMutation } from '../../services/outbox/outboxService';
import { generateIdempotencyKey } from '../../services/integrations/centralgestMapper';

export async function persistEppoDoseRecord(
  inputs: EppoDoseInputsState,
  calcResult: EppoDoseCalculationResult
) {
  const { inputs: structuredInputs, outputs } = buildEppoDoseStructuredValues(inputs, calcResult);
  const unit = inputs.unitMode === 'liquid' ? 'L/ha' : 'kg/ha';
  const modeTag = inputs.treatmentMode === 'band' ? ' (Faixa)' : '';

  const calcName = (inputs.selectedCultureName && inputs.selectedEquipmentName)
    ? `${inputs.selectedCultureName} • ${inputs.selectedEquipmentName}`
    : `EPPO ${calcResult.doseAjustada} ${unit}${modeTag} (${calcResult.reducaoPercentual >= 0 ? `Poupança: -${calcResult.reducaoPercentual}%` : `Acréscimo: +${Math.abs(calcResult.reducaoPercentual)}%`})`;

  const tags = [inputs.unitMode === 'solid' ? 'Sólido' : 'Líquido', inputs.treatmentMode === 'band' ? 'Faixa' : 'Total'];
  if (inputs.selectedCultureName) tags.push(inputs.selectedCultureName);
  if (inputs.selectedEquipmentName) tags.push(inputs.selectedEquipmentName);

  const record = buildCalculationRecord({
    userId: 'local-user',
    calculatorId: 'ajuste_dose_eppo',
    calculatorVersion: '2.1.0',
    name: calcName,
    tags,
    inputs: structuredInputs,
    outputs
  });

  await saveCalculationToDb(record);

  await enqueueMutation({
    entityId: generateIdempotencyKey(),
    entityType: 'calculation',
    operation: 'CREATE',
    payload: {
      calculationId: record.id,
      calculatorId: 'ajuste_dose_eppo',
      name: calcName,
      doseRotulo: inputs.doseRotulo,
      alturaM: inputs.alturaM,
      entrelinhaM: inputs.entrelinhaM,
      treatmentMode: inputs.treatmentMode,
      cropStructure: inputs.cropStructure,
      lwaReal: calcResult.lwaReal,
      doseAjustada: calcResult.doseAjustada,
      reducaoPercentual: calcResult.reducaoPercentual,
      produtoPorDeposito: calcResult.produtoPorDeposito,
      concentracaoPor100L: calcResult.concentracaoPor100LSub,
      unitMode: inputs.unitMode,
      selectedCulture: inputs.selectedCultureName,
      selectedEquipment: inputs.selectedEquipmentName,
      timestamp: new Date().toISOString()
    }
  });

  return record;
}
