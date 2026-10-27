import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db/db';
import { ISO_NOZZLE_COLORS, calculateIsoFlow } from './debitoTypes';
import {
  softDeleteCalculationInDb,
  clearCalculatorHistoryInDb,
  updateCalculationMetadataInDb
} from '../core/historyService';
import { CalculatorHistoryDrawer } from '../history/CalculatorHistoryDrawer';
import { DaterraKeypadModal } from '../../../components/DaterraKeypad';
import { NozzleMicrolearningModal } from '../../nozzle-comparison/NozzleMicrolearningModal';
import { DebitoHeader } from './DebitoHeader';
import { DebitoResultCard } from './DebitoResultCard';
import { DebitoIsoSelector } from './DebitoIsoSelector';
import { DebitoInputs } from './DebitoInputs';
import { DebitoFooterBar } from './DebitoFooterBar';
import { useDebitoSaveHistory } from './services/useDebitoSaveHistory';

export const DebitoTrabalhoView: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCode, setSelectedCode] = useState<string>('02'); // ISO 02 Amarelo por omissão
  const [pressureBar, setPressureBar] = useState<number>(3.0);
  const [isKeypadOpen, setIsKeypadOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const { toastMessage, saveToHistory } = useDebitoSaveHistory();

  const selectedNozzle = useMemo(
    () => ISO_NOZZLE_COLORS.find((n) => n.code === selectedCode) || ISO_NOZZLE_COLORS[2],
    [selectedCode]
  );

  const flowResult = useMemo(
    () => calculateIsoFlow(selectedNozzle.nominalFlow3Bar, pressureBar),
    [selectedNozzle, pressureBar]
  );

  const historyRecords = useLiveQuery(
    async () => {
      try {
        if (!db || !db.calculation_history_v2) return [];
        return await db.calculation_history_v2
          .filter((r) => r.calculatorId === 'calc_tabelas_debito' && !r.isDeleted)
          .reverse()
          .sortBy('createdAt');
      } catch {
        return [];
      }
    },
    []
  ) ?? [];

  const handleReset = useCallback(() => {
    setSelectedCode('02');
    setPressureBar(3.0);
  }, []);

  const handleSaveToHistory = () => {
    saveToHistory(selectedNozzle, pressureBar, flowResult);
  };

  return (
    <div className="space-y-4 pb-28 md:pb-24 animate-fade-in font-sans max-w-4xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#114037] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#3CA64C]/40 font-extrabold text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#3AAA35] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Camada 1: Topo e Navegação */}
      <DebitoHeader
        onBack={() => navigate('/ferramentas')}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onReset={handleReset}
        historyCount={historyRecords.length}
      />

      {/* Camada 1: Cartão de Resultado Verde (#114D37) com Números Grandes */}
      <DebitoResultCard
        flowResult={flowResult}
        selectedNozzle={selectedNozzle}
        pressureBar={pressureBar}
      />

      {/* Camada 1 & 2: Seletor Tátil de Bicos ISO 10625 */}
      <DebitoIsoSelector
        selectedCode={selectedCode}
        onSelectCode={setSelectedCode}
      />

      {/* Camada 1: Painel "Valores Introduzidos" com Ajuste de Pressão */}
      <DebitoInputs
        pressureBar={pressureBar}
        onOpenKeypad={() => setIsKeypadOpen(true)}
        onSelectPresetPressure={setPressureBar}
      />

      {/* Camada 2: Teclado Tátil DaterraKeypad em Bottom Sheet Modal */}
      {isKeypadOpen && (
        <DaterraKeypadModal
          isOpen={true}
          onClose={() => setIsKeypadOpen(false)}
          label="Pressão de Trabalho"
          initialValue={String(pressureBar)}
          initialUnit="bar"
          availableUnits={['bar']}
          commonValues={[1.5, 2.0, 2.5, 3.0, 4.0, 5.0]}
          validationRules={{ min: 0.5, max: 30.0, allowDecimal: true, allowNegative: false }}
          onConfirm={(val) => {
            setPressureBar(val);
            setIsKeypadOpen(false);
          }}
        />
      )}

      {/* Camada 3: Modal Didático [Guia] com negrito formatDidacticText */}
      <NozzleMicrolearningModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Drawer Lateral de Histórico Universal */}
      <CalculatorHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        calculatorId="calc_tabelas_debito"
        calculatorTitle="Tabelas de Débito (Comparador)"
        records={historyRecords}
        onDeleteRecord={async (rec) => softDeleteCalculationInDb(rec.id)}
        onClearHistory={async () => {
          await clearCalculatorHistoryInDb('calc_tabelas_debito', 'local-user');
        }}
        onUpdateMetadata={async (id, meta) => updateCalculationMetadataInDb(id, meta)}
      />

      {/* Barra de Rodapé Fixa (Master Blueprint) */}
      <DebitoFooterBar
        onSave={handleSaveToHistory}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        historyCount={historyRecords.length}
      />
    </div>
  );
};
