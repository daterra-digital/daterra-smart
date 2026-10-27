import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { CalculatorFieldDefinition } from './types.ts';
import { useLanguage } from '../../../context/LanguageContext.tsx';

export interface CalculatorSelectFieldProps {
  field: CalculatorFieldDefinition;
  value: number | string;
  error?: string;
  warning?: string;
  selectDescribedByIds?: string;
  onChange: (newValue: number | string, newUnit: string) => void;
}

export const CalculatorSelectField: React.FC<CalculatorSelectFieldProps> = ({
  field,
  value,
  error,
  warning,
  selectDescribedByIds,
  onChange,
}) => {
  const { t } = useLanguage();
  const selectedOption = field.options?.find((o) => o.value === String(value));

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <select
          id={field.id}
          name={field.id}
          value={value !== undefined && value !== null ? String(value) : ''}
          onChange={(e) => onChange(e.target.value, '')}
          className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs sm:text-sm font-bold text-slate-800 cursor-pointer hover:border-daterra-accent outline-none transition-all touch-target focus:ring-2 focus:ring-daterra-accent/30 focus:border-daterra-accent ${
            error
              ? 'border-rose-400 bg-rose-50/20 text-rose-900'
              : warning
              ? 'border-amber-400 bg-amber-50/20 text-amber-900'
              : 'border-slate-300'
          }`}
          aria-invalid={!!error}
          aria-describedby={selectDescribedByIds}
        >
          <option value="" disabled>
            {t('common.selectOption', 'Selecione uma opção...')}
          </option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Descrição contextual da opção ativa */}
      {selectedOption?.description && (
        <div
          id={`${field.id}-option-desc`}
          className="p-2.5 bg-slate-100/80 rounded-xl text-xs text-slate-600 leading-relaxed border border-slate-200/60"
        >
          <strong className="font-bold text-slate-800 block mb-0.5">
            {selectedOption.label}:
          </strong>
          {selectedOption.description}
        </div>
      )}

      {/* Aviso contextual informativo */}
      {selectedOption?.contextualWarning && (
        <div
          id={`${field.id}-contextual-warning`}
          role="status"
          className="p-2.5 bg-amber-50/90 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed flex items-start gap-2 animate-fade-in"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <span>{selectedOption.contextualWarning}</span>
        </div>
      )}
    </div>
  );
};
