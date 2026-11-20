// src/features/settings/nozzles/components/BentoSlotSummaryCards.tsx
import React from 'react';
import { formatPt } from '../../../nozzle-comparison/nozzleComparison.calculations.ts';

interface BentoSlotSummaryCardsProps {
  avgTabulatedFlowLMin: number;
  totalFlowLMin: number;
  midLabel: string;
  midValue: string;
  midAlert: boolean;
}

export const BentoSlotSummaryCards: React.FC<BentoSlotSummaryCardsProps> = ({
  avgTabulatedFlowLMin,
  totalFlowLMin,
  midLabel,
  midValue,
  midAlert
}) => (
  <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
      <span className="text-[10px] font-bold uppercase text-slate-400 block">Débito Médio Tabelado</span>
      <span className="text-sm font-mono font-black text-slate-800">{formatPt(avgTabulatedFlowLMin)} L/min</span>
    </div>
    <div className={`p-3 rounded-2xl border ${midAlert ? 'bg-rose-50 border-rose-300 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
      <span className={`text-[10px] font-bold uppercase block ${midAlert ? 'text-rose-700' : 'text-slate-400'}`}>{midLabel}</span>
      <span className="text-sm font-mono font-black tabular-nums">{midValue}</span>
    </div>
    <div className="p-3 rounded-2xl bg-[#114037] text-white">
      <span className="text-[10px] font-bold uppercase text-emerald-200 block">Débito Total da Máquina</span>
      <span className="text-sm font-mono font-black tabular-nums">{formatPt(totalFlowLMin)} L/min</span>
    </div>
  </div>
);
