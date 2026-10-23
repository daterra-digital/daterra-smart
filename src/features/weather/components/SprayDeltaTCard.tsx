// src/features/weather/components/SprayDeltaTCard.tsx
import React from 'react';
import { Droplet, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import type { CurrentWeather } from '../types';
import type { WeatherEquipmentContext } from './WeatherContextBar';
import { evaluateSprayWindow } from '../weatherCalculations';

interface SprayDeltaTCardProps {
  current?: CurrentWeather;
  context: WeatherEquipmentContext;
}

export const SprayDeltaTCard: React.FC<SprayDeltaTCardProps> = ({ current, context }) => {
  const deltaT = current?.deltaT ?? 4.2;
  const wind = current?.windSpeedKmh ?? 12;
  const gusts = current?.windGustsKmh ?? 16;
  const rh = current?.humidityPercent ?? 62;
  const rain = current?.precipitationMm ?? 0;

  const evaluation = evaluateSprayWindow(deltaT, wind, gusts, rh, rain, {
    nozzleType: context.nozzleType,
    hasAirSleeve: context.hasAirSleeve,
    workingPressureBar: context.workingPressureBar
  });

  const markerPercent = Math.min(100, Math.max(0, (deltaT / 12) * 100));

  const isOptimal = evaluation.level === 'optimal';
  const isMarginal = evaluation.level === 'marginal';

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-soft flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <Droplet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Janela de Pulverização (Delta T)</h3>
              <p className="text-xs text-slate-500">Sobrevivência de gota e risco de evaporação (Padrão EPPO)</p>
            </div>
          </div>
          <span
            className={`text-xs font-black px-3 py-1 rounded-xl uppercase tracking-wide flex items-center gap-1.5 ${
              isOptimal
                ? 'bg-emerald-100 text-emerald-800'
                : isMarginal
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {isOptimal ? <CheckCircle2 className="w-3.5 h-3.5" /> : isMarginal ? <AlertTriangle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {evaluation.badgeLabel}
          </span>
        </div>

        {/* Mostrador Grande de Delta T */}
        <div className="my-5 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
            Delta T Atual (Tseco - Thúmido)
          </div>
          <div className="text-4xl sm:text-5xl font-black text-slate-900 font-mono-numbers tracking-tight">
            {deltaT} °C
          </div>

          {/* Régua de Cores Estilo Metos Iberia */}
          <div className="mt-4 max-w-md mx-auto">
            <div className="h-3.5 w-full rounded-full bg-gradient-to-r from-blue-400 via-emerald-500 via-amber-400 to-rose-600 relative overflow-hidden shadow-inner">
              <div
                className="absolute top-0 bottom-0 w-2.5 bg-slate-900 border-2 border-white rounded-full shadow-md transition-all duration-300"
                style={{ left: `calc(${markerPercent}% - 5px)` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-1.5">
              <span>0-2°C Escorrimento</span>
              <span className="text-emerald-700">2-8°C Janela Ótima</span>
              <span className="text-amber-700">8-10°C Evaporação</span>
              <span className="text-rose-700">&gt;10°C Perigo</span>
            </div>
          </div>
        </div>

        {/* Métricas Complementares */}
        <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-slate-400 block text-[11px] mb-0.5">Vento / Rajadas</span>
            <strong className="font-bold text-slate-800 font-mono-numbers">{wind} / {gusts} km/h</strong>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-slate-400 block text-[11px] mb-0.5">Humidade Rel.</span>
            <strong className="font-bold text-slate-800 font-mono-numbers">{rh}% HR</strong>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-slate-400 block text-[11px] mb-0.5">Ponto Orvalho</span>
            <strong className="font-bold text-slate-800 font-mono-numbers">{current?.dewPointC ?? 14.1} °C</strong>
          </div>
        </div>
      </div>

      {/* Caixa de Parecer Contextual Personalizado com a Máquina */}
      <div
        className={`p-4 rounded-2xl text-xs space-y-1.5 border transition-all ${
          isOptimal
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : isMarginal
            ? 'bg-amber-50 border-amber-200 text-amber-950'
            : 'bg-rose-50 border-rose-200 text-rose-950'
        }`}
      >
        <div className="font-extrabold flex items-center gap-2">
          <span>{isOptimal ? '✅' : isMarginal ? '⚡' : '⚠️'}</span>
          <span>{evaluation.title}</span>
        </div>
        <p className="text-[11px] leading-relaxed opacity-90">
          {evaluation.reason}
        </p>
      </div>
    </div>
  );
};
