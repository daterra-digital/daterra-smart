import React from 'react';
import { Gauge, Calculator, Minus, Plus } from 'lucide-react';
import { formatPt } from '../../../nozzle-comparison/nozzleComparison.calculations';

export interface ComparadorSliderFittsProps {
  workingPressureBar: number;
  onChangePressure: (pressure: number) => void;
  onOpenKeypad: () => void;
}

const PRESET_PRESSURES = [2.0, 3.0, 5.0, 8.0, 10.0, 15.0, 20.0, 25.0];

export const ComparadorSliderFitts: React.FC<ComparadorSliderFittsProps> = ({
  workingPressureBar,
  onChangePressure,
  onOpenKeypad
}) => {
  const handleStep = (step: number) => {
    const nextVal = Math.max(1.0, Math.min(30.0, Number((workingPressureBar + step).toFixed(1))));
    onChangePressure(nextVal);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = parseFloat(e.target.value);
    // Snapping tátil de 0.5 bar
    const snapped = Math.round(rawVal * 2) / 2;
    onChangePressure(snapped);
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
      {/* 1. Cabeçalho com Acesso ao Teclado */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C]">
            Ajuste Hidráulico
          </span>
          <h3 className="text-base font-black text-slate-900 leading-tight">
            Pressão de Trabalho
          </h3>
        </div>
        <button
          type="button"
          onClick={onOpenKeypad}
          aria-label="Abrir teclado numérico DaterraKeypad"
          className="min-h-[44px] px-3 bg-emerald-50 hover:bg-emerald-100 text-daterra-primary border border-emerald-200 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Calculator className="w-4 h-4 text-daterra-accent" />
          <span>Teclado</span>
        </button>
      </div>

      {/* 2. Mostrador Numérico Interativo (Toque aciona DaterraKeypad) */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => handleStep(-0.5)}
          aria-label="Diminuir 0.5 bar"
          className="min-h-[48px] min-w-[48px] rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-black text-lg flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          <Minus className="w-5 h-5" />
        </button>

        <div
          onClick={onOpenKeypad}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenKeypad(); }}
          aria-label="Tocar para editar pressão no teclado"
          className="flex-1 min-h-[48px] py-2 px-4 rounded-2xl bg-[#114037]/5 hover:bg-[#114037]/10 border-2 border-dashed border-[#114037]/25 flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <Gauge className="w-5 h-5 text-[#114037]" />
          <span className="text-2xl sm:text-3xl font-black font-mono text-[#114037]">
            {formatPt(workingPressureBar)}
          </span>
          <span className="text-xs font-black uppercase text-[#114037]">BAR</span>
        </div>

        <button
          type="button"
          onClick={() => handleStep(0.5)}
          aria-label="Aumentar 0.5 bar"
          className="min-h-[48px] min-w-[48px] rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-black text-lg flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* 3. Slider Híbrido com Manipulador Generoso (>= 48x48 dp) e Snapping de 0.5 bar */}
      <div className="space-y-1.5 pt-1">
        <div className="relative flex items-center h-12">
          <input
            type="range"
            min="1.0"
            max="30.0"
            step="0.5"
            value={workingPressureBar}
            onChange={handleSliderChange}
            aria-label="Slider de ajuste de pressão"
            className="w-full h-3.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#114037] focus:outline-none focus:ring-2 focus:ring-[#3CA64C]"
          />
        </div>
        <div className="flex justify-between text-[10px] font-bold text-slate-400 px-1 font-mono">
          <span>1.0 bar</span>
          <span>5.0 bar</span>
          <span>10.0 bar</span>
          <span>20.0 bar</span>
          <span>30.0 bar</span>
        </div>
      </div>

      {/* 4. Atalhos Rápidos de Campo (Hitbox >= 48px) */}
      <div>
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
          Atalhos Rápidos de Campo
        </span>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {PRESET_PRESSURES.map((p) => {
            const isSelected = Math.abs(workingPressureBar - p) < 0.05;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onChangePressure(p)}
                className={`min-h-[44px] py-1 px-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#114037] text-white shadow-xs scale-102 ring-2 ring-[#3CA64C]/50'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {formatPt(p, 0)} bar
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
