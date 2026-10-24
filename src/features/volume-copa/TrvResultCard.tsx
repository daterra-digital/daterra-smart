import React from 'react';
import { Trees, Droplets, Info } from 'lucide-react';
import type { TrvCalculationResult } from './trvDataMapper';

interface TrvResultCardProps {
  trvResult: TrvCalculationResult;
  alturaCopa: number;
  larguraCopa: number;
  distanciaEntrelinhas: number;
}

export const TrvResultCard: React.FC<TrvResultCardProps> = ({
  trvResult,
  alturaCopa,
  larguraCopa,
  distanciaEntrelinhas
}) => {
  const { volume_copa, caldaReferenciaLHa, caldaMinLHa, caldaMaxLHa, isValid } = trvResult;

  const getCanopyClassification = () => {
    if (!isValid || volume_copa <= 0) {
      return { label: 'Aguardando valores válidos', color: 'bg-slate-800 text-slate-300' };
    }
    if (volume_copa < 6000) {
      return { label: 'Copa Baixa / Vinha Compacta', color: 'bg-emerald-950/60 text-emerald-200 border-emerald-700/80' };
    }
    if (volume_copa <= 12000) {
      return { label: 'Copa Média / Pomar Padrão', color: 'bg-teal-950/60 text-teal-200 border-teal-700/80' };
    }
    return { label: 'Copa Grande / Pomar Vigoroso', color: 'bg-amber-950/60 text-amber-200 border-amber-800/80' };
  };

  const status = getCanopyClassification();

  return (
    <section
      aria-label="Resultado do volume de copa calculado"
      className="bg-[#114037] text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-[#1D734B] space-y-4"
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#3CA64C]/20 border border-[#3CA64C]/40 flex items-center justify-center text-[#3AAA35]">
            <Trees className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-[#3AAA35] block">
              Resultado Oficial
            </span>
            <span className="text-xs text-slate-200 font-semibold">
              Tree Row Volume (TRV)
            </span>
          </div>
        </div>

        <span className="text-[11px] font-mono text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
          TRV = ({alturaCopa} × {larguraCopa} × 10.000) / {distanciaEntrelinhas}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-white">
              {isValid ? volume_copa.toLocaleString('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '--'}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#3AAA35]">m³ TRV/ha</span>
          </div>
          <p className="text-xs text-slate-300 font-medium mt-1">
            Volume tridimensional de vegetação foliar por hectare
          </p>
        </div>

        {/* Estimativa de Calda de Referência (EPPO / DGAV) */}
        <div className="bg-emerald-950/60 border border-emerald-700/80 rounded-2xl p-3 sm:px-4 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-bold">
            <Droplets className="w-4 h-4 text-[#3AAA35] shrink-0" />
            <span>Calda Sugerida de Referência</span>
          </div>
          <div className="text-base font-mono font-black text-white">
            {isValid ? `~ ${caldaReferenciaLHa} L/ha` : '--'}
          </div>
          <p className="text-[10px] text-emerald-300/80 leading-tight">
            Faixa operacional: {isValid ? `${caldaMinLHa} a ${caldaMaxLHa} L/ha (0,04 a 0,07 L/m³)` : '--'}
          </p>
        </div>
      </div>

      <div className="pt-1 flex items-center justify-between">
        <div className={`px-3 py-1 rounded-xl border text-[11px] font-bold inline-flex items-center gap-1.5 ${status.color}`}>
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>{status.label}</span>
        </div>
      </div>
    </section>
  );
};
