import { useState } from 'react';
import { buildLwaStructuredValues, type LwaCalculationResult } from './lwaDataMapper';
import { buildCalculationRecord, saveCalculationToDb } from '../calculators/core/historyService';
import { enqueueMutation } from '../../services/outbox/outboxService';
import { generateIdempotencyKey } from '../../services/integrations/centralgestMapper';
import { useLanguage } from '../../context/LanguageContext';

export function useLwaSaveHistory() {
  const { t } = useLanguage();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const saveToHistory = async (
    alturaVegetacao: number,
    distanciaEntrelinhas: number,
    lwaResult: LwaCalculationResult
  ) => {
    try {
      if (!lwaResult.isValid) {
        setToastMessage(t('areaParedeFoliar.actions.invalidInputs', 'Insira medidas válidas superiores a zero antes de gravar.'));
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      const { inputs, outputs } = buildLwaStructuredValues(
        alturaVegetacao,
        distanciaEntrelinhas,
        lwaResult.area_parede_foliar
      );
      const record = buildCalculationRecord({
        userId: 'local-user',
        calculatorId: 'calc_area_parede_foliar',
        calculatorVersion: '1.0.0',
        name: `LWA ${lwaResult.area_parede_foliar} m²/ha (h:${alturaVegetacao}m, r:${distanciaEntrelinhas}m)`,
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
          calculatorId: 'calc_area_parede_foliar',
          alturaVegetacao,
          distanciaEntrelinhas,
          areaParedeFoliar: lwaResult.area_parede_foliar,
          caldaReferenciaLHa: lwaResult.caldaReferenciaLHa,
          timestamp: new Date().toISOString()
        }
      });

      setToastMessage(t('areaParedeFoliar.actions.saveSuccess', 'Medição de LWA gravada e enfileirada na Outbox offline!'));
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Erro ao gravar medição de LWA:', err);
      setToastMessage(t('areaParedeFoliar.actions.saveError', 'Erro ao gravar a medição.'));
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return { toastMessage, saveToHistory };
}
