// src/features/settings/nozzles/components/NozzleDroneFields.tsx
import React from 'react';
import { Minus, Plus } from 'lucide-react';
import type { UavNozzleMode } from '../../../../schemas/nozzle-profile.schema.ts';

interface NozzleDroneFieldsProps {
  rotorCount: 4 | 6 | 8;
  nozzleCount: number;
  uavMode: UavNozzleMode;
  onChangeRotorCount: (rotors: 4 | 6 | 8) => void;
  onStepNozzleCount: (delta: number) => void;
  onOpenNozzleCountKeypad: () => void;
  onChangeUavMode: (mode: UavNozzleMode) => void;
}

export const NozzleDroneFields: React.FC<NozzleDroneFieldsProps> = ({
  rotorCount,
  nozzleCount,
  uavMode,
  onChangeRotorCount,
  onStepNozzleCount,
  onOpenNozzleCountKeypad,
  onChangeUavMode
}) => {
  const sideCount = Math.ceil(nozzleCount / 2);
  const atomizerLabel = uavMode === 'ROTARY_CDA' ? 'Centrífugo (CDA)' : 'Hidráulico (BD)';
  return (
    <>
      <div>
        <label className="block text-xs font-semibold text-[#114037] mb-1.5">N.º de Rotores</label>
        <div className="grid grid-cols-3 gap-2">
          {([4, 6, 8] as const).map((r) => (
            <button key={r} type="button" onClick={() => onChangeRotorCount(r)} className={`h-[44px] rounded-xl text-xs font-bold border cursor-pointer transition-colors ${rotorCount === r ? 'bg-[#114037] text-white border-[#114037]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
              {r} Rotores
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#114037] mb-1.5">N.º de Bicos / Pontos de Pulverização</label>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onStepNozzleCount(-2)} className="h-[44px] w-[44px] bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer shrink-0">
            <Minus className="w-4 h-4" />
          </button>
          <button type="button" onClick={onOpenNozzleCountKeypad} className="flex-1 h-[44px] px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center text-slate-900 cursor-pointer hover:border-[#114037] tabular-nums">
            {nozzleCount} pontos
          </button>
          <button type="button" onClick={() => onStepNozzleCount(2)} className="h-[44px] w-[44px] bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer shrink-0">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#114037] mb-1.5">Tecnologia de Atomização</label>
        <div className="grid grid-cols-2 gap-2">
          {([['HYDRAULIC', 'Hidráulico (BD)'], ['ROTARY_CDA', 'Centrífugo (CDA)']] as const).map(([m, lbl]) => (
            <button key={m} type="button" onClick={() => onChangeUavMode(m)} className={`h-[44px] rounded-xl text-xs font-bold border cursor-pointer transition-colors ${uavMode === m ? 'bg-[#114037] text-white border-[#114037]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
              {lbl}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-500 mt-1.5 leading-snug tabular-nums">
          Drone <strong className="text-[#114037]">{rotorCount} rotores</strong> · {nozzleCount} pontos ({sideCount} Esq. + {nozzleCount - sideCount} Dir.) · {atomizerLabel}.
        </p>
      </div>
    </>
  );
};
