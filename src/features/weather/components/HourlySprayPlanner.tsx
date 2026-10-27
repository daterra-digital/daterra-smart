// src/features/weather/components/HourlySprayPlanner.tsx
import React from 'react';
import { Clock, ShieldCheck, Sun, CloudRain, CloudSun, Cloud } from 'lucide-react';
import type { HourlyForecastItem } from '../types';

interface HourlySprayPlannerProps {
  hourly: HourlyForecastItem[];
}

export const HourlySprayPlanner: React.FC<HourlySprayPlannerProps> = ({ hourly }) => {
  const displayHours = hourly.slice(0, 16); // Próximas 16 horas

  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return <Sun className="w-5 h-5 text-amber-500" />;
    if (code === 2) return <CloudSun className="w-5 h-5 text-amber-500" />;
    if (code >= 51 && code <= 82) return <CloudRain className="w-5 h-5 text-sky-500" />;
    return <Cloud className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-soft space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-daterra-primary" />
            <h3 className="text-base font-extrabold text-slate-900">
              Planeador Horário de Pulverização (Próximas Horas)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Janelas horárias seguras calculadas automaticamente com base no Delta T e no vento
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Favorável
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-amber-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Atenção
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-rose-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Desfavorável
          </span>
        </div>
      </div>

      {/* Faixa Horária com Scroll Horizontal Suave */}
      <div className="overflow-x-auto pb-2 pt-1">
        <div className="flex gap-2.5 min-w-[750px]">
          {displayHours.map((h, idx) => {
            const isOptimal = h.sprayEvaluation.level === 'optimal';
            const isMarginal = h.sprayEvaluation.level === 'marginal';

            return (
              <div
                key={idx}
                className={`flex-1 min-w-[95px] p-3 rounded-2xl border text-center flex flex-col items-center justify-between transition-all ${
                  isOptimal
                    ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                    : isMarginal
                    ? 'bg-amber-50/60 border-amber-200'
                    : 'bg-rose-50/60 border-rose-200'
                }`}
              >
                <span className="text-xs font-black text-slate-800 font-mono-numbers block">
                  {h.timeFormatted}
                </span>

                <div className="my-1.5">{getWeatherIcon(h.weatherCode)}</div>

                <div className="text-xs font-black text-slate-900 font-mono-numbers">
                  {h.temperatureC}°C
                </div>

                <div className="text-[10px] text-slate-600 font-mono-numbers my-1 space-y-0.5">
                  <div>ΔT: <strong>{h.deltaT}°C</strong></div>
                  <div>V: <strong>{h.windSpeedKmh}k/h</strong></div>
                </div>

                <div
                  className={`mt-1.5 w-full py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight ${
                    isOptimal
                      ? 'bg-emerald-600 text-white'
                      : isMarginal
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isOptimal ? 'Ótimo' : isMarginal ? 'Atenção' : 'Adiar'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nota Operacional Rodapé */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-daterra-accent shrink-0" />
          <span>
            <strong>Recomendação Operacional para o Tratorista:</strong> Privilegiar as janelas matinais (após secagem do orvalho) e as últimas horas do dia com ar calmo.
          </span>
        </div>
        <span className="text-emerald-700 font-bold text-[11px] self-end sm:self-auto">
          Parâmetros de Pulverização
        </span>
      </div>
    </div>
  );
};
