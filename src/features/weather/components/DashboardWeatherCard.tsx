// src/features/weather/components/DashboardWeatherCard.tsx
import React from 'react';
import { Compass, WifiOff, Info, RotateCcw } from 'lucide-react';
import { useWeather } from '../hooks/useWeather.ts';
import { useLanguage } from '../../../context/LanguageContext.tsx';
import { WeatherLocationSearchDropdown } from './WeatherLocationSearchDropdown.tsx';
import { DashboardWeatherMetrics } from './DashboardWeatherMetrics.tsx';
import { DashboardWeatherHero } from './DashboardWeatherHero.tsx';

function formatFutureDayHeader(dateIso: string, language: string): string {
  try {
    const dObj = new Date(dateIso.includes('T') ? dateIso : `${dateIso}T12:00:00Z`);
    if (isNaN(dObj.getTime())) return dateIso;
    const localeCode = language === 'en' ? 'en-GB' : 'pt-PT';
    return dObj.toLocaleDateString(localeCode, { weekday: 'long', day: 'numeric', month: 'short' });
  } catch {
    return dateIso;
  }
}

interface DashboardWeatherCardProps {
  selectedDateIso?: string | null;
  onSelectDate?: (dateIso: string | null) => void;
  hideLocationDropdown?: boolean;
}

export const DashboardWeatherCard: React.FC<DashboardWeatherCardProps> = ({
  selectedDateIso,
  onSelectDate,
  hideLocationDropdown = false
}) => {
  const { t, language } = useLanguage();
  const {
    data,
    isLoading,
    error,
    currentLocation,
    selectLocation,
    useGpsLocation
  } = useWeather();

  const cur = data?.current;
  const daily = data?.daily || [];

  const isSelectedToday = !selectedDateIso || (daily[0] && selectedDateIso === daily[0].dateIso);
  const selectedDayItem = !isSelectedToday && selectedDateIso
    ? daily.find((d) => d.dateIso === selectedDateIso)
    : null;
  const isFutureDay = Boolean(selectedDayItem);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-slate-200 flex flex-col justify-between h-full space-y-3">
      {/* 1. Topo: Título Contextual + Ação "Agora" + Seletor Pesquisável */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#eef8f0] text-daterra-primary flex items-center justify-center font-bold shrink-0">
            <Compass className="w-4 h-4 text-daterra-accent shrink-0" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-extrabold text-daterra-primary capitalize">
                {isFutureDay && selectedDayItem
                  ? `Previsão · ${formatFutureDayHeader(selectedDayItem.dateIso, language)}`
                  : 'Meteorologia'}
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Previsão Open-Meteo
              </span>
              {isFutureDay && (
                <button
                  type="button"
                  onClick={() => onSelectDate?.(null)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-daterra-primary font-bold text-xs border border-emerald-200 transition-colors cursor-pointer"
                  title={t('weather.returnToCurrentConditions', 'Regressar às condições atuais (Hoje)')}
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
                : 'Condições Atuais e do Dia'}
            </span>
          </div>
        </div>

        {/* Seletor Pesquisável de Freguesia / Município (oculto quando a vista de topo já o contém) */}
        {!hideLocationDropdown && (
          <WeatherLocationSearchDropdown
            currentLocation={currentLocation}
            onSelectLocation={selectLocation}
            onUseGps={useGpsLocation}
          />
        )}
      </div>

      {/* Alertas de Rede e Modo Offline */}
      {error && !cur ? (
        <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs font-bold text-amber-950">
          <WifiOff className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
          <span>{t('weather.forecastUnavailableOffline', 'Previsão indisponível para esta localidade (sem ligação à rede).')}</span>
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

      {/* 2. Corpo Central: Resumo do Dia / Condições Atuais */}
      <div className="py-0.5">
        <DashboardWeatherHero
          current={cur}
          dailyToday={daily[0]}
          selectedDayItem={selectedDayItem}
          isFutureDay={isFutureDay}
          isLoading={isLoading}
          t={t}
        />
      </div>

      {/* 3. Base: Faixa Horizontal Compacta das Três Métricas */}
      <DashboardWeatherMetrics
        current={cur}
        dailyItem={isFutureDay ? selectedDayItem : daily[0]}
        isFutureDay={isFutureDay}
        isLoading={isLoading}
      />
    </div>
  );
};
