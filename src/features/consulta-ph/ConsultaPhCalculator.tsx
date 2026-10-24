import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import {
  evaluatePh,
  getPhKeypadConfig,
  type TipoCalda
} from './phDataMapper';
import { persistPhRecord } from './phStorage';
import {
  softDeleteCalculationInDb,
  clearCalculatorHistoryInDb,
  updateCalculationMetadataInDb
} from '../calculators/core/historyService';
import { CalculatorHistoryDrawer } from '../calculators/history/CalculatorHistoryDrawer';
import { DaterraKeypadModal } from '../../components/DaterraKeypad';
import { PhHeader } from './PhHeader';
import { PhResultCard } from './PhResultCard';
import { PhInputsPanel } from './PhInputsPanel';
import { PhFooterBar } from './PhFooterBar';

// UniversalCalculatorTemplate compat: Padrão arquitetural Master Blueprint DATERRA
export const ConsultaPhCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [ph, setPh] = useState<number>(6.0);
  const [tipoCalda, setTipoCalda] = useState<TipoCalda>('geral');

  const [isKeypadOpen, setIsKeypadOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const calcResult = useMemo(
    () => evaluatePh(ph, tipoCalda),
    [ph, tipoCalda]
  );

  const historyRecords = useLiveQuery(
    async () => {
      try {
        if (!db || !db['calculation_history_v2']) return [];
        return await db['calculation_history_v2']
          .filter((r) => r.calculatorId === 'calc_ph' && !r.isDeleted)
          .reverse()
          .sortBy('createdAt');
      } catch {
        return [];
      }
    },
    []
  ) ?? [];

  const handleReset = useCallback(() => {
    setPh(6.0);
    setTipoCalda('geral');
  }, []);

  const handleSaveToHistory = async () => {
    try {
      if (!calcResult.isValid) {
        setToastMessage('Insira um valor de pH válido entre 0 e 14 antes de guardar.');
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }
      await persistPhRecord(ph, tipoCalda, calcResult);
      setToastMessage('Consulta de pH gravada e enfileirada na Outbox offline!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Erro ao gravar consulta de pH:', err);
      setToastMessage('Erro ao gravar a consulta.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const keypadCfg = useMemo(() => getPhKeypadConfig(ph), [ph]);

  return (
    <div className="space-y-4 pb-28 md:pb-24 animate-fade-in font-sans max-w-4xl mx-auto">
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#114037] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#3CA64C]/40 font-extrabold text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#8ffa94] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <PhHeader
        onBack={() => navigate('/ferramentas')}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onReset={handleReset}
        historyCount={historyRecords.length}
      />

      <PhResultCard
        calculationResult={calcResult}
        ph={ph}
        tipoCalda={tipoCalda}
      />

      <PhInputsPanel
        ph={ph}
        tipoCalda={tipoCalda}
        onSetTipoCalda={setTipoCalda}
        onOpenKeypad={() => setIsKeypadOpen(true)}
        onSelectPresetPh={setPh}
      />

      {isKeypadOpen && (
        <DaterraKeypadModal
          isOpen={true}
          onClose={() => setIsKeypadOpen(false)}
          label={keypadCfg.label}
          initialValue={String(keypadCfg.initial)}
          initialUnit={keypadCfg.unit}
          availableUnits={[keypadCfg.unit]}
          commonValues={keypadCfg.common}
          validationRules={{ min: keypadCfg.min, max: keypadCfg.max, allowDecimal: true, allowNegative: false }}
          onConfirm={(val) => {
            setPh(val);
            setIsKeypadOpen(false);
          }}
        />
      )}

      <CalculatorHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        calculatorId="calc_ph"
        calculatorTitle="Consulta de pH"
        records={historyRecords}
        onDeleteRecord={async (rec) => softDeleteCalculationInDb(rec.id)}
        onClearHistory={async () => { await clearCalculatorHistoryInDb('calc_ph', 'local-user'); }}
        onUpdateMetadata={async (id, meta) => updateCalculationMetadataInDb(id, meta)}
      />

      <PhFooterBar
        onSave={handleSaveToHistory}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyRecords.length}
      />
    </div>
  );
};

export default ConsultaPhCalculator;
