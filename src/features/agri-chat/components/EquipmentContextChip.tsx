// src/features/agri-chat/components/EquipmentContextChip.tsx
import React from 'react';
import { CheckCircle2, ShieldAlert, Wind, Wrench } from 'lucide-react';
import type { EquipmentAiContextItem } from '../../settings/equipment/equipmentAiContextService';

export interface EquipmentContextChipProps {
  items: EquipmentAiContextItem[];
  selectedId?: string;
  isActive: boolean;
  onToggleActive: () => void;
  onSelectEquipment: (item: EquipmentAiContextItem) => void;
  compact?: boolean;
}

const IPP_TONE_CLASSES: Readonly<Record<'emerald' | 'amber' | 'rose' | 'slate', string>> = {
  emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  rose: 'bg-rose-50 text-rose-800 border-rose-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200'
};

const TYPE_BADGE_CLASSES: Readonly<Record<'2D' | '3D' | 'UAV' | 'Manual', string>> = {
  '2D': 'bg-sky-100 text-sky-900',
  '3D': 'bg-emerald-100 text-emerald-900',
  UAV: 'bg-indigo-100 text-indigo-900',
  Manual: 'bg-amber-100 text-amber-900'
};

export const EquipmentContextChip: React.FC<EquipmentContextChipProps> = ({
  items,
  selectedId,
  isActive,
  onToggleActive,
  onSelectEquipment,
  compact = false
}) => {
  if (items.length === 0) return null;

  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  const ippTone = IPP_TONE_CLASSES[selected.ippStatus.badgeTone];
  const typeTone = TYPE_BADGE_CLASSES[selected.typologyBadge];
  const isIppWarning =
    selected.ippStatus.status === 'EXPIRED' ||
    selected.ippStatus.status === 'EXPIRING_SOON' ||
    selected.ippStatus.status === 'YEAR_ALERT';

  return (
    <div className={compact ? 'mt-2 space-y-1.5' : 'mt-2.5 pt-2.5 border-t border-slate-200 space-y-2'}>
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
            <Wrench className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#3CA64C]' : 'text-slate-400'}`} />
            <span
              className={`font-mono text-[11px] font-black shrink-0 ${
                isActive ? 'text-emerald-200' : 'text-[#114037]'
              }`}
            >
              @equipamento
            </span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black shrink-0 ${typeTone}`}>
              {selected.typologyBadge}
            </span>
            <span className={`text-xs font-extrabold truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
              {selected.name}
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${ippTone}`}
          >
            {isIppWarning ? (
              <ShieldAlert className="w-3 h-3 shrink-0" />
            ) : (
              <CheckCircle2 className="w-3 h-3 shrink-0" />
            )}
            <span>{selected.ippStatus.badgeText}</span>
          </span>
        </div>

        <div
          className={`mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] ${
            isActive ? 'text-emerald-100' : 'text-slate-500'
          }`}
        >
          <span className="font-mono font-semibold">{selected.operationalSummary}</span>
          <span className="opacity-50">•</span>
          <span className="inline-flex items-center gap-1 font-semibold">
            <Wind className="w-3 h-3 shrink-0" />
            <span>{selected.airSummary}</span>
          </span>
        </div>
      </button>

      {items.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {items.map((item) => {
            const isCurrent = item.id === selected.id && isActive;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectEquipment(item)}
                className={`shrink-0 min-h-[44px] px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-emerald-50 text-[#114037] border-[#3CA64C]'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {item.name} ({item.typologyBadge})
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
