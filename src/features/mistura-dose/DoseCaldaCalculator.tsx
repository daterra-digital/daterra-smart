import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import {
  calculateDoseExtended,
  getDoseKeypadConfig,
  type DoseUnitMode
} from './doseDataMapper';
import { persistDoseRecord } from './doseStorage';
import {
  softDeleteCalculationInDb,
  clearCalculatorHistoryInDb,
  updateCalculationMetadataInDb
} from '../calculators/core/historyService';
import { CalculatorHistoryDrawer } from '../calculators/history/CalculatorHistoryDrawer';
import { DaterraKeypadModal } from '../../components/DaterraKeypad';
import { DoseHeader } from './DoseHeader';
import { DoseResultCard } from './DoseResultCard';
import { DoseInputsPanel } from './DoseInputsPanel';
import { DoseFooterBar } from './DoseFooterBar';

// UniversalCalculatorTemplate compat: Padrão arquitetural Master Blueprint DATERRA
export const DoseCaldaCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [volPreparar, setVolPreparar] = useState<number>(1000);
  const [doseValue, setDoseValue] = useState<number>(2);
  const [unitMode, setUnitMode] = useState<DoseUnitMode>('liquid');
  const [volCalda, setVolCalda] = useState<number>(200);

  const [activeKeypad, setActiveKeypad] = useState<'volPreparar' | 'doseValue' | 'volCalda' | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const calcResult = useMemo(
    () => calculateDoseExtended(volPreparar, doseValue, unitMode, volCalda),
    [volPreparar, doseValue, unitMode, volCalda]
  );

  const historyRecords = useLiveQuery(
    async () => {
      try {
        if (!db || !db['calculation_history_v2']) return [];
        return await db['calculation_history_v2']
          .filter((r) => r.calculatorId === 'calc_dose' && !r.isDeleted)
          .reverse()
          .sortBy('createdAt');
      } catch {
        return [];
      }
    },
    []
  ) ?? [];

  const handleReset = useCallback(() => {
    setVolPreparar(1000);
    setDoseValue(2);
    setUnitMode('liquid');
    setVolCalda(200);
  }, []);

  const handleSaveToHistory = async () => {
    try {
      if (!calcResult.isValid) {
        setToastMessage('Insira valores válidos superiores a zero antes de guardar.');
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }
      await persistDoseRecord(volPreparar, doseValue, unitMode, volCalda, calcResult);
      setToastMessage('Mistura de calda gravada e enfileirada na Outbox offline!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Erro ao gravar mistura por dose:', err);
      setToastMessage('Erro ao gravar o cálculo.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const keypadCfg = useMemo(() => {
    if (!activeKeypad) return null;
    return getDoseKeypadConfig(activeKeypad, volPreparar, doseValue, volCalda, unitMode);
  }, [activeKeypad, volPreparar, doseValue, volCalda, unitMode]);

  const handleConfirmKeypad = (val: number) => {
    if (activeKeypad === 'volPreparar') setVolPreparar(val);
    else if (activeKeypad === 'doseValue') setDoseValue(val);
    else if (activeKeypad === 'volCalda') setVolCalda(val);
    setActiveKeypad(null);
  };

  return (
    <div className="space-y-4 pb-28 md:pb-24 animate-fade-in font-sans max-w-4xl mx-auto">
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#114037] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#3CA64C]/40 font-extrabold text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#8ffa94] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <DoseHeader
        onBack={() => navigate('/ferramentas')}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onReset={handleReset}
        historyCount={historyRecords.length}
      />

      <DoseResultCard
        calculationResult={calcResult}
        volPreparar={volPreparar}
        doseValue={doseValue}
        unitMode={unitMode}
        volCalda={volCalda}
      />

      <DoseInputsPanel
        volPreparar={volPreparar}
        doseValue={doseValue}
        unitMode={unitMode}
        volCalda={volCalda}
        onSetUnitMode={setUnitMode}
        onOpenKeypad={(field) => setActiveKeypad(field)}
        onSelectPresetVolPreparar={setVolPreparar}
        onSelectPresetDose={setDoseValue}
        onSelectPresetVolCalda={setVolCalda}
      />

      {activeKeypad && keypadCfg && (
        <DaterraKeypadModal
          isOpen={true}
          onClose={() => setActiveKeypad(null)}
          label={keypadCfg.label}
          initialValue={String(keypadCfg.initial)}
          initialUnit={keypadCfg.unit}
          availableUnits={[keypadCfg.unit]}
          commonValues={keypadCfg.common}
          validationRules={{ min: keypadCfg.min, max: keypadCfg.max, allowDecimal: true, allowNegative: false }}
          onConfirm={handleConfirmKeypad}
        />
      )}

      <CalculatorHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        calculatorId="calc_dose"
        calculatorTitle="Mistura de Calda (Dose)"
        records={historyRecords}
        onDeleteRecord={async (rec) => softDeleteCalculationInDb(rec.id)}
        onClearHistory={async () => { await clearCalculatorHistoryInDb('calc_dose', 'local-user'); }}
        onUpdateMetadata={async (id, meta) => updateCalculationMetadataInDb(id, meta)}
      />

      <DoseFooterBar
        onSave={handleSaveToHistory}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyRecords.length}
      />
    </div>
  );
};

export default DoseCaldaCalculator;
