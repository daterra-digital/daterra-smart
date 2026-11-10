// src/features/weather/components/WindDirectionIndicator.tsx
import React from 'react';
import { parseWindDirection } from '../utils/windDirection.ts';

interface WindDirectionIndicatorProps {
  windSpeedKmh?: number | null;
  windDirectionDeg?: number | null;
  isDominant?: boolean;
  className?: string;
}

export const WindDirectionIndicator: React.FC<WindDirectionIndicatorProps> = ({
  windSpeedKmh,
  windDirectionDeg,
  isDominant = false,
  className = ''
}) => {
  const isCalm = windSpeedKmh !== undefined && windSpeedKmh !== null && windSpeedKmh === 0;
  const windInfo = parseWindDirection(windDirectionDeg);

  // Sem direção e sem calmaria: estado honestamente indisponível
  if (windDirectionDeg == null && !isCalm) {
    return (
      <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
        <div className="w-13 h-13 rounded-full border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs font-mono">
          --
        </div>
        <span className="text-[11px] text-slate-400 mt-1.5 font-medium">
          Direção indisponível
        </span>
      </div>
    );
  }

  // Calmaria confirmada (0 km/h)
  if (isCalm) {
    return (
      <div
        className={`flex flex-col items-center justify-center text-center select-none ${className}`}
        aria-label="Calmaria confirmada, vento nulo"
      >
        <div className="w-13 h-13 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
        </div>
        <span className="text-[13px] font-bold text-slate-700 mt-1.5">
          Calmaria
        </span>
        <span className="text-[11px] text-slate-400">
          Vento nulo
        </span>
      </div>
    );
  }

  if (!windInfo) return null;

  const accessibleLabel = isDominant
    ? `Vento com direção dominante ${windInfo.originPreposition.toLowerCase()}, a soprar ${windInfo.targetPreposition} (${windInfo.degrees}°)`
    : `Vento ${windInfo.originPreposition.toLowerCase()}, a soprar ${windInfo.targetPreposition} (${windInfo.degrees}°)`;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center select-none ${className}`}
      aria-label={accessibleLabel}
      title={accessibleLabel}
    >
      {/* Rosa dos ventos compacta */}
      <div className="relative w-13 h-13 rounded-full border border-slate-200 bg-slate-50/60 shadow-2xs flex items-center justify-center">
        {/* Ticks e rótulos cardeais */}
        <span className="absolute top-0.5 text-[8px] font-black text-slate-400 leading-none">N</span>
        <span className="absolute bottom-0.5 text-[8px] font-black text-slate-400 leading-none">S</span>
        <span className="absolute right-1 text-[8px] font-black text-slate-400 leading-none">E</span>
        <span className="absolute left-1 text-[8px] font-black text-slate-400 leading-none">O</span>

        {/* Seta direcional: indica o sentido de deslocação (para onde sopra) */}
        <div
          className="w-7 h-7 flex items-center justify-center transition-transform duration-300"
          style={{ transform: `rotate(${windInfo.displacementDeg}deg)` }}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 text-[#3CA64C] fill-current drop-shadow-xs"
          >
            {/* Seta com corpo orientado para o topo (0°) */}
            <path d="M12 2L6 14h4v8h4v-8h4L12 2z" />
          </svg>
        </div>
      </div>

      {/* Rótulo de Origem e Deslocação */}
      <div className="mt-1.5 space-y-0.5">
        <div className="text-[13px] font-extrabold text-slate-800 leading-tight">
          {windInfo.originPreposition}
        </div>
        <div className="text-[11px] text-slate-500 font-medium leading-tight">
          {windInfo.targetPreposition}
        </div>
        {isDominant && (
          <span className="inline-block text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded mt-0.5">
            dominante
          </span>
        )}
      </div>
    </div>
  );
};
