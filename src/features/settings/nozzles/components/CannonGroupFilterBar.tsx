// src/features/settings/nozzles/components/CannonGroupFilterBar.tsx
import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import type { CannonDeviationStats, CannonGroupFilter } from '../services/nozzleCannonHelpers.ts';

interface CannonGroupFilterBarProps {
  mainCount: number;
  deflectorCount: number;
  mainFirstIdx?: number;
  deflectorFirstIdx?: number;
  activeFilter: CannonGroupFilter;
  deviation: CannonDeviationStats;
  onSelectFilter: (filter: CannonGroupFilter, firstSlotIndex?: number) => void;
}

export const CannonGroupFilterBar: React.FC<CannonGroupFilterBarProps> = ({
  mainCount,
  deflectorCount,
  mainFirstIdx,
  deflectorFirstIdx,
  activeFilter,
  deviation,
  onSelectFilter
}) => {
  const totalNozzles = mainCount + deflectorCount;
  const btnCls = (isActive: boolean) =>
    `min-h-[36px] px-3 rounded-xl text-xs font-extrabold cursor-pointer border transition-colors touch-target tabular-nums ${
      isActive ? 'bg-[#114037] text-white border-[#114037]' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
    }`;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button type="button" onClick={() => onSelectFilter('MAIN', mainFirstIdx)} className={btnCls(activeFilter === 'MAIN')}>
        Boca Principal ({mainCount})
      </button>

      {deflectorCount > 0 && (
        <button type="button" onClick={() => onSelectFilter('DEFLECTOR', deflectorFirstIdx)} className={btnCls(activeFilter === 'DEFLECTOR')}>
          Defletor Inferior ({deflectorCount})
        </button>
      )}

      <button type="button" onClick={() => onSelectFilter('ALL')} className={btnCls(activeFilter === 'ALL')}>
        Todos ({totalNozzles})
      </button>

      <span
        title="Desvio médio entre débitos ativos do canhão (limite normativo ISO 16122: < 10%)"
        className={`min-h-[36px] px-3 py-1 rounded-xl text-white text-[11px] font-extrabold inline-flex items-center gap-1.5 shadow-2xs shrink-0 whitespace-nowrap tabular-nums ${
          deviation.isCompliant ? 'bg-emerald-600' : 'bg-rose-600'
        }`}
      >
        {deviation.isCompliant ? <Check className="w-3.5 h-3.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
        <span>Desvio Canhão: {deviation.avgDeviationPct.toFixed(1).replace('.', ',')}% · ISO 16122 (&lt; 10%)</span>
      </span>
    </div>
  );
};
