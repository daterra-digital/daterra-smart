/**
 * DATERRA Smart - Ecrã Inicial da Aplicação Manual
 * Shell de Boas-vindas e Acesso Rápido (< 200 LOC)
 */

import React from 'react';
import { Calculator, BookOpen, History } from 'lucide-react';
import { useLanguage } from '../../../../src/context/LanguageContext';

export interface ManualStartCardProps {
  historyCount: number;
  onStart: () => void;
  onOpenGuide: () => void;
  onOpenHistory: () => void;
}

export const ManualStartCard: React.FC<ManualStartCardProps> = ({
  historyCount,
  onStart,
  onOpenGuide,
  onOpenHistory
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs text-center space-y-5 animate-fade-in">
      <div className="w-16 h-16 rounded-3xl bg-[#114037]/10 text-[#114037] flex items-center justify-center mx-auto">
        <Calculator className="w-8 h-8 text-[#3CA64C]" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">{t('manual.start.title', 'Aplicação Manual')}</h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">{t('manual.start.desc', 'Calcule a quantidade de produto e a área aproximada a tratar, passo a passo.')}</p>
      </div>
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onStart}
          className="w-full sm:w-auto px-7 py-3.5 bg-[#114037] hover:bg-[#114037]/90 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all touch-target cursor-pointer flex items-center justify-center gap-2"
        >
          <span>{t('manual.start.startBtn', 'Começar cálculo')}</span>
        </button>
        <button
          type="button"
          onClick={onOpenGuide}
          className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-all touch-target cursor-pointer flex items-center justify-center gap-2"
        >
          <BookOpen className="w-4 h-4 text-[#3CA64C]" />
          <span>{t('manual.actions.techGuide', 'Guia Técnico')}</span>
        </button>
      </div>
      {historyCount > 0 && (
        <div className="pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 touch-target cursor-pointer"
          >
            <History className="w-4 h-4 text-slate-400" />
            <span>{t('common.actions.historyWithCount', 'Ver Histórico ({{count}})', { count: historyCount })}</span>
          </button>
        </div>
      )}
    </div>
  );
};
