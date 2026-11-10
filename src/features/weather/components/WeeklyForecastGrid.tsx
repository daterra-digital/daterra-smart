// src/features/weather/components/WeeklyForecastGrid.tsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Calendar, Sun, CloudRain, CloudSun, Cloud, CloudLightning,
  CheckCircle2, AlertTriangle, XCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import type { DaySprayWindowSummary } from '../weatherWeekAggregator.ts';

function getWeatherIcon(code: number) {
  if (code <= 1) return <Sun className="w-7 h-7 text-amber-500" />;
  if (code === 2) return <CloudSun className="w-7 h-7 text-amber-500" />;
  if (code >= 51 && code <= 82) return <CloudRain className="w-7 h-7 text-sky-500" />;
  if (code >= 95) return <CloudLightning className="w-7 h-7 text-indigo-500" />;
  return <Cloud className="w-7 h-7 text-slate-400" />;
}

interface WeeklyForecastGridProps {
  dailyWindows: DaySprayWindowSummary[];
  selectedDateIso?: string | null;
  onSelectDate?: (dateIso: string) => void;
}

export const WeeklyForecastGrid: React.FC<WeeklyForecastGridProps> = ({
  dailyWindows,
  selectedDateIso,
  onSelectDate
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
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-daterra-primary" />
            <h3 className="text-base font-extrabold text-slate-900">
              Previsão para 7 Dias (Critérios Diários de Pulverização)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Selecione um dia para inspecionar as horas. Classificação baseada no intervalo configurado 06:00–20:00.
          </p>
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
            const isSelected = day.dateIso === activeDate;

            return (
              <button
                key={day.dateIso}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectDate?.(day.dateIso)}
                className={`flex-1 min-w-[124px] sm:min-w-[130px] lg:min-w-0 p-3 sm:p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3CA64C] focus:ring-offset-1 ${
                  isSelected
                    ? 'bg-[#eef8f0] border-2 border-[#3CA64C] shadow-sm'
                    : 'bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-slate-200/60">
                    <span className={`text-xs uppercase font-mono-numbers ${isSelected ? 'font-black text-[#114037]' : 'font-bold text-slate-800'}`}>
                      {day.dayLabel}
                    </span>
                    <span className={`inline-flex items-center gap-0.5 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                      isOpt
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : isMarg
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {isOpt ? <CheckCircle2 className="w-3 h-3 text-emerald-700" /> : isMarg ? <AlertTriangle className="w-3 h-3 text-amber-700" /> : <XCircle className="w-3 h-3 text-rose-700" />}
                      {isOpt ? 'Favorável' : day.badgeLabel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between my-2">
                    <div>{getWeatherIcon(day.weatherCode)}</div>
                    <div className="text-right">
                      <div className="text-base font-black text-slate-900 font-mono-numbers">{day.maxTempC}°C</div>
                      <div className="text-[11px] text-slate-500 font-mono-numbers">mín. {day.minTempC}°C</div>
                    </div>
                  </div>

                  <div className="text-[11px] space-y-0.5 text-slate-600 font-mono-numbers pt-1 border-t border-slate-200/60">
                    <div>Vento: <strong className="text-slate-800">{day.windSpeedMaxKmh} km/h</strong></div>
                    <div>Chuva: <strong className="text-slate-800">{day.precipitationSumMm} mm</strong></div>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60">
                  <div className={`px-2 py-1 rounded-xl text-center border ${
                    isOpt
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      : isMarg
                      ? 'bg-amber-50 text-amber-950 border-amber-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    <div className="text-[11px] font-black font-mono-numbers">{day.bestWindowText}</div>
                    <div className="text-[10px] font-medium leading-tight opacity-90 line-clamp-1 text-slate-600 mt-0.5" title={day.limitingFactor}>
                      {day.limitingFactor}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
