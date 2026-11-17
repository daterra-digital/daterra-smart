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
    <div className="flex items-center justify-between mb-1.5">
      <label className="block text-xs font-bold text-slate-700">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 px-1.5 py-0.5 rounded-lg"
        >
          Limpar
        </button>
      )}
    </div>

    <button
      type="button"
      onClick={onOpenKeypad}
      className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl border border-slate-300 bg-white hover:border-[#3CA64C] flex items-center justify-between gap-2 text-left transition-colors touch-target"
    >
      <span className={`text-xs font-mono-numbers font-bold ${value ? 'text-slate-900' : 'text-slate-400 font-sans font-semibold'}`}>
        {value ? `${value}${unit ? ` ${unit}` : ''}` : placeholder}
      </span>
      <Calculator className="w-4 h-4 text-[#1D734B] shrink-0" />
    </button>

    {helperText && <p className="mt-1 text-[11px] text-slate-500">{helperText}</p>}
    {errorMsg && <p role="alert" className="mt-1 text-xs font-semibold text-rose-700">{errorMsg}</p>}
  </div>
);
