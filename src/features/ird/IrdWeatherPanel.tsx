import React, { useState } from 'react';
import { RefreshCw, WifiOff, Pencil, ChevronDown, ChevronUp, AlertTriangle, BookOpen } from 'lucide-react';
import { calculateDeltaT, calculateDewPoint, calculateWetBulbTemperature } from '../weather/weatherCalculations.ts';
import type { IrdWeatherInput, IrdWeatherSource } from './irdTypes.ts';
import type { IrdGuideTopicId } from './irdGuideSections.ts';
import { IRD_FAIL_CLOSED_RULES } from './irdConfig.ts';

export type WeatherKeypadField = 'windSpeedKmh' | 'windGustsKmh' | 'temperatureC' | 'relativeHumidityPct' | 'precipitationMm';

interface IrdWeatherPanelProps {
  readonly weather: IrdWeatherInput;
  readonly isOffline: boolean;
  readonly isWeatherLoading: boolean;
  readonly weatherError: string | null;
  readonly locationName: string;
  readonly isComplementaryOpen?: boolean;
  readonly onToggleComplementary?: () => void;
  readonly onOpenGuideTopic?: (topic: IrdGuideTopicId) => void;
  readonly onChangeSource: (source: IrdWeatherSource) => void;
  readonly onRefreshWeather: () => void;
  readonly onOpenKeypad: (field: WeatherKeypadField) => void;
}

function getCacheBadgeMeta(weather: IrdWeatherInput): { label: string; css: string } {
  if (weather.weatherSource === 'manual_field') return { label: 'Leitura direta no campo', css: 'bg-emerald-100 text-emerald-950' };
  const age = weather.weatherAgeMinutes ?? null;
  if (weather.weatherSource === 'open_meteo_cache') {
    const expired = age === null || age > IRD_FAIL_CLOSED_RULES.requireManualCheckWhenWeatherCacheOlderThanMin;
    return expired
      ? { label: `Cache expirada (${age !== null ? `há ${age} min` : '> 20 min'} · confirmar no campo)`, css: 'bg-amber-200 text-amber-950' }
      : { label: `Cache válida (há ${age} min ≤ 20 min)`, css: 'bg-emerald-100 text-emerald-950' };
  }
  return { label: age !== null ? `Open-Meteo (há ${age} min)` : 'Open-Meteo ao vivo', css: 'bg-emerald-100 text-emerald-950' };
}

