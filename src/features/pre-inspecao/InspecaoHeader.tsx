import React from 'react';
import { ChevronLeft, History, RotateCcw, BookOpen } from 'lucide-react';

interface InspecaoHeaderProps {
  onBack: () => void;
  onOpenHistory: () => void;
  onOpenGuide: () => void;
  onReset: () => void;
  historyCount: number;
}

export const InspecaoHeader: React.FC<InspecaoHeaderProps> = ({
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
          className="min-h-[48px] px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer touch-target"
        >
          <ChevronLeft className="w-4 h-4 text-[#114037]" />
          <span>Voltar</span>
        </button>
        <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-lg font-black text-[#114037] leading-tight">
              Pré-Inspeção do Pulverizador
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              ISO 16122 / DGAV
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Verificação prévia dos 5 pontos críticos antes da inspeção oficial IPP
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button
          type="button"
          onClick={onOpenGuide}
          aria-label="Abrir guia técnico da norma ISO 16122"
          className="min-h-[48px] px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#114037] border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer touch-target"
        >
          <BookOpen className="w-4 h-4 text-[#3CA64C]" />
          <span>Guia</span>
        </button>

        <button
          type="button"
          onClick={onOpenHistory}
          aria-label="Abrir histórico de pré-inspeções"
          className="min-h-[48px] px-3.5 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer touch-target"
        >
          <History className="w-4 h-4 text-sky-700" />
          <span>Histórico</span>
          {historyCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] bg-sky-600 text-white rounded-full font-black">
              {historyCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onReset}
          aria-label="Reiniciar checklist de pré-inspeção"
          className="min-h-[48px] p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer touch-target"
          title="Reiniciar checklist"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
