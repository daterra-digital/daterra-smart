import React from 'react';
import { ArrowRight, ShieldCheck, Gauge } from 'lucide-react';
import type { AlternativeNozzleMatch } from '../services/alternativasEngine';
import { getNozzleColorPresentation, formatPt } from '../../../nozzle-comparison/nozzleComparison.calculations';

export interface AlternativaEquivalenteCardProps {
  match: AlternativeNozzleMatch;
  onSelectForComparison: (nozzleId: string, pressureBar: number) => void;
}

export const AlternativaEquivalenteCard: React.FC<AlternativaEquivalenteCardProps> = ({
  match,
  onSelectForComparison
}) => {
  const {
    nozzle,
    requiredPressureBar,
    calculatedFlowLMin,
    diffPercent,
    minP,
    maxP,
    dropletCode,
    dropletLabelPt,
    dropletBadgeBg,
    dropletBadgeText,
    dropletBadgeBorder,
    driftNote,
    isAirInduction
  } = match;
  const pres = getNozzleColorPresentation(nozzle);

  const diffBadgeColor = Math.abs(diffPercent) < 0.1
    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
    : diffPercent > 0
    ? 'bg-teal-50 text-teal-800 border-teal-200'
    : 'bg-amber-50 text-amber-800 border-amber-200';

  const diffLabel = diffPercent > 0 ? `+${formatPt(diffPercent)}%` : `${formatPt(diffPercent)}%`;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition-all space-y-3">
      {/* Topo do Cartão: Modelo & Tecnologia */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs"
            style={{ backgroundColor: `${pres.hex}18`, borderColor: pres.hex }}
          >
            <span className="w-4 h-4 rounded-full border border-white shadow-xs" style={{ backgroundColor: pres.hex }} />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-black text-slate-900 truncate">
              {nozzle.brand} {nozzle.model}
            </h4>
            <span className="text-[11px] text-slate-500 font-medium block truncate">
              {nozzle.color || 'Ref'} ({nozzle.isoCode || 'ND'}) · {nozzle.nozzleType || 'Bico Hidráulico'}
            </span>
          </div>
        </div>

        {isAirInduction && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
            Anti-deriva
          </span>
        )}
      </div>

      {/* Instrução Prática Direta à Mesma Pressão com Débito e Desvio */}
      <div className="p-3 rounded-2xl bg-[#114037]/5 border border-[#114037]/15 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-[#114037] shrink-0" />
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
              À mesma pressão ({formatPt(requiredPressureBar)} bar) · Gama: {minP}–{maxP} bar
            </span>
            <span className="text-xs font-black text-slate-800">
              Débito: <strong className="text-base text-[#114037] font-mono font-black">{formatPt(calculatedFlowLMin)} L/min</strong>
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-black font-mono border ${diffBadgeColor}`}>
            {diffLabel}
          </span>
          <span className="block text-[9px] font-bold text-slate-400 uppercase mt-0.5">
            desvio
          </span>
        </div>
      </div>

      {/* Classificação de Gotas e Deriva */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5 flex-wrap">
          {dropletCode && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${dropletBadgeBg} ${dropletBadgeText} border ${dropletBadgeBorder}`}>
              {dropletCode} • {dropletLabelPt?.split(' ')[0]}
            </span>
          )}
          <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3CA64C]" />
            {driftNote}
          </span>
        </div>

        {/* Botão de Transferência Direta para o Modo 2 */}
        <button
          type="button"
          onClick={() => onSelectForComparison(nozzle.id, requiredPressureBar)}
          className="min-h-[44px] px-3.5 bg-emerald-50 hover:bg-emerald-100 text-daterra-primary border border-emerald-200 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
        >
          <span>Comparar</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#3CA64C]" />
        </button>
      </div>
    </div>
  );
};
