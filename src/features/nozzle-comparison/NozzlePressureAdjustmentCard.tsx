import React from 'react';
import { Sliders } from 'lucide-react';
import { formatPt } from './nozzleComparison.calculations';

export interface NozzlePressureAdjustmentCardProps {
  workingPressureBar: number;
  onChangePressure: (newPressure: number) => void;
  className?: string;
}

const PRESET_SHORTCUTS = [2.0, 4.0, 5.0, 10.0, 12.0, 15.0];

export const NozzlePressureAdjustmentCard: React.FC<NozzlePressureAdjustmentCardProps> = ({
  workingPressureBar,
  onChangePressure,
  className = ''
}) => {
  const handleStep = (delta: number) => {
    const next = Math.min(30.0, Math.max(1.0, Math.round((workingPressureBar + delta) * 10) / 10));
    onChangePressure(next);
  };

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangePressure(Number(e.target.value));
  };

  return (
    <div className={`bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col justify-between ${className}`}>
      <div>
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#114037] text-white flex items-center justify-center shadow-xs">
              <Sliders className="w-4 h-4 text-[#3CA64C]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C]">
                Ajuste de Calibração
              </span>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                Pressão De Trabalho
              </h3>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            ● Pressão selecionada
          </span>
        </div>

        {/* Stepper Central (-) 23,0 BAR (+) */}
        <div className="my-3 py-2 flex items-center justify-center gap-4 bg-slate-50/70 rounded-2xl border border-slate-100">
          <button
            type="button"
            onClick={() => handleStep(-0.5)}
            aria-label="Diminuir pressão"
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 active:scale-95 text-slate-700 font-black text-lg flex items-center justify-center shadow-2xs cursor-pointer transition-transform"
          >
            −
          </button>
          <div className="text-center min-w-[120px]">
            <span className="font-mono text-3xl font-black text-slate-900 tracking-tight">
              {formatPt(workingPressureBar, 1)}
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase ml-1.5">BAR</span>
          </div>
          <button
            type="button"
            onClick={() => handleStep(0.5)}
            aria-label="Aumentar pressão"
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 active:scale-95 text-slate-700 font-black text-lg flex items-center justify-center shadow-2xs cursor-pointer transition-transform"
          >
            +
          </button>
        </div>

        {/* Slider de Pressão */}
        <div className="px-1">
          <input
            type="range"
            min="1.0"
            max="30.0"
            step="0.5"
            value={workingPressureBar}
            onChange={handleSlider}
            aria-label="Barra deslizante de pressão"
            className="w-full accent-[#114037] cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>1,0 bar</span>
            <span>30,0 bar</span>
          </div>
        </div>

        {/* Atalhos Rápidos */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400">Atalhos:</span>
          {PRESET_SHORTCUTS.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => onChangePressure(p)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                workingPressureBar === p
                  ? 'bg-[#114037] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {p} bar
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
