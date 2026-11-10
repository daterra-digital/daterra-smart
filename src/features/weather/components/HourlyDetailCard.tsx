// src/features/weather/components/HourlyDetailCard.tsx
import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Wind, Thermometer, AlertCircle, Droplets } from 'lucide-react';
import type { HourlyForecastItem, SprayEvaluation } from '../types.ts';
import type { ActiveMachineContext } from '../weatherWeekAggregator.ts';
import { adaptSprayEvaluation } from '../utils/sprayPresentationAdapter.ts';

interface HourlyDetailCardProps {
  hour: HourlyForecastItem;
  evaluation: SprayEvaluation;
  context?: ActiveMachineContext | null;
  rainFreeText?: string | null;
}

export const HourlyDetailCard: React.FC<HourlyDetailCardProps> = ({
  hour,
  evaluation,
  context,
  rainFreeText
}) => {
  const [showFullConditions, setShowFullConditions] = useState(false);
  const adapted = adaptSprayEvaluation(evaluation, context);
  const isOptimal = adapted.level === 'optimal';
  const isMarginal = adapted.level === 'marginal';

  const deltaT = hour.deltaT;
  const rh = hour.humidityPercent;
  const deltaTTag = deltaT < 2.0 && rh > 90
    ? 'Escorrimento (HR > 90%)'
    : deltaT < 2.0 ? '< 2.0 °C' : deltaT <= 8.0 ? 'Faixa ideal (2–8 °C)' : deltaT <= 10.0 ? 'Evaporação rápida' : 'Evaporação extrema (> 10 °C)';

  return (
    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 sm:p-5 text-slate-900 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/60">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wide border ${
            isOptimal ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : isMarginal ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {isOptimal ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> : isMarginal ? <AlertTriangle className="w-3.5 h-3.5 text-amber-700" /> : <XCircle className="w-3.5 h-3.5 text-rose-700" />}
            {adapted.badgeLabel || (isOptimal ? 'Favorável' : 'Atenção')}
          </span>
          <span className="font-extrabold text-xs sm:text-sm text-slate-900 font-mono-numbers">
            Hora {hour.timeFormatted} — {adapted.title}
          </span>
          {adapted.isHeuristicLimited && (
            <span className="text-[10px] font-extrabold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
              Avaliação limitada
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowFullConditions(!showFullConditions)}
          className="text-xs font-bold text-daterra-primary hover:text-daterra-accent underline self-start sm:self-auto cursor-pointer"
        >
          {showFullConditions ? 'Ocultar detalhes' : 'Ver condições completas'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 my-3 text-xs">
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-slate-500 block text-[10px] font-bold">Temperatura / HR</span>
          <strong className="font-mono-numbers text-slate-800">{hour.temperatureC}°C / {hour.humidityPercent}% HR</strong>
        </div>
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-slate-500 block text-[10px] font-bold">Delta T (ΔT)</span>
          <strong className="font-mono-numbers text-slate-800">{hour.deltaT}°C ({deltaTTag})</strong>
        </div>
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-slate-500 block text-[10px] font-bold">Vento / Rajadas</span>
          <strong className="font-mono-numbers text-slate-800">{hour.windSpeedKmh} / {hour.windGustsKmh} km/h</strong>
        </div>
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-slate-500 block text-[10px] font-bold">Precipitação</span>
          <strong className="font-mono-numbers text-slate-800">{hour.precipitationMm} mm</strong>
        </div>
      </div>

      {showFullConditions && (
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>DPV (Défice Pressão Vapor): <strong>{hour.vpdKpa} kPa</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-sky-700 shrink-0" />
            <span>Ponto de Orvalho: <strong>{hour.dewPointC}°C</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-slate-600 shrink-0" />
            <span>Vento: <strong>{hour.windSpeedKmh > 0 ? `${hour.windSpeedKmh} km/h` : 'Calmo'}</strong></span>
          </div>
        </div>
      )}

      <p className="text-xs leading-relaxed text-slate-700 font-medium">{adapted.reason}</p>

      {adapted.heuristicNotice && (
        <div className="mt-2 text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-700" />
          <span>{adapted.heuristicNotice}</span>
        </div>
      )}

      {rainFreeText && (
        <div className="mt-2 text-[11px] text-slate-600 font-medium">
          {rainFreeText}
        </div>
      )}
    </div>
  );
};
