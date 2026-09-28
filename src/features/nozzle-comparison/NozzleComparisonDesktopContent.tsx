import React from 'react';
import { Sliders, TableProperties, LineChart, Edit2 } from 'lucide-react';
import type { Nozzle, CalculatedNozzleFlow } from './nozzleComparison.types';
import { getNozzleColorPresentation, formatPt } from './nozzleComparison.calculations';
import { NozzlePressureAdjustmentCard } from './NozzlePressureAdjustmentCard';
import { NozzleComparisonMatrixCard } from './NozzleComparisonMatrixCard';
import { NozzleCurvesChart } from './NozzleCurvesChart';

export interface NozzleComparisonDesktopContentProps {
  nozzleA?: Nozzle;
  nozzleB?: Nozzle;
  flowA?: CalculatedNozzleFlow;
  flowB?: CalculatedNozzleFlow;
  workingPressureBar: number;
  onChangePressure: (p: number) => void;
  onEditNozzleA: () => void;
  onEditNozzleB: () => void;
  onOpenMatrixModal: () => void;
}

export const NozzleComparisonDesktopContent: React.FC<NozzleComparisonDesktopContentProps> = ({
  nozzleA,
  nozzleB,
  flowA,
  flowB,
  workingPressureBar,
  onChangePressure,
  onEditNozzleA,
  onEditNozzleB,
  onOpenMatrixModal
}) => {
  const [analysisTab, setAnalysisTab] = React.useState<'matrix' | 'chart'>('matrix');

  const presA = React.useMemo(() => getNozzleColorPresentation(nozzleA), [nozzleA]);
  const presB = React.useMemo(() => getNozzleColorPresentation(nozzleB), [nozzleB]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Grid: Valores Introduzidos & Pressão de Trabalho (2 colunas em desktop, empilhado em tablet) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cartão Valores Introduzidos */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col justify-between order-2 md:order-1">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C]">Seleção Atual</span>
                <h3 className="text-base font-black text-slate-900 leading-tight">Valores Introduzidos</h3>
              </div>
              <button
                type="button"
                aria-label="Filtros de seleção"
                className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* Bico A */}
            <div
              onClick={onEditNozzleA}
              className="p-3 mb-2.5 rounded-2xl border border-slate-200/90 bg-[#FAFBFB] hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs"
                  style={{ backgroundColor: `${presA.hex}18`, borderColor: presA.hex }}
                >
                  <span className="w-4 h-4 rounded-full border border-white shadow-xs" style={{ backgroundColor: presA.hex }} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-black text-slate-900">{nozzleA ? `${nozzleA.brand} ${nozzleA.model}` : 'Selecionar Bico A'}</span>
                    {nozzleA?.sprayAngleDeg && <span className="text-[10px] text-slate-400 font-mono">[{nozzleA.sprayAngleDeg}°]</span>}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    {nozzleA ? `${nozzleA.color || 'Ref'} (${nozzleA.isoCode || 'ND'}) · ` : ''}
                    <strong className="text-[#114037] font-mono">{nozzleA?.nominalFlowLMin ? `${formatPt(nozzleA.nominalFlowLMin)} L/min` : '—'}</strong>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onEditNozzleA(); }}
                aria-label="Editar Bico A"
                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            {/* Bico B */}
            <div
              onClick={onEditNozzleB}
              className="p-3 rounded-2xl border border-slate-200/90 bg-[#FAFBFB] hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs"
                  style={{ backgroundColor: `${presB.hex}18`, borderColor: presB.hex }}
                >
                  <span className="w-4 h-4 rounded-full border border-white shadow-xs" style={{ backgroundColor: presB.hex }} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-black text-slate-900">{nozzleB ? `${nozzleB.brand} ${nozzleB.model}` : 'Selecionar Bico B'}</span>
                    {nozzleB?.sprayAngleDeg && <span className="text-[10px] text-slate-400 font-mono">[{nozzleB.sprayAngleDeg}°]</span>}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    {nozzleB ? `${nozzleB.color || 'Ref'} (${nozzleB.isoCode || 'ND'}) · ` : ''}
                    <strong className="text-[#114037] font-mono">{nozzleB?.nominalFlowLMin ? `${formatPt(nozzleB.nominalFlowLMin)} L/min` : '—'}</strong>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onEditNozzleB(); }}
                aria-label="Editar Bico B"
                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Cartão Pressão De Trabalho */}
        <div className="order-1 md:order-2">
          <NozzlePressureAdjustmentCard
            workingPressureBar={workingPressureBar}
            onChangePressure={onChangePressure}
          />
        </div>
      </div>

      {/* Tabs Centradas de Análise */}
      <div className="flex justify-center pt-2">
        <div className="bg-slate-200/70 p-1 rounded-2xl flex gap-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setAnalysisTab('matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              analysisTab === 'matrix' ? 'bg-[#114037] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableProperties className="w-4 h-4" />
            <span>Matriz Comparativa</span>
          </button>
          <button
            type="button"
            onClick={() => setAnalysisTab('chart')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              analysisTab === 'chart' ? 'bg-[#114037] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LineChart className="w-4 h-4" />
            <span>Gráfico Comparativo</span>
          </button>
        </div>
      </div>

      {/* Exibição da Análise: Matriz ou Gráfico */}
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
                Curvas de Pressão vs. Débito
              </h3>
            </div>
          </div>
          <NozzleCurvesChart
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
