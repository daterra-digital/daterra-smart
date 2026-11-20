// src/features/weather/components/WeeklyNowSummaryCard.tsx
import React, { useState } from 'react';
import { Sun, CloudSun, Cloud, CloudRain, CloudLightning, AlertTriangle, CheckCircle2, XCircle, Wind, Thermometer, Droplets } from 'lucide-react';
import type { CurrentWeather } from '../types.ts';
import type { ActiveMachineContext } from '../weatherWeekAggregator.ts';
import { formatDecimalPt } from '../utils/windDirection.ts';
import { buildCurrentSprayTelemetry } from '../utils/weatherContextHelpers.ts';
import { getIrdOperationalBand } from '../utils/irdOperationalThresholds.ts';

const ICON_MAP = (c: number) => c <= 1 ? <Sun className="w-8 h-8 text-amber-500" /> : c === 2 ? <CloudSun className="w-8 h-8 text-amber-500" /> : c >= 51 && c <= 82 ? <CloudRain className="w-8 h-8 text-sky-500" /> : c >= 95 ? <CloudLightning className="w-8 h-8 text-indigo-500" /> : <Cloud className="w-8 h-8 text-slate-400" />;

interface WeeklyNowSummaryCardProps {
  current?: CurrentWeather;
  level: 'optimal' | 'marginal' | 'unfavorable';
  badgeLabel: string;
  context?: ActiveMachineContext | null;
  irdValue: number | null;
}

