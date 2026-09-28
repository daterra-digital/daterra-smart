import React from 'react';
import { Droplets, ArrowLeftRight } from 'lucide-react';
import type { Nozzle, CalculatedNozzleFlow } from './nozzleComparison.types';
import { DROPLET_CLASSES_MAP, formatPt } from './nozzleComparison.calculations';
import { interpolateDropletSpectrum } from './dropletSpectrumInterpolation';

export interface NozzleComparisonTopCardProps {
  nozzleA?: Nozzle;
  nozzleB?: Nozzle;
  flowA?: CalculatedNozzleFlow;
  flowB?: CalculatedNozzleFlow;
  workingPressureBar: number;
  onSwapNozzles?: () => void;
}

export const NozzleComparisonTopCard: React.FC<NozzleComparisonTopCardProps> = ({
  nozzleA,
  nozzleB,
  flowA,
  flowB,
  workingPressureBar,
  onSwapNozzles
}) => {
  const dvA = React.useMemo(
    () => interpolateDropletSpectrum(nozzleA, workingPressureBar),
    [nozzleA, workingPressureBar]
  );
  const dvB = React.useMemo(
    () => interpolateDropletSpectrum(nozzleB, workingPressureBar),
    [nozzleB, workingPressureBar]
  );

  const effectiveClassA = dvA.effectiveDropletClass || flowA?.effectiveDropletClass;
  const effectiveClassB = dvB.effectiveDropletClass || flowB?.effectiveDropletClass;
  const dropletInfoA = effectiveClassA ? DROPLET_CLASSES_MAP[effectiveClassA] : undefined;
  const dropletInfoB = effectiveClassB ? DROPLET_CLASSES_MAP[effectiveClassB] : undefined;

  return (
    <div className="bg-[#114037] text-white p-3.5 sm:p-4 rounded-2xl md:rounded-3xl shadow-md border border-emerald-900/40 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a2d0c3]">
          Comparação de Bicos
        </span>
        {onSwapNozzles && (
          <button
            type="button"
            onClick={onSwapNozzles}
            aria-label="Trocar bicos"
            className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] sm:text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-3 h-3 text-[#3CA64C]" />
            <span>Trocar bicos</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 relative">
        {/* Pílula VS */}
        <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white text-[#114037] font-black text-[10px] items-center justify-center shadow-lg border-2 border-[#114037] z-10">
          VS
        </div>
        {/* Coluna Bico A */}
        <div className="bg-[#1b554a]/75 p-3 sm:p-4 rounded-xl border border-white/10 flex flex-col justify-between items-center text-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-slate-100 tracking-tight truncate w-full">
            {nozzleA ? `Bico A • ${nozzleA.brand} ${nozzleA.model}` : 'Bico A • Não selecionado'}
          </span>

          <div className="flex flex-col items-center justify-center gap-1.5 w-full">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-mono text-[#8ffa94] tracking-tight leading-none">
                {flowA ? formatPt(flowA.flowLMin) : '—'}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-200">L/min</span>
            </div>
            {dropletInfoA ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 rounded-full text-xs sm:text-xs md:text-sm font-black bg-[#8ffa94]/20 text-[#8ffa94] border border-[#8ffa94]/30 shadow-xs whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-[#8ffa94] shrink-0" />
                <span>{dropletInfoA.code}</span>
                <span className="text-white/60 font-normal">•</span>
                <span className="font-semibold text-white/95">{dropletInfoA.labelPt.split(' ')[0]}</span>
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-300">
                Gota: —
              </span>
            )}
          </div>

          <div className="bg-[#114037]/90 border border-white/10 rounded-xl py-1.5 px-2 flex flex-col items-center justify-center gap-1 w-full">
            <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs tracking-wider text-[#a2d0c3] font-semibold">
              <Droplets className="w-3.5 h-3.5 text-[#8ffa94]" />
              <span className="uppercase text-slate-200 font-bold">Espectro</span>
              <span className="normal-case font-bold text-slate-200">(µm)</span>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-1 border-t border-white/10 w-full text-center items-center">
              <div className="flex flex-col items-center justify-center">
                <span className="text-[9px] sm:text-[10px] md:text-xs text-[#a2d0c3] font-bold uppercase leading-none">DV10</span>
                <span className="text-xs sm:text-sm md:text-base font-mono font-bold text-[#8ffa94] whitespace-nowrap leading-tight mt-0.5">
                  {dvA.dv10 ?? '—'}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center border-x border-white/10 px-1">
                <span className="text-[9px] sm:text-[10px] md:text-xs text-[#a2d0c3] font-bold uppercase leading-none">DV50</span>
                <span className="text-xs sm:text-sm md:text-base font-mono font-bold text-[#8ffa94] whitespace-nowrap leading-tight mt-0.5">
                  {dvA.dv50 ?? '—'}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-[9px] sm:text-[10px] md:text-xs text-[#a2d0c3] font-bold uppercase leading-none">DV90</span>
                <span className="text-xs sm:text-sm md:text-base font-mono font-bold text-[#8ffa94] whitespace-nowrap leading-tight mt-0.5">
                  {dvA.dv90 ?? '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Bico B */}
        <div className="bg-[#1b554a]/75 p-3 sm:p-4 rounded-xl border border-white/10 flex flex-col justify-between items-center text-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-slate-100 tracking-tight truncate w-full">
            {nozzleB ? `Bico B • ${nozzleB.brand} ${nozzleB.model}` : 'Bico B • Não selecionado'}
          </span>

          <div className="flex flex-col items-center justify-center gap-1.5 w-full">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-mono text-[#8ffa94] tracking-tight leading-none">
                {flowB ? formatPt(flowB.flowLMin) : '—'}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-200">L/min</span>
            </div>
            {dropletInfoB ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 rounded-full text-xs sm:text-xs md:text-sm font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 shadow-xs whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span>{dropletInfoB.code}</span>
                <span className="text-white/60 font-normal">•</span>
                <span className="font-semibold text-white/95">{dropletInfoB.labelPt.split(' ')[0]}</span>
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-300">
                Gota: —
              </span>
            )}
          </div>

          <div className="bg-[#114037]/90 border border-white/10 rounded-xl py-1.5 px-2 flex flex-col items-center justify-center gap-1 w-full">
            <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs tracking-wider text-[#a2d0c3] font-semibold">
              <Droplets className="w-3.5 h-3.5 text-amber-300" />
              <span className="uppercase text-slate-200 font-bold">Espectro</span>
              <span className="normal-case font-bold text-slate-200">(µm)</span>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-1 border-t border-white/10 w-full text-center items-center">
              <div className="flex flex-col items-center justify-center">
                <span className="text-[9px] sm:text-[10px] md:text-xs text-[#a2d0c3] font-bold uppercase leading-none">DV10</span>
                <span className="text-xs sm:text-sm md:text-base font-mono font-bold text-slate-200 whitespace-nowrap leading-tight mt-0.5">
                  {dvB.dv10 ?? '—'}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center border-x border-white/10 px-1">
                <span className="text-[9px] sm:text-[10px] md:text-xs text-[#a2d0c3] font-bold uppercase leading-none">DV50</span>
                <span className="text-xs sm:text-sm md:text-base font-mono font-bold text-slate-200 whitespace-nowrap leading-tight mt-0.5">
                  {dvB.dv50 ?? '—'}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-[9px] sm:text-[10px] md:text-xs text-[#a2d0c3] font-bold uppercase leading-none">DV90</span>
                <span className="text-xs sm:text-sm md:text-base font-mono font-bold text-slate-200 whitespace-nowrap leading-tight mt-0.5">
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
