/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Componente: CalculatorInputField
 * Fase 2 - Componentes Atómicos do Template Oficial
 */

import React from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext.tsx';
import type { CalculatorFieldDefinition } from './types.ts';
import { DidacticHelp, type FAQFileType } from '../../concentracao/DidacticHelp.tsx';
import { resolveFriendlyValidationMessage } from '../../calibracao-pulverizador/calibracaoPulverizadorValidationFallback.ts';
import { CalculatorSelectField } from './CalculatorSelectField.tsx';
import { CalculatorPresetsBar } from './CalculatorPresetsBar.tsx';

export interface CalculatorInputFieldProps {
  field: CalculatorFieldDefinition;
  value: number | string;
  unit: string;
  onChange: (newValue: number | string, newUnit: string) => void;
  onOpenKeypad: (field: CalculatorFieldDefinition) => void;
  error?: string;
  warning?: string;
}

export const CalculatorInputField: React.FC<CalculatorInputFieldProps> = ({
  field,
  value,
  unit,
  onChange,
  onOpenKeypad,
  error,
  warning
}) => {
  const { t, language } = useLanguage();
  const locale = language === 'en-GB' ? 'en-GB' : 'pt-PT';

  const formatDisplayValue = (val: number | string) => {
    if (typeof val === 'number') {
      return val.toLocaleString(locale, { maximumFractionDigits: 3 });
    }
    return val;
  };

  const displayString = `${formatDisplayValue(value)} ${unit}`.trim();
  const selectedOption = field.options?.find((o) => o.value === String(value));

  const selectDescribedByIds = [
    error ? `${field.id}-error` : null,
    warning ? `${field.id}-warning` : null,
    selectedOption?.description ? `${field.id}-option-desc` : null,
    selectedOption?.contextualWarning ? `${field.id}-contextual-warning` : null,
    field.description ? `${field.id}-description` : null
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className="space-y-1">
      {/* 1. Cabeçalho do Campo: Rótulo semântico + Botão de Ajuda Contextual */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={field.id}
          className="text-xs font-bold text-slate-700 select-none cursor-pointer block truncate"
        >
          {field.label}
          {field.required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>

        {(field.helpFile || field.helpTopic) && (
          <DidacticHelp
            faqFile={field.helpFile as FAQFileType}
            topic={field.helpTopic}
            variant="icon"
            iconType="info"
            buttonLabel={t('common.help', 'Ajuda')}
            className="!min-w-[36px] !min-h-[36px] !p-1.5"
            iconClassName="w-4 h-4 text-[#1D734B]"
          />
        )}
      </div>

      {/* 2. Campo de Entrada Táctil/Físico OU Seletor Estruturado */}
      {field.type === 'select' ? (
        <CalculatorSelectField
          field={field}
          value={value}
          error={error}
          warning={warning}
          selectDescribedByIds={selectDescribedByIds}
          onChange={onChange}
        />
      ) : (
        <div className="relative">
          <input
            type="text"
            id={field.id}
            name={field.id}
            readOnly
            inputMode="none"
            onClick={() => onOpenKeypad(field)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenKeypad(field);
              }
            }}
            value={displayString}
            placeholder="0"
            className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm sm:text-base font-bold font-mono-numbers text-daterra-primary cursor-pointer hover:border-daterra-accent outline-none transition-all touch-target focus:ring-2 focus:ring-daterra-accent/30 focus:border-daterra-accent ${
              error
                ? 'border-rose-400 bg-rose-50/20 text-rose-900'
                : warning
                ? 'border-amber-400 bg-amber-50/20 text-amber-900'
                : 'border-slate-300'
            }`}
            aria-invalid={!!error}
            aria-describedby={
              [
                error ? `${field.id}-error` : null,
                warning ? `${field.id}-warning` : null,
                field.description ? `${field.id}-description` : null
              ]
                .filter(Boolean)
                .join(' ') || undefined
            }
          />
        </div>
      )}

      {/* 3. Pílulas de Atalhos Rápidos (Presets) */}
      {field.presets && field.presets.length > 0 && (
        <CalculatorPresetsBar
          presets={field.presets}
          value={value}
          unit={unit}
          formatDisplayValue={formatDisplayValue}
          onChange={(presetVal, presetUnit) => onChange(presetVal, presetUnit)}
        />
      )}

      {/* 4. Nota técnica permanente (se declarada no campo) */}
      {field.description && (
        <p
          id={`${field.id}-description`}
          className="text-[11px] text-slate-500 mt-0.5 leading-tight line-clamp-2"
        >
          {field.description}
        </p>
      )}

      {/* 5. Espaço para Erros e Avisos de Validação Agronómica */}
      {error && (
        <p id={`${field.id}-error`} className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-1 animate-fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{resolveFriendlyValidationMessage(error, t)}</span>
        </p>
      )}
      {!error && warning && (
        <p id={`${field.id}-warning`} role="status" className="text-xs font-semibold text-amber-600 flex items-center gap-1 mt-1 animate-fade-in">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{resolveFriendlyValidationMessage(warning, t)}</span>
        </p>
      )}
    </div>
  );
};
