/**
 * DATERRA Smart - Barra de Ações Inferior Oficial (Aplicação Manual)
 * Padrão Canónico LWA / Mobile-First Safe Area (< 200 LOC)
 */

import React from 'react';
import { Bookmark, History, BookOpen, Check } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export interface ManualFooterBarProps {
  onSave: () => void;
  onOpenHistory: () => void;
  onOpenGuide: () => void;
  historyCount: number;
  isSaving?: boolean;
  isSaved?: boolean;
}

export const ManualFooterBar: React.FC<ManualFooterBarProps> = ({
  onSave,
  onOpenHistory,
  onOpenGuide,
  historyCount,
  isSaving = false,
  isSaved = false
}) => {
  const { t } = useLanguage();

  return (
    <aside
      aria-label={t('manual.actions.footerAria', 'Ações da ferramenta de aplicação manual')}
      className="fixed bottom-[var(--bottom-nav-total-height,5rem)] md:bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-2.5 z-35 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
    >
      <div className="max-w-4xl mx-auto grid grid-cols-3 gap-2">
        {/* Botão Guardar / Guardado */}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || isSaved}
          aria-label={
            isSaved
              ? t('common.actions.savedAria', 'Cálculo já guardado no histórico')
              : t('common.actions.saveAria', 'Guardar cálculo da calda no histórico')
          }
          className={`h-12 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all touch-target cursor-pointer ${
            isSaved
              ? 'bg-emerald-800 text-emerald-100 cursor-default'
              : 'bg-[#3CA64C] hover:bg-[#349142] text-white active:scale-98'
          }`}
        >
          {isSaved ? (
            <Check className="w-4 h-4 text-emerald-300" />
          ) : (
            <Bookmark className="w-4 h-4 text-white" />
          )}
          <span className="truncate">
            {isSaving
              ? t('common.actions.saving', 'A guardar...')
              : isSaved
              ? t('common.actions.saved', 'Guardado')
              : t('common.actions.save', 'Guardar')}
          </span>
        </button>

        {/* Botão Histórico */}
        <button
          type="button"
          onClick={onOpenHistory}
          aria-label={t('manual.actions.historyAria', 'Abrir histórico local com {{count}} registos', {
            count: historyCount
          })}
          className="h-12 bg-slate-100 hover:bg-slate-200 text-[#114037] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer touch-target"
        >
          <History className="w-4 h-4 text-slate-500" />
          <span className="truncate">
            {t('common.history', 'Histórico')} ({historyCount})
          </span>
        </button>

        {/* Botão Guia Técnico */}
        <button
          type="button"
          onClick={onOpenGuide}
          aria-label={t('manual.actions.guideAria', 'Abrir Guia Técnico da Aplicação Manual')}
          className="h-12 bg-slate-100 hover:bg-slate-200 text-[#114037] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer touch-target"
        >
          <BookOpen className="w-4 h-4 text-[#3CA64C]" />
          <span className="truncate">
            {t('manual.actions.techGuide', 'Guia Técnico')}
          </span>
        </button>
      </div>
    </aside>
  );
};
