import React from 'react';
import { ShieldCheck, Scale } from 'lucide-react';
import type { EvaluationStyle } from '../types/inspecaoTypes';

interface EvaluationStyleSelectorProps {
  selectedStyle: EvaluationStyle;
  onChangeStyle: (style: EvaluationStyle) => void;
}

export const EvaluationStyleSelector: React.FC<EvaluationStyleSelectorProps> = ({
  selectedStyle,
  onChangeStyle
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C] block">
          Estilo de Avaliação
        </span>
        <span className="text-[11px] font-mono text-slate-500 font-bold">
          {selectedStyle === 'dgav_oficial' ? 'DL 26/2017 IPP' : 'ISO 16122 (1 a 4)'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChangeStyle('iso_16122')}
          className={`min-h-[48px] py-2.5 px-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer touch-target ${
            selectedStyle === 'iso_16122'
              ? 'bg-[#114037] text-white shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <ShieldCheck className={`w-4 h-4 ${selectedStyle === 'iso_16122' ? 'text-[#8ffa94]' : 'text-slate-400'}`} />
          <span>Norma ISO 16122</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeStyle('dgav_oficial')}
          className={`min-h-[48px] py-2.5 px-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer touch-target ${
            selectedStyle === 'dgav_oficial'
              ? 'bg-[#114037] text-white shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Scale className={`w-4 h-4 ${selectedStyle === 'dgav_oficial' ? 'text-[#8ffa94]' : 'text-slate-400'}`} />
          <span>Inspeção Oficial Portugal (DGAV)</span>
        </button>
      </div>
    </div>
  );
};
