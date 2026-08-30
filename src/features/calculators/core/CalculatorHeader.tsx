/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Componente: CalculatorHeader
 * Fase 2 - Componentes Atómicos do Template Oficial
 * 
 * Barra superior oficial conforme a Imagem 1 de referência:
 * - Botão de retorno às ferramentas
 * - Categoria agronómica
 * - Título oficial da calculadora
 * - Badge de estado (ex: "Ferramenta Ativa")
 * - Botão de Histórico (preparado com callback e contador de cálculos, sem drawer funcional na Fase 2)
 */

import React from 'react';
import { ChevronLeft, History, CheckCircle2 } from 'lucide-react';

export interface CalculatorHeaderProps {
  /** Título principal da calculadora (ex: 'Calculadora de Dose por Hectare') */
  title: string;
  /** Categoria agronómica em caixa alta (ex: 'PULVERIZAÇÃO', 'CALIBRAÇÃO') */
  category: string;
  /** Rótulo do badge de estado (padrão: 'Ferramenta Ativa') */
  badgeLabel?: string;
  /** Ação ao clicar em "Voltar às Ferramentas" */
  onBack?: () => void;
  /** Callback opcional de clique no botão "Histórico" (ação visual preparada para Fase 4) */
  onOpenHistory?: () => void;
  /** Número de cálculos ativos guardados (opcional, para visualização de quota na Fase 4) */
  historyCount?: number;
  /** Limite máximo de cálculos (padrão: 20) */
  maxHistory?: number;
}

export const CalculatorHeader: React.FC<CalculatorHeaderProps> = ({
  title,
  category,
  badgeLabel = 'Ferramenta Ativa',
  onBack,
  onOpenHistory,
  historyCount,
  maxHistory = 20
}) => {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-soft">
      {/* Secção Esquerda: Navegação de Regresso + Categoria + Título */}
      <div className="flex items-center gap-3 flex-wrap">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all flex items-center gap-1.5 text-xs font-bold touch-target active:scale-95"
            aria-label="Voltar ao catálogo de ferramentas"
          >
            <ChevronLeft className="w-4 h-4 text-daterra-primary" />
            <span>Voltar às Ferramentas</span>
          </button>
        )}

        <div className="hidden sm:block h-6 w-[1px] bg-slate-200" aria-hidden="true" />

        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-daterra-accent">
            {category}
          </span>
          <h1 className="text-base sm:text-lg font-black text-daterra-primary leading-tight">
            {title}
          </h1>
        </div>
      </div>

      {/* Secção Direita: Botão Histórico (Preparado) + Badge de Estado */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
        {/* Botão de Histórico Acessível (Ponto de Integração Obrigatório) */}
        <button
          type="button"
          onClick={onOpenHistory}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-daterra-primary rounded-2xl transition-all flex items-center gap-2 text-xs font-bold touch-target border border-slate-200/60 active:scale-95"
          aria-label={
            historyCount !== undefined
              ? `Consultar histórico: ${historyCount} de ${maxHistory} cálculos guardados`
              : 'Consultar histórico de cálculos'
          }
          title={
            historyCount !== undefined
              ? `${historyCount} de ${maxHistory} cálculos guardados`
              : 'Histórico'
          }
        >
          <History className="w-4 h-4 text-daterra-primary shrink-0" />
          <span className="inline">
            Histórico{historyCount !== undefined && historyCount > 0 ? ` · ${historyCount}/${maxHistory}` : ''}
          </span>
        </button>

        {/* Badge Oficial "Ferramenta Ativa" */}
        {badgeLabel && (
          <div className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full flex items-center gap-1 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{badgeLabel}</span>
          </div>
        )}
      </div>
    </header>
  );
};
