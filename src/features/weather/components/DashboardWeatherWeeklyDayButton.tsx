// src/features/weather/components/DashboardWeatherWeeklyDayButton.tsx
import React from 'react';
import { Sun, CloudSun, Cloud, CloudRain, CloudLightning } from 'lucide-react';
import type { DailyForecastItem } from '../types.ts';
import { formatDecimalPt } from '../utils/windDirection.ts';

function getWeatherIcon(code: number, className = 'w-7 h-7') {
  if (code === 0 || code === 1) return <Sun className={`${className} text-amber-500`} aria-hidden="true" />;
  if (code === 2) return <CloudSun className={`${className} text-amber-500`} aria-hidden="true" />;
  if (code === 3 || code === 45 || code === 48) return <Cloud className={`${className} text-slate-400`} aria-hidden="true" />;
  if (code >= 51 && code <= 82) return <CloudRain className={`${className} text-sky-500`} aria-hidden="true" />;
  if (code >= 95) return <CloudLightning className={`${className} text-indigo-500`} aria-hidden="true" />;
  return <Sun className={`${className} text-amber-500`} aria-hidden="true" />;
}

function formatDayLabel(dateIso: string, index: number, fallbackLabel: string, language: string, t: any): string {
  try {
    const dObj = new Date(dateIso.includes('T') ? dateIso : `${dateIso}T12:00:00Z`);
    if (isNaN(dObj.getTime())) return fallbackLabel;
    const weekdaysPt = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const weekdaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const shortName = language === 'en' ? weekdaysEn[dObj.getDay()] : weekdaysPt[dObj.getDay()];
    const dayNum = dObj.getDate();
    if (index === 0) {
      return `${t('weather.today', 'Hoje')} (${shortName} ${dayNum})`;
    }
    return `${shortName} ${dayNum}`;
  } catch {
    return fallbackLabel;
  }
}

interface DashboardWeatherWeeklyDayButtonProps {
  item: DailyForecastItem;
  index: number;
  isSelected: boolean;
  language: string;
  t: (key: string, fallback?: string) => string;
  onSelect: () => void;
}

export const DashboardWeatherWeeklyDayButton: React.FC<DashboardWeatherWeeklyDayButtonProps> = ({
  item,
  index,
  isSelected,
  language,
  t,
  onSelect
}) => {
  const hasRain = item.precipitationSumMm > 0.2;
  const dayLabelText = formatDayLabel(item.dateIso, index, item.dayLabel, language, t);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      aria-label={`Previsão para ${dayLabelText}: máxima ${item.maxTempC} graus, mínima ${item.minTempC} graus`}
      className={`flex-1 min-w-[130px] rounded-2xl p-2.5 sm:p-3 text-center space-y-1.5 transition-all select-none block cursor-pointer touch-target focus:outline-none focus:ring-2 focus:ring-[#3CA64C] focus:ring-offset-1 ${
        isSelected
          ? 'bg-[#eef8f0] border-2 border-[#3CA64C] shadow-sm'
          : 'bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/80'
      }`}
    >
      <span
        className={`text-[13px] sm:text-sm block uppercase font-mono-numbers truncate ${
          isSelected ? 'font-black text-[#114037]' : 'font-bold text-slate-700'
        }`}
      >
        {dayLabelText}
      </span>

      <div className="py-1 flex justify-center">
        {getWeatherIcon(item.weatherCode)}
      </div>

      <div className="text-[15px] sm:text-base font-bold text-slate-900 font-mono-numbers">
        <span>{item.maxTempC}°</span>
        <span className="text-slate-400 font-normal mx-1">/</span>
        <span className="text-slate-600">{item.minTempC}°</span>
      </div>

      <div className="space-y-0.5 pt-0.5">
        <div
          className={`text-[13px] font-bold font-mono-numbers ${
            hasRain ? 'text-sky-800' : 'text-slate-600'
          }`}
        >
          {item.precipitationSumMm > 0 ? `${formatDecimalPt(item.precipitationSumMm)} mm` : '0 mm'}
        </div>
        <div className="text-[12px] sm:text-[13px] text-slate-500 font-medium font-mono-numbers">
          {item.precipitationProbabilityMax}% prob.
        </div>
      </div>
    </button>
  );
};
