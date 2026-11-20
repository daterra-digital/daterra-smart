// src/features/settings/nozzles/components/DroneFlankFilterBar.tsx
import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import type { DroneFlankFilter } from '../services/nozzleDroneHelpers.ts';

interface DroneFlankFilterBarProps {
  totalSlots: number;
  leftFirstIdx?: number;
  rightFirstIdx?: number;
  activeFilter: DroneFlankFilter;
  bilateralDeviationPct: number;
  isCompliant: boolean;
  onSelectFilter: (filter: DroneFlankFilter, firstSlotIndex?: number) => void;
}

export const DroneFlankFilterBar: React.FC<DroneFlankFilterBarProps> = ({
  totalSlots,
  leftFirstIdx,
  rightFirstIdx,
  activeFilter,
  bilateralDeviationPct,
  isCompliant,
  onSelectFilter
}) => {
  const sideCount = Math.ceil(totalSlots / 2);
  const rightCount = totalSlots - sideCount;
  const btnCls = (isActive: boolean) =>
    `min-h-[36px] px-3 rounded-xl text-xs font-extrabold cursor-pointer border transition-colors touch-target tabular-nums ${
      isActive ? 'bg-[#114037] text-white border-[#114037]' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
    }`;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button type="button" onClick={() => onSelectFilter('LEFT', leftFirstIdx)} className={btnCls(activeFilter === 'LEFT')}>
        Esquerda ({sideCount})
      </button>
      <button type="button" onClick={() => onSelectFilter('RIGHT', rightFirstIdx)} className={btnCls(activeFilter === 'RIGHT')}>
        Direita ({rightCount})
      </button>
      <button type="button" onClick={() => onSelectFilter('ALL')} className={btnCls(activeFilter === 'ALL')}>
        Todos ({totalSlots})
      </button>

      <span
        title="Desvio bilateral entre o flanco esquerdo e direito do drone (limite normativo ISO 16122: < 10%)"
        className={`min-h-[36px] px-3 py-1 rounded-xl text-white text-[11px] font-extrabold inline-flex items-center gap-1.5 shadow-2xs shrink-0 whitespace-nowrap tabular-nums ${
          isCompliant ? 'bg-emerald-600' : 'bg-rose-600'
        }`}
      >
        {isCompliant ? <Check className="w-3.5 h-3.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
        <span>Desvio Esq. vs. Dir.: {bilateralDeviationPct.toFixed(1).replace('.', ',')}% · ISO 16122 (&lt; 10%)</span>
      </span>
    </div>
  );
};
