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
import { useLanguage } from '../../../context/LanguageContext.tsx';

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
  badgeLabel,
  onBack
}) => {
  const { t } = useLanguage();
  const activeLabel = badgeLabel ?? t('common.activeTool', 'Ferramenta Ativa');

  return (
    <header className="bg-white p-3 sm:p-3.5 rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-soft flex items-center justify-between gap-3">
      {/* Lado Esquerdo: Botão Voltar + Categoria e Título */}
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold touch-target active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#114037] shrink-0"
            aria-label={t('common.backToTools', 'Voltar ao catálogo de ferramentas')}
          >
            <ChevronLeft className="w-4 h-4 text-daterra-primary" />
            <span className="hidden sm:inline">{t('common.backToTools', 'Voltar às Ferramentas')}</span>
            <span className="sm:hidden">{t('common.back', 'Voltar')}</span>
          </button>
        )}
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-daterra-accent leading-none">
            {category}
          </span>
          <h1 className="text-sm sm:text-base md:text-lg font-black text-daterra-primary leading-tight truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Lado Direito: Badge Ferramenta Ativa */}
      {activeLabel && (
        <div className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full flex items-center gap-1.5 shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>{activeLabel}</span>
        </div>
      )}
    </header>
  );
};
