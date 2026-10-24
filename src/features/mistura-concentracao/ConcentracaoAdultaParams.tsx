import React from 'react';
import { Edit2 } from 'lucide-react';

interface ConcentracaoAdultaParamsProps {
  volRecomendado: number;
  volAplicado: number;
  onOpenKeypad: (field: 'volRecomendado' | 'volAplicado') => void;
}

export const ConcentracaoAdultaParams: React.FC<ConcentracaoAdultaParamsProps> = ({
  volRecomendado,
  volAplicado,
  onOpenKeypad
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Volume Recomendado</span>
          <span className="text-sm font-mono font-black text-slate-800">{volRecomendado} L/ha</span>
        </div>
        <button
          type="button"
          onClick={() => onOpenKeypad('volRecomendado')}
          aria-label="Editar volume recomendado de calda"
          className="p-2 text-slate-500 hover:text-[#114037] cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Volume Aplicado</span>
          <span className="text-sm font-mono font-black text-slate-800">{volAplicado} L/ha</span>
        </div>
        <button
          type="button"
          onClick={() => onOpenKeypad('volAplicado')}
          aria-label="Editar volume aplicado de calda"
          className="p-2 text-slate-500 hover:text-[#114037] cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
