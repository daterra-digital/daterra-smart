// src/features/weather/components/DashboardWeatherMetrics.tsx
import React from 'react';
import { Wind, CloudRain, Droplets } from 'lucide-react';
import type { CurrentWeather, DailyForecastItem } from '../types.ts';
import { parseWindDirection, formatDecimalPt } from '../utils/windDirection.ts';

interface DashboardWeatherMetricsProps {
  current?: CurrentWeather | null;
  dailyItem?: DailyForecastItem | null;
  isFutureDay?: boolean;
  isLoading?: boolean;
}

export const DashboardWeatherMetrics: React.FC<DashboardWeatherMetricsProps> = ({
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 border-t border-slate-100 pt-2.5">
      {/* ========================================================================= */}
      {/* MÉTRICA 1: VENTO (Com direção integrada na mesma coluna)                   */}
      {/* ========================================================================= */}
      <div className="flex items-start gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-daterra-primary flex items-center justify-center shrink-0 mt-0.5">
          <Wind className="w-4 h-4 text-daterra-primary" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
            {isFutureDay ? 'Vento máx. diário' : 'Vento a 10m'}
          </div>
          <div className="text-base sm:text-[17px] font-extrabold text-slate-900 font-mono-numbers leading-tight">
            {isLoading ? '--' : windSpeed !== undefined ? `${windSpeed} km/h` : '--'}
          </div>

          {/* Direção e sentido de deslocação integrados */}
          {windInfo ? (
            <div
              className="text-[11px] text-slate-700 font-semibold leading-tight flex items-center gap-1 mt-0.5"
              title={`Direção ${windInfo.originPreposition.toLowerCase()} a soprar ${windInfo.targetPreposition} (${windInfo.degrees}°)`}
            >
              <span
                className="inline-block w-3 h-3 shrink-0 text-[#3CA64C] transition-transform"
                style={{ transform: `rotate(${windInfo.displacementDeg}deg)` }}
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
                  <path d="M12 2L6 14h4v8h4v-8h4L12 2z" />
                </svg>
              </span>
              <span className="truncate">
                {windInfo.originPreposition} ({windInfo.targetPreposition})
              </span>
            </div>
          ) : isCalm ? (
            <div className="text-[11px] text-slate-500 mt-0.5">Calmaria confirmada</div>
          ) : (
            <div className="text-[11px] text-slate-400 mt-0.5">Direção indisponível</div>
          )}

          <div className="text-[10px] text-slate-400 font-mono-numbers truncate mt-0.5">
            {windGusts !== undefined
              ? `Rajadas até ${windGusts} km/h`
              : isFutureDay
              ? 'Rajadas indisponíveis'
              : 'Sem leitura'}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MÉTRICA 2: PRECIPITAÇÃO PREVISTA                                         */}
      {/* ========================================================================= */}
      <div className="flex items-start gap-2.5 min-w-0 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-3">
        <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
          <CloudRain className="w-4 h-4 text-sky-600" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
            {isFutureDay ? 'Precipitação prevista' : 'Chuva prevista hoje'}
          </div>
          <div className="text-base sm:text-[17px] font-extrabold text-slate-900 font-mono-numbers leading-tight">
            {isLoading ? '--' : rainAmount !== undefined ? `${formatDecimalPt(rainAmount)} mm` : '--'}
          </div>
          <div className="text-[11px] text-slate-600 font-semibold font-mono-numbers truncate mt-0.5">
            {rainProb !== undefined ? `Probabilidade: ${rainProb}%` : 'Sem leitura'}
          </div>
          <div className="text-[10px] text-slate-400 truncate mt-0.5">
            {isFutureDay ? 'Total estimado do dia' : 'Previsão diária'}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MÉTRICA 3: HUMIDADE RELATIVA                                              */}
      {/* ========================================================================= */}
      <div className="flex items-start gap-2.5 min-w-0 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-3">
        <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
          <Droplets className="w-4 h-4 text-teal-700" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
            {isFutureDay ? 'Humidade média' : 'Humidade do ar'}
          </div>
          <div className="text-base sm:text-[17px] font-extrabold text-slate-900 font-mono-numbers leading-tight">
            {isLoading ? '--' : humidity !== undefined ? `${humidity}%` : '--'}
          </div>
          <div className="text-[11px] text-slate-600 font-semibold truncate mt-0.5">
            {isFutureDay ? 'Média estimada do dia' : 'Relativa atual'}
          </div>
          <div className="text-[10px] text-slate-400 truncate mt-0.5">
            Ar ambiente
          </div>
        </div>
      </div>
    </div>
  );
};
