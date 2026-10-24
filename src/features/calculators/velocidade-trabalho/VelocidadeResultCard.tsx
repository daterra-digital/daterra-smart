import React from 'react';
import { Gauge, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import type { PureWorkSpeedResult } from '../definitions/velocidadeRealCalculatorConfig';

interface VelocidadeResultCardProps {
  speedResult: PureWorkSpeedResult;
  distanciaMeters: number;
  tempoSeconds: number;
}

export const VelocidadeResultCard: React.FC<VelocidadeResultCardProps> = ({
  speedResult,
  distanciaMeters,
  tempoSeconds
}) => {
  const { velocidade_kmh, velocidade_ms, isValid } = speedResult;

  // Classificação agronómica da velocidade operacional (EPPO / DGAV)
  const getSpeedClassification = () => {
    if (!isValid || velocidade_kmh <= 0) {
      return {
        label: 'Aguardando valores válidos',
        color: 'bg-slate-800 text-slate-300 border-slate-700',
        icon: Info
      };
    }
    if (velocidade_kmh < 4.0) {
      return {
        label: 'Velocidade Lenta — Alto volume / copas densas',
        color: 'bg-amber-950/60 text-amber-200 border-amber-800/80',
        icon: AlertTriangle
      };
    }
    if (velocidade_kmh <= 8.0) {
      return {
        label: 'Velocidade Recomendada — Faixa padrão EPPO/DGAV',
        color: 'bg-emerald-900/60 text-emerald-200 border-emerald-700/80',
        icon: CheckCircle2
      };
    }
    return {
      label: 'Velocidade Elevada — Risco de deriva ou oscilação de barras',
      color: 'bg-rose-950/60 text-rose-200 border-rose-800/80',
      icon: AlertTriangle
    };
  };

  const status = getSpeedClassification();
  const StatusIcon = status.icon;

  return (
    <section
      aria-label="Resultado da velocidade calculada"
      className="bg-[#114037] text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-[#1D734B] space-y-4"
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#3CA64C]/20 border border-[#3CA64C]/40 flex items-center justify-center text-[#3AAA35]">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-[#3AAA35] block">
              Resultado Oficial
            </span>
            <span className="text-xs text-slate-200 font-semibold">
              Velocidade Real de Avanço
            </span>
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
          v = (3.6 × {distanciaMeters}m) / {tempoSeconds}s
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-white">
              {isValid ? velocidade_kmh.toFixed(1) : '--'}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#3AAA35]">km/h</span>
          </div>
          <p className="text-xs text-slate-300 font-medium mt-1">
            Velocidade equivalente:{' '}
            <strong className="font-mono text-white font-bold">
              {isValid ? velocidade_ms.toFixed(1) : '--'} m/s
            </strong>
          </p>
        </div>

        <div className={`px-3.5 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 ${status.color}`}>
          <StatusIcon className="w-4 h-4 shrink-0" />
          <span>{status.label}</span>
        </div>
      </div>
    </section>
  );
};
