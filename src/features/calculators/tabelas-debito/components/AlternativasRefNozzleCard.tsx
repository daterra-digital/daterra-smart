import React, { useMemo } from 'react';
import { Edit2 } from 'lucide-react';
import type { Nozzle } from '../../../nozzle-comparison/nozzleComparison.types.ts';
import { getNozzleColorPresentation, formatPt } from '../../../nozzle-comparison/nozzleComparison.calculations.ts';

export interface AlternativasRefNozzleCardProps {
  refNozzle?: Nozzle;
  onEditRefNozzle: () => void;
}

export const AlternativasRefNozzleCard: React.FC<AlternativasRefNozzleCardProps> = ({
  refNozzle,
  onEditRefNozzle
}) => {
  const presRef = useMemo(() => getNozzleColorPresentation(refNozzle), [refNozzle]);

  return (
    <div
      onClick={onEditRefNozzle}
      className="p-3.5 rounded-2xl border border-slate-200 bg-[#FAFBFB] hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs"
          style={{ backgroundColor: `${presRef.hex}18`, borderColor: presRef.hex }}
        >
          <span className="w-4 h-4 rounded-full border border-white shadow-xs" style={{ backgroundColor: presRef.hex }} />
        </div>
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-black text-slate-900">
              {refNozzle ? `${refNozzle.brand} ${refNozzle.model}` : 'Selecionar Bico de Referência'}
            </span>
            {refNozzle?.sprayAngleDeg && (
              <span className="text-[10px] text-slate-400 font-mono">[{refNozzle.sprayAngleDeg}°]</span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 font-medium block">
            {refNozzle ? `${refNozzle.color || 'Ref'} (${refNozzle.isoCode || 'ND'}) · ` : ''}
            <strong className="text-[#114037] font-mono">
              {refNozzle?.nominalFlowLMin ? `${formatPt(refNozzle.nominalFlowLMin)} L/min` : '—'}
            </strong>
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onEditRefNozzle(); }}
        aria-label="Trocar Bico de Referência"
        className="min-h-[44px] px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <Edit2 className="w-3.5 h-3.5" />
        <span>Trocar</span>
      </button>
    </div>
  );
};
