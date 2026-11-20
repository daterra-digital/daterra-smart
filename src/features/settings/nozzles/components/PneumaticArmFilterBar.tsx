// src/features/settings/nozzles/components/PneumaticArmFilterBar.tsx
import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import type { RampGroup } from '../services/nozzleBoom2dHelpers.ts';
import {
  getPneumaticCompactArmLabel,
  getPneumaticFullArmTitle,
  type PneumaticArmDeviationStats,
  type PneumaticArmFilter
} from '../services/nozzlePneumaticHelpers.ts';

interface PneumaticArmFilterBarProps {
  armGroups: RampGroup[];
  totalSlots: number;
  activeFilter: PneumaticArmFilter;
  deviation: PneumaticArmDeviationStats;
  onSelectFilter: (filter: PneumaticArmFilter, firstSlotIndex?: number) => void;
}

export const PneumaticArmFilterBar: React.FC<PneumaticArmFilterBarProps> = ({
  armGroups,
  totalSlots,
  activeFilter,
  deviation,
  onSelectFilter
}) => {
  const leftGroups = armGroups.filter((g) => g.id.startsWith('LEFT_'));
  const rightGroups = armGroups.filter((g) => g.id.startsWith('RIGHT_'));

  const renderGroupBtn = (g: RampGroup) => {
    const side = g.id.startsWith('RIGHT_') ? 'RIGHT' : 'LEFT';
    const armIdx = Number(g.id.split('_')[1] ?? 1);
    return (
      <button
        key={g.id}
        type="button"
        title={getPneumaticFullArmTitle(side, armIdx, g.slots.length)}
        onClick={() => onSelectFilter(g.id, g.slots[0]?.slotIndex)}
        className={`min-h-[36px] px-2.5 rounded-xl text-xs font-extrabold cursor-pointer border transition-colors touch-target tabular-nums ${
          activeFilter === g.id
            ? 'bg-[#114037] text-white border-[#114037]'
            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
        }`}
      >
        {getPneumaticCompactArmLabel(side, armIdx)} ({g.slots.length})
      </button>
    );
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {leftGroups.map(renderGroupBtn)}
      {leftGroups.length > 0 && rightGroups.length > 0 && <span className="h-4 w-px bg-slate-200 mx-0.5 shrink-0" aria-hidden="true" />}
      {rightGroups.map(renderGroupBtn)}

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
        title="Desvio médio entre braços pneumáticos (limite normativo ISO 16122: < 10%)"
        className={`min-h-[36px] px-3 py-1 rounded-xl text-white text-[11px] font-extrabold inline-flex items-center gap-1.5 shadow-2xs shrink-0 whitespace-nowrap tabular-nums ${
          deviation.isCompliant ? 'bg-emerald-600' : 'bg-rose-600'
        }`}
      >
        {deviation.isCompliant ? <Check className="w-3.5 h-3.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
        <span>Desvio Braços: {deviation.avgDeviationPct.toFixed(1).replace('.', ',')}% · ISO 16122 (&lt; 10%)</span>
      </span>
    </div>
  );
};
