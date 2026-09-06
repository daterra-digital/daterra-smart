/**
 * DATERRA Smart - Barra Contextual Inferior de Ações para Calculadoras
 * Componente: CalculatorActionBar
 * Correção UX P2 - Mobile & Tablet (< 1024px)
 * 
 * Estrutura Visual:
 * [          Guardar (~50%)          ] [ Histórico (~25%) ] [ Guia Técnico (~25%) ]
 * 
 * Regras:
 * - Guardar: Ação primária (verde institucional #114037), ativa apenas quando cálculo é válido
 * - Histórico: Ação secundária, abre o drawer de histórico existente
 * - Guia Técnico: Ação terciária, abre o modal de microlearning/didactic help geral existente
 * - Acessibilidade: <button type="button">, min-h-[48px], touch-target >=48x48px, labels i18n
 * - Responsividade: Em 320px os botões secundários exibem apenas ícones com aria-label acessível; em >=375px exibem texto
 * - Posicionamento: Fixed acima da BottomNavigationBar via tokens CSS em .calculator-action-bar-position
 */

import React from 'react';
import { Save, History, BookOpen } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext.tsx';

export interface CalculatorActionBarProps {
  /** Indica se o cálculo atual é válido para poder ser gravado */
  isValid: boolean;
  /** Estado de gravação em curso */
  isSaving?: boolean;
  /** Rótulo personalizado do botão de gravação */
  saveButtonLabel?: string;
  /** Callback acionado ao clicar em Guardar */
  onSave: () => void;
  /** Callback acionado ao clicar em Histórico */
  onOpenHistory: () => void;
  /** Callback acionado ao clicar em Guia Técnico */
  onOpenTechnicalGuide?: () => void;
  /** Indica se existe um ficheiro de ajuda geral/guia técnico disponível para a calculadora */
  hasTechnicalGuide?: boolean;
  /** Contagem de registos no histórico (opcional) */
  historyCount?: number;
  /** Classe CSS adicional */
  className?: string;
}

export const CalculatorActionBar: React.FC<CalculatorActionBarProps> = ({
  isValid,
  isSaving = false,
  saveButtonLabel,
  onSave,
  onOpenHistory,
  onOpenTechnicalGuide,
  hasTechnicalGuide = true,
  historyCount,
  className = ''
}) => {
  const { t } = useLanguage();

  const isSaveActive = isValid && !isSaving;

  return (
    <aside
      aria-label="Ações da calculadora"
      className={`calculator-action-bar-position bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] ${className}`}
    >
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-2 flex items-center gap-1.5 sm:gap-3 w-full">
        {/* 1. Botão Guardar: ~50% da largura (Ação Primária) */}
        <button
          type="button"
          onClick={onSave}
          disabled={!isSaveActive}
          aria-disabled={!isSaveActive}
          title={
            !isSaveActive
              ? t('calculatorActionBar.saveDisabled', 'Introduza todos os valores para guardar')
              : t('calculatorActionBar.saveCalculation', 'Guardar Cálculo')
          }
          aria-label={t('calculatorActionBar.saveCalculation', 'Guardar Cálculo')}
          className={`flex-[2] basis-1/2 min-h-[48px] px-1.5 sm:px-4 py-2.5 rounded-2xl font-black text-[11px] min-[360px]:text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 shadow-xs transition-all touch-target select-none focus-visible:outline-2 focus-visible:outline-[#3CA64C] ${
            isSaveActive
              ? 'bg-[#114037] hover:bg-[#175348] text-white active:scale-98 cursor-pointer'
              : 'bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed shadow-none'
          }`}
        >
          <Save
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isSaveActive ? 'text-[#3CA64C]' : 'text-slate-400'}`}
            aria-hidden="true"
          />
          <span className="truncate">{saveButtonLabel || t('calculatorActionBar.save', 'Guardar Histórico')}</span>
        </button>

        {/* 2. Botão Histórico: ~25% da largura (Ação Secundária) */}
        <button
          type="button"
          onClick={onOpenHistory}
          aria-label={t('calculatorActionBar.openHistory', 'Abrir Histórico')}
          title={t('calculatorActionBar.openHistory', 'Abrir Histórico')}
          className="flex-1 basis-1/4 min-h-[48px] px-1 sm:px-3 py-2.5 rounded-2xl font-bold text-[11px] min-[360px]:text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-98 flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer touch-target select-none focus-visible:outline-2 focus-visible:outline-[#114037]"
        >
          <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {t('calculatorActionBar.history', 'Histórico')}
          </span>
          {typeof historyCount === 'number' && historyCount > 0 && (
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-extrabold bg-[#114037] text-white rounded-full ml-0.5">
              {historyCount}
            </span>
          )}
        </button>

        {/* 3. Botão Guia: ~25% da largura (Ação Terciária) */}
        <button
          type="button"
          onClick={onOpenTechnicalGuide}
          disabled={!hasTechnicalGuide || !onOpenTechnicalGuide}
          aria-disabled={!hasTechnicalGuide || !onOpenTechnicalGuide}
          aria-label={t('calculatorActionBar.openTechnicalGuide', 'Consultar Guia')}
          title={
            hasTechnicalGuide && onOpenTechnicalGuide
              ? t('calculatorActionBar.openTechnicalGuide', 'Consultar Guia')
              : t('calculatorActionBar.noTechnicalGuideAvailable', 'Guia técnico não disponível')
          }
          className={`flex-1 basis-1/4 min-h-[48px] px-1 sm:px-3 py-2.5 rounded-2xl font-bold text-[11px] min-[360px]:text-xs sm:text-sm active:scale-98 flex items-center justify-center gap-1 sm:gap-1.5 transition-all touch-target select-none focus-visible:outline-2 focus-visible:outline-[#114037] ${
            hasTechnicalGuide && onOpenTechnicalGuide
              ? 'bg-[#1D734B]/10 hover:bg-[#1D734B]/20 text-[#1D734B] cursor-pointer'
              : 'bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed'
          }`}
        >
          <BookOpen
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
              hasTechnicalGuide && onOpenTechnicalGuide ? 'text-[#1D734B]' : 'text-slate-400'
            }`}
            aria-hidden="true"
          />
          <span className="truncate">
            {t('calculatorActionBar.guide', 'Guia')}
          </span>
        </button>
      </div>
    </aside>
  );
};
