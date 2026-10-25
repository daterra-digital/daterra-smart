import React from 'react';
import { TableProperties, LineChart } from 'lucide-react';
import type { Nozzle, CalculatedNozzleFlow } from '../../../nozzle-comparison/nozzleComparison.types';
import { ComparadorVsCard } from './ComparadorVsCard';
import { ComparadorNozzleCards } from './ComparadorNozzleCards';
import { ComparadorSliderFitts } from './ComparadorSliderFitts';
import { NozzleComparisonMatrixCard } from '../../../nozzle-comparison/NozzleComparisonMatrixCard';
import { ComparadorCurvasGrafico } from './ComparadorCurvasGrafico';

export interface ModoComparadorViewProps {
  nozzleA?: Nozzle;
  nozzleB?: Nozzle;
  flowA?: CalculatedNozzleFlow;
  flowB?: CalculatedNozzleFlow;
  workingPressureBar: number;
  onChangePressure: (p: number) => void;
  onOpenKeypad: () => void;
  onSwapNozzles: () => void;
  onEditNozzleA: () => void;
  onEditNozzleB: () => void;
  onOpenMatrixModal: () => void;
}

export const ModoComparadorView: React.FC<ModoComparadorViewProps> = ({
  nozzleA,
  nozzleB,
  flowA,
  flowB,
  workingPressureBar,
  onChangePressure,
  onOpenKeypad,
  onSwapNozzles,
  onEditNozzleA,
  onEditNozzleB,
  onOpenMatrixModal
}) => {
  const [analysisTab, setAnalysisTab] = React.useState<'matrix' | 'chart'>('matrix');

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      {/* 1. Cartão Superior VS com Delta % e Gotas */}
      <ComparadorVsCard
        nozzleA={nozzleA}
        nozzleB={nozzleB}
        flowA={flowA}
        flowB={flowB}
        workingPressureBar={workingPressureBar}
        onSwapNozzles={onSwapNozzles}
      />

      {/* 2. Grelha de Configuração: Modelos Introduzidos & Pressão de Trabalho */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ComparadorNozzleCards
          nozzleA={nozzleA}
          nozzleB={nozzleB}
          onEditNozzleA={onEditNozzleA}
          onEditNozzleB={onEditNozzleB}
        />
        <ComparadorSliderFitts
          workingPressureBar={workingPressureBar}
          onChangePressure={onChangePressure}
          onOpenKeypad={onOpenKeypad}
        />
      </div>

      {/* 3. Seletor de Análise: Matriz vs Gráfico */}
      <div className="flex justify-center pt-1">
        <div className="bg-slate-200/80 p-1 rounded-2xl flex gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => setAnalysisTab('matrix')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              analysisTab === 'matrix' ? 'bg-[#114037] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableProperties className="w-4 h-4 text-[#3CA64C]" />
            <span>Matriz Comparativa</span>
          </button>
          <button
            type="button"
            onClick={() => setAnalysisTab('chart')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              analysisTab === 'chart' ? 'bg-[#114037] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LineChart className="w-4 h-4 text-[#3CA64C]" />
            <span>Gráfico de Curvas</span>
          </button>
        </div>
      </div>

      {/* 4. Exibição do Conteúdo de Análise */}
      {analysisTab === 'matrix' ? (
        <NozzleComparisonMatrixCard
          nozzleA={nozzleA}
          nozzleB={nozzleB}
          flowA={flowA}
          flowB={flowB}
          onOpenDetailsModal={onOpenMatrixModal}
        />
      ) : (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-[#114037] text-[#3CA64C] flex items-center justify-center shadow-xs">
              <LineChart className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C]">
                Gráfico Hidráulico
              </span>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                Curvas de Pressão vs. Débito (Regime Contínuo)
              </h3>
            </div>
          </div>
          <ComparadorCurvasGrafico
            nozzleA={nozzleA}
            nozzleB={nozzleB}
            flowA={flowA}
            flowB={flowB}
            workingPressureBar={workingPressureBar}
            width={520}
            height={240}
          />
        </div>
      )}
    </div>
  );
};
