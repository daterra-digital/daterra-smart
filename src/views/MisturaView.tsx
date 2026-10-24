import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { enqueueMutation } from '../services/outbox/outboxService';
import { generateIdempotencyKey } from '../services/integrations/centralgestMapper';
import { DaterraKeypad } from '../components/DaterraKeypad';
import {
  FormulationSelector,
  MixingSequenceDisplay,
  JarTestModal,
  MixHistoryModal,
  generateMixingSequence
} from '../features/mistura';
import { MisturaHeader } from '../features/mistura/MisturaHeader';
import { MisturaResultCard } from '../features/mistura/MisturaResultCard';
import { MisturaFooterBar } from '../features/mistura/MisturaFooterBar';

export const MisturaView: React.FC = () => {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>(['PH', 'WG', 'SC', 'EC', 'MOL']);
  const [tankCapacityL, setTankCapacityL] = useState<number>(1000);
  const [isJarTestOpen, setIsJarTestOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isKeypadOpen, setIsKeypadOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const historyCount =
    useLiveQuery(async () => {
      try {
        if (!db || !db.mix_history) return 0;
        return await db.mix_history.count();
      } catch {
        return 0;
      }
    }, []) ?? 0;

  const sequenceAnalysis = useMemo(() => generateMixingSequence(selectedIds, tankCapacityL), [selectedIds, tankCapacityL]);
  const productSteps = useMemo(() => sequenceAnalysis.steps.filter((s) => !s.isWater), [sequenceAnalysis.steps]);

  const handleToggleFormulation = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleReset = () => {
    setSelectedIds([]);
    setTankCapacityL(1000);
  };

  // Submissão com Persistência First-Offline (Outbox Dexie v8)
  const handleSaveToHistory = async () => {
    try {
      if (selectedIds.length === 0) {
        setToastMessage('Selecione pelo menos uma formulação antes de gravar.');
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      // 1. Gravação no histórico local imediato
      await db.mix_history.add({
        date: new Date().toISOString(),
        title: `Calda ${tankCapacityL} L (${selectedIds.length} produtos)`,
        selected_formulation_ids: selectedIds,
        tank_capacity_l: tankCapacityL,
        water_initial_l: sequenceAnalysis.waterInitialL,
        water_final_l: sequenceAnalysis.waterFinalL
      });

      // 2. Persistência atómica na Mutation Outbox (Dexie v8) com idempotência UUIDv4
      await enqueueMutation({
        entityId: generateIdempotencyKey(),
        entityType: 'mixture',
        operation: 'CREATE',
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

  return (
    <div className="space-y-4 pb-28 md:pb-24 animate-fade-in font-sans max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#114037] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#3CA64C]/40 font-extrabold text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#3AAA35] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Topo: Navegação, Identificação e Ações */}
      <MisturaHeader
        onBack={() => navigate('/ferramentas')}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onReset={handleReset}
        historyCount={historyCount}
      />

      {/* 2. Cartão de Resultado Verde Oficial (#114037) com Números Grandes e Resumo W.A.L.E.S. */}
      <MisturaResultCard
        waterInitialL={sequenceAnalysis.waterInitialL ?? 500}
        waterFinalL={sequenceAnalysis.waterFinalL ?? 500}
        tankCapacityL={tankCapacityL}
        productSteps={productSteps}
        onOpenJarTest={() => setIsJarTestOpen(true)}
        onOpenKeypad={() => setIsKeypadOpen(true)}
      />

      {/* 3. Conteúdo Principal: Seletor de Formulações e Sequência com Ajuste Tátil */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-5">
          <FormulationSelector
            selectedIds={selectedIds}
            onToggleFormulation={handleToggleFormulation}
            onSelectMultiple={setSelectedIds}
            onClearSelection={() => setSelectedIds([])}
          />
        </div>

        <div className="lg:col-span-7">
          <MixingSequenceDisplay
            analysis={sequenceAnalysis}
            tankCapacityL={tankCapacityL}
            onTankCapacityChange={setTankCapacityL}
            onOpenKeypad={() => setIsKeypadOpen(true)}
            onSaveToHistory={handleSaveToHistory}
            onOpenJarTest={() => setIsJarTestOpen(true)}
            onRemoveFormulation={(id) => setSelectedIds((prev) => prev.filter((i) => i !== id))}
            onReset={handleReset}
          />
        </div>
      </div>

      {/* 4. Barra de Rodapé Fixa Oficial */}
      <MisturaFooterBar
        onSave={handleSaveToHistory}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyCount}
      />

      {/* 5. Bottom Sheet DaterraKeypad Tátil (Alvos >= 48x48 dp) */}
      <DaterraKeypad
        isOpen={isKeypadOpen}
        onClose={() => setIsKeypadOpen(false)}
        initialValue={String(tankCapacityL)}
        initialUnit="L"
        availableUnits={['L']}
        commonValues={[400, 600, 800, 1000, 1500, 2000, 3000]}
        label="Capacidade do Depósito"
        validationRules={{
          required: true,
          min: 100,
          max: 5000,
          allowDecimal: false,
          integerOnly: true,
          allowNegative: false
        }}
        onConfirm={(val) => {
          setTankCapacityL(Math.round(val));
          setIsKeypadOpen(false);
        }}
      />

      {/* 6. Modais Auxiliares */}
      <JarTestModal isOpen={isJarTestOpen} onClose={() => setIsJarTestOpen(false)} />
      <MixHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onLoadMix={(ids, cap) => {
          setSelectedIds(ids);
          if (cap) setTankCapacityL(cap);
        }}
      />
    </div>
  );
};

export default MisturaView;
