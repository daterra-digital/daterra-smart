// src/features/weather/components/WeatherHourlyDetail.tsx
import React from 'react';
import { Thermometer, Droplets, Wind, CloudRain, Clock, Info } from 'lucide-react';
import type { HourlyForecastItem } from '../types.ts';
import { formatDecimalPt } from '../utils/windDirection.ts';

interface WeatherHourlyDetailProps {
  hour: HourlyForecastItem;
}

export const WeatherHourlyDetail: React.FC<WeatherHourlyDetailProps> = ({ hour }) => {
  return (
    <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3.5 animate-fade-in">
      {/* Topo do detalhe com identificação da hora e estado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2.5 border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-daterra-accent shrink-0" aria-hidden="true" />
          <h4 className="text-sm font-extrabold text-daterra-primary">
            Detalhe das {hour.timeFormatted}
            <span className="font-normal text-slate-500 ml-1.5">— {hour.weatherLabel}</span>
          </h4>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
          <span>Valores instantâneos e precipitação acumulada na hora</span>
        </div>
      </div>

      {/* Grelha de 4 métricas limpas e sem dados de pulverização */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Temperatura */}
        <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-xs space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <Thermometer className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
            <span>Temperatura</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 font-mono-numbers">
            {hour.temperatureC} °C
          </div>
          {hour.dewPointC !== undefined && (
            <div className="text-[11px] text-slate-500 font-mono-numbers">
              Orvalho: {formatDecimalPt(hour.dewPointC)} °C
            </div>
          )}
        </div>

        {/* Humidade */}
        <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-xs space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <Droplets className="w-3.5 h-3.5 text-teal-600 shrink-0" aria-hidden="true" />
            <span>Humidade</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 font-mono-numbers">
            {hour.humidityPercent}%
          </div>
          <div className="text-[11px] text-slate-500">
            Humidade relativa do ar
          </div>
        </div>

        {/* Vento e Rajadas */}
        <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-xs space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <Wind className="w-3.5 h-3.5 text-daterra-primary shrink-0" aria-hidden="true" />
            <span>Vento a 10m</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 font-mono-numbers">
            {hour.windSpeedKmh} km/h
          </div>
          <div className="text-[11px] text-slate-500 font-mono-numbers">
            Rajadas até {hour.windGustsKmh} km/h
          </div>
        </div>

        {/* Precipitação e Probabilidade */}
        <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-xs space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <CloudRain className="w-3.5 h-3.5 text-sky-600 shrink-0" aria-hidden="true" />
            <span>Precipitação</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 font-mono-numbers">
            {formatDecimalPt(hour.precipitationMm)} mm
          </div>
          <div className="text-[11px] text-slate-500 font-mono-numbers">
            Probabilidade: {hour.precipitationProbability}%
          </div>
        </div>
      </div>
    </div>
  );
};
