/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Componente: CalculatorResultsPanel
 * Fase 2 - Componentes Atómicos do Template Oficial
 * 
 * Painel direito oficial de resultados:
 * - Fundo com gradiente verde institucional (from-daterra-primary via-[#175348] to-daterra-secondary)
 * - Sombra flutuante (shadow-floating) e cantos arredondados (rounded-3xl)
 * - Cabeçalho superior com separador border-white/15 e texto uppercase em daterra-accent
 * - Grelha responsiva de resultados (CalculatorResultCard)
 * - Botão de ação oficial verde para gravação de cálculo
 */

import React from 'react';
import { Save } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext.tsx';
import type { CalculatorResultDefinition } from './types.ts';
import { CalculatorResultCard } from './CalculatorResultCard.tsx';

export interface ResultDisplayItem {
  value: number | string;
  unit: string;
  subValue?: number | string;
  subUnit?: string;
  hasHelp?: boolean;
  isInvalid?: boolean;
  invalidMessage?: string;
}

export interface CalculatorResultsPanelProps {
  /** Título superior em caixa alta (ex: 'RESULTADO DO CÁLCULO DE DOSE') */
  headerTitle: string;
  /** Badge opcional de modo (ex: 'Planta Jovem', 'Planta Adulta') */
  badgeMode?: string;
  /** Definições declarativas dos resultados a exibir */
  results: CalculatorResultDefinition[];
  /** Mapa de valores calculados para cada resultado */
  outputValues: Record<string, ResultDisplayItem>;
  /** Callback para guardar o cálculo */
  onSave: () => void;
  /** Estado de carregamento da gravação */
  isSaving?: boolean;
  /** Rótulo do botão de gravação */
  saveButtonLabel?: string;
  /** Callback para microlearning específico de um resultado */
  onOpenResultHelp?: (resultId: string) => void;
}

export const CalculatorResultsPanel: React.FC<CalculatorResultsPanelProps> = ({
  headerTitle,
  badgeMode,
  results,
  outputValues,
  onSave,
  isSaving = false,
  saveButtonLabel,
  onOpenResultHelp
}) => {
  const { t } = useLanguage();
  // Configuração da grelha: 1 coluna se houver 1 resultado, 2 colunas se houver mais
  const gridColsClass = results.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2';

  return (
    <section className="bg-gradient-to-br from-daterra-primary via-[#175348] to-daterra-secondary text-white p-6 sm:p-8 rounded-3xl shadow-floating border border-white/10 space-y-6">
      {/* 1. Barra de Título do Painel de Resultados */}
      <div className="flex items-center justify-between border-b border-white/15 pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-daterra-accent">
          {headerTitle}
        </span>
        {badgeMode && (
          <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold font-sans">
            {badgeMode}
          </span>
        )}
      </div>

      {/* 2. Grelha Responsiva de Resultados */}
      <div className={`grid ${gridColsClass} gap-6`}>
        {results.map((resDef) => {
          const item = outputValues[resDef.id] || {
            value: 0,
            unit: resDef.defaultUnit,
            subValue: undefined,
            subUnit: resDef.subUnit
          };

          return (
            <CalculatorResultCard
              key={resDef.id}
              resultDef={resDef}
              value={item.value}
              unit={item.unit}
              subValue={item.subValue}
              subUnit={item.subUnit}
              onOpenResultHelp={onOpenResultHelp}
              hasHelp={item.hasHelp || !!resDef.helpFile}
              isInvalid={item.isInvalid}
              invalidMessage={item.invalidMessage}
            />
          );
        })}
      </div>

      {/* 3. Botão Oficial de Gravação de Cálculo */}
      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="w-full py-4 bg-daterra-accent hover:bg-daterra-accent/90 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl transition-all shadow-xl shadow-daterra-accent/30 flex items-center justify-center gap-2 active:scale-95 touch-target cursor-pointer"
      >
        <Save className="w-5 h-5 shrink-0" />
        <span>{saveButtonLabel || t('calculatorActionBar.save', 'Guardar Histórico')}</span>
      </button>
    </section>
  );
};
