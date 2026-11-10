import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { enqueueMutation } from '../../services/outbox/outboxService';
import { generateIdempotencyKey } from '../../services/integrations/centralgestMapper';
import { saveMixHistoryForUser } from './mixHistoryStorage';
import type { MixingSequenceAnalysis } from './index';

export function useMisturaSaveHistory() {
  const { user } = useAuth();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const saveToHistory = async (
    selectedIds: string[],
    tankCapacityL: number,
    sequenceAnalysis: MixingSequenceAnalysis
  ) => {
    try {
      const effectiveUserId = user?.id || user?.uid;
      if (!effectiveUserId) {
        setToastMessage('Sessão inválida. Volte a autenticar-se antes de gravar.');
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      if (selectedIds.length === 0) {
        setToastMessage('Selecione pelo menos uma formulação antes de gravar.');
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      await saveMixHistoryForUser(effectiveUserId, {
        date: new Date().toISOString(),
        title: `Calda ${tankCapacityL} L (${selectedIds.length} produtos)`,
        selected_formulation_ids: selectedIds,
        tank_capacity_l: tankCapacityL,
        water_initial_l: sequenceAnalysis.waterInitialL,
        water_final_l: sequenceAnalysis.waterFinalL
      });

      await enqueueMutation({
        entityId: generateIdempotencyKey(),
        entityType: 'mixture',
        operation: 'CREATE',
        userId: effectiveUserId,
        payload: {
          tankCapacityL,
          selectedFormulationIds: selectedIds,
          waterInitialL: sequenceAnalysis.waterInitialL,
          waterFinalL: sequenceAnalysis.waterFinalL,
          productsCount: selectedIds.length
        }
      });

      setToastMessage('Receita gravada e enfileirada na Outbox offline!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Erro ao guardar mistura na outbox:', err);
      setToastMessage('Erro ao gravar no histórico.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return { toastMessage, saveToHistory };
}
