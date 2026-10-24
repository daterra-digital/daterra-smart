import React from 'react';
import { ChevronLeft, History, RotateCcw, BookOpen } from 'lucide-react';

interface DebitoHeaderProps {
  onBack: () => void;
  onOpenHistory: () => void;
  onOpenGuide: () => void;
  onReset: () => void;
  historyCount: number;
}

export const DebitoHeader: React.FC<DebitoHeaderProps> = ({
  onBack,
  onOpenHistory,
  onOpenGuide,
  onReset,
  historyCount
}) => {
  return (
    <header className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar ao catálogo de ferramentas"
          className="min-h-[44px] px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer touch-target"
        >
          <ChevronLeft className="w-4 h-4 text-[#114037]" />
          <span>Voltar</span>
        </button>
        <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-lg font-black text-[#114037] leading-tight">
              Tabelas de Débito (Comparador)
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Calibração
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Débito nominal ISO 10625, pressão e tolerâncias de desgaste (ISO 16122)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button
          type="button"
          onClick={onOpenGuide}
          aria-label="Abrir guia técnico sobre bicos e tabelas de débito"
          className="min-h-[44px] px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#114037] border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer touch-target"
        >
          <BookOpen className="w-4 h-4 text-[#3CA64C]" />
          <span>Guia</span>
        </button>

        <button
          type="button"
          onClick={onOpenHistory}
          aria-label="Abrir histórico local de calibrações de bicos"
          className="min-h-[44px] px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer touch-target"
        >
          <History className="w-4 h-4 text-sky-700" />
          <span className="hidden sm:inline">Histórico ({historyCount})</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          aria-label="Reiniciar parâmetros de bico e pressão"
          className="min-h-[44px] px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer touch-target"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reiniciar</span>
        </button>
      </div>
    </header>
  );
};
