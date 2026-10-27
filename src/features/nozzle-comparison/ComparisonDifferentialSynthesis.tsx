import React from 'react';
import { Droplets, Wind, Compass, ShieldCheck } from 'lucide-react';

export interface ComparisonDifferentialSynthesisProps {
  flowComparisonText: string;
  driftComparisonText: string;
  dropletComparisonText: string;
  disclaimer: string;
}

export const ComparisonDifferentialSynthesis: React.FC<ComparisonDifferentialSynthesisProps> = ({
  flowComparisonText,
  driftComparisonText,
  dropletComparisonText,
  disclaimer
}) => {
  return (
    <>
      {/* 4. SÍNTESE DIFERENCIAL */}
      <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-2.5 text-xs text-slate-700">
        <div className="flex items-start gap-2.5">
          <Droplets className="w-4 h-4 text-daterra-primary shrink-0 mt-0.5" />
          <p className="font-semibold leading-relaxed">{flowComparisonText}</p>
        </div>

        <div className="flex items-start gap-2.5">
          <Wind className="w-4 h-4 text-daterra-primary shrink-0 mt-0.5" />
          <p className="font-semibold leading-relaxed">{driftComparisonText}</p>
        </div>

        <div className="flex items-start gap-2.5">
          <Compass className="w-4 h-4 text-daterra-primary shrink-0 mt-0.5" />
          <p className="font-semibold leading-relaxed">{dropletComparisonText}</p>
        </div>
      </div>

      {/* 6. AVISO E DISCLAIMER REGULAMENTAR DE CALIBRAÇÃO */}
      <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-[11px] text-slate-500 leading-relaxed space-y-1">
        <span className="font-extrabold text-slate-700 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-daterra-primary" />
          Procedimento de Campo Obrigatório
        </span>
        <p>{disclaimer}</p>
      </div>
    </>
  );
};
