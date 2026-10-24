import React from 'react';
import { Edit2, Droplet } from 'lucide-react';

interface EppoDoseSecondaryParamsProps {
  lwaRef: number;
  capacidadeDeposito: number;
  volumeCaldaLHa: number;
  onOpenKeypad: (field: 'lwaRef' | 'capacidadeDeposito' | 'volumeCaldaLHa') => void;
}

export const EppoDoseSecondaryParams: React.FC<EppoDoseSecondaryParamsProps> = ({
  lwaRef,
  capacidadeDeposito,
  volumeCaldaLHa,
  onOpenKeypad
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-500 block">LWA Referência</span>
          <span className="text-sm font-mono font-black text-slate-800">{lwaRef.toLocaleString('pt-PT')} m²</span>
        </div>
        <button
          type="button"
          onClick={() => onOpenKeypad('lwaRef')}
          aria-label="Editar LWA de referência"
          className="p-2 text-slate-500 hover:text-[#114037] cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Depósito</span>
          <span className="text-sm font-mono font-black text-slate-800">{capacidadeDeposito} L</span>
        </div>
        <button
          type="button"
          onClick={() => onOpenKeypad('capacidadeDeposito')}
          aria-label="Editar capacidade do depósito"
          className="p-2 text-slate-500 hover:text-[#114037] cursor-pointer"
        >
          <Droplet className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Volume Calda</span>
          <span className="text-sm font-mono font-black text-slate-800">{volumeCaldaLHa} L/ha</span>
        </div>
        <button
          type="button"
          onClick={() => onOpenKeypad('volumeCaldaLHa')}
          aria-label="Editar volume de calda aplicado"
          className="p-2 text-slate-500 hover:text-[#114037] cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
