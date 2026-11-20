// src/features/weather/components/WeeklyDecisionSummaryCards.tsx
import React, { useMemo } from 'react';
import { Clock, Info, WifiOff } from 'lucide-react';
import type { CurrentWeather, HourlyForecastItem } from '../types.ts';
import type { WeeklySpraySchedule, ActiveMachineContext } from '../weatherWeekAggregator.ts';
import { adaptSprayEvaluation, getFavorableSprayHours } from '../utils/sprayPresentationAdapter.ts';
import { useWeatherTime, filterFutureHours, getEffectiveDateIso } from '../services/weatherTimeService.ts';
import { assessWeatherDriftReading } from '../utils/weatherDriftEvaluator.ts';
import { WeeklyNowSummaryCard } from './WeeklyNowSummaryCard.tsx';

interface WeeklyDecisionSummaryCardsProps {
  current?: CurrentWeather;
  schedule: WeeklySpraySchedule;
  isCached?: boolean;
  hasNetworkError?: boolean;
  context?: ActiveMachineContext | null;
  hourly?: HourlyForecastItem[];
}

export const WeeklyDecisionSummaryCards: React.FC<WeeklyDecisionSummaryCardsProps> = ({
  current, schedule, isCached, hasNetworkError, context, hourly = []
}) => {
  const { todayDecision, nextBestWindow } = schedule;
  const adaptedEval = adaptSprayEvaluation({
    level: todayDecision.level, badgeLabel: todayDecision.badgeLabel,
    title: todayDecision.title, reason: todayDecision.reason,
    deltaT: current?.deltaT ?? 4.2, windSpeedKmh: current?.windSpeedKmh ?? 0,
    windGustsKmh: current?.windGustsKmh ?? 0, humidityPercent: current?.humidityPercent ?? 60
  }, context);

  const currentHourIso = useWeatherTime();
  const todayIso = getEffectiveDateIso();
  const futureTodayHours = useMemo(() => filterFutureHours(hourly, currentHourIso, 24).filter((h) => h.timeIso.startsWith(todayIso)), [hourly, currentHourIso, todayIso]);
  const favorableToday = getFavorableSprayHours(futureTodayHours.map((h) => ({ timeFormatted: h.timeFormatted, sprayEvaluation: h.sprayEvaluation })), context);

  const driftEval = useMemo(() => (current ? assessWeatherDriftReading(current, { isCached: current.isCached }) : null), [current]);
  const baseAtmos = context?.baseMeteoScore ?? (driftEval?.status === 'VALID' ? driftEval.score : null);
  const irdValue = context?.calibrationId && context.combinedIrdPct != null ? context.combinedIrdPct : context?.parcelRiskPct != null ? context.parcelRiskPct : baseAtmos;

  return (
    <div className="space-y-3">
      {hasNetworkError ? (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-amber-950">
          <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Previsão indisponível (Sem ligação à rede).</span>
        </div>
      ) : isCached ? (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs font-bold text-amber-950">
          <span className="flex items-center gap-1.5"><Info className="w-4 h-4 text-amber-700 shrink-0" /><span>Dados em cache ({current?.updatedAt ? `Leitura de ${current.updatedAt}` : 'Offline'})</span></span>
          <span className="text-[10px] text-amber-800 uppercase tracking-wider">Modo Offline</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WeeklyNowSummaryCard current={current} level={adaptedEval.level} badgeLabel={adaptedEval.badgeLabel} context={context} irdValue={irdValue} />

        <div className="p-4 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-soft flex flex-col justify-between space-y-4 text-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-600" /><span>Próximos Horários Favoráveis</span>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wide border ${
              favorableToday.hasFavorable || nextBestWindow.available ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}>
              {favorableToday.hasFavorable ? 'Hoje Favorável' : nextBestWindow.available ? 'Próximo Dia' : 'Sem Previsão'}
            </span>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="w-14 h-14 rounded-2xl bg-[#eef8f0] text-daterra-primary border border-emerald-100 flex items-center justify-center shrink-0">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              {favorableToday.hasFavorable ? (
                <>
                  <div className="text-xs font-extrabold text-emerald-800 uppercase tracking-wide">Hoje</div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono-numbers tabular-nums leading-tight mt-0.5">
                    {favorableToday.hoursList.length >= 3
                      ? `${favorableToday.hoursList[0]} – ${favorableToday.hoursList[favorableToday.hoursList.length - 1]}`
                      : favorableToday.displayLabel}
                  </div>
                </>
              ) : nextBestWindow.available ? (
                <>
                  <div className="text-xs sm:text-sm font-extrabold text-emerald-800 uppercase tracking-wide">{nextBestWindow.fullDateLabel || nextBestWindow.dayLabel}</div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono-numbers tabular-nums leading-tight mt-0.5">{nextBestWindow.timeRange}</div>
                </>
              ) : (
                <div className="text-base sm:text-lg font-black text-slate-800">Sem janela favorável nas próximas 48h</div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-bold">Dias favoráveis na semana</span>
            <span className="font-black text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg font-mono-numbers tabular-nums">
              {schedule.safeDays.length} de {schedule.dailyWindows.length} dias
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
