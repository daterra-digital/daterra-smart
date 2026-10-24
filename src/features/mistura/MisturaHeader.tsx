import React from 'react';
import { ChevronLeft, History, RotateCcw } from 'lucide-react';
import { DidacticHelp } from '../concentracao/DidacticHelp';

interface MisturaHeaderProps {
  onBack: () => void;
  onOpenHistory: () => void;
  onReset: () => void;
  historyCount: number;
}

export const MisturaHeader: React.FC<MisturaHeaderProps> = ({
  onBack,
  onOpenHistory,
  onReset,
  historyCount
}) => {
  return (
    <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar ao catálogo de ferramentas"
          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-daterra-primary" />
          <span>Voltar</span>
        </button>
        <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-lg font-black text-daterra-primary leading-tight">
              Ordem de Mistura
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Ferramenta Ativa
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Ordem técnica W.A.L.E.S., volume de calda e compatibilidade física
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <DidacticHelp
          faqFile="MisturaFAQGeral.md"
          topic="mistura-geral"
          buttonLabel="Guia"
          variant="button"
          iconType="help"
          className="px-2.5 py-1.5 !bg-emerald-50 hover:!bg-emerald-100 !text-daterra-primary border border-emerald-200 !rounded-lg !text-xs !font-bold shadow-xs cursor-pointer"
        />

        <button
          type="button"
          onClick={onOpenHistory}
          aria-label="Abrir histórico local de misturas"
          className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
        >
          <History className="w-3.5 h-3.5 text-sky-700" />
          <span className="hidden sm:inline">Histórico ({historyCount})</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          aria-label="Reiniciar mistura"
          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reiniciar</span>
        </button>
      </div>
    </div>
  );
};
