// src/features/weather/components/WeatherDedicatedCard.tsx
import React from 'react';
import {
  Compass, Sun, CloudSun, Cloud,
  CloudRain, CloudLightning, WifiOff, Info, RotateCcw
} from 'lucide-react';
import { useWeather } from '../hooks/useWeather.ts';
import { useLanguage } from '../../../context/LanguageContext.tsx';
import { getLocalizedWeatherCondition } from './weatherI18n.ts';
import { WeatherDedicatedMetrics } from './WeatherDedicatedMetrics.tsx';

function getDominantWeatherIcon(code: number | undefined, className = 'w-16 h-16') {
  const safe = code ?? 0;
  if (safe <= 1) return <Sun className={`${className} text-amber-500`} aria-hidden="true" />;
  if (safe === 2) return <CloudSun className={`${className} text-amber-500`} aria-hidden="true" />;
  if (safe === 3 || safe === 45 || safe === 48) return <Cloud className={`${className} text-slate-400`} aria-hidden="true" />;
  if (safe >= 51 && safe <= 82) return <CloudRain className={`${className} text-sky-500`} aria-hidden="true" />;
  if (safe >= 95) return <CloudLightning className={`${className} text-indigo-500`} aria-hidden="true" />;
  return <Sun className={`${className} text-amber-500`} aria-hidden="true" />;
}

function formatFutureDayHeader(dateIso: string, language: string): string {
  try {
    const dObj = new Date(dateIso.includes('T') ? dateIso : `${dateIso}T12:00:00Z`);
    if (isNaN(dObj.getTime())) return dateIso;
    return dObj.toLocaleDateString(language === 'en' ? 'en-GB' : 'pt-PT', { weekday: 'long', day: 'numeric', month: 'short' });
  } catch {
    return dateIso;
  }
}

interface WeatherDedicatedCardProps {
  selectedDateIso?: string | null;
  onSelectDate?: (dateIso: string | null) => void;
}

export const WeatherDedicatedCard: React.FC<WeatherDedicatedCardProps> = ({
  selectedDateIso,
  onSelectDate
}) => {
  const { t, language } = useLanguage();
  const { data, isLoading, error } = useWeather();

  const cur = data?.current;
  const daily = data?.daily || [];

  const isSelectedToday = !selectedDateIso || (daily[0] && selectedDateIso === daily[0].dateIso);
  const selectedDayItem = !isSelectedToday && selectedDateIso
    ? daily.find((d) => d.dateIso === selectedDateIso)
    : null;
  const isFutureDay = Boolean(selectedDayItem);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-slate-200 space-y-4">
      {/* 1. Cabeçalho Contextual com Ação "Agora" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#eef8f0] text-daterra-primary flex items-center justify-center font-bold shrink-0">
            <Compass className="w-4 h-4 text-daterra-accent shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-extrabold text-daterra-primary capitalize">
                {isFutureDay && selectedDayItem
                  ? `Previsão · ${formatFutureDayHeader(selectedDayItem.dateIso, language)}`
                  : 'Condições Atuais e Previsão do Dia'}
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Previsão Open-Meteo
              </span>
              {isFutureDay && (
                <button
                  type="button"
                  onClick={() => onSelectDate?.(null)}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-daterra-primary font-bold text-xs border border-emerald-200 transition-colors cursor-pointer"
                  title="Regressar às condições atuais (Hoje)"
                  aria-label="Regressar às condições atuais"
                >
                  <RotateCcw className="w-3 h-3 text-daterra-accent" />
                  <span>Agora</span>
                </button>
              )}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {isFutureDay
                ? 'Condição prevista mais severa ao longo do dia'
                : 'Leituras meteorológicas e bioclimáticas da exploração'}
            </span>
          </div>
        </div>
      </div>

      {/* Alertas de Rede e Modo Offline */}
      {error && !cur ? (
        <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs font-bold text-amber-950">
          <WifiOff className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
          <span>Previsão indisponível para esta localidade (sem ligação à rede).</span>
        </div>
      ) : cur?.isCached ? (
        <div className="p-2 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs text-amber-950 px-3">
          <span className="flex items-center gap-1.5 font-semibold text-[11px]">
            <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" aria-hidden="true" />
            <span>Dados em cache • {cur.updatedAt ? `Leitura de ${cur.updatedAt}` : 'Modo Offline'}</span>
          </span>
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Offline</span>
        </div>
      ) : null}

      {/* 2. Distribuição Otimizada da Página: 4 Grupos Balanceados na Largura Total */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6 items-start pt-1">
        {/* GRUPO A: CONDIÇÕES E TEMPERATURA (4 colunas lg) */}
        <div className="lg:col-span-4 flex items-start gap-4">
          <div className="shrink-0 flex items-center justify-center mt-1">
            {getDominantWeatherIcon(
              isFutureDay ? selectedDayItem?.weatherCode : cur?.weatherCode,
              'w-14 h-14 sm:w-16 sm:h-16'
            )}
          </div>

          <div className="space-y-1 min-w-0">
            {isFutureDay && selectedDayItem ? (
              <div>
                <div className="flex items-baseline gap-2.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Máx.</span>
                    <span className="text-3xl sm:text-4xl font-black text-daterra-primary font-mono tracking-tight font-mono-numbers">
                      {selectedDayItem.maxTempC}°C
                    </span>
                  </div>
                  <span className="text-2xl text-slate-300 font-light">/</span>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Mín.</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-600 font-mono tracking-tight font-mono-numbers">
                      {selectedDayItem.minTempC}°C
                    </span>
                  </div>
                </div>

                <div className="text-sm sm:text-base font-bold text-slate-800 truncate mt-1">
                  {getLocalizedWeatherCondition(selectedDayItem.weatherCode, selectedDayItem.weatherLabel, t)}
                </div>
                <div className="text-[11px] text-slate-500">
                  Mais severa prevista para o dia
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-4xl sm:text-5xl font-black text-daterra-primary font-mono tracking-tight font-mono-numbers leading-none">
                    {isLoading ? '--' : cur ? `${cur.temperatureC}` : '--'}
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-daterra-primary leading-none">°C</span>
                  {cur?.apparentTempC !== undefined && (
                    <span className="text-xs text-slate-500 font-semibold font-mono-numbers ml-1">
                      (Sensação {cur.apparentTempC}°C)
                    </span>
                  )}
                </div>

                <div className="text-sm sm:text-base font-bold text-slate-800 truncate mt-1">
                  {cur
                    ? getLocalizedWeatherCondition(cur.weatherCode, cur.weatherLabel, t)
                    : isLoading
                    ? 'A carregar...'
                    : 'Condições indisponíveis'}
                </div>

                <div className="text-xs font-semibold text-slate-600 font-mono-numbers mt-0.5">
                  {daily[0] ? (
                    <span>
                      Mín <strong className="text-slate-800">{daily[0].minTempC}°C</strong> / Máx{' '}
                      <strong className="text-slate-800">{daily[0].maxTempC}°C</strong>
                    </span>
                  ) : (
                    <span>Mín -- / Máx --</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* GRUPOS B, C e D: VENTO, PRECIPITAÇÃO, HUMIDADE E ORVALHO (8 colunas lg) */}
        <WeatherDedicatedMetrics
          current={cur}
          dailyItem={isFutureDay ? selectedDayItem : daily[0]}
          isFutureDay={isFutureDay}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
