import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import {
  evaluateInspecao,
  CRITICAL_POINTS_ISO16122,
  type ItemStatus
} from './inspecaoDataMapper';
import { persistInspecaoRecord } from './inspecaoStorage';
import {
  softDeleteCalculationInDb,
  clearCalculatorHistoryInDb,
  updateCalculationMetadataInDb
} from '../calculators/core/historyService';
import { CalculatorHistoryDrawer } from '../calculators/history/CalculatorHistoryDrawer';
import { InspecaoHeader } from './InspecaoHeader';
import { InspecaoResultCard } from './InspecaoResultCard';
import { InspecaoChecklistPanel } from './InspecaoChecklistPanel';
import { InspecaoFooterBar } from './InspecaoFooterBar';
import { InspecaoGuideModal } from './InspecaoGuideModal';

// UniversalCalculatorTemplate compat: Padrão arquitetural Master Blueprint DATERRA
export const PreInspecaoCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, ItemStatus>>({});
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const calcResult = useMemo(() => evaluateInspecao(answers), [answers]);

  const historyRecords = useLiveQuery(
    async () => {
      try {
        if (!db || !db['calculation_history_v2']) return [];
        return await db['calculation_history_v2']
          .filter((r) => r.calculatorId === 'calc_pre_inspecao' && !r.isDeleted)
          .reverse()
          .sortBy('createdAt');
      } catch {
        return [];
      }
    },
    []
  ) ?? [];

  const handleReset = useCallback(() => {
    setAnswers({});
  }, []);

  const handleSetAnswer = (id: string, status: ItemStatus) => {
    setAnswers((prev) => ({ ...prev, [id]: status }));
  };

  const handleMarkAllConforme = () => {
    const allConforme: Record<string, ItemStatus> = {};
    for (const point of CRITICAL_POINTS_ISO16122) {
      allConforme[point.id] = 'conforme';
    }
    setAnswers(allConforme);
    setToastMessage('Todos os 5 pontos marcados como conformes!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveToHistory = async () => {
    try {
      if (!calcResult.isValid) {
        setToastMessage('Avalie pelo menos um ponto crítico antes de guardar.');
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }
      await persistInspecaoRecord(answers, calcResult);
      setToastMessage('Boletim de pré-inspeção gravado e enfileirado na Outbox offline!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Erro ao guardar pré-inspeção:', err);
      setToastMessage('Erro ao gravar a pré-inspeção.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-4 pb-28 md:pb-24 animate-fade-in font-sans max-w-4xl mx-auto">
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#114037] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#3CA64C]/40 font-extrabold text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#8ffa94] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <InspecaoHeader
        onBack={() => navigate('/ferramentas')}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onReset={handleReset}
        historyCount={historyRecords.length}
      />

      <InspecaoResultCard
        calculationResult={calcResult}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      <InspecaoChecklistPanel
        answers={answers}
        onSetAnswer={handleSetAnswer}
        onMarkAllConforme={handleMarkAllConforme}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      <CalculatorHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        calculatorId="calc_pre_inspecao"
        calculatorTitle="Pré-Inspeção do Pulverizador"
        records={historyRecords}
        onDeleteRecord={async (rec) => softDeleteCalculationInDb(rec.id)}
        onClearHistory={async () => { await clearCalculatorHistoryInDb('calc_pre_inspecao', 'local-user'); }}
        onUpdateMetadata={async (id, meta) => updateCalculationMetadataInDb(id, meta)}
      />

      <InspecaoGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <InspecaoFooterBar
        onSave={handleSaveToHistory}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        historyCount={historyRecords.length}
      />
    </div>
  );
};

export default PreInspecaoCalculator;
