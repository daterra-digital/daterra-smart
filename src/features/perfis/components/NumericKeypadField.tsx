// src/features/perfis/components/NumericKeypadField.tsx
// Gatilho mobile-first para DaterraKeypadModal com opção de limpar campos opcionais (<= 100 LOC).

import React from 'react';
import { Calculator } from 'lucide-react';

export interface NumericKeypadFieldProps {
  label: string;
  value: string;
  unit?: string;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  errorMsg?: string;
  onOpenKeypad: () => void;
  onClear?: () => void;
  testId?: string;
}

export const NumericKeypadField: React.FC<NumericKeypadFieldProps> = ({
  label,
  value,
  unit,
  placeholder = 'Tocar para introduzir',
  required,
  helperText,
  errorMsg,
  onOpenKeypad,
  onClear,
  testId
}) => (
  <div data-testid={testId}>
    <div className="flex items-center justify-between gap-1 mb-1.5 min-h-[18px]">
      <label className="block text-xs font-semibold text-[#114037] whitespace-nowrap truncate">
        {label}
        {required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 px-1.5 py-0.5 rounded-lg shrink-0"
        >
          Limpar
        </button>
      )}
    </div>

    <button
      type="button"
      onClick={onOpenKeypad}
      className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#114037] focus:border-[#114037] focus:ring-2 focus:ring-[#114037]/15 flex items-center justify-between gap-2 text-left transition-colors touch-target outline-none"
    >
      <span className={`text-xs font-mono-numbers font-bold truncate ${value ? 'text-slate-900' : 'text-slate-400 font-sans font-medium'}`}>
        {value ? `${value}${unit ? ` ${unit}` : ''}` : placeholder}
      </span>
      <Calculator className="w-4 h-4 text-[#1D734B] shrink-0" />
    </button>

    {helperText && <p className="mt-1 text-[11px] text-slate-500">{helperText}</p>}
    {errorMsg && <p role="alert" className="mt-1 text-xs font-semibold text-rose-700">{errorMsg}</p>}
  </div>
);
