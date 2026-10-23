import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  RotateCcw,
  ShieldCheck,
  Scale,
  GraduationCap,
  History,
  Search,
  Bookmark,
  BookOpen
} from 'lucide-react';
import { NozzleComparisonTopCard } from './NozzleComparisonTopCard';
import { NozzleComparisonDesktopContent } from './NozzleComparisonDesktopContent';
import { NozzleSelectorDrawer } from './NozzleSelectorDrawer';
import { NozzleComparisonMatrixModal } from './NozzleComparisonMatrixModal';
import { NozzleMicrolearningModal } from './NozzleMicrolearningModal';
import { NozzleComparisonHistoryModal } from './NozzleComparisonHistoryModal';
import { NozzleCurvesModal } from './NozzleCurvesModal';
import { NozzleFindAlternatives } from './NozzleFindAlternatives';
import { NOZZLES_BY_ID } from './nozzleComparison.data';
import { calculateNozzleFlow, compareNozzles } from './nozzleComparison.calculations';
import { NozzleComparisonMobileView } from './NozzleComparisonMobileView';
import type { Nozzle, ActiveComparisonMode } from './nozzleComparison.types';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';

export const NozzleComparisonView: React.FC = () => {
  const navigate = useNavigate();

  // Detetar viewport mobile para renderizar a interface dedicada de smartphone (< 768px)
  const [isMobile, setIsMobile] = React.useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Modo Ativo: 'comparar' ou 'alternativas'
  const [activeMode, setActiveMode] = React.useState<ActiveComparisonMode>('comparar');

  // Estados de Seleção
  const [selectedNozzleIdA, setSelectedNozzleIdA] = React.useState<string>('albuz_atr_80_amarelo');
  const [selectedNozzleIdB, setSelectedNozzleIdB] = React.useState<string>('teejet_xr_110_verde');
  const [workingPressureBar, setWorkingPressureBar] = React.useState<number>(7.6);

  // Modais e Gavetas
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  const [drawerSide, setDrawerSide] = React.useState<'A' | 'B'>('A');
  const [isMatrixOpen, setIsMatrixOpen] = React.useState<boolean>(false);
  const [isCurvesOpen, setIsCurvesOpen] = React.useState<boolean>(false);
  const [isMicrolearningOpen, setIsMicrolearningOpen] = React.useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState<boolean>(false);

  // Objetos Nozzle Resolvidos
  const nozzleA: Nozzle | undefined = React.useMemo(() => {
    return NOZZLES_BY_ID.get(selectedNozzleIdA);
  }, [selectedNozzleIdA]);

  const nozzleB: Nozzle | undefined = React.useMemo(() => {
    return NOZZLES_BY_ID.get(selectedNozzleIdB);
  }, [selectedNozzleIdB]);

  // Cálculos Hidráulicos de Fluxo
  const flowA = React.useMemo(() => {
    if (!nozzleA) return undefined;
    return calculateNozzleFlow(nozzleA, workingPressureBar);
  }, [nozzleA, workingPressureBar]);

  const flowB = React.useMemo(() => {
    if (!nozzleB) return undefined;
    return calculateNozzleFlow(nozzleB, workingPressureBar);
  }, [nozzleB, workingPressureBar]);

  const comparisonResult = React.useMemo(() => {
    if (!flowA || !flowB) return undefined;
    return compareNozzles(flowA, flowB);
  }, [flowA, flowB]);

  // Ação: Trocar Bico A e Bico B
  const handleSwapNozzles = () => {
    const tempId = selectedNozzleIdA;
    setSelectedNozzleIdA(selectedNozzleIdB);
    setSelectedNozzleIdB(tempId);
  };

  // Ação: Reiniciar Seleção
  const handleReset = () => {
    setSelectedNozzleIdA('');
    setSelectedNozzleIdB('');
    setWorkingPressureBar(3.0);
  };

  // Ação: Carregar Comparação do Histórico
  const handleLoadFromHistory = (nIdA: string, nIdB: string, pBar: number) => {
    setSelectedNozzleIdA(nIdA);
    setSelectedNozzleIdB(nIdB);
    setWorkingPressureBar(pBar);
    setActiveMode('comparar');
  };

  // Ação: Selecionar Alternativa e comutar para o Modo Comparar
  const handleSelectAlternativeForComparison = (
    refId: string,
    altId: string,
    pressureBar: number
  ) => {
    setSelectedNozzleIdA(refId);
    setSelectedNozzleIdB(altId);
    setWorkingPressureBar(pressureBar);
    setActiveMode('comparar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Contagem de histórico local
  const historyCount = useLiveQuery(
    async () => {
      try {
        if (!db || !db.calculation_history) return 0;
        return await db.calculation_history
          .where('calculator_type')
          .equals('comparador_bicos' as any)
          .count();
      } catch (err) {
        console.error('Erro ao consultar histórico:', err);
        return 0;
      }
    },
    []
  ) ?? 0;

  if (isMobile) {
    return <NozzleComparisonMobileView />;
  }

  return (
    <div className="space-y-4 pb-28 md:pb-24 animate-fade-in font-sans max-w-6xl mx-auto">
      
      {/* 1. CABEÇALHO DA FERRAMENTA (PADRÃO CALCULADORA DE CONCENTRAÇÃO) */}
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
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-daterra-primary leading-tight">
                Tabelas de Débito (Comparador)
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Ferramenta Ativa
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Compare desempenho, débito e espectro de gotas lado a lado.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setIsMicrolearningOpen(true)}
            aria-label="Abrir guia agronómico"
            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-daterra-primary border border-emerald-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5 text-daterra-accent" />
            <span className="hidden sm:inline">Microlearning</span>
          </button>

          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            aria-label="Abrir histórico local de comparações"
            className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-sky-700" />
            <span className="hidden sm:inline">Histórico ({historyCount})</span>
          </button>

          {activeMode === 'comparar' && (
            <button
              type="button"
              onClick={handleReset}
              aria-label="Reiniciar seleções do comparador"
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reiniciar</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. CARTÃO VERDE ESCURO (#114037) — COMPARAÇÃO DE BICOS COM ESPECTRO DV10/DV50/DV90 */}
      <NozzleComparisonTopCard
        nozzleA={nozzleA}
        nozzleB={nozzleB}
        flowA={flowA}
        flowB={flowB}
        workingPressureBar={workingPressureBar}
        onSwapNozzles={handleSwapNozzles}
      />

      {/* 3. SELETOR DE MODO (TABS) */}
      <div className="grid grid-cols-2 gap-2 bg-slate-200/60 p-1 rounded-2xl max-w-xl mx-auto w-full">
        <button
          type="button"
          onClick={() => setActiveMode('comparar')}
          className={`py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeMode === 'comparar'
              ? 'bg-[#114037] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Comparar 2 Bicos</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMode('alternativas')}
          className={`py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeMode === 'alternativas'
              ? 'bg-[#114037] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Encontrar Alternativas</span>
        </button>
      </div>

      {/* 4. CONTEÚDO DO MODO SELECIONADO */}
      {activeMode === 'alternativas' ? (
        <NozzleFindAlternatives
          initialRefNozzleId={selectedNozzleIdA || 'albuz_atr_80_amarelo'}
          initialPressureBar={workingPressureBar}
          onSelectForComparison={handleSelectAlternativeForComparison}
        />
      ) : (
        <NozzleComparisonDesktopContent
          nozzleA={nozzleA}
          nozzleB={nozzleB}
          flowA={flowA}
          flowB={flowB}
          workingPressureBar={workingPressureBar}
          onChangePressure={setWorkingPressureBar}
          onEditNozzleA={() => {
            setDrawerSide('A');
            setIsDrawerOpen(true);
          }}
          onEditNozzleB={() => {
            setDrawerSide('B');
            setIsDrawerOpen(true);
          }}
          onOpenMatrixModal={() => setIsMatrixOpen(true)}
        />
      )}

      {/* 5. AVISO TÉCNICO NO FINAL */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl text-xs text-slate-600 leading-relaxed space-y-1">
        <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-daterra-primary" />
          Aviso Técnico DATERRA Smart
        </span>
        <p>
          Esta ferramenta fornece referências de débito baseadas nos catálogos técnicos oficiais e nas leis físicas da hidráulica. Confirme sempre a calibração com água limpa no pulverizador antes de qualquer tratamento fitossanitário.
        </p>
      </div>

      {/* 6. BARRA DE RODAPÉ FIXA OFICIAL (PADRÃO DATERRA SMART) */}
      <aside
        aria-label="Ações da ferramenta"
        className="fixed bottom-[var(--bottom-nav-total-height,5rem)] md:bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-2.5 z-35 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      >
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
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
          <button
            type="button"
            onClick={() => setIsMicrolearningOpen(true)}
            className="h-12 bg-slate-100 hover:bg-slate-200 text-[#114037] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-slate-500" />
            <span>Guia</span>
          </button>
        </div>
      </aside>

      {/* 7. MODAIS E GAVETAS */}
      <NozzleSelectorDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        side={drawerSide}
        currentNozzleId={drawerSide === 'A' ? selectedNozzleIdA : selectedNozzleIdB}
        onSelectNozzle={id => drawerSide === 'A' ? setSelectedNozzleIdA(id) : setSelectedNozzleIdB(id)}
      />

      <NozzleComparisonMatrixModal
        isOpen={isMatrixOpen}
        onClose={() => setIsMatrixOpen(false)}
        nozzleA={nozzleA}
        nozzleB={nozzleB}
        flowA={flowA}
        flowB={flowB}
        comparison={comparisonResult}
        workingPressureBar={workingPressureBar}
      />

      <NozzleCurvesModal
        isOpen={isCurvesOpen}
        onClose={() => setIsCurvesOpen(false)}
        nozzleA={nozzleA}
        nozzleB={nozzleB}
        flowA={flowA}
        flowB={flowB}
        workingPressureBar={workingPressureBar}
      />

      <NozzleMicrolearningModal
        isOpen={isMicrolearningOpen}
        onClose={() => setIsMicrolearningOpen(false)}
      />

      <NozzleComparisonHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onLoadComparison={handleLoadFromHistory}
        currentFlowA={flowA}
        currentFlowB={flowB}
        currentComparison={comparisonResult}
        currentPressureBar={workingPressureBar}
      />
    </div>
  );
};

export default NozzleComparisonView;
