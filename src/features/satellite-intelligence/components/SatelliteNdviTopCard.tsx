import React from 'react';
import type { NdviModulationResult, CopernicusProductMeta } from '../types';

interface Props {
  modulation: NdviModulationResult;
  metadata: CopernicusProductMeta;
}

export const SatelliteNdviTopCard: React.FC<Props> = ({ modulation, metadata }) => {
  const { ndvi, modulatedVolumeLha, baseVolumeLha, volumeDiffLha, savingsPct, canopyStatusLabel } = modulation;

  return (
    <div className="p-4 mx-4 my-2 rounded-2xl bg-[#114037] text-white border border-[#3CA64C]/40 shadow-xl relative overflow-hidden">
      {/* Padrão gráfico subtil de satélite no fundo */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[#3CA64C]/10 blur-xl pointer-events-none" />

      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#3CA64C] bg-black/25 px-2 py-0.5 rounded-md">
            Índice de Vigor Vegetativo Médio
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl sm:text-5xl font-black font-mono-numbers tracking-tight text-white">
              {ndvi.toFixed(2)}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#3CA64C] text-[#0A2620]">
              {canopyStatusLabel}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-300 block">Passagem Satélite</span>
          <span className="text-xs font-bold font-mono-numbers text-slate-100">
            {metadata.sensingTime.split(' ')[0]} • {metadata.cloudCoveragePct}% Nuvens
          </span>
          <span className="text-[10px] text-[#3CA64C] block font-mono font-bold">
            {metadata.platform} ({metadata.resolutionM}m)
          </span>
        </div>
      </div>

      {/* Barra Cromática de Escala NDVI */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex justify-between text-[10px] text-slate-300 mb-1 font-mono-numbers">
          <span>0.0 (Solo nu)</span>
          <span>0.4 (Moderado)</span>
          <span className="font-bold text-[#3CA64C]">{ndvi.toFixed(2)} (Parcela)</span>
          <span>1.0 (Muito denso)</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-black/40 overflow-hidden p-0.5 flex">
          <div
            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-500 via-lime-500 to-[#3CA64C]"
            style={{ width: `${Math.min(100, Math.max(5, ndvi * 100))}%` }}
          />
        </div>
      </div>

      {/* Impacto Agronómico Imediato na Calda */}
      <div className="mt-3 grid grid-cols-2 gap-2 pt-1 text-xs">
        <div className="bg-black/25 p-2 rounded-xl border border-white/5">
          <span className="text-[10px] text-slate-300 block">Volume de Calda Sugerido</span>
          <span className="text-base font-bold font-mono-numbers text-[#3CA64C]">
            {modulatedVolumeLha} L/ha
          </span>
          <span className="text-[10px] text-slate-400 block">
            Base padrão: {baseVolumeLha} L/ha
          </span>
        </div>

        <div className="bg-black/25 p-2 rounded-xl border border-white/5">
          <span className="text-[10px] text-slate-300 block">Poupança Ecológica</span>
          <span className={`text-base font-bold font-mono-numbers ${volumeDiffLha <= 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
            {volumeDiffLha <= 0 ? `${savingsPct}%` : `+${savingsPct}%`}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {volumeDiffLha <= 0 ? `${Math.abs(volumeDiffLha)} L/ha poupados` : `${volumeDiffLha} L/ha reforço de copa`}
          </span>
        </div>
      </div>
    </div>
  );
};
