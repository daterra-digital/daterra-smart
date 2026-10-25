import React from 'react';
import { Gauge } from 'lucide-react';
import { formatPt } from '../../../nozzle-comparison/nozzleComparison.calculations.ts';

export interface AlternativasHabitualPressureControlProps {
  habitualPressureBar: number;
  targetFlowLMin: number;
  onChangeHabitualPressure: (pressure: number) => void;
  onOpenKeypad: () => void;
}

const PRESET_PRESSURES = [2.0, 3.0, 5.0, 8.0, 10.0, 15.0, 20.0, 25.0];

export const AlternativasHabitualPressureControl: React.FC<AlternativasHabitualPressureControlProps> = ({
  habitualPressureBar,
  targetFlowLMin,
  onChangeHabitualPressure,
  onOpenKeypad
}) => {
  return (
    <div className="space-y-3 pt-1">
      {/* Mostrador Numérico e Débito Resultante */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          onClick={onOpenKeypad}
          className="min-h-[48px] py-2 px-3.5 rounded-2xl bg-[#114037]/5 hover:bg-[#114037]/10 border-2 border-dashed border-[#114037]/25 flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-[#114037]" />
            <span className="text-xs font-bold text-slate-700">Pressão Habitual:</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black font-mono text-[#114037]">{formatPt(habitualPressureBar)}</span>
            <span className="text-xs font-black text-[#114037]">BAR</span>
          </div>
        </div>

        <div className="min-h-[48px] py-2 px-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">Débito Real Apurado:</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black font-mono text-[#114037]">{formatPt(targetFlowLMin)}</span>
            <span className="text-xs font-black text-[#114037]">L/min</span>
          </div>
        </div>
      </div>

      {/* Slider de Pressão Habitual 1.0 a 30.0 bar */}
      <div className="space-y-1">
        <div className="relative flex items-center h-10">
          <input
            type="range"
            min="1.0"
            max="30.0"
            step="0.5"
            value={habitualPressureBar}
            onChange={(e) => {
              const raw = parseFloat(e.target.value);
              onChangeHabitualPressure(Math.round(raw * 2) / 2);
            }}
            aria-label="Slider de ajuste de pressão habitual"
            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#114037] focus:outline-none focus:ring-2 focus:ring-[#3CA64C]"
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

      {/* Atalhos Rápidos de Pressão Habitual */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-black uppercase text-slate-400 shrink-0 mr-1">Atalhos:</span>
        {PRESET_PRESSURES.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChangeHabitualPressure(p)}
            className={`min-h-[36px] px-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              Math.abs(habitualPressureBar - p) < 0.1 ? 'bg-[#114037] text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {formatPt(p, 0)} bar
          </button>
        ))}
      </div>
    </div>
  );
};
