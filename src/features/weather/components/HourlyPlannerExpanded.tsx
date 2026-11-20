// src/features/weather/components/HourlyPlannerExpanded.tsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Clock, Sun, CloudRain, CloudSun, Cloud, ChevronLeft, ChevronRight } from 'lucide-react';
import type { HourlyForecastItem } from '../types.ts';
import type { ActiveMachineContext } from '../weatherWeekAggregator.ts';
import { evaluateSprayWindow } from '../weatherCalculations.ts';
import { formatDecimalPt } from '../utils/windDirection.ts';
import { evaluateHourWithProfileContext } from '../utils/irdOperationalThresholds.ts';
import { HourlyDetailCard } from './HourlyDetailCard.tsx';
import { useWeatherTime, filterFutureHours, getEffectiveDateIso } from '../services/weatherTimeService.ts';

const getWeatherIcon = (c: number) => c <= 1 ? <Sun className="w-5 h-5 text-amber-500" /> : c === 2 ? <CloudSun className="w-5 h-5 text-amber-500" /> : c >= 51 && c <= 82 ? <CloudRain className="w-5 h-5 text-sky-500" /> : <Cloud className="w-5 h-5 text-slate-400" />;

interface HourlyPlannerExpandedProps { hourly: HourlyForecastItem[]; hourlyFull?: HourlyForecastItem[]; context: ActiveMachineContext | null; selectedDateIso?: string | null; }

export const HourlyPlannerExpanded: React.FC<HourlyPlannerExpandedProps> = ({ hourly, hourlyFull, context, selectedDateIso }) => {
  const [selectedHourIndex, setSelectedHourIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const currentHourIso = useWeatherTime();
  const todayDateIso = hourly[0]?.timeIso.slice(0, 10) || getEffectiveDateIso();
  const isToday = !selectedDateIso || selectedDateIso === todayDateIso;

  const displayHours = useMemo(() => {
    const pool = hourlyFull || hourly;
    if (isToday) {
      const live = filterFutureHours(pool, currentHourIso, 24);
      return live.length ? live : hourly.slice(0, 24);
    }
    return pool.filter((h) => h.timeIso.startsWith(selectedDateIso!));
  }, [isToday, hourly, hourlyFull, currentHourIso, selectedDateIso]);

  // Ao mudar de dia, repõe no início
  const prevDateRef = useRef(selectedDateIso);
  useEffect(() => {
    if (prevDateRef.current !== selectedDateIso) {
      prevDateRef.current = selectedDateIso;
      setSelectedHourIndex(0);
      scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [selectedDateIso]);

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
    return () => { el.removeEventListener('scroll', checkScroll); window.removeEventListener('resize', checkScroll); };
  }, [checkScroll, displayHours.length]);

  const scrollBy = (offset: number) => { scrollRef.current?.scrollBy({ left: offset, behavior: 'smooth' }); };

  const selectedHour = displayHours[selectedHourIndex] || displayHours[0];

  const equipmentOptions = (context && (context.equipmentId || context.nozzleId || context.calibrationId))
    ? {
        nozzleType: context.nozzleType || undefined, hasAirSleeve: context.hasAirSleeve ?? undefined,
        workingPressureBar: context.workingPressureBar ?? undefined, dropletSizeUm: context.dropletSizeUm ?? undefined
      }
    : undefined;

  const hasActiveProfile = Boolean(context && (context.calibrationId || context.cultureId));
  const selectedRawEval = selectedHour
    ? evaluateSprayWindow(
        selectedHour.deltaT, selectedHour.windSpeedKmh, selectedHour.windGustsKmh,
        selectedHour.humidityPercent, selectedHour.precipitationMm, equipmentOptions
      )
    : null;
  const selectedEval = selectedHour && selectedRawEval
    ? (hasActiveProfile ? evaluateHourWithProfileContext(selectedRawEval, selectedHour, context).evaluation : selectedRawEval)
    : null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-soft space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-daterra-accent flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-daterra-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-extrabold text-daterra-primary leading-tight">
                {isToday ? 'Planeador Horário (Próximas 24 Horas)' : `Planeador Horário (${selectedDateIso})`}
              </h3>
              {hasActiveProfile && (
                <span className="text-[10px] font-extrabold bg-emerald-50 text-[#114037] border border-emerald-200 px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                  Ajustado ao perfil
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Toque numa hora para inspecionar temperatura, ΔT, vento e IRD.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button type="button" onClick={() => scrollBy(-240)} disabled={!canScrollLeft} aria-label="Horas anteriores" className={`p-1.5 rounded-xl border border-slate-200 transition-colors ${canScrollLeft ? 'bg-white hover:bg-slate-50 text-slate-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => scrollBy(240)} disabled={!canScrollRight} aria-label="Horas seguintes" className={`p-1.5 rounded-xl border border-slate-200 transition-colors ${canScrollRight ? 'bg-white hover:bg-slate-50 text-slate-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="overflow-x-auto pb-2 pt-1 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2 min-w-[700px]" role="tablist" aria-label="Horas previstas">
          {displayHours.map((h, idx) => {
            const hNum = parseInt(h.timeFormatted.split(':')[0], 10);
            const isOutsideOp = hNum < 6 || hNum > 20;
            const rawHourEval = evaluateSprayWindow(
              h.deltaT, h.windSpeedKmh, h.windGustsKmh, h.humidityPercent, h.precipitationMm, equipmentOptions
            );
            const hEval = hasActiveProfile ? evaluateHourWithProfileContext(rawHourEval, h, context).evaluation : rawHourEval;
            const isOpt = hEval.level === 'optimal';
            const isMarg = hEval.level === 'marginal';
            const isSelected = idx === selectedHourIndex;

            return (
              <button
                key={h.timeIso || idx}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedHourIndex(idx)}
                className={`flex-1 min-w-[78px] sm:min-w-[85px] min-h-[148px] p-2 sm:p-2.5 rounded-2xl border text-center flex flex-col items-center justify-between transition-all select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3CA64C] focus:ring-offset-1 ${
                  isSelected
                    ? 'border-[#3CA64C] bg-[#eef8f0] shadow-sm ring-2 ring-[#3CA64C]'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className={`text-xs uppercase font-mono-numbers block ${isSelected ? 'font-black text-[#114037]' : 'font-bold text-slate-700'}`}>{h.timeFormatted}</span>
                  {isOutsideOp && <span className="text-[9px] text-slate-400 font-bold leading-none">Fora 06-20h</span>}
                </div>
                <div className="my-1.5">{getWeatherIcon(h.weatherCode)}</div>
                <div className="text-sm font-black text-slate-900 font-mono-numbers tabular-nums">{formatDecimalPt(h.temperatureC)}°C</div>
                <div className="text-xs font-bold text-slate-700 font-mono-numbers tabular-nums mt-0.5">
                  {formatDecimalPt(h.windSpeedKmh)} km/h
                </div>
                {h.precipitationMm > 0 && (
                  <div className="text-[10px] font-extrabold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded-md font-mono-numbers mt-0.5">
                    {formatDecimalPt(h.precipitationMm)} mm
                  </div>
                )}
                <div className={`w-full mt-2 py-1 px-1 rounded-xl text-center border text-[10px] font-black uppercase tracking-tight ${
                  isOpt
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : isMarg
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {isOpt ? 'Favorável' : isMarg ? 'Atenção' : 'Adiar'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedHour && selectedEval && (
        <HourlyDetailCard hour={selectedHour} evaluation={selectedEval} context={context} />
      )}
    </div>
  );
};
