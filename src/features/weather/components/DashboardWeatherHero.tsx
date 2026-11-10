// src/features/weather/components/DashboardWeatherHero.tsx
import React from 'react';
import { Sun, CloudSun, Cloud, CloudRain, CloudLightning } from 'lucide-react';
import type { CurrentWeather, DailyForecastItem } from '../types.ts';
import { getLocalizedWeatherCondition } from './weatherI18n.ts';

function getDominantWeatherIcon(code: number | undefined, className = 'w-16 h-16') {
  const safe = code ?? 0;
  if (safe === 0 || safe === 1) return <Sun className={`${className} text-amber-500`} aria-hidden="true" />;
  if (safe === 2) return <CloudSun className={`${className} text-amber-500`} aria-hidden="true" />;
  if (safe === 3 || safe === 45 || safe === 48) return <Cloud className={`${className} text-slate-400`} aria-hidden="true" />;
  if (safe >= 51 && safe <= 82) return <CloudRain className={`${className} text-sky-500`} aria-hidden="true" />;
  if (safe >= 95) return <CloudLightning className={`${className} text-indigo-500`} aria-hidden="true" />;
  return <Sun className={`${className} text-amber-500`} aria-hidden="true" />;
}

interface DashboardWeatherHeroProps {
  current?: CurrentWeather | null;
  dailyToday?: DailyForecastItem | null;
  selectedDayItem?: DailyForecastItem | null;
  isFutureDay?: boolean;
  isLoading?: boolean;
  t: (key: string, fallback?: string) => string;
}

export const DashboardWeatherHero: React.FC<DashboardWeatherHeroProps> = ({
  current,
  dailyToday,
  selectedDayItem,
  isFutureDay = false,
  isLoading = false,
  t
}) => {
  const weatherCode = isFutureDay ? selectedDayItem?.weatherCode : current?.weatherCode;

  return (
    <div className="flex items-center gap-4 sm:gap-5">
      <div className="shrink-0 flex items-center justify-center">
        {getDominantWeatherIcon(weatherCode, 'w-16 h-16 sm:w-20 sm:h-20')}
      </div>

      <div className="space-y-0.5 sm:space-y-1 min-w-0">
        {isFutureDay && selectedDayItem ? (
          <div className="space-y-0.5">
            <div className="flex items-baseline gap-2.5">
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-500 block">Máx.</span>
                <span className="text-3xl sm:text-4xl font-black text-daterra-primary font-mono tracking-tight font-mono-numbers">
                  {selectedDayItem.maxTempC}°C
                </span>
              </div>
              <span className="text-2xl text-slate-300 font-light">/</span>
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-500 block">Mín.</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-600 font-mono tracking-tight font-mono-numbers">
                  {selectedDayItem.minTempC}°C
                </span>
              </div>
            </div>

            <div className="text-sm sm:text-base font-bold text-slate-800 truncate">
              {getLocalizedWeatherCondition(selectedDayItem.weatherCode, selectedDayItem.weatherLabel, t)}
            </div>
            <div className="text-[11px] text-slate-500">
              Condição mais severa prevista
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-black text-daterra-primary font-mono tracking-tight font-mono-numbers leading-none">
                {isLoading ? '--' : current ? `${current.temperatureC}` : '--'}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-daterra-primary leading-none">°C</span>
            </div>

            <div className="text-sm sm:text-base font-bold text-slate-800 truncate mt-1">
              {current
                ? getLocalizedWeatherCondition(current.weatherCode, current.weatherLabel, t)
                : isLoading
                ? 'A carregar...'
                : 'Condições indisponíveis'}
            </div>

            <div className="text-xs font-semibold text-slate-600 font-mono-numbers mt-0.5">
              {dailyToday ? (
                <span>
                  Mín <strong className="text-slate-800">{dailyToday.minTempC}°C</strong> / Máx{' '}
                  <strong className="text-slate-800">{dailyToday.maxTempC}°C</strong>
                </span>
              ) : (
                <span>Mín -- / Máx --</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
