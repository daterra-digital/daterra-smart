// src/features/settings/nozzles/components/NozzleColorIsoDropdown.tsx
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { formatPt, getNozzleColorPresentation } from '../../../nozzle-comparison/nozzleComparison.calculations.ts';
import type { Nozzle } from '../../../nozzle-comparison/nozzleComparison.types.ts';

interface NozzleColorIsoDropdownProps {
  selectedId: string;
  selectedNozzleObj?: Nozzle;
  variants: Nozzle[];
  disabled?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onSelectId: (id: string) => void;
}

export const NozzleColorIsoDropdown: React.FC<NozzleColorIsoDropdownProps> = ({
  selectedId,
  selectedNozzleObj,
  variants,
  disabled = false,
  isOpen,
  onToggle,
  onSelectId
}) => {
  const selectedPres = getNozzleColorPresentation(selectedNozzleObj);

  return (
    <div>
      <label className="block text-xs font-semibold text-[#114037] mb-1.5">
        Cor / Calibre (ISO) <span className="text-rose-500">*</span>
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        className={`w-full h-[44px] px-3.5 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-semibold ${
          disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-white hover:bg-slate-50 text-slate-900 cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {selectedNozzleObj ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0" style={{ backgroundColor: selectedPres.hex }} />
              <span className="truncate">
                {selectedPres.colorName || selectedNozzleObj.color}
                {selectedNozzleObj.isoCode ? ` (${selectedNozzleObj.isoCode})` : ''}
              </span>
              <span className="font-mono text-[11px] font-bold text-[#114037] shrink-0 tabular-nums">
                ({formatPt(selectedNozzleObj.nominalFlowLMin || 0)} L/min)
              </span>
            </>
          ) : (
            <span className="text-slate-400 font-medium truncate">Selecionar cor / calibre...</span>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="mt-1 w-full bg-white border border-slate-200 rounded-2xl shadow-lg p-1.5 space-y-1 max-h-52 overflow-y-auto">
          {variants.map((v) => {
            const pres = getNozzleColorPresentation(v);
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelectId(v.id)}
                className={`w-full min-h-[44px] px-3 rounded-xl flex items-center justify-between text-xs cursor-pointer ${
                  v.id === selectedId ? 'bg-[#114037] text-white font-bold' : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border shrink-0" style={{ backgroundColor: pres.hex }} />
                  <span>{pres.colorName || v.color}{v.isoCode ? ` (${v.isoCode})` : ''}</span>
                </div>
                <span className="font-mono text-[11px] tabular-nums">{formatPt(v.nominalFlowLMin)} L/min</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
