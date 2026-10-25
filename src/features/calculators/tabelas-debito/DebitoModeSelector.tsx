import React from 'react';
import { Gauge, Scale, Search } from 'lucide-react';
import type { DebitoHubMode } from './debitoTypes';

export interface DebitoModeSelectorProps {
  activeMode: DebitoHubMode;
  onSelectMode: (mode: DebitoHubMode) => void;
}

export const DebitoModeSelector: React.FC<DebitoModeSelectorProps> = ({
  activeMode,
  onSelectMode
}) => {
  return (
    <div
      role="tablist"
      aria-label="Modo de operação das Tabelas de Débito"
      className="grid grid-cols-3 gap-1.5 bg-slate-200/80 p-1.5 rounded-2xl max-w-2xl mx-auto w-full shadow-inner"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeMode === 'unitario'}
        onClick={() => onSelectMode('unitario')}
        className={`min-h-[48px] py-2 px-2 rounded-xl font-black text-xs transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
          activeMode === 'unitario'
            ? 'bg-[#114037] text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40'
        }`}
      >
        <Gauge className="w-4 h-4 shrink-0 text-[#3CA64C]" />
        <span className="truncate">Bicos ISO</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeMode === 'comparador'}
        onClick={() => onSelectMode('comparador')}
        className={`min-h-[48px] py-2 px-2 rounded-xl font-black text-xs transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
          activeMode === 'comparador'
            ? 'bg-[#114037] text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40'
        }`}
      >
        <Scale className="w-4 h-4 shrink-0 text-[#3CA64C]" />
        <span className="truncate">Comparador</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeMode === 'alternativas'}
        onClick={() => onSelectMode('alternativas')}
        className={`min-h-[48px] py-2 px-2 rounded-xl font-black text-xs transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
          activeMode === 'alternativas'
            ? 'bg-[#114037] text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40'
        }`}
      >
        <Search className="w-4 h-4 shrink-0 text-[#3CA64C]" />
        <span className="truncate">Alternativas</span>
      </button>
    </div>
  );
};
