/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Componente: CalculatorInputsPanel
 * Fase 2 & Fase 6B - Componentes Atómicos do Template Oficial com Suporte a Modos
 * 
 * Painel esquerdo de entradas de dados:
 * - Cartão branco com cantos arredondados (rounded-3xl) e sombra suave (shadow-soft)
 * - Cabeçalho com título, subtítulo e botão de Microlearning Geral
 * - Faixa de aviso quando os valores forem importados de um cálculo anterior
 * - Seletor de modos vegetativos (Planta Jovem vs Planta Adulta) quando declarado
 * - Lista ordenada de campos CalculatorInputField do modo ativo
 */

import React, { useMemo } from 'react';
import { Info, Sprout, Trees } from 'lucide-react';
import type { CalculatorFieldDefinition, CalculatorModeDefinition } from './types.ts';
import { CalculatorInputField } from './CalculatorInputField.tsx';
import { DidacticHelp, type FAQFileType } from '../../concentracao/DidacticHelp.tsx';

export interface CalculatorInputsPanelProps {
  /** Título da secção de entradas (ex: 'Calculadora de Dose') */
  title: string;
  /** Subtítulo descritivo */
  subtitle: string;
  /** Ficheiro de microlearning geral da ferramenta (opcional) */
  generalHelpFile?: string;
  /** Modos operacionais declarados (ex: 'jovem' vs 'adulta') */
  modes?: CalculatorModeDefinition[];
  /** Identificador do modo ativo */
  activeModeId?: string;
  /** Callback para alteração de modo */
  onModeChange?: (modeId: string) => void;
  /** Lista de campos declarados */
  fields: CalculatorFieldDefinition[];
  /** Valores atuais de cada campo */
  values: Record<string, number | string>;
  /** Unidades ativas de cada campo */
  units: Record<string, string>;
  /** Callback ao alterar valor/unidade de um campo */
  onChange: (fieldId: string, newValue: number | string, newUnit: string) => void;
  /** Callback para abrir o DaterraKeypad */
  onOpenKeypad: (field: CalculatorFieldDefinition) => void;
  /** Mensagens de erro de validação por campo */
  errors?: Record<string, string>;
  /** Mensagens de aviso por campo */
  warnings?: Record<string, string>;
  /** Aviso opcional de importação de valores (Fase 5 / 6B) */
  importedNotice?: string | null;
}

export const CalculatorInputsPanel: React.FC<CalculatorInputsPanelProps> = ({
  title,
  subtitle,
  generalHelpFile,
  modes,
  activeModeId,
  onModeChange,
  fields,
  values,
  units,
  onChange,
  onOpenKeypad,
  errors = {},
  warnings = {},
  importedNotice
}) => {
  // Filtragem e ordenação dinâmica dos campos com base no modo ativo
  const visibleFields = useMemo(() => {
    if (!modes || !activeModeId) return fields;
    const currentMode = modes.find((m) => m.id === activeModeId);
    if (!currentMode || !currentMode.fieldIds || currentMode.fieldIds.length === 0) {
      return fields;
    }
    const fieldMap = new Map(fields.map((f) => [f.id, f]));
    return currentMode.fieldIds.map((id) => fieldMap.get(id)).filter(Boolean) as CalculatorFieldDefinition[];
  }, [fields, modes, activeModeId]);

  return (
    <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-200 space-y-6">
      {/* 1. Aviso Contextual de Valores Importados (quando aplicável) */}
      {importedNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-emerald-800 animate-fade-in">
          <Info className="w-4 h-4 shrink-0 text-daterra-accent" />
          <span>{importedNotice}</span>
        </div>
      )}

      {/* 2. Cabeçalho do Painel de Entradas */}
      <div>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h2 className="text-xl font-extrabold text-daterra-primary leading-tight">
            {title}
          </h2>
          {generalHelpFile && (
            <DidacticHelp
              faqFile={generalHelpFile as FAQFileType}
              buttonLabel="Ajuda"
            />
          )}
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* 3. Seletor Oficial de Modos (Planta Jovem vs Planta Adulta) */}
      {modes && modes.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            {modes.map((m) => {
              const isActive = activeModeId === m.id;
              const isJovem = m.id === 'jovem';
              const Icon = isJovem ? Sprout : Trees;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onModeChange?.(m.id)}
                  className={`py-3 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 touch-target cursor-pointer ${
                    isActive
                      ? isJovem
                        ? 'bg-daterra-accent text-white shadow-md'
                        : 'bg-daterra-primary text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Lista de Campos de Entrada Visíveis */}
      <div className="space-y-4">
        {visibleFields.map((field) => {
          const effectiveField = field.getDynamicPresets
            ? { ...field, presets: field.getDynamicPresets(values) }
            : field;
          return (
            <CalculatorInputField
              key={field.id}
              field={effectiveField}
              value={values[field.id] ?? field.defaultValue ?? ''}
              unit={units[field.id] ?? field.defaultUnit}
              onChange={(newVal, newUnit) => onChange(field.id, newVal, newUnit)}
              onOpenKeypad={onOpenKeypad}
              error={errors[field.id]}
              warning={warnings[field.id]}
            />
          );
        })}
      </div>
    </section>
  );
};
