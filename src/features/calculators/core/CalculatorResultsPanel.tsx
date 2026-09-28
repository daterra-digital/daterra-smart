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
  // Configuração responsiva da grelha: adapta-se perfeitamente à largura total do ecrã
  const gridColsClass = React.useMemo(() => {
    if (results.length === 1) return 'grid-cols-1 max-w-xl mx-auto';
    if (results.length === 2) return 'grid-cols-1 sm:grid-cols-2';
    if (results.length === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  }, [results.length]);

  return (
    <section className="bg-gradient-to-br from-daterra-primary via-[#175348] to-daterra-secondary text-white p-4 sm:p-5 rounded-2xl md:rounded-3xl shadow-floating border border-white/10 space-y-3.5">
      {/* 1. Barra de Título do Painel de Resultados */}
      <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-daterra-accent">
          {headerTitle}
        </span>
        {badgeMode && (
          <span className="px-2.5 py-0.5 bg-white/10 rounded-full text-xs font-bold font-sans">
            {badgeMode}
          </span>
        )}
      </div>

      {/* 2. Grelha Responsiva de Resultados */}
      <div className={`grid ${gridColsClass} gap-2.5 sm:gap-3`}>
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2.5 border-t border-white/10">
        <span className="text-xs text-emerald-100/75 font-medium hidden sm:block">
          {t('calibracaoPulverizador.resultsLiveHint', 'Resultados calculados dinamicamente em tempo real.')}
        </span>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-2.5 bg-daterra-accent hover:bg-daterra-accent/90 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-daterra-accent/25 flex items-center justify-center gap-2 active:scale-95 touch-target cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4 shrink-0" />
          <span>{saveButtonLabel || t('calculatorActionBar.save', 'Guardar Histórico')}</span>
        </button>
      </div>
    </section>
  );
};
