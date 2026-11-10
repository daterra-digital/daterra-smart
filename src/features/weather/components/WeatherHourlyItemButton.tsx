// src/features/weather/components/WeatherHourlyItemButton.tsx
import React from 'react';
import { Sun, CloudSun, Cloud, CloudRain, CloudLightning, Wind } from 'lucide-react';
import type { HourlyForecastItem } from '../types.ts';
import { formatDecimalPt } from '../utils/windDirection.ts';

function getWeatherIcon(code: number, className = 'w-6 h-6') {
  if (code === 0 || code === 1) return <Sun className={`${className} text-amber-500`} aria-hidden="true" />;
  if (code === 2) return <CloudSun className={`${className} text-amber-500`} aria-hidden="true" />;
  if (code === 3 || code === 45 || code === 48) return <Cloud className={`${className} text-slate-400`} aria-hidden="true" />;
  if (code >= 51 && code <= 82) return <CloudRain className={`${className} text-sky-500`} aria-hidden="true" />;
  if (code >= 95) return <CloudLightning className={`${className} text-indigo-500`} aria-hidden="true" />;
  return <Sun className={`${className} text-amber-500`} aria-hidden="true" />;
}

interface WeatherHourlyItemButtonProps {
  item: HourlyForecastItem;
  isSelected: boolean;
  onSelect: (timeIso: string) => void;
  dayBadge?: string;
}

export const WeatherHourlyItemButton: React.FC<WeatherHourlyItemButtonProps> = ({
  item,
  isSelected,
  onSelect,
  dayBadge
}) => {
  const hasRain = item.precipitationMm > 0;
  const ariaLabel = `${dayBadge ? `${dayBadge}, ` : ''}Hora ${item.timeFormatted}: ${item.temperatureC} graus, ${item.weatherLabel}, vento ${item.windSpeedKmh} km/h, chuva ${formatDecimalPt(item.precipitationMm)} mm`;

  return (
    <button
      type="button"
      role="button"
      aria-pressed={isSelected}
      aria-label={ariaLabel}
      onClick={() => onSelect(item.timeIso)}
      className={`shrink-0 min-w-[92px] sm:min-w-[104px] rounded-2xl p-3 text-center transition-all select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3CA64C] focus:ring-offset-1 border ${
        isSelected
          ? 'border-[#3CA64C] bg-emerald-50/80 shadow-sm ring-1 ring-[#3CA64C]'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {dayBadge && (
        <span className="text-[10px] uppercase font-extrabold text-daterra-accent bg-emerald-100/70 text-emerald-900 px-1.5 py-0.5 rounded-md block mb-1 border border-emerald-200/50">
          {dayBadge}
        </span>
      )}
      <div className="text-xs font-black font-mono-numbers text-slate-700">
        {item.timeFormatted}
      </div>

      <div className="flex justify-center my-2">
        {getWeatherIcon(item.weatherCode, 'w-7 h-7')}
      </div>

      <div className="text-lg font-black text-slate-900 font-mono-numbers leading-none">
        {item.temperatureC}°
      </div>

      <div className="mt-2 pt-1.5 border-t border-slate-100/80 space-y-1">
        <div className="flex items-center justify-center gap-1 text-[11px] font-mono-numbers text-slate-500">
          <Wind className="w-3 h-3 text-slate-400 shrink-0" aria-hidden="true" />
          <span>{item.windSpeedKmh} km/h</span>
        </div>
        <div className={`flex items-center justify-center gap-1 text-[11px] font-mono-numbers ${hasRain ? 'text-sky-700 font-semibold' : 'text-slate-400'}`}>
          <CloudRain className={`w-3 h-3 shrink-0 ${hasRain ? 'text-sky-500' : 'text-slate-300'}`} aria-hidden="true" />
          <span>{formatDecimalPt(item.precipitationMm)} mm</span>
        </div>
      </div>
    </button>
  );
};
