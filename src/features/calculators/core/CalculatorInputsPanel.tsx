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
import { useTranslation } from '../../../context/LanguageContext.tsx';

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
  const { t } = useTranslation();
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
    <section className="bg-white p-4 sm:p-5 rounded-2xl md:rounded-3xl shadow-soft border border-slate-200 space-y-3.5">
      {/* 1. Aviso Contextual de Valores Importados (quando aplicável) */}
      {importedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-fade-in">
          <Info className="w-4 h-4 shrink-0 text-daterra-accent" />
          <span>{importedNotice}</span>
        </div>
      )}

      {/* 2. Cabeçalho do Painel de Entradas */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-daterra-primary leading-tight">
            {title}
          </h2>
          <p className="text-xs text-slate-500 leading-tight mt-0.5">
            {subtitle}
          </p>
        </div>
        {generalHelpFile && (
          <DidacticHelp
            faqFile={generalHelpFile as FAQFileType}
            buttonLabel={t('common.help', 'Ajuda')}
          />
        )}
      </div>

      {/* 3. Seletor Oficial de Modos (Planta Jovem vs Planta Adulta) */}
      {modes && modes.length > 0 && (
        <div className="space-y-1.5">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
            {modes.map((m) => {
              const isActive = activeModeId === m.id;
              const isJovem = m.id === 'jovem';
              const Icon = isJovem ? Sprout : Trees;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onModeChange?.(m.id)}
                  className={`py-2 px-3 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 touch-target cursor-pointer ${
                    isActive
                      ? isJovem
                        ? 'bg-daterra-accent text-white shadow-xs'
                        : 'bg-daterra-primary text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Lista de Campos de Entrada Visíveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
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
