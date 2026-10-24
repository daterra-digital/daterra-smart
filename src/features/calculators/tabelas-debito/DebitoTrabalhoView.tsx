import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db/db';
import { ISO_NOZZLE_COLORS, calculateIsoFlow, buildDebitoStructuredValues } from './debitoTypes';
import {
  buildCalculationRecord,
  saveCalculationToDb,
  softDeleteCalculationInDb,
  clearCalculatorHistoryInDb,
  updateCalculationMetadataInDb
} from '../core/historyService';
import { CalculatorHistoryDrawer } from '../history/CalculatorHistoryDrawer';
import { enqueueMutation } from '../../../services/outbox/outboxService';
import { generateIdempotencyKey } from '../../../services/integrations/centralgestMapper';
import { DaterraKeypadModal } from '../../../components/DaterraKeypad';
import { NozzleMicrolearningModal } from '../../nozzle-comparison/NozzleMicrolearningModal';
import { DebitoHeader } from './DebitoHeader';
import { DebitoResultCard } from './DebitoResultCard';
import { DebitoIsoSelector } from './DebitoIsoSelector';
import { DebitoInputs } from './DebitoInputs';
import { DebitoFooterBar } from './DebitoFooterBar';

export const DebitoTrabalhoView: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCode, setSelectedCode] = useState<string>('02'); // ISO 02 Amarelo por omissão
  const [pressureBar, setPressureBar] = useState<number>(3.0);
  const [isKeypadOpen, setIsKeypadOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handleSaveToHistory = async () => {
    try {
      if (!flowResult.isValid) {
        setToastMessage('Insira valores válidos de pressão antes de gravar.');
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      // 1. Criação do registo estruturado para calculation_history_v2
      const { inputs, outputs } = buildDebitoStructuredValues(selectedNozzle, pressureBar, flowResult);
      const record = buildCalculationRecord({
        userId: 'local-user',
        calculatorId: 'calc_tabelas_debito',
        calculatorVersion: '1.0.0',
        name: `Bico ISO ${selectedNozzle.code} (${selectedNozzle.namePt}): ${flowResult.flowLMin} L/min @ ${pressureBar} bar`,
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
          calculatorId: 'calc_tabelas_debito',
          isoCode: selectedNozzle.code,
          colorName: selectedNozzle.namePt,
          nominalFlow3Bar: selectedNozzle.nominalFlow3Bar,
          pressureBar,
          flowLMin: flowResult.flowLMin,
          flowMinLMin: flowResult.flowMinLMin,
          flowMaxLMin: flowResult.flowMaxLMin,
          timestamp: new Date().toISOString()
        }
      });

      setToastMessage('Calibração de bico gravada e enfileirada na Outbox offline!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Erro ao gravar calibração de bico:', err);
      setToastMessage('Erro ao gravar a calibração.');
      setTimeout(() => setToastMessage(null), 3000);
    }
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
