/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Componente: CalculatorInputField
 * Fase 2 - Componentes Atómicos do Template Oficial
 * 
 * Campo de entrada universal:
 * - Label semântico associado com htmlFor
 * - Botão de microlearning DidacticHelp contextual
 * - Input táctil com tipografia mono-numbers (JetBrains Mono)
 * - Atalhos rápidos horizontais (presets)
 * - Suporte a teclado DaterraKeypad em mobile e digitação física em desktop
 * - Espaço para erros e validações agronómicas
 */

import React from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext.tsx';
import type { CalculatorFieldDefinition } from './types.ts';
import { DidacticHelp, type FAQFileType } from '../../concentracao/DidacticHelp.tsx';

export interface CalculatorInputFieldProps {
  /** Definição declarativa do campo */
  field: CalculatorFieldDefinition;
  /** Valor atual numérico ou texto */
  value: number | string;
  /** Unidade ativa selecionada */
  unit: string;
  /** Callback ao alterar valor diretamente ou via atalhos */
  onChange: (newValue: number | string, newUnit: string) => void;
  /** Callback ao clicar para abrir o DaterraKeypad */
  onOpenKeypad: (field: CalculatorFieldDefinition) => void;
  /** Mensagem de erro de validação (se aplicável) */
  error?: string;
  /** Mensagem de aviso de limite agronómico (se aplicável) */
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
  const { t } = useLanguage();

  // Formatação amigável para exibição pt-PT
  const formatDisplayValue = (val: number | string) => {
    if (typeof val === 'number') {
      return val.toLocaleString('pt-PT', { maximumFractionDigits: 3 });
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
    <div className="space-y-1.5">
      {/* 1. Cabeçalho do Campo: Rótulo semântico + Botão de Microlearning Contextual */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={field.id}
          className="text-xs font-bold text-slate-700 select-none cursor-pointer"
        >
          {field.label}
          {field.required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>

        {/* Microlearning específico por campo */}
        {(field.helpFile || field.helpTopic) && (
          <DidacticHelp
            faqFile={field.helpFile as FAQFileType}
            topic={field.helpTopic}
            buttonLabel="Ajuda"
          />
        )}
      </div>

      {/* 2. Campo de Entrada Táctil/Físico OU Seletor Estruturado */}
      {field.type === 'select' ? (
        <div className="space-y-2">
          <div className="relative">
            <select
              id={field.id}
              name={field.id}
              value={value !== undefined && value !== null ? String(value) : ''}
              onChange={(e) => onChange(e.target.value, '')}
              className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl text-sm font-bold text-slate-800 cursor-pointer hover:border-daterra-accent outline-none transition-all touch-target focus:ring-2 focus:ring-daterra-accent/30 focus:border-daterra-accent ${
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
                Selecione uma opção...
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
              className="p-3 bg-slate-100/80 rounded-xl text-xs text-slate-600 leading-relaxed border border-slate-200/60"
            >
              <strong className="font-bold text-slate-800 block mb-0.5">
                {selectedOption.label}:
              </strong>
              {selectedOption.description}
            </div>
          )}

          {/* Aviso contextual informativo (ex: Linhas Alternadas em row_spacing) */}
          {selectedOption?.contextualWarning && (
            <div
              id={`${field.id}-contextual-warning`}
              role="status"
              className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed flex items-start gap-2 animate-fade-in"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>{selectedOption.contextualWarning}</span>
            </div>
          )}
        </div>
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
            className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl text-base font-bold font-mono-numbers text-daterra-primary cursor-pointer hover:border-daterra-accent outline-none transition-all touch-target focus:ring-2 focus:ring-daterra-accent/30 focus:border-daterra-accent ${
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
        <div className="flex items-center gap-1.5 pt-1 pb-0.5 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
            Atalhos:
          </span>
          {field.presets.slice(0, 4).map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset, unit)}
              className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all font-mono-numbers shrink-0 touch-target sm:min-h-0 sm:h-auto active:scale-95 ${
                Number(value) === preset
                  ? 'bg-daterra-primary text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title={`Definir ${preset} ${unit}`}
            >
              {preset}
            </button>
          ))}
        </div>
      )}

      {/* 4. Nota técnica permanente (se declarada no campo) */}
      {field.description && (
        <p
          id={`${field.id}-description`}
          className="text-xs text-slate-500 mt-1 leading-relaxed"
        >
          {field.description}
        </p>
      )}

      {/* 5. Espaço para Erros e Avisos de Validação Agronómica */}
      {error && (
        <p id={`${field.id}-error`} className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-1 animate-fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
      {!error && warning && (
        <p id={`${field.id}-warning`} className="text-xs font-semibold text-amber-600 flex items-center gap-1 mt-1 animate-fade-in">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{t(warning, warning)}</span>
        </p>
      )}
    </div>
  );
};
