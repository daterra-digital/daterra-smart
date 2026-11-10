// src/features/weather/components/SprayRisksMatrixCard.tsx
import React from 'react';
import { Wind, Droplets, Thermometer, CloudRain, Sprout, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import type { CurrentWeather } from '../types';
import type { WeatherEquipmentContext } from './WeatherContextBar';

interface SprayRisksMatrixCardProps {
  current?: CurrentWeather;
  context: WeatherEquipmentContext;
}

export const SprayRisksMatrixCard: React.FC<SprayRisksMatrixCardProps> = ({ current, context }) => {
  const deltaT = current?.deltaT ?? 4.2;
  const wind = current?.windSpeedKmh ?? 12;
  const gusts = current?.windGustsKmh ?? 16;
  const rh = current?.humidityPercent ?? 62;
  const rain = current?.precipitationMm ?? 0;
  const vpd = current?.vpdKpa ?? 0.95;

  const isAirInduction = context.nozzleType.toLowerCase().includes('ind') ||
    context.nozzleType === 'air_induction';
  const hasAirSleeve = !!context.hasAirSleeve;

  const maxWindSafe = hasAirSleeve ? 16 : isAirInduction ? 14 : 10;
  const maxWindLimit = hasAirSleeve ? 20 : isAirInduction ? 18 : 14;

  const isWindCritical = wind > maxWindLimit || gusts > 25;
  const isWindMarginal = !isWindCritical && wind > maxWindSafe;
  const isRunoffMarginal = deltaT < 2.0 && rh > 90;
  const isEvapCritical = deltaT > 10.0;
  const isEvapMarginal = !isEvapCritical && deltaT > 8.0;
  const isRainActive = rain > 0.2;
  const isVpdOptimal = vpd >= 0.7 && vpd <= 1.2;
  const isVpdLow = vpd < 0.7;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-soft space-y-4">
      <div className="pb-3 border-b border-slate-100">
        <h3 className="text-base font-extrabold text-slate-900">
          Riscos e Restrições Agronómicas
        </h3>
        <p className="text-xs text-slate-500">
          Avaliação em tempo real dos fatores limitantes de aplicação segundo as regras do motor de cálculo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* Vento / Deriva */}
        <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
          isWindCritical ? 'bg-rose-50/70 border-rose-200 text-rose-950' : isWindMarginal ? 'bg-amber-50/70 border-amber-200 text-amber-950' : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
        }`}>
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5"><Wind className="w-4 h-4 text-slate-700" /> Vento e Deriva</span>
            <span className="font-mono-numbers">{wind} / {gusts} km/h</span>
          </div>
          <div className="flex items-center gap-1 font-extrabold text-[11px]">
            {isWindCritical ? <XCircle className="w-3.5 h-3.5 text-rose-600" /> : isWindMarginal ? <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{isWindCritical ? 'Crítico (Excede limite do perfil ou rajada > 25 km/h)' : isWindMarginal ? `Atenção (Acima do seguro ${maxWindSafe} km/h)` : 'Favorável (Dentro do limite seguro)'}</span>
          </div>
        </div>

        {/* Escorrimento */}
        <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
          isRunoffMarginal ? 'bg-amber-50/70 border-amber-200 text-amber-950' : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
        }`}>
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5"><Droplets className="w-4 h-4 text-slate-700" /> Escorrimento / Orvalho</span>
            <span className="font-mono-numbers">ΔT {deltaT}°C • {rh}% HR</span>
          </div>
          <div className="flex items-center gap-1 font-extrabold text-[11px]">
            {isRunoffMarginal ? <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{isRunoffMarginal ? 'Atenção (ΔT < 2.0°C e HR > 90% provocam escorrimento)' : 'Favorável (Sem saturação de condensação)'}</span>
          </div>
        </div>

        {/* Evaporação */}
        <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
          isEvapCritical ? 'bg-rose-50/70 border-rose-200 text-rose-950' : isEvapMarginal ? 'bg-amber-50/70 border-amber-200 text-amber-950' : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
        }`}>
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5"><Thermometer className="w-4 h-4 text-slate-700" /> Evaporação de Gotas</span>
            <span className="font-mono-numbers">ΔT {deltaT} °C</span>
          </div>
          <div className="flex items-center gap-1 font-extrabold text-[11px]">
            {isEvapCritical ? <XCircle className="w-3.5 h-3.5 text-rose-600" /> : isEvapMarginal ? <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{isEvapCritical ? 'Crítico (ΔT > 10°C: evaporação extrema)' : isEvapMarginal ? 'Atenção (ΔT entre 8 e 10°C: evaporação rápida)' : 'Favorável (ΔT na janela ótima 2-8°C)'}</span>
          </div>
        </div>

        {/* Precipitação */}
        <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
          isRainActive ? 'bg-rose-50/70 border-rose-200 text-rose-950' : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
        }`}>
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5"><CloudRain className="w-4 h-4 text-slate-700" /> Precipitação Atual</span>
            <span className="font-mono-numbers">{rain} mm</span>
          </div>
          <div className="flex items-center gap-1 font-extrabold text-[11px]">
            {isRainActive ? <XCircle className="w-3.5 h-3.5 text-rose-600" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{isRainActive ? 'Chuva ativa (> 0.2 mm) — Aplicação inviável' : 'Sem chuva no momento'}</span>
          </div>
        </div>

        {/* DPV da Cultura */}
        <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
          isVpdOptimal ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : isVpdLow ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-amber-50/70 border-amber-200 text-amber-950'
        }`}>
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5"><Sprout className="w-4 h-4 text-slate-700" /> Transpiração da Cultura (DPV)</span>
            <span className="font-mono-numbers">{vpd} kPa</span>
          </div>
          <div className="flex items-center gap-1 font-extrabold text-[11px]">
            {isVpdOptimal ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
            <span>{isVpdOptimal ? 'Transpiração ativa (0.7 a 1.2 kPa)' : isVpdLow ? 'Baixa transpiração (< 0.7 kPa)' : 'Stress hídrico (> 1.2 kPa)'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
