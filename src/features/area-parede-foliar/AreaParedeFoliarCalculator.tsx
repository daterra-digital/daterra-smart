import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { calculateLwaExtended, buildLwaStructuredValues } from './lwaDataMapper';
import {
  buildCalculationRecord,
  saveCalculationToDb,
  softDeleteCalculationInDb,
  clearCalculatorHistoryInDb,
  updateCalculationMetadataInDb
} from '../calculators/core/historyService';
import { CalculatorHistoryDrawer } from '../calculators/history/CalculatorHistoryDrawer';
import { enqueueMutation } from '../../services/outbox/outboxService';
import { generateIdempotencyKey } from '../../services/integrations/centralgestMapper';
import { DaterraKeypadModal } from '../../components/DaterraKeypad';
import { LwaHeader } from './LwaHeader';
import { LwaResultCard } from './LwaResultCard';
import { LwaInputsPanel } from './LwaInputsPanel';
import { LwaFooterBar } from './LwaFooterBar';

// UniversalCalculatorTemplate compat: Padrão arquitetural Master Blueprint DATERRA
export const AreaParedeFoliarCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [alturaVegetacao, setAlturaVegetacao] = useState<number>(2.5);
  const [distanciaEntrelinhas, setDistanciaEntrelinhas] = useState<number>(3.0);
  const [activeKeypadField, setActiveKeypadField] = useState<'altura' | 'entrelinha' | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const lwaResult = useMemo(
    () => calculateLwaExtended(alturaVegetacao, distanciaEntrelinhas),
    [alturaVegetacao, distanciaEntrelinhas]
  );

  const historyRecords = useLiveQuery(
    async () => {
      try {
        if (!db || !db['calculation_history_v2']) return [];
        return await db['calculation_history_v2']
          .filter((r) => r.calculatorId === 'calc_area_parede_foliar' && !r.isDeleted)
          .reverse()
          .sortBy('createdAt');
      } catch {
        return [];
      }
    },
    []
  ) ?? [];

  const handleReset = useCallback(() => {
    setAlturaVegetacao(2.5);
    setDistanciaEntrelinhas(3.0);
  }, []);

  const handleSaveToHistory = async () => {
    try {
      if (!lwaResult.isValid) {
        setToastMessage('Insira medidas válidas superiores a zero antes de gravar.');
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      // 1. Gravação em calculation_history_v2
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

      // 2. Persistência atómica na Mutation Outbox (Dexie v8) com idempotência UUIDv4
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

      setToastMessage('Medição de LWA gravada e enfileirada na Outbox offline!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Erro ao gravar medição de LWA:', err);
      setToastMessage('Erro ao gravar a medição.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const keypadConfig = useMemo(() => {
    if (activeKeypadField === 'altura') {
      return { label: 'Altura da Vegetação Tratada (h)', initial: alturaVegetacao, common: [1.5, 2.5, 3.5, 4.5], min: 0.5, max: 6.0 };
    }
    return { label: 'Distância Entrelinhas (r)', initial: distanciaEntrelinhas, common: [2.0, 3.0, 4.0, 5.0], min: 1.0, max: 10.0 };
  }, [activeKeypadField, alturaVegetacao, distanciaEntrelinhas]);

  return (
    <div className="space-y-4 pb-28 md:pb-24 animate-fade-in font-sans max-w-4xl mx-auto">
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#114037] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#3CA64C]/40 font-extrabold text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#3AAA35] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <LwaHeader
        onBack={() => navigate('/ferramentas')}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onReset={handleReset}
        historyCount={historyRecords.length}
      />

      <LwaResultCard
        lwaResult={lwaResult}
        alturaVegetacao={alturaVegetacao}
        distanciaEntrelinhas={distanciaEntrelinhas}
      />

      <LwaInputsPanel
        alturaVegetacao={alturaVegetacao}
        distanciaEntrelinhas={distanciaEntrelinhas}
        onOpenKeypad={(field) => setActiveKeypadField(field)}
        onSelectPresetAltura={setAlturaVegetacao}
        onSelectPresetEntrelinha={setDistanciaEntrelinhas}
      />

      {activeKeypadField && (
        <DaterraKeypadModal
          isOpen={true}
          onClose={() => setActiveKeypadField(null)}
          label={keypadConfig.label}
          initialValue={String(keypadConfig.initial)}
          initialUnit="m"
          availableUnits={['m']}
          commonValues={keypadConfig.common}
          validationRules={{ min: keypadConfig.min, max: keypadConfig.max, allowDecimal: true, allowNegative: false }}
          onConfirm={(val) => {
            if (activeKeypadField === 'altura') setAlturaVegetacao(val);
            else setDistanciaEntrelinhas(val);
            setActiveKeypadField(null);
          }}
        />
      )}

      <CalculatorHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        calculatorId="calc_area_parede_foliar"
        calculatorTitle="Área de Parede Foliar (LWA)"
        records={historyRecords}
        onDeleteRecord={async (rec) => softDeleteCalculationInDb(rec.id)}
        onClearHistory={async () => {
          await clearCalculatorHistoryInDb('calc_area_parede_foliar', 'local-user');
        }}
        onUpdateMetadata={async (id, meta) => updateCalculationMetadataInDb(id, meta)}
      />

      <LwaFooterBar
        onSave={handleSaveToHistory}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyRecords.length}
      />
    </div>
  );
};

export default AreaParedeFoliarCalculator;
