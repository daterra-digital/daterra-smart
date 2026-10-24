import React from 'react';
import { ShieldCheck } from 'lucide-react';
import type { IsoFlowCalculationResult, IsoNozzleColor } from './debitoTypes';

interface DebitoResultCardProps {
  flowResult: IsoFlowCalculationResult;
  selectedNozzle: IsoNozzleColor;
  pressureBar: number;
}

export const DebitoResultCard: React.FC<DebitoResultCardProps> = ({
  flowResult,
  selectedNozzle,
  pressureBar
}) => {
  const { flowLMin, flowMinLMin, flowMaxLMin, isValid } = flowResult;

  return (
    <section
      aria-label="Resultado do débito por bico"
      className="bg-[#114037] text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-[#1D734B] space-y-4"
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 shadow-xs"
            style={{ backgroundColor: `${selectedNozzle.hex}22`, borderColor: selectedNozzle.hex }}
          >
            <span
              className="w-3.5 h-3.5 rounded-full border border-white/80 shadow-xs"
              style={{ backgroundColor: selectedNozzle.hex }}
            />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-[#3AAA35] block">
              Bico ISO {selectedNozzle.code} • {selectedNozzle.namePt}
            </span>
            <span className="text-xs text-slate-200 font-semibold">
              Débito Nominal Apurado
            </span>
          </div>
        </div>

        <span className="text-[11px] font-mono text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
          q = {selectedNozzle.nominalFlow3Bar} × √(P/3)
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-white">
              {isValid ? flowLMin.toFixed(2) : '--'}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#3AAA35]">L/min</span>
          </div>
          <p className="text-xs text-slate-300 font-medium mt-1">
            À pressão de <strong className="font-mono text-white font-bold">{pressureBar.toFixed(1)} bar</strong> (Nominal 3 bar: {selectedNozzle.nominalFlow3Bar.toFixed(2)} L/min)
          </p>
        </div>

        {/* Faixa de Tolerância ISO 16122 (Desgaste Máximo ±10%) */}
        <div className="bg-emerald-950/60 border border-emerald-700/80 rounded-2xl p-3 sm:px-4 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-[#3AAA35] shrink-0" />
            <span>Tolerância ISO 16122 (±10%)</span>
          </div>
          <div className="text-xs font-mono font-bold text-white">
            {isValid ? `${flowMinLMin.toFixed(2)} a ${flowMaxLMin.toFixed(2)} L/min` : '--'}
          </div>
          <p className="text-[10px] text-emerald-300/80 leading-tight">
            Substituir bico se a leitura no ensaio de proveta exceder {flowMaxLMin.toFixed(2)} L/min.
          </p>
        </div>
      </div>
    </section>
  );
};
