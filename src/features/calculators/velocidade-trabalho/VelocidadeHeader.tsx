import React from 'react';
import { ChevronLeft, History, RotateCcw } from 'lucide-react';
import { DidacticHelp } from '../../concentracao/DidacticHelp';
import { useLanguage } from '../../../context/LanguageContext';

interface VelocidadeHeaderProps {
  onBack: () => void;
  onOpenHistory: () => void;
  onReset: () => void;
  historyCount: number;
}

export const VelocidadeHeader: React.FC<VelocidadeHeaderProps> = ({
  onBack,
  onOpenHistory,
  onReset,
  historyCount
}) => {
  const { t } = useLanguage();

  return (
    <header className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label={t('common.backToTools', 'Voltar ao catálogo de ferramentas')}
          className="min-h-[48px] px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer touch-target"
        >
          <ChevronLeft className="w-4 h-4 text-[#114037]" />
          <span>{t('common.back', 'Voltar')}</span>
        </button>
        <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-lg font-black text-[#114037] leading-tight">
              {t('velocidadeReal.title', 'Velocidade Real de Trabalho')}
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {t('velocidadeReal.category', 'Calibração')}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {t('velocidadeReal.subtitle', 'Determinação cronometrada em campo para apoio à calibração')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <DidacticHelp
          faqFile="VelocidadeRealFAQGeral.md"
          topic="velocidade-real-geral"
          buttonLabel={t('common.guide', 'Guia')}
          variant="button"
          iconType="help"
          className="min-h-[48px] px-3.5 py-2.5 !bg-emerald-50 hover:!bg-emerald-100 !text-[#114037] border border-emerald-200 !rounded-xl !text-xs !font-bold shadow-xs cursor-pointer touch-target"
        />

        <button
          type="button"
          onClick={onOpenHistory}
          aria-label={t('velocidadeReal.actions.historyAria', 'Abrir histórico local de medições de velocidade')}
          className="min-h-[48px] px-3.5 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer touch-target"
        >
          <History className="w-4 h-4 text-sky-700" />
          <span className="hidden sm:inline">{t('common.history', 'Histórico')} ({historyCount})</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          aria-label={t('velocidadeReal.actions.resetAria', 'Reiniciar parâmetros da medição')}
          className="min-h-[48px] px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer touch-target"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>{t('common.reset', 'Reiniciar')}</span>
        </button>
      </div>
    </header>
  );
};
