import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { calculateTrvExtended } from './trvDataMapper';
import {
  softDeleteCalculationInDb,
  clearCalculatorHistoryInDb,
  updateCalculationMetadataInDb
} from '../calculators/core/historyService';
import { CalculatorHistoryDrawer } from '../calculators/history/CalculatorHistoryDrawer';
import { DaterraKeypadModal } from '../../components/DaterraKeypad';
import { TrvHeader } from './TrvHeader';
import { TrvResultCard } from './TrvResultCard';
import { TrvInputsPanel } from './TrvInputsPanel';
import { TrvFooterBar } from './TrvFooterBar';
import { useTrvSaveHistory } from './useTrvSaveHistory';
import { useLanguage } from '../../context/LanguageContext';

// UniversalCalculatorTemplate compat: Padrão arquitetural Master Blueprint DATERRA
export const VolumeCopaCalculator: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [alturaCopa, setAlturaCopa] = useState<number>(2.5);
  const [larguraCopa, setLarguraCopa] = useState<number>(1.0);
  const [distanciaEntrelinhas, setDistanciaEntrelinhas] = useState<number>(3.0);
  const [activeKeypadField, setActiveKeypadField] = useState<'altura' | 'largura' | 'entrelinha' | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const { toastMessage, saveToHistory } = useTrvSaveHistory();

  const trvResult = useMemo(
    () => calculateTrvExtended(alturaCopa, larguraCopa, distanciaEntrelinhas),
    [alturaCopa, larguraCopa, distanciaEntrelinhas]
  );

  const historyRecords = useLiveQuery(
    async () => {
      try {
        if (!db || !db['calculation_history_v2']) return [];
        return await db['calculation_history_v2']
          .filter((r) => r.calculatorId === 'calc_volume_copa' && !r.isDeleted)
          .reverse()
          .sortBy('createdAt');
      } catch {
        return [];
      }
    },
    []
  ) ?? [];

  const handleReset = useCallback(() => {
    setAlturaCopa(2.5);
    setLarguraCopa(1.0);
    setDistanciaEntrelinhas(3.0);
  }, []);

  const handleSaveToHistory = () => {
    saveToHistory(alturaCopa, larguraCopa, distanciaEntrelinhas, trvResult);
  };

  const keypadConfig = useMemo(() => {
    if (activeKeypadField === 'altura') {
      return {
        label: t('volumeCopa.canopyHeight', 'Altura da Copa (h)'),
        initial: alturaCopa,
        common: [1.5, 2.5, 3.5, 4.5],
        min: 0.5,
        max: 6.0
      };
    }
    if (activeKeypadField === 'largura') {
      return {
        label: t('volumeCopa.canopyWidth', 'Largura da Copa (w)'),
        initial: larguraCopa,
        common: [0.5, 1.0, 1.5, 2.0],
        min: 0.2,
        max: 5.0
      };
    }
    return {
      label: t('volumeCopa.rowSpacing', 'Distância Entrelinhas (r)'),
      initial: distanciaEntrelinhas,
      common: [2.0, 3.0, 4.0, 5.0],
      min: 1.0,
      max: 10.0
    };
  }, [activeKeypadField, alturaCopa, larguraCopa, distanciaEntrelinhas, t]);

  return (
    <div className="space-y-4 pb-28 md:pb-24 animate-fade-in font-sans max-w-4xl mx-auto">
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#114037] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#3CA64C]/40 font-extrabold text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#3AAA35] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <TrvHeader
        onBack={() => navigate('/ferramentas')}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onReset={handleReset}
        historyCount={historyRecords.length}
      />

      <TrvResultCard
        trvResult={trvResult}
        alturaCopa={alturaCopa}
        larguraCopa={larguraCopa}
        distanciaEntrelinhas={distanciaEntrelinhas}
      />

      <TrvInputsPanel
        alturaCopa={alturaCopa}
        larguraCopa={larguraCopa}
        distanciaEntrelinhas={distanciaEntrelinhas}
        onOpenKeypad={(field) => setActiveKeypadField(field)}
        onSelectPresetAltura={setAlturaCopa}
        onSelectPresetLargura={setLarguraCopa}
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
            if (activeKeypadField === 'altura') setAlturaCopa(val);
            else if (activeKeypadField === 'largura') setLarguraCopa(val);
            else setDistanciaEntrelinhas(val);
            setActiveKeypadField(null);
          }}
        />
      )}

      <CalculatorHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        calculatorId="calc_volume_copa"
        calculatorTitle={t('volumeCopa.title', 'Volume de Copa (TRV)')}
        records={historyRecords}
        onDeleteRecord={async (rec) => softDeleteCalculationInDb(rec.id)}
        onClearHistory={async () => {
          await clearCalculatorHistoryInDb('calc_volume_copa', 'local-user');
        }}
        onUpdateMetadata={async (id, meta) => updateCalculationMetadataInDb(id, meta)}
      />

      <TrvFooterBar
        onSave={handleSaveToHistory}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyRecords.length}
      />
    </div>
  );
};

export default VolumeCopaCalculator;
