import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  CheckCircle2,
  History,
  Beaker,
  ArrowRight,
  Droplets,
  Bookmark,
  RotateCcw
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
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

  // Modais
  const [isJarTestOpen, setIsJarTestOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Contagem de histórico local em tempo real
  const historyCount =
    useLiveQuery(async () => {
      try {
        if (!db || !db.mix_history) return 0;
        return await db.mix_history.count();
      } catch {
        return 0;
      }
    }, []) ?? 0;

  // Geração do Motor de Sequência de Mistura (100% intacto)
  const sequenceAnalysis = useMemo(() => {
    return generateMixingSequence(selectedIds, tankCapacityL);
  }, [selectedIds, tankCapacityL]);

  // Passos apenas de produtos (sem água) para resumo visual no cartão verde
  const productSteps = useMemo(() => {
    return sequenceAnalysis.steps.filter((s) => !s.isWater);
  }, [sequenceAnalysis.steps]);

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
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleRemoveFormulation = (id: string) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleReset = () => {
    setSelectedIds([]);
    setTankCapacityL(1000);
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
    setToastMessage('Mistura carregada do histórico!');
    setTimeout(() => setToastMessage(null), 3000);
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

      {/* 1. CABEÇALHO DA FERRAMENTA (PADRÃO COMPARADOR DE BICOS) */}
      <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/ferramentas')}
            aria-label="Voltar ao catálogo de ferramentas"
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-daterra-primary" />
            <span>Voltar</span>
          </button>
          <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-daterra-primary leading-tight">
                Ordem de Mistura
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Ferramenta Ativa
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Ordem técnica W.A.L.E.S., volume de água e compatibilidade física • Norma DGAV
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <DidacticHelp
            faqFile="MisturaFAQGeral.md"
            topic="mistura-geral"
            buttonLabel="Microlearning"
            variant="button"
            iconType="help"
            className="px-2.5 py-1.5 !bg-emerald-50 hover:!bg-emerald-100 !text-daterra-primary border border-emerald-200 !rounded-lg !text-xs !font-bold shadow-xs"
          />

          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            aria-label="Abrir histórico local de misturas"
            className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-sky-700" />
            <span className="hidden sm:inline">Histórico ({historyCount})</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            aria-label="Reiniciar mistura"
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>

      {/* 2. CARTÃO VERDE ESCURO (#114037) — RESUMO DA CALDA E ORDEM RÁPIDA */}
      <div className="bg-[#114037] text-white p-3.5 sm:p-4 rounded-2xl md:rounded-3xl shadow-md border border-emerald-900/40 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a2d0c3]">
            Protocolo W.A.L.E.S. • Resumo de Preparação da Calda
          </span>
          <button
            type="button"
            onClick={() => setIsJarTestOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] sm:text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Beaker className="w-3.5 h-3.5 text-[#8ffa94]" />
            <span>Teste de Jarra</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
          {/* Bloco 1: Água Inicial */}
          <div className="bg-[#1b554a]/75 p-3 sm:p-4 rounded-xl border border-white/10 flex flex-col justify-between items-center text-center gap-1.5">
            <span className="text-xs font-bold text-slate-100 tracking-tight">
              1. Água Inicial (~50%)
            </span>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-mono text-[#8ffa94] tracking-tight leading-none">
                {sequenceAnalysis.waterInitialL ?? 500}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-200">L</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#8ffa94]/20 text-[#8ffa94] border border-[#8ffa94]/30">
              <Droplets className="w-3 h-3" />
              <span>Iniciar agitação</span>
            </span>
          </div>

          {/* Bloco 2: Ordem de Entrada dos Produtos */}
          <div className="bg-[#1b554a]/75 p-3 sm:p-4 rounded-xl border border-white/10 flex flex-col justify-between items-center text-center gap-2">
            <span className="text-xs font-bold text-slate-100 tracking-tight">
              2. Ordem de Entrada ({productSteps.length} {productSteps.length === 1 ? 'Produto' : 'Produtos'})
            </span>

            {productSteps.length > 0 ? (
              <div className="flex items-center justify-center gap-1 flex-wrap py-1">
                {productSteps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <span className="px-2 py-0.5 rounded-md font-mono text-xs font-black bg-[#114037] text-[#8ffa94] border border-[#8ffa94]/30">
                      {step.sigla}
                    </span>
                    {index < productSteps.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-[#a2d0c3] shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-300 italic py-2">
                Nenhuma formulação selecionada
              </span>
            )}

            <span className="text-[10px] font-semibold text-[#a2d0c3] uppercase tracking-wider">
              Sequência Cronológica Automática
            </span>
          </div>

          {/* Bloco 3: Água Final */}
          <div className="bg-[#1b554a]/75 p-3 sm:p-4 rounded-xl border border-white/10 flex flex-col justify-between items-center text-center gap-1.5">
            <span className="text-xs font-bold text-slate-100 tracking-tight">
              3. Água Final (~50%)
            </span>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-mono text-[#8ffa94] tracking-tight leading-none">
                {sequenceAnalysis.waterFinalL ?? 500}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-200">L</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <span>Completar volume</span>
            </span>
          </div>
        </div>

        {/* Rodapé do Cartão Verde */}
        <div className="flex items-center justify-between text-xs text-slate-200 pt-1 border-t border-white/10">
          <span className="font-medium text-[11px]">Capacidade de referência do depósito</span>
          <span className="font-mono font-bold text-white bg-[#1b554a] px-2 py-0.5 rounded text-xs">
            {tankCapacityL} L • Agitação Contínua
          </span>
        </div>
      </div>

      {/* 3. CONTEÚDO PRINCIPAL (DIVULGAÇÃO PROGRESSIVA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Coluna Esquerda (5 cols): Formulações Introduzidas + Botão para Modal/Gaveta */}
        <div className="lg:col-span-5">
          <FormulationSelector
            selectedIds={selectedIds}
            onToggleFormulation={handleToggleFormulation}
            onSelectMultiple={handleSelectMultiple}
            onClearSelection={handleClearSelection}
          />
        </div>

        {/* Coluna Direita (7 cols): Calibração do Depósito + Linha Cronológica em Acordeão */}
        <div className="lg:col-span-7">
          <MixingSequenceDisplay
            analysis={sequenceAnalysis}
            tankCapacityL={tankCapacityL}
            onTankCapacityChange={setTankCapacityL}
            onSaveToHistory={handleSaveToHistory}
            onOpenJarTest={() => setIsJarTestOpen(true)}
            onRemoveFormulation={handleRemoveFormulation}
            onReset={handleReset}
          />
        </div>
      </div>

      {/* 4. BARRA DE RODAPÉ FIXA OFICIAL (PADRÃO DATERRA SMART) */}
      <aside
        aria-label="Ações da ferramenta"
        className="fixed bottom-[var(--bottom-nav-total-height,5rem)] md:bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-2.5 z-35 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      >
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleSaveToHistory}
            className="h-12 bg-[#3CA64C] hover:bg-[#349142] text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
          >
            <Bookmark className="w-4 h-4" />
            <span>Guardar</span>
          </button>
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="h-12 bg-slate-100 hover:bg-slate-200 text-[#114037] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Histórico ({historyCount})</span>
          </button>
          <div className="h-12">
            <DidacticHelp
              faqFile="MisturaFAQGeral.md"
              topic="mistura-geral"
              buttonLabel="Guia"
              variant="button"
              iconType="info"
              className="w-full h-12 !bg-slate-100 hover:!bg-slate-200 !text-[#114037] !rounded-xl !text-xs !font-bold flex items-center justify-center gap-2 !border-0 !shadow-none"
            />
          </div>
        </div>
      </aside>

      {/* 5. MODAIS */}
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
