// src/features/weather/components/WeatherDedicatedMetrics.tsx
import React from 'react';
import { Wind, CloudRain, Droplets } from 'lucide-react';
import type { CurrentWeather, DailyForecastItem } from '../types.ts';
import { parseWindDirection, formatDecimalPt } from '../utils/windDirection.ts';

interface WeatherDedicatedMetricsProps {
  current?: CurrentWeather | null;
  dailyItem?: DailyForecastItem | null;
  isFutureDay?: boolean;
  isLoading?: boolean;
}

export const WeatherDedicatedMetrics: React.FC<WeatherDedicatedMetricsProps> = ({
  current,
  dailyItem,
  isFutureDay = false,
  isLoading = false
}) => {
  const isCalm = !isFutureDay && current?.windSpeedKmh === 0;
  const windSpeed = isFutureDay ? dailyItem?.windSpeedMaxKmh : current?.windSpeedKmh;
  const windGusts = isFutureDay ? dailyItem?.windGustsMaxKmh : current?.windGustsKmh;
  const windDirDeg = isFutureDay ? dailyItem?.windDirectionDominantDeg : current?.windDirectionDeg;
  const windInfo = parseWindDirection(windDirDeg);

  const rainAmount = isFutureDay
    ? dailyItem?.precipitationSumMm
    : (dailyItem?.precipitationSumMm ?? current?.precipitationMm);
  const rainProb = isFutureDay
    ? dailyItem?.precipitationProbabilityMax
    : dailyItem?.precipitationProbabilityMax;

  const humidity = isFutureDay
    ? dailyItem?.relativeHumidityMeanPercent
    : current?.humidityPercent;

  return (
    <>
      {/* GRUPO B: VENTO E RAJADAS (3 colunas lg) */}
      <div className="lg:col-span-3 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-daterra-primary flex items-center justify-center shrink-0">
            <Wind className="w-4 h-4 text-daterra-primary" aria-hidden="true" />
          </div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {isFutureDay ? 'Vento máx. diário' : 'Vento a 10m'}
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono-numbers pt-0.5">
          {isLoading ? '--' : windSpeed !== undefined ? `${windSpeed} km/h` : '--'}
        </div>
        {windInfo ? (
          <div className="text-xs text-slate-700 font-bold flex items-center gap-1.5 pt-0.5">
            <span
              className="inline-block w-3.5 h-3.5 shrink-0 text-[#3CA64C] transition-transform"
              style={{ transform: `rotate(${windInfo.displacementDeg}deg)` }}
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M12 2L6 14h4v8h4v-8h4L12 2z" />
              </svg>
            </span>
            <span className="truncate">{windInfo.originPreposition} ({windInfo.targetPreposition})</span>
          </div>
        ) : isCalm ? (
          <div className="text-xs text-slate-600 font-medium pt-0.5">Calmaria confirmada</div>
        ) : (
          <div className="text-xs text-slate-400 pt-0.5">Direção indisponível</div>
        )}
        <div className="text-xs text-slate-500 font-mono-numbers">
          {windGusts !== undefined ? `Rajadas até ${windGusts} km/h` : isFutureDay ? 'Sem rajadas' : 'Sem leitura'}
        </div>
      </div>

      {/* GRUPO C: PRECIPITAÇÃO (3 colunas lg) */}
      <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-5 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <CloudRain className="w-4 h-4 text-sky-600" aria-hidden="true" />
          </div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {isFutureDay ? 'Precipitação prevista' : 'Chuva prevista hoje'}
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono-numbers pt-0.5">
          {isLoading ? '--' : rainAmount !== undefined ? `${formatDecimalPt(rainAmount)} mm` : '--'}
        </div>
        <div className="text-xs text-slate-700 font-bold font-mono-numbers pt-0.5">
          {rainProb !== undefined ? `Probabilidade máx.: ${rainProb}%` : 'Sem leitura'}
        </div>
        <div className="text-xs text-slate-500">
          {isFutureDay ? 'Total estimado para o dia' : 'Previsão diária acumulada'}
        </div>
      </div>

      {/* GRUPO D: HUMIDADE E PONTO DE ORVALHO (2 colunas lg) */}
      <div className="lg:col-span-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <Droplets className="w-4 h-4 text-teal-700" aria-hidden="true" />
          </div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {isFutureDay ? 'Humidade média' : 'Humidade do ar'}
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono-numbers pt-0.5">
          {isLoading ? '--' : humidity !== undefined ? `${humidity}%` : '--'}
        </div>
        <div className="text-xs text-slate-700 font-medium pt-0.5">
          {isFutureDay ? 'Média estimada do dia' : 'Humidade relativa atual'}
        </div>
        {!isFutureDay && current?.dewPointC !== undefined && (
          <div className="text-xs text-slate-500 font-mono-numbers">
            Orvalho: {formatDecimalPt(current.dewPointC)}°C
          </div>
        )}
      </div>
    </>
  );
};
