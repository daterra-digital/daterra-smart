import React from 'react';
import { BookmarkCheck, History } from 'lucide-react';
import { DidacticHelp } from '../concentracao/DidacticHelp';

interface PhFooterBarProps {
  onSave: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const PhFooterBar: React.FC<PhFooterBarProps> = ({
  onSave,
  onOpenHistory,
  historyCount
}) => {
  return (
    <nav
      aria-label="Barra de ações da consulta de pH"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-lg"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onSave}
          aria-label="Guardar resultado da consulta de pH no histórico local"
          className="min-h-[48px] flex-1 bg-[#114037] hover:bg-[#1a5c50] text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer touch-target"
        >
          <BookmarkCheck className="w-4 h-4 text-[#8ffa94]" />
          <span>Guardar Histórico</span>
        </button>

        <button
          type="button"
          onClick={onOpenHistory}
          aria-label="Ver histórico local de consultas de pH"
          className="min-h-[48px] px-3.5 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer touch-target shrink-0"
        >
          <History className="w-4 h-4 text-sky-700" />
          <span className="hidden sm:inline">Histórico</span>
          {historyCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] bg-sky-600 text-white rounded-full font-black">
              {historyCount}
            </span>
          )}
        </button>

        <DidacticHelp
          faqFile="MisturaFAQpH.md"
          topic="ph-geral"
          buttonLabel="Guia"
          variant="button"
          iconType="help"
          className="min-h-[48px] px-3.5 py-2.5 !bg-emerald-50 hover:!bg-emerald-100 !text-[#114037] border border-emerald-200 !rounded-2xl !text-xs !font-bold shadow-xs cursor-pointer touch-target shrink-0"
        />
      </div>
    </nav>
  );
};
