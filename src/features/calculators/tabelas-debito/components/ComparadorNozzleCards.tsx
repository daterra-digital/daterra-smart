import React from 'react';
import { Edit2, Sparkles } from 'lucide-react';
import type { Nozzle } from '../../../nozzle-comparison/nozzleComparison.types';
import { getNozzleColorPresentation, formatPt } from '../../../nozzle-comparison/nozzleComparison.calculations';

export interface ComparadorNozzleCardsProps {
  nozzleA?: Nozzle;
  nozzleB?: Nozzle;
  onEditNozzleA: () => void;
  onEditNozzleB: () => void;
}

export const ComparadorNozzleCards: React.FC<ComparadorNozzleCardsProps> = ({
  nozzleA,
  nozzleB,
  onEditNozzleA,
  onEditNozzleB
}) => {
  const presA = React.useMemo(() => getNozzleColorPresentation(nozzleA), [nozzleA]);
  const presB = React.useMemo(() => getNozzleColorPresentation(nozzleB), [nozzleB]);

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C]">
            Modelos em Análise
          </span>
          <h3 className="text-base font-black text-slate-900 leading-tight">
            Valores Introduzidos
          </h3>
        </div>
        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#3CA64C]" />
          Catálogo Multimarca
        </span>
      </div>

      {/* Bico A */}
      <div
        onClick={onEditNozzleA}
        className="p-3.5 rounded-2xl border border-slate-200 bg-[#FAFBFB] hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs"
            style={{ backgroundColor: `${presA.hex}18`, borderColor: presA.hex }}
          >
            <span className="w-4 h-4 rounded-full border border-white shadow-xs" style={{ backgroundColor: presA.hex }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black text-slate-900">
                {nozzleA ? `${nozzleA.brand} ${nozzleA.model}` : 'Selecionar Bico A'}
              </span>
              {nozzleA?.sprayAngleDeg && (
                <span className="text-[10px] text-slate-400 font-mono">[{nozzleA.sprayAngleDeg}°]</span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              {nozzleA ? `${nozzleA.color || 'Ref'} (${nozzleA.isoCode || 'ND'}) · ` : ''}
              <strong className="text-[#114037] font-mono">
                {nozzleA?.nominalFlowLMin ? `${formatPt(nozzleA.nominalFlowLMin)} L/min` : '—'}
              </strong>
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEditNozzleA(); }}
          aria-label="Editar Bico A"
          className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {/* Bico B */}
      <div
        onClick={onEditNozzleB}
        className="p-3.5 rounded-2xl border border-slate-200 bg-[#FAFBFB] hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs"
            style={{ backgroundColor: `${presB.hex}18`, borderColor: presB.hex }}
          >
            <span className="w-4 h-4 rounded-full border border-white shadow-xs" style={{ backgroundColor: presB.hex }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black text-slate-900">
                {nozzleB ? `${nozzleB.brand} ${nozzleB.model}` : 'Selecionar Bico B'}
              </span>
              {nozzleB?.sprayAngleDeg && (
                <span className="text-[10px] text-slate-400 font-mono">[{nozzleB.sprayAngleDeg}°]</span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              {nozzleB ? `${nozzleB.color || 'Ref'} (${nozzleB.isoCode || 'ND'}) · ` : ''}
              <strong className="text-[#114037] font-mono">
                {nozzleB?.nominalFlowLMin ? `${formatPt(nozzleB.nominalFlowLMin)} L/min` : '—'}
              </strong>
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEditNozzleB(); }}
          aria-label="Editar Bico B"
          className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
