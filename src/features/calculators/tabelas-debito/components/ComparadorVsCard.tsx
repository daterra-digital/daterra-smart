import React from 'react';
import { ArrowLeftRight, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { Nozzle, CalculatedNozzleFlow } from '../../../nozzle-comparison/nozzleComparison.types';
import { DROPLET_CLASSES_MAP, formatPt } from '../../../nozzle-comparison/nozzleComparison.calculations';
import { interpolateDropletSpectrum } from '../../../nozzle-comparison/dropletSpectrumInterpolation';
import { calculateDebitoDelta, isDriftRiskDroplets, checkPressureRange } from '../debitoTypes';

export interface ComparadorVsCardProps {
  nozzleA?: Nozzle;
  nozzleB?: Nozzle;
  flowA?: CalculatedNozzleFlow;
  flowB?: CalculatedNozzleFlow;
  workingPressureBar: number;
  onSwapNozzles: () => void;
}

export const ComparadorVsCard: React.FC<ComparadorVsCardProps> = ({
  nozzleA,
  nozzleB,
  flowA,
  flowB,
  workingPressureBar,
  onSwapNozzles
}) => {
  const dvA = React.useMemo(() => interpolateDropletSpectrum(nozzleA, workingPressureBar), [nozzleA, workingPressureBar]);
  const dvB = React.useMemo(() => interpolateDropletSpectrum(nozzleB, workingPressureBar), [nozzleB, workingPressureBar]);

  const classA = dvA.effectiveDropletClass || flowA?.effectiveDropletClass;
  const classB = dvB.effectiveDropletClass || flowB?.effectiveDropletClass;
  const dropletA = classA && classA in DROPLET_CLASSES_MAP ? DROPLET_CLASSES_MAP[classA as keyof typeof DROPLET_CLASSES_MAP] : undefined;
  const dropletB = classB && classB in DROPLET_CLASSES_MAP ? DROPLET_CLASSES_MAP[classB as keyof typeof DROPLET_CLASSES_MAP] : undefined;

  const delta = React.useMemo(() => {
    return calculateDebitoDelta(flowA?.flowLMin || 0, flowB?.flowLMin || 0);
  }, [flowA, flowB]);

  const rangeA = checkPressureRange(workingPressureBar, nozzleA?.pressureMinBar, nozzleA?.pressureMaxBar);
  const rangeB = checkPressureRange(workingPressureBar, nozzleB?.pressureMinBar, nozzleB?.pressureMaxBar);

  const driftA = isDriftRiskDroplets(dvA.dv10);
  const driftB = isDriftRiskDroplets(dvB.dv10);

  return (
    <div className="bg-[#114037] text-white p-3.5 sm:p-5 rounded-2xl md:rounded-3xl shadow-lg border border-emerald-900/40 space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#a2d0c3]">
          Comparação de Bicos Hidráulica
        </span>
        <button
          type="button"
          onClick={onSwapNozzles}
          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-[#3CA64C]" />
          <span>Trocar bicos</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-6 relative items-stretch">
        {/* Pílula VS com Indicador Delta Central */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-white text-[#114037] font-black text-xs flex items-center justify-center shadow-lg border-2 border-[#114037]">
            VS
          </div>
          <span className="mt-1 px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black whitespace-nowrap shadow-xs">
            {delta.labelPt}
          </span>
        </div>

        {/* Coluna Bico A */}
        <div className="bg-[#1b554a]/80 p-3 sm:p-4 rounded-xl border border-white/10 flex flex-col justify-between items-center text-center gap-2 min-h-[195px] sm:min-h-[205px] relative">
          {/* Cabeçalho com Alertas no Canto Superior Interior (Direita do Bico A) */}
          <div className="w-full flex items-center justify-between gap-1 min-h-[24px]">
            <span className="text-xs sm:text-sm font-bold text-slate-100 truncate text-left flex-1">
              {nozzleA ? `${nozzleA.brand} ${nozzleA.model}` : 'Bico A (ND)'}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {rangeA.isOutOfRange && (
                <span
                  title={rangeA.warningMessage}
                  className="text-[9px] font-bold text-amber-300 bg-amber-950/90 px-1.5 py-0.5 rounded border border-amber-500/50 flex items-center gap-0.5 shadow-2xs"
                >
                  <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                  <span className="hidden sm:inline">Fora gama</span>
                </span>
              )}
              {driftA && (
                <span
                  title="Risco de Deriva (DV10 < 100 µm)"
                  className="text-[9px] font-bold text-amber-300 bg-amber-900/90 px-1.5 py-0.5 rounded border border-amber-500/50 flex items-center gap-0.5 shadow-2xs"
                >
                  <ShieldAlert className="w-2.5 h-2.5 shrink-0" />
                  <span className="hidden sm:inline">Deriva</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 my-auto">
            <span className="text-2xl sm:text-4xl font-black font-mono text-[#8ffa94]">
              {flowA ? formatPt(flowA.flowLMin) : '—'} <span className="text-xs font-medium text-slate-300">L/min</span>
            </span>
            <div className="flex items-center gap-1 flex-wrap justify-center">
              {dropletA && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${dropletA.badgeBg} ${dropletA.badgeText} border ${dropletA.badgeBorder}`}>
                  {dropletA.code} • {dropletA.labelPt}
                </span>
              )}
              {(dropletA?.code === 'XC' || dropletA?.code === 'UC' || nozzleA?.nozzleType?.toLowerCase().includes('ar')) && (
                <span className="text-[9px] font-bold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                  Anti-deriva
                </span>
              )}
            </div>
          </div>

          <div className="w-full grid grid-cols-3 gap-1 text-[10px] bg-black/20 p-1.5 rounded-lg border border-white/5 font-mono">
            <div><span className="text-slate-400 block text-[9px]">DV10</span>{dvA.dv10 ? `${dvA.dv10}µm` : '—'}</div>
            <div><span className="text-slate-400 block text-[9px]">DV50</span>{dvA.dv50 ? `${dvA.dv50}µm` : '—'}</div>
            <div><span className="text-slate-400 block text-[9px]">DV90</span>{dvA.dv90 ? `${dvA.dv90}µm` : '—'}</div>
          </div>
        </div>

        {/* Coluna Bico B */}
        <div className="bg-[#1b554a]/80 p-3 sm:p-4 rounded-xl border border-white/10 flex flex-col justify-between items-center text-center gap-2 min-h-[195px] sm:min-h-[205px] relative">
          {/* Cabeçalho com Alertas no Canto Superior Interior (Esquerda do Bico B) */}
          <div className="w-full flex items-center justify-between gap-1 min-h-[24px]">
            <div className="flex items-center gap-1 shrink-0">
              {rangeB.isOutOfRange && (
                <span
                  title={rangeB.warningMessage}
                  className="text-[9px] font-bold text-amber-300 bg-amber-950/90 px-1.5 py-0.5 rounded border border-amber-500/50 flex items-center gap-0.5 shadow-2xs"
                >
                  <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                  <span className="hidden sm:inline">Fora gama</span>
                </span>
              )}
              {driftB && (
                <span
                  title="Risco de Deriva (DV10 < 100 µm)"
                  className="text-[9px] font-bold text-amber-300 bg-amber-900/90 px-1.5 py-0.5 rounded border border-amber-500/50 flex items-center gap-0.5 shadow-2xs"
                >
                  <ShieldAlert className="w-2.5 h-2.5 shrink-0" />
                  <span className="hidden sm:inline">Deriva</span>
                </span>
              )}
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-100 truncate text-right flex-1">
              {nozzleB ? `${nozzleB.brand} ${nozzleB.model}` : 'Bico B (ND)'}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1 my-auto">
            <span className="text-2xl sm:text-4xl font-black font-mono text-[#8ffa94]">
              {flowB ? formatPt(flowB.flowLMin) : '—'} <span className="text-xs font-medium text-slate-300">L/min</span>
            </span>
            <div className="flex items-center gap-1 flex-wrap justify-center">
              {dropletB && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${dropletB.badgeBg} ${dropletB.badgeText} border ${dropletB.badgeBorder}`}>
                  {dropletB.code} • {dropletB.labelPt}
                </span>
              )}
              {(dropletB?.code === 'XC' || dropletB?.code === 'UC' || nozzleB?.nozzleType?.toLowerCase().includes('ar')) && (
                <span className="text-[9px] font-bold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                  Anti-deriva
                </span>
              )}
            </div>
          </div>

          <div className="w-full grid grid-cols-3 gap-1 text-[10px] bg-black/20 p-1.5 rounded-lg border border-white/5 font-mono">
            <div><span className="text-slate-400 block text-[9px]">DV10</span>{dvB.dv10 ? `${dvB.dv10}µm` : '—'}</div>
            <div><span className="text-slate-400 block text-[9px]">DV50</span>{dvB.dv50 ? `${dvB.dv50}µm` : '—'}</div>
            <div><span className="text-slate-400 block text-[9px]">DV90</span>{dvB.dv90 ? `${dvB.dv90}µm` : '—'}</div>
          </div>
        </div>
      </div>

      <div className="pt-1 text-center">
        <span className="text-[11px] font-bold text-emerald-200">
          Pressão de referência ativa: <strong className="font-mono text-white bg-black/25 px-2 py-0.5 rounded-md">{formatPt(workingPressureBar)} bar</strong>
        </span>
      </div>
    </div>
  );
};
