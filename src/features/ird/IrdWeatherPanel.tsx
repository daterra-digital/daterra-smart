import React from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';
import {
  calculateDeltaT,
  calculateDewPoint,
  calculateWetBulbTemperature
} from '../weather/weatherCalculations.ts';
import type { IrdWeatherInput, IrdWeatherSource } from './irdTypes.ts';
import { IRD_FAIL_CLOSED_RULES } from './irdConfig.ts';

export type WeatherKeypadField =
  | 'windSpeedKmh'
  | 'windGustsKmh'
  | 'temperatureC'
  | 'relativeHumidityPct'
  | 'precipitationMm';

interface IrdWeatherPanelProps {
  readonly weather: IrdWeatherInput;
  readonly isOffline: boolean;
  readonly isWeatherLoading: boolean;
  readonly weatherError: string | null;
  readonly locationName: string;
  readonly onChangeSource: (source: IrdWeatherSource) => void;
  readonly onRefreshWeather: () => void;
  readonly onOpenKeypad: (field: WeatherKeypadField) => void;
}

function getCacheBadgeMeta(weather: IrdWeatherInput): { label: string; css: string } {
  if (weather.weatherSource === 'manual_field') {
    return { label: 'Leitura direta no campo', css: 'bg-emerald-100 text-emerald-950' };
  }
  const age = weather.weatherAgeMinutes ?? null;
  if (weather.weatherSource === 'open_meteo_cache') {
    const expired = age === null || age > IRD_FAIL_CLOSED_RULES.requireManualCheckWhenWeatherCacheOlderThanMin;
    if (expired) {
      return {
        label: `Cache expirada (${age !== null ? `há ${age} min` : '> 20 min'} · confirmar no campo)`,
        css: 'bg-amber-200 text-amber-950'
      };
    }
    return { label: `Cache válida (há ${age} min ≤ 20 min)`, css: 'bg-emerald-100 text-emerald-950' };
  }
  return { label: age !== null ? `Open-Meteo (há ${age} min)` : 'Open-Meteo ao vivo', css: 'bg-emerald-100 text-emerald-950' };
}

export const IrdWeatherPanel: React.FC<IrdWeatherPanelProps> = ({
  weather,
  isOffline,
  isWeatherLoading,
  weatherError,
  locationName,
  onChangeSource,
  onRefreshWeather,
  onOpenKeypad
}) => {
  const hasPsychro = typeof weather.temperatureC === 'number' && typeof weather.relativeHumidityPct === 'number';
  const deltaT = hasPsychro ? calculateDeltaT(weather.temperatureC as number, weather.relativeHumidityPct as number) : null;
  const wetBulb = hasPsychro ? calculateWetBulbTemperature(weather.temperatureC as number, weather.relativeHumidityPct as number) : null;
  const dewPoint = hasPsychro ? calculateDewPoint(weather.temperatureC as number, weather.relativeHumidityPct as number) : null;
  const ageBadge = getCacheBadgeMeta(weather);

  const metrics: ReadonlyArray<{ id: string; label: string; val: string; field?: WeatherKeypadField }> = [
    { id: 'ird-w-wind', label: 'Vento médio', val: weather.windSpeedKmh !== null ? `${weather.windSpeedKmh} km/h` : '—', field: 'windSpeedKmh' },
    { id: 'ird-w-gust', label: 'Rajada', val: weather.windGustsKmh != null ? `${weather.windGustsKmh} km/h` : '—', field: 'windGustsKmh' },
    { id: 'ird-w-temp', label: 'Temperatura', val: weather.temperatureC !== null ? `${weather.temperatureC} °C` : '—', field: 'temperatureC' },
    { id: 'ird-w-rh', label: 'Humidade relativa', val: weather.relativeHumidityPct !== null ? `${weather.relativeHumidityPct} %` : '—', field: 'relativeHumidityPct' },
    { id: 'ird-w-dt', label: 'Delta T (calculado)', val: deltaT !== null ? `${deltaT} °C` : '—' },
    { id: 'ird-w-rain', label: 'Precipitação', val: weather.precipitationMm != null ? `${weather.precipitationMm} mm/h` : '0 mm/h', field: 'precipitationMm' }
  ];

  return (
    <section aria-labelledby="ird-weather-heading" className="bg-white/95 rounded-2xl p-4 border border-slate-200 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="ird-weather-heading" className="text-sm font-bold text-slate-800">
            Condições Meteorológicas · {locationName}
          </h2>
          {hasPsychro && (
            <p className="text-xs text-slate-600">
              Bolbo húmido: <strong className="font-mono-numbers">{wetBulb} °C</strong> · Ponto de orvalho:{' '}
              <strong className="font-mono-numbers">{dewPoint} °C</strong>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="ird-meteo-source" className="text-xs font-bold text-slate-800">
            Origem:
          </label>
          <select
            id="ird-meteo-source"
            value={weather.weatherSource || 'manual_field'}
            onChange={(e) => onChangeSource(e.target.value as IrdWeatherSource)}
            className="touch-target rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs sm:text-sm font-bold text-slate-900"
          >
            <option value="open_meteo_live">Open-Meteo</option>
            <option value="open_meteo_cache">Cache local</option>
            <option value="manual_field">Manual em campo</option>
          </select>
          {!isOffline && (
            <button
              type="button"
              onClick={onRefreshWeather}
              disabled={isWeatherLoading}
              aria-label="Atualizar meteorologia Open-Meteo"
              className="touch-target px-3 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-900 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isWeatherLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 rounded-xl px-3 py-2 text-xs">
        <span className="font-bold text-slate-800 flex items-center gap-1.5">
          {isOffline && <WifiOff className="w-4 h-4 text-amber-700" />}
          {isOffline ? 'Dispositivo Offline' : 'Ligação Online'}
        </span>
        <span className={`font-mono-numbers px-2.5 py-1 rounded-full font-bold ${ageBadge.css}`}>{ageBadge.label}</span>
      </div>

      {weatherError && (
        <div role="alert" className="rounded-xl bg-amber-50 border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-950">
          {weatherError} Utilize entrada manual em campo tocando nos parâmetros abaixo.
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {metrics.map((m) =>
          m.field ? (
            <button
              key={m.id}
              type="button"
              onClick={() => onOpenKeypad(m.field as WeatherKeypadField)}
              className="touch-target text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#3CA64C]"
            >
              <div className="text-xs font-semibold text-slate-600">{m.label}</div>
              <div className="font-mono-numbers text-sm sm:text-base font-extrabold text-slate-950 mt-0.5">{m.val} ✏️</div>
            </button>
          ) : (
            <div key={m.id} className="touch-target bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <div className="text-xs font-semibold text-slate-600">{m.label}</div>
              <div className="font-mono-numbers text-sm sm:text-base font-extrabold text-slate-950 mt-0.5">{m.val}</div>
            </div>
          )
        )}
      </div>
    </section>
  );
};
