// src/features/settings/nozzles/components/TunnelRampFilterBar.tsx
import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import type { SlotSectionSide } from '../../../../schemas/nozzle-profile.schema.ts';
import type { TunnelRampDeviationStats, TunnelRampFilter } from '../services/nozzleTunnelHelpers.ts';
import type { RampGroup } from '../services/nozzleBoom2dHelpers.ts';

interface TunnelRampFilterBarProps {
  rampGroups: RampGroup[];
  totalSlots: number;
  activeFilter: TunnelRampFilter;
  deviation: TunnelRampDeviationStats;
  onSelectFilter: (filter: TunnelRampFilter, firstSlotIndex?: number) => void;
}

export const TunnelRampFilterBar: React.FC<TunnelRampFilterBarProps> = ({
  rampGroups,
  totalSlots,
  activeFilter,
  deviation,
  onSelectFilter
}) => {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {rampGroups.map((g) => {
        const isActive = activeFilter === g.id;
        return (
          <button
            key={g.id}
            type="button"
            onClick={() => onSelectFilter(g.id as SlotSectionSide, g.slots[0]?.slotIndex)}
            className={`min-h-[36px] px-3 rounded-xl text-xs font-extrabold cursor-pointer border transition-colors touch-target tabular-nums ${
              isActive
                ? 'bg-[#114037] text-white border-[#114037]'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {g.label} ({g.slots.length})
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onSelectFilter('ALL')}
        className={`min-h-[36px] px-3 rounded-xl text-xs font-extrabold cursor-pointer border transition-colors touch-target tabular-nums ${
          activeFilter === 'ALL'
            ? 'bg-[#114037] text-white border-[#114037]'
            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
        }`}
      >
        Todos ({totalSlots})
      </button>

      <span
        title="Desvio médio entre rampas ativas do túnel (limite normativo ISO 16122: < 10%)"
        className={`min-h-[36px] px-3 py-1 rounded-xl text-white text-[11px] font-extrabold inline-flex items-center gap-1.5 shadow-2xs shrink-0 whitespace-nowrap tabular-nums ${
          deviation.isCompliant ? 'bg-emerald-600' : 'bg-rose-600'
        }`}
      >
        {deviation.isCompliant ? <Check className="w-3.5 h-3.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
        <span>Desvio Rampas: {deviation.avgDeviationPct.toFixed(1).replace('.', ',')}% · ISO 16122 (&lt; 10%)</span>
      </span>
    </div>
  );
};