export const WeeklyNowSummaryCard: React.FC<WeeklyNowSummaryCardProps> = ({ current, level, badgeLabel, context, irdValue }) => {
  const [showTip, setShowTip] = useState(false);
  const { deltaT, rh, wind, gusts, precip, gustFactor, windDir, isInversionAlert, hasPrecipBlock, deltaTTag, deltaTTagTitle } = buildCurrentSprayTelemetry(current);
  const activeProfileName = context?.calibrationName || context?.cultureName || null;
  const irdBand = getIrdOperationalBand(irdValue);
  const acceptableLimit = context?.acceptableIrdLimitPct ?? 75;

  let effectiveLevel = level;
  let effectiveBadge = level === 'optimal' ? 'Favorável' : level === 'marginal' ? 'Atenção' : badgeLabel;
  if (context?.isUavEquipment && wind !== null && wind > 15.0) {
    effectiveLevel = 'unfavorable'; effectiveBadge = 'Adiar (UAV)';
  } else if (irdValue !== null && effectiveLevel !== 'unfavorable') {
    if (irdValue > 100 || (acceptableLimit === 30 ? irdValue > 50 : irdValue > acceptableLimit)) {
      effectiveLevel = 'unfavorable'; effectiveBadge = 'Adiar (IRD)';
    } else if ((acceptableLimit === 30 && irdValue > 30) || (irdValue >= 60 && irdValue <= 75)) {
      if (effectiveLevel === 'optimal') { effectiveLevel = 'marginal'; effectiveBadge = 'Atenção'; }
    }
  }
  const isOptimal = effectiveLevel === 'optimal';
  const isMarginal = effectiveLevel === 'marginal';

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-200 flex flex-col justify-between space-y-3 text-slate-900 min-h-[268px]">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 min-h-[40px]">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 whitespace-nowrap shrink-0">Agora ({current?.updatedAt || '08:00'})</span>
          {activeProfileName ? (
            <span className="text-[11px] font-extrabold bg-emerald-50 text-[#114037] border border-emerald-200 px-2.5 py-0.5 rounded-full truncate max-w-[190px] whitespace-nowrap" title={`Perfil ativo: ${activeProfileName}`}>
              Perfil ativo: {activeProfileName}
            </span>
          ) : (
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">Modo Referência</span>
          )}
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wide border whitespace-nowrap shrink-0 ${
          isOptimal ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : isMarginal ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {isOptimal ? <CheckCircle2 className="w-3.5 h-3.5" /> : isMarginal ? <AlertTriangle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          {effectiveBadge}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 py-1 items-center min-h-[82px]">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#eef8f0] text-daterra-primary border border-emerald-100 flex items-center justify-center shrink-0">
            {ICON_MAP(current?.weatherCode ?? 0)}
          </div>
          <div className="min-w-0">
            <div className="text-3xl sm:text-4xl font-bold text-slate-900 font-mono-numbers tabular-nums leading-tight">
              {formatDecimalPt(current?.temperatureC, '--')}°C
            </div>
            <span className="text-xs font-bold text-slate-500 block truncate">{current?.weatherLabel || 'Céu Limpo'}</span>
          </div>
        </div>

        <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl px-3 py-2.5 text-right relative min-h-[76px] flex flex-col justify-center">
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              title="Índice de Risco de Deriva"
              aria-label="Índice de Risco de Deriva"
              onClick={() => setShowTip((v) => !v)}
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
              onFocus={() => setShowTip(true)}
              onBlur={() => setShowTip(false)}
              className="text-[11px] font-black uppercase tracking-wider text-[#114037] underline decoration-dotted cursor-help focus:outline-none focus:ring-2 focus:ring-[#3CA64C] rounded whitespace-nowrap shrink-0"
            >
              IRD
            </button>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${irdBand.cls}`}>{irdBand.shortLabel}</span>
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-[#114037] font-mono-numbers tabular-nums leading-tight mt-0.5">
            {irdValue !== null ? `${irdValue}%` : '—'}
          </div>
          {showTip && (
            <div role="tooltip" className="absolute right-0 -top-8 z-20 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-semibold whitespace-nowrap shadow-md">
              Índice de Risco de Deriva (limiar {acceptableLimit}%)
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-100">
        <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 flex items-center justify-between gap-1.5 min-h-[42px]">
          <span className="flex items-center gap-1.5 text-slate-500 font-bold whitespace-nowrap shrink-0"><Wind className="w-4 h-4 text-emerald-800 shrink-0" />Vento</span>
          <span className="font-black text-slate-900 font-mono-numbers tabular-nums whitespace-nowrap">{formatDecimalPt(wind, '--')} km/h {windDir ? `· ${windDir.cardinalOrigin}` : ''}</span>
        </div>
        <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 flex items-center justify-between gap-1.5 min-h-[42px]">
          <span className="flex items-center gap-1 text-slate-500 font-bold whitespace-nowrap shrink-0"><Thermometer className="w-4 h-4 text-slate-500 shrink-0" />ΔT</span>
          <span className="flex items-center gap-1.5 font-black text-slate-900 font-mono-numbers tabular-nums whitespace-nowrap shrink-0">
            {formatDecimalPt(deltaT, '--')} °C
            <span title={deltaTTagTitle} className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0">{deltaTTag}</span>
          </span>
        </div>
        <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 flex items-center justify-between gap-1.5 min-h-[42px]">
          <span className="flex items-center gap-1.5 text-slate-500 font-bold whitespace-nowrap shrink-0"><Droplets className="w-4 h-4 text-slate-500 shrink-0" />HR / Raj.</span>
          <span className="font-black text-slate-900 font-mono-numbers tabular-nums whitespace-nowrap">{rh ?? '--'}% · {formatDecimalPt(gusts, '--')} km/h</span>
        </div>
      </div>

      {(hasPrecipBlock || isInversionAlert || (gustFactor != null && gustFactor > 1.8)) && (
        <div className="flex flex-wrap gap-1.5">
          {hasPrecipBlock && <span className="px-2 py-0.5 rounded-lg bg-sky-100 text-sky-900 text-[11px] font-extrabold whitespace-nowrap shrink-0">Bloqueio Precipitação ({formatDecimalPt(precip)} mm/h)</span>}
          {gustFactor != null && gustFactor > 1.8 && <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 text-[11px] font-extrabold whitespace-nowrap shrink-0">Rajada Elevada (G &gt; 1,8)</span>}
          {isInversionAlert && <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 text-[11px] font-extrabold whitespace-nowrap shrink-0">Inversão Térmica (&lt; 3,5 km/h)</span>}
        </div>
      )}
    </div>
  );
};