export const IrdWeatherPanel: React.FC<IrdWeatherPanelProps> = ({
  weather, isOffline, isWeatherLoading, weatherError, locationName, isComplementaryOpen, onToggleComplementary,
  onOpenGuideTopic, onChangeSource, onRefreshWeather, onOpenKeypad
}) => {
  const [localCompOpen, setLocalCompOpen] = useState(false);
  const compOpen = isComplementaryOpen ?? localCompOpen;
  const toggleComp = onToggleComplementary ?? (() => setLocalCompOpen((v) => !v));

  const hasPsychro = typeof weather.temperatureC === 'number' && typeof weather.relativeHumidityPct === 'number';
  const deltaT = hasPsychro ? calculateDeltaT(weather.temperatureC as number, weather.relativeHumidityPct as number) : null;
  const wetBulb = hasPsychro ? calculateWetBulbTemperature(weather.temperatureC as number, weather.relativeHumidityPct as number) : null;
  const dewPoint = hasPsychro ? calculateDewPoint(weather.temperatureC as number, weather.relativeHumidityPct as number) : null;
  const ageBadge = getCacheBadgeMeta(weather);
  const missingEssential = weather.windSpeedKmh === null || weather.temperatureC === null || weather.relativeHumidityPct === null;
  const hasCriticalRainOrGust = (weather.precipitationMm ?? 0) > IRD_FAIL_CLOSED_RULES.maxPrecipitationAllowedMm || (weather.windGustsKmh ?? 0) > IRD_FAIL_CLOSED_RULES.maxGustLimitKmh;

  const essentialMetrics: ReadonlyArray<{ id: string; label: string; val: string; field: WeatherKeypadField }> = [
    { id: 'ird-w-wind', label: 'Vento médio (obrigatório)', val: weather.windSpeedKmh !== null ? `${weather.windSpeedKmh} km/h` : '—', field: 'windSpeedKmh' },
    { id: 'ird-w-temp', label: 'Temperatura (obrigatório)', val: weather.temperatureC !== null ? `${weather.temperatureC} °C` : '—', field: 'temperatureC' },
    { id: 'ird-w-rh', label: 'Humidade relativa (obrigatório)', val: weather.relativeHumidityPct !== null ? `${weather.relativeHumidityPct} %` : '—', field: 'relativeHumidityPct' }
  ];

  const complementaryMetrics: ReadonlyArray<{ id: string; label: string; val: string; field?: WeatherKeypadField }> = [
    { id: 'ird-w-gust', label: 'Rajada de vento', val: weather.windGustsKmh != null ? `${weather.windGustsKmh} km/h` : '—', field: 'windGustsKmh' },
    { id: 'ird-w-rain', label: 'Precipitação', val: weather.precipitationMm != null ? `${weather.precipitationMm} mm` : '—', field: 'precipitationMm' },
    { id: 'ird-w-dt', label: 'Delta T (derivado)', val: deltaT !== null ? `${deltaT} °C` : '—' },
    { id: 'ird-w-wb', label: 'Bolbo húmido (derivado)', val: wetBulb !== null ? `${wetBulb} °C` : '—' },
    { id: 'ird-w-dp', label: 'Ponto de orvalho (derivado)', val: dewPoint !== null ? `${dewPoint} °C` : '—' }
  ];

  return (
    <section aria-labelledby="ird-weather-heading" className="bg-white/95 rounded-2xl p-4 border border-slate-200 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="ird-weather-heading" className="text-sm font-bold text-slate-800">Condições Meteorológicas · {locationName}</h2>
          {onOpenGuideTopic && (
            <button type="button" onClick={() => onOpenGuideTopic('weather')} aria-label="Saber mais sobre meteorologia e deriva" className="text-[11px] font-extrabold text-[#114037] underline inline-flex items-center gap-1 cursor-pointer">
              <BookOpen className="w-3 h-3" aria-hidden="true" /><span>Saber mais</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="ird-meteo-source" className="text-xs font-bold text-slate-800">Origem:</label>
          <select id="ird-meteo-source" value={weather.weatherSource || 'manual_field'} onChange={(e) => onChangeSource(e.target.value as IrdWeatherSource)} className="touch-target rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs sm:text-sm font-bold text-slate-900">
            <option value="open_meteo_live">Open-Meteo</option><option value="open_meteo_cache">Cache local</option><option value="manual_field">Manual em campo</option>
          </select>
          {!isOffline && (
            <button type="button" onClick={onRefreshWeather} disabled={isWeatherLoading} aria-label="Atualizar meteorologia Open-Meteo" className="touch-target px-3 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-900 disabled:opacity-50 cursor-pointer">
              <RefreshCw className={`w-4 h-4 ${isWeatherLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 rounded-xl px-3 py-2 text-xs">
        <span className="font-bold text-slate-800 flex items-center gap-1.5">{isOffline && <WifiOff className="w-4 h-4 text-amber-700" />}{isOffline ? 'Dispositivo Offline' : 'Ligação Online'}</span>
        <span className={`font-mono-numbers px-2.5 py-1 rounded-full font-bold ${ageBadge.css}`}>{ageBadge.label}</span>
      </div>

      {weatherError && <div role="alert" className="rounded-xl bg-amber-50 border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-950">{weatherError} Utilize entrada manual em campo nos parâmetros abaixo.</div>}
      {missingEssential && <div role="alert" className="rounded-xl bg-rose-50 border border-rose-300 px-3 py-2 text-xs font-bold text-rose-950 flex items-start gap-2"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" /><span>Meteorologia essencial em falta: vento médio, temperatura e humidade relativa são obrigatórios para calcular.</span></div>}
      {hasCriticalRainOrGust && <div role="alert" className="rounded-xl bg-rose-50 border border-rose-300 px-3 py-2 text-xs font-bold text-rose-950 flex items-start gap-2"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" /><span>Condição meteorológica crítica detetada (precipitação &gt; 0,2 mm ou rajada &gt; 25 km/h) — bloqueio operacional ativo.</span></div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {essentialMetrics.map((m) => (
          <button key={m.id} type="button" onClick={() => onOpenKeypad(m.field)} className="touch-target text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3CA64C] cursor-pointer">
            <div className="text-[11px] font-semibold text-slate-600">{m.label}</div>
            <div className="font-mono-numbers text-sm sm:text-base font-extrabold text-slate-950 mt-0.5 flex items-center justify-between gap-1"><span>{m.val}</span><Pencil className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" /></div>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/70 overflow-hidden">
        <button type="button" aria-expanded={compOpen} aria-controls="ird-weather-comp" onClick={toggleComp} className="touch-target w-full px-3 py-2.5 flex flex-wrap items-center justify-between gap-2 text-left text-xs font-extrabold text-[#114037] hover:bg-slate-100 cursor-pointer">
          <span>Condições meteorológicas complementares</span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono-numbers font-bold text-slate-700">
            <span>Rajada: {weather.windGustsKmh != null ? `${weather.windGustsKmh} km/h` : '—'}</span>
            <span>· Precip.:</span>
            <span>{weather.precipitationMm != null ? `${weather.precipitationMm} mm` : '—'}</span>
            {compOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </span>
        </button>
        {compOpen && (
          <div id="ird-weather-comp" className="p-3 pt-2 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {complementaryMetrics.map((m) =>
              m.field ? (
                <button key={m.id} type="button" onClick={() => onOpenKeypad(m.field as WeatherKeypadField)} className="touch-target text-left bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3CA64C] cursor-pointer">
                  <div className="text-[11px] font-semibold text-slate-600">{m.label}</div>
                  <div className="font-mono-numbers text-sm font-extrabold text-slate-950 mt-0.5 flex items-center justify-between gap-1"><span>{m.val}</span><Pencil className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" /></div>
                </button>
              ) : (
                <div key={m.id} className="touch-target bg-white border border-slate-200 rounded-xl p-2.5">
                  <div className="text-[11px] font-semibold text-slate-600">{m.label}</div>
                  <div className="font-mono-numbers text-sm font-extrabold text-slate-950 mt-0.5">{m.val}</div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
};
