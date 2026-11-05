/**
 * DATERRA Smart - Cabeçalho Institucional Oficial (Aplicação Manual)
 * Padrão Canónico LWA / Master Blueprint DATERRA (< 200 LOC)
 */

import React from 'react';
import { ChevronLeft, History, RotateCcw, BookOpen } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export interface ManualHeaderProps {
  onBack: () => void;
  onOpenHistory: () => void;
  onOpenGuide: () => void;
  onReset: () => void;
  historyCount: number;
}

export const ManualHeader: React.FC<ManualHeaderProps> = ({
  onBack,
  onOpenHistory,
  onOpenGuide,
  onReset,
  historyCount
}) => {
  const { t } = useLanguage();

  return (
    <header className="bg-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Lado Esquerdo: Voltar + Título e Badges */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label={t('common.backToTools', 'Voltar ao catálogo de ferramentas')}
          className="min-h-[48px] px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer touch-target shrink-0"
        >
          <ChevronLeft className="w-4 h-4 text-[#114037]" />
          <span>{t('common.back', 'Voltar')}</span>
        </button>

        <div className="h-6 w-[1px] bg-slate-200 hidden sm:block shrink-0" />

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-lg font-black text-[#114037] leading-tight">
              {t('manual.start.title', 'Aplicação Manual')}
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {t('common.spraying', 'Pulverização')}
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {t('common.freeBadge', 'Gratuito')}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium line-clamp-1 sm:line-clamp-none">
            {t('manual.header.subtitle', 'Cálculo da quantidade de produto para o volume de calda a preparar')}
          </p>
        </div>
      </div>

      {/* Lado Direito: Ações Rápidas (Guia Técnico, Histórico, Reiniciar) */}
      <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
        <button
          type="button"
          onClick={onOpenGuide}
          aria-label={t('manual.actions.guideAria', 'Abrir Guia Técnico da Aplicação Manual')}
          className="min-h-[48px] px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#114037] border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer touch-target"
        >
          <BookOpen className="w-4 h-4 text-[#3CA64C]" />
          <span>{t('manual.actions.techGuide', 'Guia Técnico')}</span>
        </button>

        <button
          type="button"
          onClick={onOpenHistory}
          aria-label={t('manual.actions.historyAria', 'Abrir histórico local com {{count}} registos', { count: historyCount })}
          className="min-h-[48px] px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#114037] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer touch-target"
        >
          <History className="w-4 h-4 text-slate-500" />
          <span>{t('common.history', 'Histórico')} ({historyCount})</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          aria-label={t('manual.actions.resetAria', 'Reiniciar parâmetros da aplicação manual')}
          className="min-h-[48px] px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer touch-target"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">{t('common.reset', 'Reiniciar')}</span>
        </button>
      </div>
    </header>
  );
};
