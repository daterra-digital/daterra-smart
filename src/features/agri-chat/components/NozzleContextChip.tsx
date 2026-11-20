// src/features/agri-chat/components/NozzleContextChip.tsx
import React from 'react';
import { Gauge } from 'lucide-react';
import type { NozzleAiContextItem } from '../../settings/nozzles';

export interface NozzleContextChipProps {
  items: NozzleAiContextItem[];
  selectedId?: string;
  isActive: boolean;
  onToggleActive: () => void;
  onSelectNozzle: (item: NozzleAiContextItem) => void;
  compact?: boolean;
}

export const NozzleContextChip: React.FC<NozzleContextChipProps> = ({
  items,
  selectedId,
  isActive,
  onToggleActive,
  onSelectNozzle,
  compact = false
}) => {
  if (items.length === 0) return null;

  const selected = items.find((item) => item.id === selectedId) ?? items[0];

  return (
    <div className={compact ? 'mt-1.5 space-y-1' : 'mt-2 pt-2 border-t border-slate-200 space-y-1.5'}>
      <button
        type="button"
        onClick={onToggleActive}
        aria-pressed={isActive}
        className={`w-full min-h-[44px] text-left rounded-2xl border px-3 py-2 transition-all cursor-pointer ${
          isActive
            ? 'bg-[#114037] text-white border-[#114037] shadow-xs'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 min-w-0">
            <Gauge className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#3CA64C]' : 'text-slate-400'}`} />
            <span
              className={`font-mono text-[11px] font-black shrink-0 ${
                isActive ? 'text-emerald-200' : 'text-[#114037]'
              }`}
            >
              @bico
            </span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black shrink-0 bg-blue-100 text-blue-900">
              {selected.equipmentType}
            </span>
            <span className={`text-xs font-extrabold truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
              {selected.name}
            </span>
          </div>

          <span
            className={`font-mono text-[11px] font-black shrink-0 ${
              isActive ? 'text-emerald-300' : 'text-[#1D734B]'
            }`}
          >
            {selected.totalFlowLMin.toFixed(2)} L/min
          </span>
        </div>
      </button>

      {items.length > 1 && (
        <div className="flex gap-1 overflow-x-auto pb-0.5 custom-scroll">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectNozzle(item)}
              className={`text-[10px] font-extrabold px-2 py-1 rounded-xl shrink-0 transition-colors cursor-pointer border ${
                item.id === selected.id
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
