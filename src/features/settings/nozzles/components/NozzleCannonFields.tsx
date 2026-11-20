// src/features/settings/nozzles/components/NozzleCannonFields.tsx
import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface NozzleCannonFieldsProps {
  mainCount: number;
  deflectorCount: number;
  onStepMain: (delta: number) => void;
  onOpenMainKeypad: () => void;
  onStepDeflector: (delta: number) => void;
  onOpenDeflectorKeypad: () => void;
}

export const NozzleCannonFields: React.FC<NozzleCannonFieldsProps> = ({
  mainCount,
  deflectorCount,
  onStepMain,
  onOpenMainKeypad,
  onStepDeflector,
  onOpenDeflectorKeypad
}) => {
  const totalNozzles = mainCount + deflectorCount;
  return (
    <>
      <div>
        <label className="block text-xs font-semibold text-[#114037] mb-1.5">Boca Principal (N.º de Bicos)</label>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onStepMain(-1)} className="h-[44px] w-[44px] bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer shrink-0">
            <Minus className="w-4 h-4" />
          </button>
          <button type="button" onClick={onOpenMainKeypad} className="flex-1 h-[44px] px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center text-slate-900 cursor-pointer hover:border-[#114037] tabular-nums">
            {mainCount} {mainCount === 1 ? 'bico' : 'bicos'}
          </button>
          <button type="button" onClick={() => onStepMain(1)} className="h-[44px] w-[44px] bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer shrink-0">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#114037] mb-1.5">Defletor Inferior (N.º de Bicos)</label>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onStepDeflector(-1)} className="h-[44px] w-[44px] bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer shrink-0">
            <Minus className="w-4 h-4" />
          </button>
          <button type="button" onClick={onOpenDeflectorKeypad} className="flex-1 h-[44px] px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center text-slate-900 cursor-pointer hover:border-[#114037] tabular-nums">
            {deflectorCount} {deflectorCount === 1 ? 'bico' : 'bicos'}
          </button>
          <button type="button" onClick={() => onStepDeflector(1)} className="h-[44px] w-[44px] bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer shrink-0">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[11px] text-slate-500 mt-1.5 leading-snug tabular-nums">
          Total do Canhão: <strong className="text-[#114037]">{totalNozzles} bicos</strong> ({mainCount} boca principal + {deflectorCount} defletor inferior).
        </p>
      </div>
    </>
  );
};
