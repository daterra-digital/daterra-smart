/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Componente: CalculatorHeader
 * Correção Final de UX - Cabeçalho Contextual
 * 
 * Estrutura:
 * - Linha de contexto superior: [ Voltar às Ferramentas ] (Esquerda) + [ Ferramenta Ativa ] (Direita)
 * - Linha de título: Categoria agronómica + Título oficial da calculadora
 */

import React from 'react';
import { ChevronLeft, CheckCircle2 } from 'lucide-react';

export interface CalculatorHeaderProps {
  /** Título principal da calculadora (ex: 'Calculadora de Dose por Hectare') */
  title: string;
  /** Categoria agronómica em caixa alta (ex: 'PULVERIZAÇÃO', 'CALIBRAÇÃO') */
  category: string;
  /** Rótulo do badge de estado (padrão: 'Ferramenta Ativa') */
  badgeLabel?: string;
  /** Ação ao clicar em "Voltar às Ferramentas" */
  onBack?: () => void;
}

export const CalculatorHeader: React.FC<CalculatorHeaderProps> = ({
  title,
  category,
  badgeLabel = 'Ferramenta Ativa',
  onBack
}) => {
  return (
    <header className="flex flex-col gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-soft">
      {/* 1. Linha Superior de Contexto: Botão Voltar (Esquerda) + Badge Ferramenta Ativa (Direita/Ao lado) */}
      <div className="flex items-center justify-between gap-3 w-full">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all flex items-center gap-1.5 text-xs font-bold touch-target active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#114037]"
            aria-label="Voltar ao catálogo de ferramentas"
          >
            <ChevronLeft className="w-4 h-4 text-daterra-primary" />
            <span>Voltar às Ferramentas</span>
          </button>
        ) : (
          <div />
        )}

        {badgeLabel && (
          <div className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full flex items-center gap-1.5 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>{badgeLabel}</span>
          </div>
        )}
      </div>

      {/* 2. Linha Principal: Categoria + Título da Calculadora */}
      <div className="flex flex-col pt-2 border-t border-slate-100">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-daterra-accent">
          {category}
        </span>
        <h1 className="text-base sm:text-xl font-black text-daterra-primary leading-tight">
          {title}
        </h1>
      </div>
    </header>
  );
};
