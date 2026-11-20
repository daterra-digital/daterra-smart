// src/features/settings/equipment/EquipmentBinaryToggle.tsx
import React from 'react';

export interface EquipmentBinaryToggleProps {
  label: string;
  value: boolean | undefined;
  onChange: (next: boolean | undefined) => void;
}

export const EquipmentBinaryToggle: React.FC<EquipmentBinaryToggleProps> = ({
  label,
  value,
  onChange
}) => (
  <div>
    <div className="flex items-center justify-between gap-1 mb-1.5 min-h-[18px]">
      <span className="text-xs font-semibold text-[#114037] whitespace-nowrap truncate">
        {label}
      </span>
    </div>
    <div className="grid grid-cols-2 gap-1.5">
      <button
        type="button"
        aria-pressed={value === true}
        onClick={() => onChange(value === true ? undefined : true)}
        className={`h-[44px] px-2.5 rounded-xl text-xs font-extrabold transition-colors touch-target ${
          value === true
            ? 'bg-[#114037] text-white shadow-2xs'
            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
        }`}
      >
        Sim
      </button>
      <button
        type="button"
        aria-pressed={value === false}
        onClick={() => onChange(value === false ? undefined : false)}
        className={`h-[44px] px-2.5 rounded-xl text-xs font-extrabold transition-colors touch-target ${
          value === false
            ? 'bg-slate-800 text-white shadow-2xs'
            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
        }`}
      >
        Não
      </button>
    </div>
  </div>
);
