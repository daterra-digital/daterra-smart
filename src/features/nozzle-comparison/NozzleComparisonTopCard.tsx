import React from 'react';
import { Droplets } from 'lucide-react';
import type { Nozzle, CalculatedNozzleFlow } from './nozzleComparison.types';
import { DROPLET_CLASSES_MAP, formatPt } from './nozzleComparison.calculations';

export interface NozzleComparisonTopCardProps {
  nozzleA?: Nozzle;
  nozzleB?: Nozzle;
  flowA?: CalculatedNozzleFlow;
  flowB?: CalculatedNozzleFlow;
  workingPressureBar: number;
}

function getDropletDvValues(nozzle?: Nozzle, pressure = 3.0) {
  if (!nozzle) return { dv10: null, dv50: null, dv90: null };
  if (nozzle.brand === 'Albuz' && nozzle.model === 'ATR') {
    if (pressure >= 12.5 && nozzle.d50_15bar_um) {
      return { dv10: nozzle.d10_15bar_um, dv50: nozzle.d50_15bar_um, dv90: nozzle.d90_15bar_um };
    }
    if (pressure >= 7.5 && nozzle.d50_10bar_um) {
      return { dv10: nozzle.d10_10bar_um, dv50: nozzle.d50_10bar_um, dv90: nozzle.d90_10bar_um };
    }
    return { dv10: nozzle.d10_5bar_um, dv50: nozzle.d50_5bar_um, dv90: nozzle.d90_5bar_um };
  }
  return { dv10: null, dv50: null, dv90: null };
}

