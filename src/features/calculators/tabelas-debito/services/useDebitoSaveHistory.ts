import { useState } from 'react';
import { buildDebitoStructuredValues, type IsoFlowCalculationResult, type IsoNozzleColor } from '../debitoTypes';
import { buildCalculationRecord, saveCalculationToDb } from '../../core/historyService';
import { enqueueMutation } from '../../../../services/outbox/outboxService';
import { generateIdempotencyKey } from '../../../../services/integrations/centralgestMapper';

export function useDebitoSaveHistory() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const saveToHistory = async (
    selectedNozzle: IsoNozzleColor,
    pressureBar: number,
    flowResult: IsoFlowCalculationResult
  ) => {
    try {
      if (!flowResult.isValid) {
        setToastMessage('Insira valores válidos de pressão antes de gravar.');
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      const { inputs, outputs } = buildDebitoStructuredValues(selectedNozzle, pressureBar, flowResult);
      const record = buildCalculationRecord({
        userId: 'local-user',
        calculatorId: 'calc_tabelas_debito',
        calculatorVersion: '1.0.0',
        name: `Bico ISO ${selectedNozzle.code} (${selectedNozzle.namePt}): ${flowResult.flowLMin} L/min @ ${pressureBar} bar`,
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
          calculatorId: 'calc_tabelas_debito',
          isoCode: selectedNozzle.code,
          colorName: selectedNozzle.namePt,
          nominalFlow3Bar: selectedNozzle.nominalFlow3Bar,
          pressureBar,
          flowLMin: flowResult.flowLMin,
          flowMinLMin: flowResult.flowMinLMin,
          flowMaxLMin: flowResult.flowMaxLMin,
          timestamp: new Date().toISOString()
        }
      });

      setToastMessage('Calibração de bico gravada e enfileirada na Outbox offline!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Erro ao gravar calibração de bico:', err);
      setToastMessage('Erro ao gravar a calibração.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return { toastMessage, saveToHistory };
}
