// src/features/weather/components/WeeklyForecastGrid.tsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Calendar, Sun, CloudRain, CloudSun, Cloud, CloudLightning, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DaySprayWindowSummary } from '../weatherWeekAggregator.ts';
import { formatDecimalPt } from '../utils/windDirection.ts';

function getWeatherIcon(code: number) {
  if (code <= 1) return <Sun className="w-8 h-8 text-amber-500" />;
  if (code === 2) return <CloudSun className="w-8 h-8 text-amber-500" />;
  if (code >= 51 && code <= 82) return <CloudRain className="w-8 h-8 text-sky-500" />;
  if (code >= 95) return <CloudLightning className="w-8 h-8 text-indigo-500" />;
  return <Cloud className="w-8 h-8 text-slate-400" />;
}

interface WeeklyForecastGridProps {
  dailyWindows: DaySprayWindowSummary[];
  selectedDateIso?: string | null;
  onSelectDate?: (dateIso: string) => void;
  hasActiveProfile?: boolean;
}

export const WeeklyForecastGrid: React.FC<WeeklyForecastGridProps> = ({
  dailyWindows,
  selectedDateIso,
  onSelectDate,
  hasActiveProfile = false
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
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
  }, [checkScroll, dailyWindows]);

  const scrollBy = (offset: number) => {
    scrollRef.current?.scrollBy({ left: offset, behavior: 'smooth' });
  };

  if (!dailyWindows.length) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-soft text-center text-slate-500 text-xs">
        Previsão semanal indisponível no momento.
      </div>
    );
  }

  const activeDate = selectedDateIso || dailyWindows[0]?.dateIso;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-soft space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="w-5 h-5 text-daterra-primary" />
          <h3 className="text-base font-extrabold text-slate-900">Previsão para 7 Dias</h3>
          {hasActiveProfile && (
            <span className="text-[10px] font-extrabold bg-emerald-50 text-[#114037] border border-emerald-200 px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
              Ajustado ao perfil
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => scrollBy(-220)}
            disabled={!canScrollLeft}
            aria-label="Dia anterior"
            className={`p-1.5 rounded-xl border border-slate-200 transition-colors ${
              canScrollLeft ? 'bg-white hover:bg-slate-50 text-slate-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(220)}
            disabled={!canScrollRight}
            aria-label="Dia seguinte"
            className={`p-1.5 rounded-xl border border-slate-200 transition-colors ${
              canScrollRight ? 'bg-white hover:bg-slate-50 text-slate-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="overflow-x-auto pb-2 pt-1 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex lg:grid lg:grid-cols-7 gap-3 min-w-[720px] lg:min-w-0" role="tablist" aria-label="Dias da semana para pulverização">
          {dailyWindows.map((day) => {
            const isOpt = day.level === 'optimal';
            const isMarg = day.level === 'marginal';
            const isClosed = Boolean(day.isWindowClosed);
            const isSelected = day.dateIso === activeDate;

            return (
              <button
                key={day.dateIso}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectDate?.(day.dateIso)}
                className={`flex-1 min-w-[116px] sm:min-w-[124px] lg:min-w-0 min-h-[172px] p-3 rounded-2xl border text-center flex flex-col items-center justify-between gap-2 transition-all select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3CA64C] focus:ring-offset-1 ${
                  isSelected
                    ? 'bg-[#eef8f0] border-2 border-[#3CA64C] shadow-sm'
                    : 'bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/80'
                }`}
              >
                <span className={`text-xs uppercase font-mono-numbers ${isSelected ? 'font-black text-[#114037]' : 'font-bold text-slate-800'}`}>
                  {day.dayLabel}
                </span>

                <div className="my-1">{getWeatherIcon(day.weatherCode)}</div>

                <div className="font-mono-numbers tabular-nums">
                  <span className="text-base font-black text-slate-900">{Math.round(day.maxTempC)}°</span>
                  <span className="text-xs font-bold text-slate-500 ml-1">/ {Math.round(day.minTempC)}°</span>
                </div>

                <div className="text-xs font-bold text-slate-600 font-mono-numbers tabular-nums">
                  {formatDecimalPt(day.windSpeedMaxKmh)} km/h
                </div>

                <span className={`w-full py-1 px-2 rounded-xl text-[11px] font-black uppercase tracking-tight border ${
                  isOpt
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : isMarg
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : isClosed
                    ? 'bg-slate-100 text-slate-700 border-slate-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {isOpt ? 'Favorável' : day.badgeLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
