// src/features/weather/components/WeatherHourlyCard.tsx
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Clock, ChevronLeft, ChevronRight, CloudOff } from 'lucide-react';
import { useWeather } from '../hooks/useWeather.ts';
import { useLanguage } from '../../../context/LanguageContext.tsx';
import type { HourlyForecastItem, DailyForecastItem } from '../types.ts';
import { WeatherHourlyItemButton } from './WeatherHourlyItemButton.tsx';
import { WeatherHourlyDetail } from './WeatherHourlyDetail.tsx';
import { useWeatherTime, filterFutureHours, getEffectiveDateIso } from '../services/weatherTimeService.ts';

const EMPTY_DAILY: DailyForecastItem[] = [];
const EMPTY_HOURLY: HourlyForecastItem[] = [];

function formatHourlyDayHeader(dateIso: string, language: string): string {
  try {
    const dObj = new Date(dateIso.includes('T') ? dateIso : `${dateIso}T12:00:00Z`);
    if (isNaN(dObj.getTime())) return dateIso;
    const formatted = dObj.toLocaleDateString(language === 'en' ? 'en-GB' : 'pt-PT', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return dateIso;
  }
}

interface WeatherHourlyCardProps {
  selectedDateIso?: string | null;
}

export const WeatherHourlyCard: React.FC<WeatherHourlyCardProps> = ({ selectedDateIso }) => {
  const { language } = useLanguage();
  const { data, isLoading } = useWeather();
  const currentHourIso = useWeatherTime();
  const daily = data?.daily || EMPTY_DAILY;
  const hourly = data?.hourly || EMPTY_HOURLY;

  const todayDateIso = daily[0]?.dateIso || getEffectiveDateIso();
  const isToday = !selectedDateIso || selectedDateIso === todayDateIso;
  const targetDateIso = isToday ? todayDateIso : selectedDateIso;

  const hourlyFull = data?.hourlyFull || hourly;
  const dayHours = useMemo(() => {
    if (isToday) {
      const live = filterFutureHours(hourlyFull, currentHourIso, 48);
      return live.length ? live : hourly.slice(0, 48);
    }
    return hourlyFull.filter((h) => h.timeIso.startsWith(targetDateIso));
  }, [isToday, hourly, hourlyFull, currentHourIso, targetDateIso]);

  const [selectedHourIso, setSelectedHourIso] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Sincronização da hora ao mudar de dia ou ao carregar dados
  const prevDateRef = useRef(targetDateIso);
  useEffect(() => {
    if (prevDateRef.current !== targetDateIso) {
      prevDateRef.current = targetDateIso;
      setSelectedHourIso(dayHours[0]?.timeIso || null);
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = 0;
      }
    } else if (selectedHourIso && !dayHours.some((h) => h.timeIso === selectedHourIso)) {
      setSelectedHourIso(dayHours[0]?.timeIso || null);
    }
  }, [targetDateIso, dayHours, selectedHourIso]);

  const selectedHour = useMemo(() => {
    if (!dayHours.length) return null;
    return dayHours.find((h) => h.timeIso === selectedHourIso) || dayHours[0];
  }, [dayHours, selectedHourIso]);

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
  }, [checkScroll, dayHours.length]);

  const scrollBy = (offset: number) => {
    scrollRef.current?.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const title = 'Previsão horária';
  const subtitle = isToday
    ? (hourly.length >= 48 ? 'Próximas 48 horas' : `Previsão parcial — ${hourly.length} horas disponíveis`)
    : formatHourlyDayHeader(targetDateIso, language);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-slate-200 space-y-4">
      {/* 1. Cabeçalho com Título Contextual e Controlos de Navegação */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-daterra-accent flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-daterra-accent" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-daterra-primary leading-tight">
              {title}
            </h3>
            <span className="text-[11px] text-slate-500 font-semibold">
              {subtitle}
            </span>
          </div>
        </div>

        {dayHours.length > 0 && (
          <div className="flex items-center gap-1.5" aria-label="Navegação horizontal da previsão horária">
            <button
              type="button"
              onClick={() => scrollBy(-220)}
              disabled={!canScrollLeft}
              aria-label="Ver horas anteriores"
              className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors touch-target focus:outline-none focus:ring-2 focus:ring-[#3CA64C]"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(220)}
              disabled={!canScrollRight}
              aria-label="Ver horas seguintes"
              className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors touch-target focus:outline-none focus:ring-2 focus:ring-[#3CA64C]"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Carrossel Horizontal de Horas ou Estado Vazio */}
      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-400 font-medium">
          A carregar previsão horária...
        </div>
      ) : dayHours.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 space-y-1.5">
          <CloudOff className="w-7 h-7 text-slate-300 mx-auto" aria-hidden="true" />
          <p className="font-semibold text-slate-700">Sem dados de previsão horária</p>
          <p className="text-slate-400">Não existem horas disponíveis para a data selecionada.</p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          role="region"
          aria-label="Lista de horas previstas"
          className="flex items-stretch gap-2.5 overflow-x-auto scroll-smooth scrollbar-none py-1 focus:outline-none"
          tabIndex={0}
        >
          {dayHours.map((hour, idx) => {
            const prev = idx > 0 ? dayHours[idx - 1] : null;
            const isNewDate = prev && hour.timeIso.slice(0, 10) !== prev.timeIso.slice(0, 10);
            let dayBadge: string | undefined;
            if (isToday && (idx === 0 || isNewDate)) {
              const d = new Date(hour.timeIso);
              dayBadge = d.toLocaleDateString(language === 'en' ? 'en-GB' : 'pt-PT', {
                weekday: 'short',
                day: 'numeric'
              });
            }
            return (
              <WeatherHourlyItemButton
                key={hour.timeIso}
                item={hour}
                dayBadge={dayBadge}
                isSelected={selectedHour?.timeIso === hour.timeIso}
                onSelect={setSelectedHourIso}
              />
            );
          })}
        </div>
      )}

      {/* 3. Detalhe Compacto da Hora Selecionada */}
      {!isLoading && selectedHour && (
        <WeatherHourlyDetail hour={selectedHour} />
      )}
    </div>
  );
};