export const NozzleComparisonTopCard: React.FC<NozzleComparisonTopCardProps> = ({
  nozzleA,
  nozzleB,
  flowA,
  flowB,
  workingPressureBar
}) => {
  const dvA = React.useMemo(() => getDropletDvValues(nozzleA, workingPressureBar), [nozzleA, workingPressureBar]);
  const dvB = React.useMemo(() => getDropletDvValues(nozzleB, workingPressureBar), [nozzleB, workingPressureBar]);

  const dropletInfoA = flowA?.effectiveDropletClass ? DROPLET_CLASSES_MAP[flowA.effectiveDropletClass] : undefined;
  const dropletInfoB = flowB?.effectiveDropletClass ? DROPLET_CLASSES_MAP[flowB.effectiveDropletClass] : undefined;

  return (
    <div className="bg-[#114037] text-white p-3.5 sm:p-4 rounded-2xl md:rounded-3xl shadow-md border border-emerald-900/40 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a2d0c3]">
          Comparação de Bicos
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* Coluna Bico A */}
        <div className="bg-[#1b554a]/75 p-2.5 sm:p-3 rounded-xl border border-white/10 flex flex-col justify-between items-center text-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-200 tracking-tight truncate w-full">
            {nozzleA ? `Bico A • ${nozzleA.brand} ${nozzleA.model}` : 'Bico A • Não selecionado'}
          </span>

          <div className="flex flex-col items-center justify-center gap-1 w-full">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-2xl font-bold font-mono text-[#8ffa94] tracking-tight leading-none">
                {flowA ? formatPt(flowA.flowLMin) : '—'}
              </span>
              <span className="text-[10px] font-medium text-slate-200">L/min</span>
            </div>
            {dropletInfoA ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#8ffa94]/15 text-[#8ffa94] border border-[#8ffa94]/20 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8ffa94]" />
                {dropletInfoA.code} • {dropletInfoA.labelPt.split(' ')[0]}
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-white/10 text-slate-300">
                Gota: —
              </span>
            )}
          </div>

          <div className="bg-[#114037]/90 border border-white/10 rounded-lg py-1 px-1.5 flex flex-col items-center justify-center gap-1 w-full">
            <div className="flex items-center justify-center gap-1 text-[9px] tracking-wider text-[#a2d0c3] font-semibold">
              <Droplets className="w-3 h-3 text-[#8ffa94]" />
              <span className="uppercase text-slate-200">Espectro</span>
              <span className="normal-case font-bold text-slate-200">(µm)</span>
            </div>
            <div className="grid grid-cols-3 gap-0.5 pt-0.5 border-t border-white/10 w-full text-center items-center">
              <div className="flex flex-col items-center justify-center">
                <span className="text-[8px] text-[#a2d0c3] font-medium uppercase leading-none">DV10</span>
                <span className="text-[11px] font-mono font-bold text-[#8ffa94] whitespace-nowrap leading-tight mt-0.5">
                  {dvA.dv10 ?? '—'}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center border-x border-white/10 px-0.5">
                <span className="text-[8px] text-[#a2d0c3] font-medium uppercase leading-none">DV50</span>
                <span className="text-[11px] font-mono font-bold text-[#8ffa94] whitespace-nowrap leading-tight mt-0.5">
                  {dvA.dv50 ?? '—'}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-[8px] text-[#a2d0c3] font-medium uppercase leading-none">DV90</span>
                <span className="text-[11px] font-mono font-bold text-[#8ffa94] whitespace-nowrap leading-tight mt-0.5">
                  {dvA.dv90 ?? '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Bico B */}
        <div className="bg-[#1b554a]/75 p-2.5 sm:p-3 rounded-xl border border-white/10 flex flex-col justify-between items-center text-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-200 tracking-tight truncate w-full">
            {nozzleB ? `Bico B • ${nozzleB.brand} ${nozzleB.model}` : 'Bico B • Não selecionado'}
          </span>

          <div className="flex flex-col items-center justify-center gap-1 w-full">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-2xl font-bold font-mono text-[#8ffa94] tracking-tight leading-none">
                {flowB ? formatPt(flowB.flowLMin) : '—'}
              </span>
              <span className="text-[10px] font-medium text-slate-200">L/min</span>
            </div>
            {dropletInfoB ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/20 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {dropletInfoB.code} • {dropletInfoB.labelPt.split(' ')[0]}
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-white/10 text-slate-300">
                Gota: —
              </span>
            )}
          </div>

          <div className="bg-[#114037]/90 border border-white/10 rounded-lg py-1 px-1.5 flex flex-col items-center justify-center gap-1 w-full">
            <div className="flex items-center justify-center gap-1 text-[9px] tracking-wider text-[#a2d0c3] font-semibold">
              <Droplets className="w-3 h-3 text-amber-300" />
              <span className="uppercase text-slate-200">Espectro</span>
              <span className="normal-case font-bold text-slate-200">(µm)</span>
            </div>
            <div className="grid grid-cols-3 gap-0.5 pt-0.5 border-t border-white/10 w-full text-center items-center">
              <div className="flex flex-col items-center justify-center">
                <span className="text-[8px] text-[#a2d0c3] font-medium uppercase leading-none">DV10</span>
                <span className="text-[11px] font-mono font-bold text-slate-300 whitespace-nowrap leading-tight mt-0.5">
                  {dvB.dv10 ?? '—'}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center border-x border-white/10 px-0.5">
                <span className="text-[8px] text-[#a2d0c3] font-medium uppercase leading-none">DV50</span>
                <span className="text-[11px] font-mono font-bold text-slate-300 whitespace-nowrap leading-tight mt-0.5">
                  {dvB.dv50 ?? '—'}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-[8px] text-[#a2d0c3] font-medium uppercase leading-none">DV90</span>
                <span className="text-[11px] font-mono font-bold text-slate-300 whitespace-nowrap leading-tight mt-0.5">
                  {dvB.dv90 ?? '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé do Cartão com Pressão de Referência */}
      <div className="flex items-center justify-between text-xs text-slate-200 pt-1 border-t border-white/10">
        <span className="font-medium text-[11px]">Pressão de referência</span>
        <span className="font-mono font-bold text-white bg-[#1b554a] px-2 py-0.5 rounded text-xs">
          {formatPt(workingPressureBar)} bar
        </span>
      </div>
    </div>
  );
};
