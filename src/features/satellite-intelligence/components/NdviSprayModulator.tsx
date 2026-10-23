import React from 'react';
import { Sliders, Droplets } from 'lucide-react';
import type { NdviModulationResult } from '../types';

interface Props {
  modulation: NdviModulationResult;
  simulatedNdvi: number;
  onSimulateNdviChange: (val: number) => void;
}

export const NdviSprayModulator: React.FC<Props> = ({
  modulation,
  simulatedNdvi,
  onSimulateNdviChange
}) => {
  const { baseVolumeLha, modulatedVolumeLha, volumeDiffLha, savingsPct } = modulation;

  return (
    <div className="px-4 py-2">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-[#3CA64C]" />
              Modulação da Calda por Vigor
            </h3>
            <p className="text-[11px] text-slate-400">Ajuste recomendado com base na área foliar real</p>
          </div>
          <span className="text-[10px] font-mono font-bold bg-[#114037] text-[#3CA64C] px-2 py-0.5 rounded border border-[#3CA64C]/30">
            Algoritmo LWA-NDVI
          </span>
        </div>

        {/* Slider de Simulação de Vigor */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              Simular Variação de Vigor (NDVI):
            </span>
            <span className="font-mono-numbers font-bold text-[#3CA64C]">
              {simulatedNdvi.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0.20"
            max="0.95"
            step="0.01"
            value={simulatedNdvi}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#3CA64C]"
            onChange={(e) => onSimulateNdviChange(parseFloat(e.target.value))}
          />
        </div>

        {/* Comparação de Pulverização */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Volume Tradicional Fixo</span>
            <span className="text-lg font-bold font-mono-numbers text-slate-200">
              {baseVolumeLha} L/ha
            </span>
            <span className="text-[10px] text-slate-500 block">Sem leitura de biomassa</span>
          </div>

          <div className="bg-[#114037]/50 p-2.5 rounded-xl border border-[#3CA64C]/40">
            <span className="text-[10px] text-[#3CA64C] block uppercase font-bold">Volume Otimizado NDVI</span>
            <span className="text-lg font-bold font-mono-numbers text-white">
              {modulatedVolumeLha} L/ha
            </span>
            <span
              className={`text-[10px] block font-semibold ${
                volumeDiffLha <= 0 ? 'text-emerald-300' : 'text-amber-300'
              }`}
            >
              {volumeDiffLha <= 0
                ? `${volumeDiffLha} L/ha (${savingsPct}%)`
                : `+${volumeDiffLha} L/ha (+${savingsPct}%)`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
