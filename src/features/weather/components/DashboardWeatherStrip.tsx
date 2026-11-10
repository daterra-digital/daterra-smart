// src/features/weather/components/DashboardWeatherStrip.tsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Sun, CloudSun, Cloud, CloudRain, CloudLightning } from 'lucide-react';
import type { DailyForecastItem } from '../types.ts';
import { useLanguage } from '../../../context/LanguageContext.tsx';

interface DashboardWeatherStripProps {
  daily: DailyForecastItem[];
  isLoading?: boolean;
}

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
    const localeCode = language === 'en' ? 'en-GB' : 'pt-PT';
    const weekdayShort = dObj.toLocaleDateString(localeCode, { weekday: 'short' }).replace('.', '');
    const capitalized = weekdayShort.charAt(0).toUpperCase() + weekdayShort.slice(1);
    const dayNum = dObj.getDate();
    if (index === 0) {
      return `${t('weather.today', 'Hoje')} (${capitalized} ${dayNum})`;
    }
    return `${capitalized} ${dayNum}`;
  } catch {
    return fallbackLabel;
  }
}

export const DashboardWeatherStrip: React.FC<DashboardWeatherStripProps> = ({
  daily,
  isLoading
}) => {
  const { t, language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const displayDays = daily.slice(0, 7);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, displayDays.length]);

  const scrollBy = (offset: number) => {
    scrollRef.current?.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <div className="pt-3 border-t border-slate-100 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span>Previsão dos Próximos {displayDays.length > 0 ? displayDays.length : 7} Dias</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scrollBy(-140)}
            disabled={!canScrollLeft}
            aria-label="Dia anterior"
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none text-slate-700 flex items-center justify-center transition-colors cursor-pointer text-xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollBy(140)}
            disabled={!canScrollRight}
            aria-label="Próximo dia"
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none text-slate-700 flex items-center justify-center transition-colors cursor-pointer text-xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto pb-2 scroll-smooth"
        tabIndex={0}
        aria-label="Faixa de previsão diária"
      >
        {displayDays.length > 0 ? (
          displayDays.map((item, index) => {
            const isToday = index === 0;
            const hasRain = item.precipitationSumMm > 0.2;
            return (
              <Link
                key={item.dateIso || index}
                to="/meteorologia"
                className={`w-28 shrink-0 rounded-2xl p-2.5 text-center space-y-1 transition-all select-none block cursor-pointer ${
                  isToday
                    ? 'bg-[#eef8f0] border-2 border-[#3CA64C] shadow-2xs'
                    : 'bg-[#F2F2F2] hover:bg-slate-200/70 border border-slate-200'
                }`}
                title={`Ver detalhes de ${formatDayLabel(item.dateIso, index, item.dayLabel, language, t)} na Meteorologia`}
              >
                <span
                  className={`text-[11px] block uppercase font-mono-numbers ${
                    isToday ? 'font-black text-[#114037]' : 'font-bold text-slate-600'
                  }`}
                >
                  {formatDayLabel(item.dateIso, index, item.dayLabel, language, t)}
                </span>
                <div className="py-1 flex justify-center">{getWeatherIcon(item.weatherCode)}</div>
                <div className="text-xs font-mono font-bold text-slate-900 metric-value font-mono-numbers">
                  {item.maxTempC}° / {item.minTempC}°
                </div>
                <span
                  className={`text-[10px] font-bold px-1 py-0.5 rounded block truncate font-mono-numbers ${
                    hasRain ? 'text-sky-800 bg-sky-100' : 'text-slate-500'
                  }`}
                >
                  {item.precipitationSumMm} mm • {item.precipitationProbabilityMax}%
                </span>
              </Link>
            );
          })
        ) : (
          <div className="w-full text-center text-xs text-slate-400 py-4">
            {isLoading ? 'A carregar previsão semanal...' : 'Previsão semanal indisponível sem ligação à rede'}
          </div>
        )}
      </div>
    </div>
  );
};
