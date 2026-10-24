import React from 'react';
import { Sprout, Trees } from 'lucide-react';
import type { ConcentracaoUnit, ConcentracaoMode } from './concentracaoDataMapper';

interface ConcentracaoModeSelectorProps {
  mode: ConcentracaoMode;
  concUnit: ConcentracaoUnit;
  onSetMode: (m: ConcentracaoMode) => void;
  onSetUnit: (u: ConcentracaoUnit) => void;
}

export const ConcentracaoModeSelector: React.FC<ConcentracaoModeSelectorProps> = ({
  mode,
  concUnit,
  onSetMode,
  onSetUnit
}) => {
  const isJovem = mode === 'jovem';
  const units: ConcentracaoUnit[] = ['mL/hL', 'g/hL', '%', 'L/hL', 'kg/hL'];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-[#114037]">
            Valores Introduzidos
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">
            Toque nos parâmetros para editar via teclado tátil
          </span>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => onSetMode('jovem')}
            className={`min-h-[44px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isJovem ? 'bg-[#114037] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Planta Jovem</span>
          </button>
          <button
            type="button"
            onClick={() => onSetMode('adulta')}
            className={`min-h-[44px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              !isJovem ? 'bg-[#114037] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trees className="w-3.5 h-3.5" />
            <span>Copa Adulta</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Unidade:</span>
        {units.map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => onSetUnit(u)}
            className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              concUnit === u
                ? 'bg-[#114037] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {u}
          </button>
        ))}
      </div>
    </div>
  );
};
