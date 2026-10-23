import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sliders, TableProperties, LineChart, Bookmark, History, BookOpen, Edit2 } from 'lucide-react';
import { NozzleComparisonTopCard } from './NozzleComparisonTopCard';
import { NozzleSelectorDrawer } from './NozzleSelectorDrawer';
import { NozzleCurvesModal } from './NozzleCurvesModal';
import { NozzleComparisonMatrixModal } from './NozzleComparisonMatrixModal';
import { NozzleComparisonMatrixCard } from './NozzleComparisonMatrixCard';
import { NozzleMicrolearningModal } from './NozzleMicrolearningModal';
import { NozzleComparisonHistoryModal } from './NozzleComparisonHistoryModal';
import { NozzleFindAlternatives } from './NozzleFindAlternatives';
import { DaterraKeypadModal } from '../../components/DaterraKeypad';
import { NOZZLES_BY_ID, NOZZLES_DATABASE } from './nozzleComparison.data';
import { calculateNozzleFlow, compareNozzles, formatPt, getNozzleColorPresentation } from './nozzleComparison.calculations';
import type { Nozzle, ActiveComparisonMode } from './nozzleComparison.types';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';

function getAvailableAnglesForModel(brand?: string, model?: string): string {
  if (!brand || !model) return '';
  const angles = new Set<number>();
  NOZZLES_DATABASE.forEach(n => {
    if (n.brand === brand && n.model === model && n.sprayAngleDeg) {
      const num = Number(n.sprayAngleDeg);
      if (!isNaN(num) && num > 0) {
        angles.add(num);
      }
    }
  });
  if (angles.size === 0) return '';
  const sorted = Array.from(angles).sort((a, b) => b - a);
  return sorted.map(a => `${a}°`).join(', ');
}

function formatNozzleCodeText(nozzle?: Nozzle): string {
  if (!nozzle) return '—';
  const colorPart = nozzle.color || nozzle.disc || 'Ref';
  const codePart = nozzle.isoCode ? `(${nozzle.isoCode})` : '(ND)';
  return `${nozzle.brand} ${nozzle.model} ${colorPart} ${codePart}`;
}

