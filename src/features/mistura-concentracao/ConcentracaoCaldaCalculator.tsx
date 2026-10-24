import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import {
  calculateConcentracaoExtended,
  getConcentracaoKeypadConfig,
  type ConcentracaoUnit,
  type ConcentracaoMode
} from './concentracaoDataMapper';
import { persistConcentracaoRecord } from './concentracaoStorage';
import {
  softDeleteCalculationInDb,
  clearCalculatorHistoryInDb,
  updateCalculationMetadataInDb
} from '../calculators/core/historyService';
import { CalculatorHistoryDrawer } from '../calculators/history/CalculatorHistoryDrawer';
import { DaterraKeypadModal } from '../../components/DaterraKeypad';
import { ConcentracaoHeader } from './ConcentracaoHeader';
import { ConcentracaoResultCard } from './ConcentracaoResultCard';
import { ConcentracaoInputsPanel } from './ConcentracaoInputsPanel';
import { ConcentracaoFooterBar } from './ConcentracaoFooterBar';

// UniversalCalculatorTemplate compat: Padrão arquitetural Master Blueprint DATERRA
export const ConcentracaoCaldaCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [concValue, setConcValue] = useState<number>(100);
  const [concUnit, setConcUnit] = useState<ConcentracaoUnit>('mL/hL');
  const [volPreparar, setVolPreparar] = useState<number>(400);
  const [mode, setMode] = useState<ConcentracaoMode>('jovem');
  const [volRecomendado, setVolRecomendado] = useState<number>(1000);
  const [volAplicado, setVolAplicado] = useState<number>(400);

  const [activeKeypad, setActiveKeypad] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const calcResult = useMemo(
    () => calculateConcentracaoExtended(concValue, concUnit, volPreparar, mode, volRecomendado, volAplicado),
    [concValue, concUnit, volPreparar, mode, volRecomendado, volAplicado]
  );

  const historyRecords = useLiveQuery(
    async () => {
      try {
        if (!db || !db['calculation_history_v2']) return [];
        return await db['calculation_history_v2']
          .filter((r) => r.calculatorId === 'calc_concentracao' && !r.isDeleted)
          .reverse()
          .sortBy('createdAt');
      } catch {
        return [];
      }
    },
    []
  ) ?? [];

  const handleReset = useCallback(() => {
    setConcValue(100);
    setConcUnit('mL/hL');
    setVolPreparar(400);
    setMode('jovem');
    setVolRecomendado(1000);
    setVolAplicado(400);
  }, []);

  const handleSaveToHistory = async () => {
    try {
      if (!calcResult.isValid) {
        setToastMessage('Insira valores válidos superiores a zero antes de guardar.');
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }
      await persistConcentracaoRecord(concValue, concUnit, volPreparar, mode, volRecomendado, volAplicado, calcResult);
      setToastMessage('Concentração gravada e enfileirada na Outbox offline!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Erro ao gravar concentração:', err);
      setToastMessage('Erro ao gravar o cálculo.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const keypadCfg = useMemo(
    () => getConcentracaoKeypadConfig(activeKeypad, concValue, volPreparar, volRecomendado, volAplicado, concUnit),
    [activeKeypad, concValue, volPreparar, volRecomendado, volAplicado, concUnit]
  );

  const handleConfirmKeypad = (val: number) => {
    if (activeKeypad === 'concValue') setConcValue(val);
    else if (activeKeypad === 'volPreparar') setVolPreparar(val);
    else if (activeKeypad === 'volRecomendado') setVolRecomendado(val);
    else setVolAplicado(val);
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

      <ConcentracaoHeader
        onBack={() => navigate('/ferramentas')}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onReset={handleReset}
        historyCount={historyRecords.length}
      />

      <ConcentracaoResultCard
        calculationResult={calcResult}
        concValue={concValue}
        concUnit={concUnit}
        volPreparar={volPreparar}
        mode={mode}
        volRecomendado={volRecomendado}
        volAplicado={volAplicado}
      />

      <ConcentracaoInputsPanel
        concValue={concValue}
        concUnit={concUnit}
        volPreparar={volPreparar}
        mode={mode}
        volRecomendado={volRecomendado}
        volAplicado={volAplicado}
        onSetMode={setMode}
        onSetUnit={setConcUnit}
        onOpenKeypad={(field) => setActiveKeypad(field)}
        onSelectPresetConc={setConcValue}
        onSelectPresetVol={setVolPreparar}
      />

      {activeKeypad && (
        <DaterraKeypadModal
          isOpen={true}
          onClose={() => setActiveKeypad(null)}
          label={keypadCfg.label}
          initialValue={String(keypadCfg.initial)}
          initialUnit={activeKeypad === 'concValue' ? concUnit : 'L'}
          availableUnits={[concUnit, 'L', 'kg']}
          commonValues={keypadCfg.common}
          validationRules={{ min: keypadCfg.min, max: keypadCfg.max, allowDecimal: true, allowNegative: false }}
          onConfirm={handleConfirmKeypad}
        />
      )}

      <CalculatorHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        calculatorId="calc_concentracao"
        calculatorTitle="Mistura de Calda (Concentração)"
        records={historyRecords}
        onDeleteRecord={async (rec) => softDeleteCalculationInDb(rec.id)}
        onClearHistory={async () => { await clearCalculatorHistoryInDb('calc_concentracao', 'local-user'); }}
        onUpdateMetadata={async (id, meta) => updateCalculationMetadataInDb(id, meta)}
      />

      <ConcentracaoFooterBar
        onSave={handleSaveToHistory}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyRecords.length}
      />
    </div>
  );
};

export default ConcentracaoCaldaCalculator;
