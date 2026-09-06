import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  CheckCircle2,
  Layers,
  History,
  Beaker,
  ArrowRight,
  Droplets
} from 'lucide-react';
import { db } from '../db/db';
import {
  FormulationSelector,
  MixingSequenceDisplay,
  JarTestModal,
  MixHistoryModal,
  generateMixingSequence
} from '../features/mistura';
import { DidacticHelp } from '../features/concentracao/DidacticHelp';

export const MisturaView: React.FC = () => {
  const navigate = useNavigate();

  // Estados principais de seleção
  const [selectedIds, setSelectedIds] = useState<string[]>(['PH', 'WG', 'SC', 'EC', 'MOL']);
  const [tankCapacityL, setTankCapacityL] = useState<number>(1000);

  // Tab ativa em ecrãs móveis ('selecao' | 'sequencia')
  const [activeTab, setActiveTab] = useState<'selecao' | 'sequencia'>('sequencia');

  // Modais
  const [isJarTestOpen, setIsJarTestOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Geração do Motor de Sequência de Mistura
  const sequenceAnalysis = useMemo(() => {
    return generateMixingSequence(selectedIds, tankCapacityL);
  }, [selectedIds, tankCapacityL]);

  // Manipuladores de Seleção de Formulações
  const handleToggleFormulation = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectMultiple = (ids: string[]) => {
    setSelectedIds(ids);
    setActiveTab('sequencia');
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleRemoveFormulation = (id: string) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleReset = () => {
    setSelectedIds([]);
    setActiveTab('selecao');
  };

  // Guardar no Histórico IndexedDB (Dexie)
  const handleSaveToHistory = async () => {
    try {
      if (selectedIds.length === 0) {
        setToastMessage('Selecione pelo menos uma formulação antes de gravar no histórico.');
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      await db.mix_history.add({
        date: new Date().toISOString(),
        title: `Calda ${tankCapacityL} L (${selectedIds.length} produtos)`,
        selected_formulation_ids: selectedIds,
        tank_capacity_l: tankCapacityL,
        water_initial_l: sequenceAnalysis.waterInitialL,
        water_final_l: sequenceAnalysis.waterFinalL
      });

      setToastMessage('Receita de calda gravada com sucesso no Histórico!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Erro ao guardar mistura no histórico:', err);
      setToastMessage('Ocorreu um erro ao gravar no histórico.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Carregar do Histórico
  const handleLoadMixFromHistory = (formulationIds: string[], capacityL?: number) => {
    setSelectedIds(formulationIds);
    if (capacityL) {
      setTankCapacityL(capacityL);
    }
    setActiveTab('sequencia');
    setToastMessage('Mistura carregada do histórico!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-12 animate-fade-in max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#114037] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#3CA64C]/40 font-extrabold text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#3AAA35] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Barra Superior de Regresso e Ferramenta */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/ferramentas')}
            className="min-h-[44px] p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all flex items-center gap-1.5 text-xs font-bold touch-target active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 text-[#114037]" />
            <span>Voltar às Ferramentas</span>
          </button>
          <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1D734B]">
                Pulverização & Caldas
              </span>
              <span className="text-[10px] text-slate-400">• Norma DGAV</span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-[#114037] leading-tight">
              Guia de Sequência de Mistura
            </h1>
          </div>
        </div>

        {/* Ações Rápidas: Microlearning Geral, Teste de Jarra e Histórico */}
        <div className="flex items-center gap-2 flex-wrap">
          <DidacticHelp
            faqFile="MisturaFAQGeral.md"
            topic="mistura-geral"
            buttonLabel="Microlearning"
            variant="button"
            iconType="help"
          />

          <button
            type="button"
            onClick={() => setIsJarTestOpen(true)}
            className="min-h-[44px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold touch-target active:scale-95 border border-slate-200"
          >
            <Beaker className="w-4 h-4 text-[#1D734B]" />
            <span className="hidden sm:inline">Teste de Jarra</span>
          </button>

          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="min-h-[44px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold touch-target active:scale-95 border border-slate-200"
          >
            <History className="w-4 h-4 text-[#1D734B]" />
            <span>Histórico</span>
          </button>
        </div>
      </div>

      {/* 2. Alternador de Vistas Mobile (Tabs) */}
      <div className="lg:hidden">
        <div className="grid grid-cols-2 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300">
          <button
            type="button"
            onClick={() => setActiveTab('selecao')}
            className={`min-h-[48px] py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 touch-target ${
              activeTab === 'selecao'
                ? 'bg-[#114037] text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Selecionar ({selectedIds.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sequencia')}
            className={`min-h-[48px] py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 touch-target ${
              activeTab === 'sequencia'
                ? 'bg-[#114037] text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Droplets className="w-4 h-4 text-[#3AAA35]" />
            <span>2. Ver Sequência</span>
          </button>
        </div>
      </div>

      {/* 3. Estrutura Principal de Layout (Desktop: 2 Colunas / Mobile: Tabs) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna 1: Seletor de Formulações */}
        <div className={`lg:col-span-5 ${activeTab === 'selecao' ? 'block' : 'hidden lg:block'}`}>
          <FormulationSelector
            selectedIds={selectedIds}
            onToggleFormulation={handleToggleFormulation}
            onSelectMultiple={handleSelectMultiple}
            onClearSelection={handleClearSelection}
          />
        </div>

        {/* Coluna 2: Sequência de Mistura e Resultados */}
        <div className={`lg:col-span-7 ${activeTab === 'sequencia' ? 'block' : 'hidden lg:block'}`}>
          {selectedIds.length === 0 ? (
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-soft text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#114037] flex items-center justify-center mx-auto border border-emerald-100">
                <Layers className="w-8 h-8 text-[#1D734B]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-slate-800">
                  Nenhuma formulação selecionada
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Selecione no painel à esquerda as formulações (ex: Regulador de pH, WP, WG, SC, EC, Molhante, etc.) para gerar a sequência cronológica de mistura da calda.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedIds(['PH', 'WG', 'SC', 'EC', 'MOL']);
                  setActiveTab('sequencia');
                }}
                className="min-h-[44px] px-5 py-2.5 bg-[#114037] hover:bg-[#1D734B] text-white text-xs font-bold rounded-xl transition-all shadow-md touch-target"
              >
                Carregar Exemplo de Calda
              </button>
            </div>
          ) : (
            <MixingSequenceDisplay
              analysis={sequenceAnalysis}
              tankCapacityL={tankCapacityL}
              onTankCapacityChange={setTankCapacityL}
              onSaveToHistory={handleSaveToHistory}
              onOpenJarTest={() => setIsJarTestOpen(true)}
              onRemoveFormulation={handleRemoveFormulation}
              onReset={handleReset}
            />
          )}
        </div>
      </div>

      {/* 4. Barra Fixa Inferior Mobile para Alternar Rapidamente */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 flex items-center justify-between gap-3 shadow-lg">
        <div>
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Formulações</span>
          <span className="text-xs font-extrabold text-[#114037]">
            {selectedIds.length} selecionadas ({tankCapacityL} L)
          </span>
        </div>

        {activeTab === 'selecao' ? (
          <button
            type="button"
            onClick={() => setActiveTab('sequencia')}
            className="min-h-[48px] px-5 py-2.5 bg-[#114037] text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-1.5 touch-target active:scale-95"
          >
            <span>Ver Sequência</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setActiveTab('selecao')}
            className="min-h-[48px] px-5 py-2.5 bg-slate-100 text-slate-800 border border-slate-300 text-xs font-extrabold rounded-xl shadow-xs flex items-center gap-1.5 touch-target active:scale-95"
          >
            <Layers className="w-4 h-4" />
            <span>Adicionar Produtos</span>
          </button>
        )}
      </div>

      {/* Modais */}
      <JarTestModal
        isOpen={isJarTestOpen}
        onClose={() => setIsJarTestOpen(false)}
      />

      <MixHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onLoadMix={handleLoadMixFromHistory}
      />
    </div>
  );
};

export default MisturaView;
