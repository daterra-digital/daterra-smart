import React from 'react';
import type { LabelDoseType } from './types';

export interface DoseTypeOption {
  id: LabelDoseType;
  shortLabel: string;
  description: string;
  unitLiquid: string;
  unitSolid: string;
  presets: number[];
  decimals: number;
}

export const DOSE_TYPE_OPTIONS: DoseTypeOption[] = [
  {
    id: 'D_GA',
    shortLabel: 'Área de Superfície ha',
    description: 'Dose por hectare de superfície de solo (ajustada à copa real)',
    unitLiquid: 'L/ha',
    unitSolid: 'kg/ha',
    presets: [0.5, 1.0, 1.5, 2.0, 3.0],
    decimals: 2
  },
  {
    id: 'D_LWA',
    shortLabel: 'Parede Foliar (LWA)',
    description: 'Dose expressa por 10 000 m² de Área de Parede Foliar (LWA)',
    unitLiquid: 'L/LWA',
    unitSolid: 'kg/LWA',
    presets: [0.5, 1.0, 1.5, 2.0, 2.5],
    decimals: 2
  },
  {
    id: 'D_TRV',
    shortLabel: 'Volume Copa (TRV)',
    description: 'Dose expressa por 10 000 m³ de Volume de Copa (TRV)',
    unitLiquid: 'L/TRV',
    unitSolid: 'kg/TRV',
    presets: [0.5, 1.0, 1.5, 2.0, 2.5],
    decimals: 2
  },
  {
    id: 'D_hl',
    shortLabel: 'Concentração (hL)',
    description: 'Dose expressa por hectolitro de água (100 L de calda)',
    unitLiquid: 'mL/hL',
    unitSolid: 'g/hL',
    presets: [50, 100, 150, 200, 250],
    decimals: 0
  }
];

export interface DoseExpressionTypeSelectorProps {
  labelDoseType: LabelDoseType;
  activeOption: DoseTypeOption;
  onChangeDoseType: (type: LabelDoseType) => void;
}

export const DoseExpressionTypeSelector: React.FC<DoseExpressionTypeSelectorProps> = ({
  labelDoseType,
  activeOption,
  onChangeDoseType
}) => {
  return (
    <div className="mt-6 border-t border-slate-100 pt-4 space-y-1.5">
      <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
        Expressão da Dose no Rótulo
      </span>
      <div className="grid grid-cols-2 gap-2">
        {DOSE_TYPE_OPTIONS.map((opt) => {
          const isSelected = opt.id === labelDoseType;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChangeDoseType(opt.id)}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer touch-target ${
                isSelected
                  ? 'bg-[#114037] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {opt.shortLabel}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-500 font-medium px-0.5">
        {activeOption.description}
      </p>
    </div>
  );
};
