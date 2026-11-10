// src/features/weather/components/WeeklyDecisionSummaryCards.tsx
import React, { useMemo } from 'react';
import {
  Clock, Sun, CloudSun, Cloud, CloudRain, CloudLightning,
  AlertTriangle, CheckCircle2, XCircle, Wind, Thermometer, Droplets, Info, WifiOff, AlertCircle
} from 'lucide-react';
import type { CurrentWeather, HourlyForecastItem } from '../types.ts';
import type { WeeklySpraySchedule, ActiveMachineContext } from '../weatherWeekAggregator.ts';
import {
  adaptSprayEvaluation,
  getContextDisplayInfo,
  getFavorableSprayHours
} from '../utils/sprayPresentationAdapter.ts';
import { useWeatherTime, filterFutureHours } from '../services/weatherTimeService.ts';

function getWeatherIcon(code: number) {
  if (code <= 1) return <Sun className="w-9 h-9 text-amber-500" />;
  if (code === 2) return <CloudSun className="w-9 h-9 text-amber-500" />;
  if (code >= 51 && code <= 82) return <CloudRain className="w-9 h-9 text-sky-500" />;
  if (code >= 95) return <CloudLightning className="w-9 h-9 text-indigo-500" />;
  return <Cloud className="w-9 h-9 text-slate-400" />;
}

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
  const contextInfo = getContextDisplayInfo(context);
  const rawEval = {
    level: todayDecision.level, badgeLabel: todayDecision.badgeLabel,
    title: todayDecision.title, reason: todayDecision.reason,
    deltaT: current?.deltaT ?? 4.2, windSpeedKmh: current?.windSpeedKmh ?? 0,
    windGustsKmh: current?.windGustsKmh ?? 0, humidityPercent: current?.humidityPercent ?? 60
  };
  const adaptedEval = adaptSprayEvaluation(rawEval, context);
  const isOptimal = adaptedEval.level === 'optimal';
  const isMarginal = adaptedEval.level === 'marginal';

  const currentHourIso = useWeatherTime();
  const futureHourly = useMemo(() => {
    return filterFutureHours(hourly, currentHourIso, 24);
  }, [hourly, currentHourIso]);

  const favorableToday = getFavorableSprayHours(
    (futureHourly.length ? futureHourly : hourly).map((h) => ({ timeFormatted: h.timeFormatted, sprayEvaluation: h.sprayEvaluation })),
    context
  );

  const deltaT = current?.deltaT ?? 4.2;
  const rh = current?.humidityPercent ?? 62;
  const deltaTTag = deltaT < 2.0 && rh > 90
    ? 'Escorrimento (HR > 90%)'
    : deltaT < 2.0 ? '< 2.0 °C (Referência)' : deltaT <= 8.0 ? 'Faixa ideal (2–8 °C)' : deltaT <= 10.0 ? 'Evaporação rápida' : 'Evaporação extrema';

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
        {/* Cartão 1: Agora nos Critérios Avaliados */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-200 flex flex-col justify-between space-y-3 text-slate-900">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">Agora ({current?.updatedAt || '08:00'})</span>
                <span className="text-[10px] font-extrabold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">{contextInfo.modeLabel}</span>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wide border ${
                isOptimal ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : isMarginal ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {isOptimal ? <CheckCircle2 className="w-3.5 h-3.5" /> : isMarginal ? <AlertTriangle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {adaptedEval.badgeLabel}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-[#eef8f0] text-daterra-primary border border-emerald-100 flex items-center justify-center shrink-0">
                  {getWeatherIcon(current?.weatherCode ?? 0)}
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono-numbers leading-tight">{current?.temperatureC ?? '--'}°C</div>
                  <span className="text-xs font-bold text-slate-600 block">{current?.weatherLabel || 'Céu Limpo'}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-black flex items-center justify-end gap-1.5 text-slate-900 text-base font-mono-numbers">
                  <Wind className="w-4 h-4 text-emerald-800" />
                  <span>{current?.windSpeedKmh ?? '--'} km/h</span>
                </div>
                <div className="text-[11px] font-bold text-slate-500 font-mono-numbers mt-0.5">Rajadas: <span className="text-slate-800">{current?.windGustsKmh ?? '--'} km/h</span></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
              <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-2">
                <Thermometer className="w-3.5 h-3.5 text-slate-500 shrink-0" /><span className="text-slate-500 font-bold">ΔT:</span><span className="font-black text-slate-900 font-mono-numbers">{deltaT} °C</span>
                <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md">{deltaTTag}</span>
              </div>
              <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-2">
                <Droplets className="w-3.5 h-3.5 text-slate-500 shrink-0" /><span className="text-slate-500 font-bold">HR:</span><span className="font-black text-slate-900 font-mono-numbers">{rh}%</span>
              </div>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 space-y-1">
            <p className="text-xs font-semibold text-slate-900 leading-relaxed">{adaptedEval.reason}</p>
            {contextInfo.notice && (
              <p className="text-[11px] text-amber-800 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0" /><span>{contextInfo.notice}</span></p>
            )}
          </div>
        </div>

        {/* Cartão 2: Próximos Horários Favoráveis Previstos (Sem duração fictícia) */}
        <div className="p-4 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-soft flex flex-col justify-between space-y-3 text-slate-900">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-600" /><span>Próximos Horários Favoráveis Previstos</span>
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
                    <div className="text-xs sm:text-sm font-extrabold text-emerald-800 uppercase tracking-wide">Hoje (Janela com critérios atendidos)</div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono-numbers leading-tight mt-0.5">
                      {favorableToday.hoursList.length >= 3
                        ? `${favorableToday.hoursList[0]} – ${favorableToday.hoursList[favorableToday.hoursList.length - 1]}`
                        : favorableToday.displayLabel}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      {favorableToday.hoursList.length >= 3
                        ? `${favorableToday.consecutiveCount} avaliações consecutivas (${favorableToday.displayLabel})`
                        : favorableToday.detailText}
                    </p>
                  </>
                ) : nextBestWindow.available ? (
                  <>
                    <div className="text-xs sm:text-sm font-extrabold text-emerald-800 uppercase tracking-wide">{nextBestWindow.fullDateLabel || nextBestWindow.dayLabel}</div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono-numbers leading-tight mt-0.5">{nextBestWindow.timeRange}</div>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">Horários previstos segundo critérios configurados no intervalo 06:00–20:00.</p>
                  </>
                ) : (
                  <>
                    <div className="text-base sm:text-lg font-black text-slate-800">Sem horários favoráveis previstos nas próximas 48 horas</div>
                    <p className="text-xs text-slate-500 mt-0.5">Critérios não atendidos no intervalo operacional das 06:00 às 20:00.</p>
                  </>
                )}
              </div>
            </div>

            <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100 flex items-center justify-between text-xs mt-2">
              <span className="text-slate-600 font-medium">Dias com horários favoráveis na semana:</span>
              <span className="font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">{schedule.safeDays.length} de {schedule.dailyWindows.length} dias</span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Intervalo configurado: <strong>06:00 às 20:00</strong></span>
            <span>Avaliação: <strong>Critérios meteorológicos</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
