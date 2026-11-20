// src/features/settings/nozzles/components/NozzleBoomSectorFields.tsx
import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface NozzleBoomSectorFieldsProps {
  sectorCounts: number[];
  onStepSectorCount: (sectorIdx: number, delta: number) => void;
  onOpenSectorKeypad: (sectorIdx: number) => void;
}

export const NozzleBoomSectorFields: React.FC<NozzleBoomSectorFieldsProps> = ({
  sectorCounts,
  onStepSectorCount,
  onOpenSectorKeypad
}) => {
  const totalNozzles = sectorCounts.reduce((acc, c) => acc + c, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#114037]">Bicos por Setor</label>
        <span className="text-[11px] font-extrabold text-[#114037] tabular-nums">
          Total da Barra: {totalNozzles} bicos
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {sectorCounts.map((count, idx) => (
          <div
            key={idx}
            className="h-[44px] px-1.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-1"
          >
            <span className="text-[11px] font-black text-[#114037] pl-1 shrink-0">S{idx + 1}</span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onStepSectorCount(idx, -1)}
                className="size-7 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                aria-label={`Diminuir bicos do Setor ${idx + 1}`}
              >
                <Minus className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => onOpenSectorKeypad(idx)}
                className="min-w-[32px] h-7 px-1 rounded-lg hover:bg-emerald-50 text-xs font-mono font-black text-slate-900 text-center cursor-pointer tabular-nums"
              >
                {count}
              </button>

              <button
                type="button"
                onClick={() => onStepSectorCount(idx, 1)}
                className="size-7 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                aria-label={`Aumentar bicos do Setor ${idx + 1}`}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
