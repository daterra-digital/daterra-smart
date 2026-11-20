// src/features/settings/nozzles/components/NozzleManualFields.tsx
import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface NozzleManualFieldsProps {
  lanceCount: number;
  onStepCount: (delta: number) => void;
  onOpenCountKeypad: () => void;
}

export const NozzleManualFields: React.FC<NozzleManualFieldsProps> = ({
  lanceCount,
  onStepCount,
  onOpenCountKeypad
}) => {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#114037] mb-1.5">N.º de Pistolas / Lanças</label>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onStepCount(-1)} className="h-[44px] w-[44px] bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer shrink-0">
          <Minus className="w-4 h-4" />
        </button>
        <button type="button" onClick={onOpenCountKeypad} className="flex-1 h-[44px] px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center text-slate-900 cursor-pointer hover:border-[#114037] tabular-nums">
          {lanceCount} {lanceCount === 1 ? 'pistola / lança' : 'pistolas / lanças'}
        </button>
        <button type="button" onClick={() => onStepCount(1)} className="h-[44px] w-[44px] bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer shrink-0">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <p className="text-[11px] text-slate-500 mt-1.5 leading-snug tabular-nums">
        Total da Instalação Manual: <strong className="text-[#114037]">{lanceCount}</strong> {lanceCount === 1 ? 'pistola/lança alimentada' : 'pistolas/lanças alimentadas'} pela mesma bomba.
      </p>
    </div>
  );
};
