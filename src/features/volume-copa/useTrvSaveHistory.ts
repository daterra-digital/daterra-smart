import { useState } from 'react';
import { buildTrvStructuredValues, type TrvCalculationResult } from './trvDataMapper';
import { buildCalculationRecord, saveCalculationToDb } from '../calculators/core/historyService';
import { enqueueMutation } from '../../services/outbox/outboxService';
import { generateIdempotencyKey } from '../../services/integrations/centralgestMapper';
import { useLanguage } from '../../context/LanguageContext';

export function useTrvSaveHistory() {
  const { t } = useLanguage();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const saveToHistory = async (
    alturaCopa: number,
    larguraCopa: number,
    distanciaEntrelinhas: number,
    trvResult: TrvCalculationResult
  ) => {
    try {
      if (!trvResult.isValid) {
        setToastMessage(t('volumeCopa.actions.invalidInputs', 'Insira medidas válidas superiores a zero antes de gravar.'));
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      const { inputs, outputs } = buildTrvStructuredValues(
        alturaCopa,
        larguraCopa,
        distanciaEntrelinhas,
        trvResult.volume_copa
      );
      const record = buildCalculationRecord({
        userId: 'local-user',
        calculatorId: 'calc_volume_copa',
        calculatorVersion: '1.0.0',
        name: `TRV ${trvResult.volume_copa} m³/ha (h:${alturaCopa}m, w:${larguraCopa}m, r:${distanciaEntrelinhas}m)`,
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
          calculatorId: 'calc_volume_copa',
          alturaCopa,
          larguraCopa,
          distanciaEntrelinhas,
          volumeCopa: trvResult.volume_copa,
          caldaReferenciaLHa: trvResult.caldaReferenciaLHa,
          timestamp: new Date().toISOString()
        }
      });

      setToastMessage(t('volumeCopa.actions.saveSuccess', 'Medição de TRV gravada e enfileirada na Outbox offline!'));
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Erro ao gravar medição de TRV:', err);
      setToastMessage(t('volumeCopa.actions.saveError', 'Erro ao gravar a medição.'));
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return { toastMessage, saveToHistory };
}
