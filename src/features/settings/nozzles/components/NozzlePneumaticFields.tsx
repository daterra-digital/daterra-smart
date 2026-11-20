// src/features/settings/nozzles/components/NozzlePneumaticFields.tsx
import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface NozzlePneumaticFieldsProps {
  arms: number;
  nozzlesPerArm: number;
  onChangeArms: (arms: number) => void;
  onStepNozzlesPerArm: (delta: number) => void;
  onOpenNozzlesKeypad: () => void;
}

export const NozzlePneumaticFields: React.FC<NozzlePneumaticFieldsProps> = ({
  arms,
  nozzlesPerArm,
  onChangeArms,
  onStepNozzlesPerArm,
  onOpenNozzlesKeypad
}) => {
  const totalNozzles = arms * nozzlesPerArm;
  return (
    <>
      <div>
        <label className="block text-xs font-semibold text-[#114037] mb-1.5">N.º de Braços Pneumáticos</label>
        <div className="grid grid-cols-4 gap-2">
          {[2, 4, 6, 8].map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => onChangeArms(a)}
              className={`h-[44px] rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                arms === a ? 'bg-[#114037] text-white border-[#114037]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {a} Braços
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#114037] mb-1.5">Bicos por Braço / Extensão</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onStepNozzlesPerArm(-1)}
            className="h-[44px] w-[44px] bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer shrink-0"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onOpenNozzlesKeypad}
            className="flex-1 h-[44px] px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center text-slate-900 cursor-pointer hover:border-[#114037] tabular-nums"
          >
            {nozzlesPerArm} {nozzlesPerArm === 1 ? 'bico / braço' : 'bicos / braço'}
          </button>
          <button
            type="button"
            onClick={() => onStepNozzlesPerArm(1)}
            className="h-[44px] w-[44px] bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[11px] text-slate-500 mt-1.5 leading-snug tabular-nums">
          Total da Máquina: <strong className="text-[#114037]">{totalNozzles} bicos</strong> ({arms} braços × {nozzlesPerArm} bicos/braço).
        </p>
      </div>
    </>
  );
};