export const NozzleComparisonMobileView: React.FC = () => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = React.useState<ActiveComparisonMode>('comparar');
  const [selectedNozzleIdA, setSelectedNozzleIdA] = React.useState<string>('albuz_atr_80_amarelo');
  const [selectedNozzleIdB, setSelectedNozzleIdB] = React.useState<string>('teejet_xr_110_verde');
  const [workingPressureBar, setWorkingPressureBar] = React.useState<number>(7.6);

  // Estados dos modais
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  const [drawerSide, setDrawerSide] = React.useState<'A' | 'B'>('A');
  const [isKeypadOpen, setIsKeypadOpen] = React.useState<boolean>(false);
  const [isCurvesOpen, setIsCurvesOpen] = React.useState<boolean>(false);
  const [isMatrixOpen, setIsMatrixOpen] = React.useState<boolean>(false);
  const [isMicrolearningOpen, setIsMicrolearningOpen] = React.useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState<boolean>(false);
  const [analysisTab, setAnalysisTab] = React.useState<'matrix' | 'chart'>('matrix');

  const nozzleA = React.useMemo(() => NOZZLES_BY_ID.get(selectedNozzleIdA), [selectedNozzleIdA]);
  const nozzleB = React.useMemo(() => NOZZLES_BY_ID.get(selectedNozzleIdB), [selectedNozzleIdB]);

  const presA = React.useMemo(() => getNozzleColorPresentation(nozzleA), [nozzleA]);
  const presB = React.useMemo(() => getNozzleColorPresentation(nozzleB), [nozzleB]);
  const anglesA = React.useMemo(() => getAvailableAnglesForModel(nozzleA?.brand, nozzleA?.model), [nozzleA]);
  const anglesB = React.useMemo(() => getAvailableAnglesForModel(nozzleB?.brand, nozzleB?.model), [nozzleB]);

  const flowA = React.useMemo(() => nozzleA ? calculateNozzleFlow(nozzleA, workingPressureBar) : undefined, [nozzleA, workingPressureBar]);
  const flowB = React.useMemo(() => nozzleB ? calculateNozzleFlow(nozzleB, workingPressureBar) : undefined, [nozzleB, workingPressureBar]);
  const comparison = React.useMemo(() => (flowA && flowB) ? compareNozzles(flowA, flowB) : undefined, [flowA, flowB]);

  const openDrawer = (side: 'A' | 'B') => {
    setDrawerSide(side);
    setIsDrawerOpen(true);
  };

  const handleSwapNozzles = () => {
    const tmp = selectedNozzleIdA;
    setSelectedNozzleIdA(selectedNozzleIdB);
    setSelectedNozzleIdB(tmp);
  };

  const handleSelectAlternative = (refId: string, altId: string, pBar: number) => {
    setSelectedNozzleIdA(refId);
    setSelectedNozzleIdB(altId);
    setWorkingPressureBar(pBar);
    setActiveMode('comparar');
  };

  // Contagem reativa do histórico em IndexedDB
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

  return (
    <div
      className="space-y-3.5 animate-fade-in font-sans"
      style={{ paddingBottom: 'calc(var(--bottom-nav-total-height, 5rem) + 4.75rem)' }}
    >
      {/* Topo: Voltar e Badge de Ferramenta Ativa */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/ferramentas')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-daterra-primary transition-colors py-1 px-2 rounded-lg hover:bg-slate-200/50"
        >
          <ChevronLeft className="w-4 h-4 text-daterra-primary" />
          <span>Voltar às Ferramentas</span>
        </button>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
          Ferramenta Ativa
        </span>
      </div>

      {/* Título e Categoria */}
      <div>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
          Calibração de Bicos
        </span>
        <h1 className="text-xl font-black text-daterra-primary leading-tight">
          Tabelas de Débito (Comparador)
        </h1>
      </div>

      {/* Cartão de Topo: Comparação de Bicos */}
      <NozzleComparisonTopCard
        nozzleA={nozzleA}
        nozzleB={nozzleB}
        flowA={flowA}
        flowB={flowB}
        workingPressureBar={workingPressureBar}
        onSwapNozzles={handleSwapNozzles}
      />

      {/* Seletor de Modo: Comparar 2 Bicos vs Encontrar Alternativas */}
      <div className="flex gap-2 p-1 bg-slate-200/70 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveMode('comparar')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeMode === 'comparar'
              ? 'bg-[#114037] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Comparar 2 Bicos
        </button>
        <button
          type="button"
          onClick={() => setActiveMode('alternativas')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeMode === 'alternativas'
              ? 'bg-[#114037] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Encontrar Alternativas
        </button>
      </div>

      {/* Conteúdo do Modo Ativo */}
      {activeMode === 'alternativas' ? (
        <NozzleFindAlternatives
          initialRefNozzleId={selectedNozzleIdA}
          initialPressureBar={workingPressureBar}
          onSelectForComparison={handleSelectAlternative}
        />
      ) : (
        <div className="space-y-3.5">
          {/* Cartão: Valores Introduzidos */}
          <div className="bg-white rounded-2xl shadow-soft p-4 border border-slate-200 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                Valores Introduzidos
              </span>
              <Sliders className="w-4 h-4 text-slate-400" />
            </div>

            {/* Linha 1: Pressão de Trabalho (Slider + Teclado) */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#114037]" />
                  <span className="text-xs font-bold text-slate-800">Pressão de Trabalho</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsKeypadOpen(true)}
                  className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-0.5 rounded-md hover:border-[#114037] transition-colors"
                >
                  <span className="text-xs font-mono font-bold text-[#114037]">{formatPt(workingPressureBar)} bar</span>
                  <Edit2 className="w-3 h-3 text-slate-500" />
                </button>
              </div>
              <div className="flex items-center gap-3 px-1">
                <input
                  type="range"
                  min="1.0"
                  max="30.0"
                  step="0.1"
                  value={workingPressureBar}
                  onChange={e => setWorkingPressureBar(Number(e.target.value))}
                  className="w-full accent-[#114037] h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span className="text-xs font-mono font-semibold text-slate-500 shrink-0">30 bar</span>
              </div>
            </div>

            {/* Linha 2: Bico A */}
            <div
              onClick={() => openDrawer('A')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer border border-slate-100"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs"
                  style={{
                    backgroundColor: `${presA.hex}18`,
                    borderColor: presA.hex
                  }}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-white shadow-xs"
                    style={{ backgroundColor: presA.hex }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {nozzleA ? `${nozzleA.brand} ${nozzleA.model}` : 'Selecionar Bico A'}
                    </span>
                    {anglesA && (
                      <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 bg-slate-200/80 text-slate-700 rounded">
                        [{anglesA}]
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1 flex-wrap mt-0.5">
                    <span className="font-semibold text-slate-800">
                      {formatNozzleCodeText(nozzleA)}
                    </span>
                    <span className="text-slate-400">•</span>
                    <strong className="text-[#114037] font-mono">{formatPt(nozzleA?.nominalFlowLMin)} L/min</strong>
                  </div>
                </div>
              </div>
              <Edit2 className="w-4 h-4 text-slate-400 shrink-0" />
            </div>

            {/* Linha 3: Bico B */}
            <div
              onClick={() => openDrawer('B')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer border border-slate-100"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs"
                  style={{
                    backgroundColor: `${presB.hex}18`,
                    borderColor: presB.hex
                  }}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-white shadow-xs"
                    style={{ backgroundColor: presB.hex }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {nozzleB ? `${nozzleB.brand} ${nozzleB.model}` : 'Selecionar Bico B'}
                    </span>
                    {anglesB && (
                      <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 bg-slate-200/80 text-slate-700 rounded">
                        [{anglesB}]
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1 flex-wrap mt-0.5">
                    <span className="font-semibold text-slate-800">
                      {formatNozzleCodeText(nozzleB)}
                    </span>
                    <span className="text-slate-400">•</span>
                    <strong className="text-[#114037] font-mono">{formatPt(nozzleB?.nominalFlowLMin)} L/min</strong>
                  </div>
                </div>
              </div>
              <Edit2 className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          </div>

          {/* Tabs: Matriz Comparativa vs Gráfico Comparativo */}
          <div className="grid grid-cols-2 gap-2 bg-slate-200/70 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setAnalysisTab('matrix')}
              className={`h-11 rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                analysisTab === 'matrix' ? 'bg-[#114037] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableProperties className="w-4 h-4" />
              <span>Matriz Comparativa</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAnalysisTab('chart');
                setIsCurvesOpen(true);
              }}
              className={`h-11 rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                analysisTab === 'chart' ? 'bg-[#114037] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LineChart className="w-4 h-4" />
              <span>Gráfico Comparativo</span>
            </button>
          </div>

          {/* Cartão Inline: Matriz Comparativa */}
          <NozzleComparisonMatrixCard
            nozzleA={nozzleA}
            nozzleB={nozzleB}
            flowA={flowA}
            flowB={flowB}
            onOpenDetailsModal={() => setIsMatrixOpen(true)}
          />
        </div>
      )}

      {/* Barra de Ações Fixa no Rodapé (posicionada sobre a BottomNavigationBar) */}
      <aside
        aria-label="Ações da ferramenta"
        className="fixed bottom-[var(--bottom-nav-total-height,5rem)] md:bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-2.5 z-35 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      >
        <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="h-12 bg-[#3CA64C] hover:bg-[#349142] text-white rounded-xl text-xs font-bold shadow-md flex flex-col items-center justify-center gap-0.5 active:scale-98 transition-all"
          >
            <Bookmark className="w-4 h-4" />
            <span>Guardar</span>
          </button>
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="h-12 bg-slate-100 hover:bg-slate-200 text-[#114037] rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-colors"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Histórico ({historyCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setIsMicrolearningOpen(true)}
            className="h-12 bg-slate-100 hover:bg-slate-200 text-[#114037] rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-slate-500" />
            <span>Guia</span>
          </button>
        </div>
      </aside>

      {/* Modais Integrados */}
      <NozzleSelectorDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        side={drawerSide}
        currentNozzleId={drawerSide === 'A' ? selectedNozzleIdA : selectedNozzleIdB}
        onSelectNozzle={id => drawerSide === 'A' ? setSelectedNozzleIdA(id) : setSelectedNozzleIdB(id)}
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

      <NozzleComparisonMatrixModal
        isOpen={isMatrixOpen}
        onClose={() => setIsMatrixOpen(false)}
        nozzleA={nozzleA}
        nozzleB={nozzleB}
        flowA={flowA}
        flowB={flowB}
        comparison={comparison}
        workingPressureBar={workingPressureBar}
      />

      <NozzleMicrolearningModal
        isOpen={isMicrolearningOpen}
        onClose={() => setIsMicrolearningOpen(false)}
      />

      <NozzleComparisonHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onLoadComparison={(nA, nB, pBar) => {
          setSelectedNozzleIdA(nA);
          setSelectedNozzleIdB(nB);
          setWorkingPressureBar(pBar);
          setActiveMode('comparar');
        }}
        currentFlowA={flowA}
        currentFlowB={flowB}
        currentComparison={comparison}
        currentPressureBar={workingPressureBar}
      />

      <DaterraKeypadModal
        isOpen={isKeypadOpen}
        onClose={() => setIsKeypadOpen(false)}
        initialValue={String(workingPressureBar)}
        initialUnit="bar"
        availableUnits={['bar']}
        commonValues={[2.0, 3.0, 5.0, 7.6, 10.0, 15.0, 20.0, 25.0, 30.0]}
        label="Pressão de Trabalho"
        validationRules={{ min: 0.5, max: 30.0 }}
        onConfirm={val => {
          setWorkingPressureBar(val);
          setIsKeypadOpen(false);
        }}
      />
    </div>
  );
};
