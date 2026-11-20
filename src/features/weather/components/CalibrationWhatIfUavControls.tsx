// src/features/weather/components/CalibrationWhatIfUavControls.tsx
import React from 'react';
import { Minus, Plus } from 'lucide-react';
import type { ResolvedCalibrationChain, WhatIfSimulationResult, WhatIfValues } from '../utils/calibrationWhatIfHelpers.ts';
import { formatDecimalPt } from '../utils/windDirection.ts';

export type UavSimKeypadTarget = 'speed' | 'pressure' | 'height' | 'cdaRpm';

interface CalibrationWhatIfUavControlsProps {
  chain: ResolvedCalibrationChain;
  vals: WhatIfValues;
  liveSim: WhatIfSimulationResult;
  onStep: (field: UavSimKeypadTarget, delta: number) => void;
  onOpenKeypad: (field: UavSimKeypadTarget) => void;
  onToggleAdjuvant: () => void;
}

export const CalibrationWhatIfUavControls: React.FC<CalibrationWhatIfUavControlsProps> = ({
  chain, vals, liveSim, onStep, onOpenKeypad, onToggleAdjuvant
}) => {
  const isCda = (chain.uavDetails?.atomizationSystem ?? 'CENTRIFUGAL_CDA') === 'CENTRIFUGAL_CDA';
  const speedMs = liveSim.uavSpeedMs ?? Math.round((vals.speedKmh / 3.6) * 10) / 10;
  const cdaRpm = vals.cdaDiscRpm ?? chain.baseCdaDiscRpm ?? 10000;

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="bg-white rounded-xl border border-slate-200 p-2.5 space-y-1">
          <div className="text-[10px] font-bold uppercase text-slate-500">Altura de Voo (Copa)</div>
          <div className="flex items-center justify-between gap-1">
            <button type="button" aria-label="Reduzir altura de voo" onClick={() => onStep('height', -0.5)} className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
            <button type="button" onClick={() => onOpenKeypad('height')} className="flex-1 text-center font-mono-numbers text-sm font-black text-[#114037] py-1 rounded-lg hover:bg-emerald-50 cursor-pointer">{formatDecimalPt(vals.heightVal)} m</button>
            <button type="button" aria-label="Aumentar altura de voo" onClick={() => onStep('height', 0.5)} className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
          </div>
          <div className="text-[10px] text-slate-500 font-mono-numbers">Ideal: 1,5–2,5 m · Alerta &gt; 3,0 m</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-2.5 space-y-1">
          <div className="text-[10px] font-bold uppercase text-slate-500">Velocidade de Voo UAV</div>
          <div className="flex items-center justify-between gap-1">
            <button type="button" aria-label="Reduzir velocidade UAV" onClick={() => onStep('speed', -1)} className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
            <button type="button" onClick={() => onOpenKeypad('speed')} className="flex-1 text-center font-mono-numbers text-sm font-black text-[#114037] py-1 rounded-lg hover:bg-emerald-50 cursor-pointer">{formatDecimalPt(vals.speedKmh)} km/h</button>
            <button type="button" aria-label="Aumentar velocidade UAV" onClick={() => onStep('speed', 1)} className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
          </div>
          <div className="text-[10px] text-slate-500 font-mono-numbers">{formatDecimalPt(speedMs)} m/s · Esteira &gt; 6,0 m/s</div>
        </div>

        {isCda ? (
          <div className="bg-white rounded-xl border border-slate-200 p-2.5 space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-500">Rotação Discos CDA</div>
            <div className="flex items-center justify-between gap-1">
              <button type="button" aria-label="Reduzir RPM CDA" onClick={() => onStep('cdaRpm', -500)} className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => onOpenKeypad('cdaRpm')} className="flex-1 text-center font-mono-numbers text-sm font-black text-[#114037] py-1 rounded-lg hover:bg-emerald-50 cursor-pointer">{Math.round(cdaRpm).toLocaleString('pt-PT')} RPM</button>
              <button type="button" aria-label="Aumentar RPM CDA" onClick={() => onStep('cdaRpm', 500)} className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
            </div>
            <div className="text-[10px] text-slate-500 font-mono-numbers">Gotas &lt; 100 µm acima de 12.000 RPM</div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-2.5 space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-500">Pressão Hidráulica UAV</div>
            <div className="flex items-center justify-between gap-1">
              <button type="button" aria-label="Reduzir pressão UAV" onClick={() => onStep('pressure', -0.5)} className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => onOpenKeypad('pressure')} className="flex-1 text-center font-mono-numbers text-sm font-black text-[#114037] py-1 rounded-lg hover:bg-emerald-50 cursor-pointer">{formatDecimalPt(vals.pressureBar)} bar</button>
              <button type="button" aria-label="Aumentar pressão UAV" onClick={() => onStep('pressure', 0.5)} className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
            </div>
            <div className="text-[10px] text-slate-500 font-mono-numbers">Q₂: {formatDecimalPt(liveSim.scaledFlowLMin)} L/min</div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <button type="button" aria-pressed={Boolean(vals.adjuvantAntiDrift)} onClick={onToggleAdjuvant}
          className={`px-3 py-1.5 rounded-xl border font-bold cursor-pointer transition-colors ${vals.adjuvantAntiDrift ? 'bg-[#114037] text-white border-[#114037]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
          Adjuvante Antievaporante (× 0,80)
        </button>
        <span className="text-[11px] font-mono-numbers font-semibold text-slate-600">
          Swath: {formatDecimalPt(chain.entrelinhaM)} m · Faixa UAV: 10–30 L/ha (piso 15 L/ha)
        </span>
      </div>
    </div>
  );
};
