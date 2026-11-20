// src/features/weather/views/WeatherSaasView.tsx
import React, { useState, useMemo, useEffect, useLayoutEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Compass, BookOpen } from 'lucide-react';
import { useWeather } from '../hooks/useWeather.ts';
import { WeatherModeToggle, type WeatherMode } from '../components/WeatherModeToggle.tsx';
import { WeatherGeneralView } from '../components/WeatherGeneralView.tsx';
import { WeatherContextAccordion } from '../components/WeatherContextAccordion.tsx';
import { WeeklyDecisionSummaryCards } from '../components/WeeklyDecisionSummaryCards.tsx';
import { HourlyPlannerExpanded } from '../components/HourlyPlannerExpanded.tsx';
import { WeeklyForecastGrid } from '../components/WeeklyForecastGrid.tsx';
import { SprayChartsModule } from '../components/charts/SprayChartsModule.tsx';
import { WeatherTechnicalGuideModal } from '../components/WeatherTechnicalGuideModal.tsx';
import { WeatherLocationSearchDropdown } from '../components/WeatherLocationSearchDropdown.tsx';
import { WeatherDriftSection } from '../components/WeatherDriftSection.tsx';
import { aggregateWeeklySpraySchedule, type ActiveMachineContext } from '../weatherWeekAggregator.ts';
import { useWeatherTime, filterFutureHours } from '../services/weatherTimeService.ts';

export const WeatherSaasView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading, error, currentLocation, selectLocation, useGpsLocation, refreshWeather } = useWeather();

  const resolveModeFromTab = (tab: string | null): WeatherMode =>
    tab === 'pulverizacao' || tab === 'deriva' ? 'pulverizacao' : 'meteorologia';

  const [activeMode, setActiveMode] = useState<WeatherMode>('meteorologia');
  const [selectedDateIso, setSelectedDateIso] = useState<string | null>(null);
  const [context, setContext] = useState<ActiveMachineContext | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  useLayoutEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const next = resolveModeFromTab(tabParam);
      setActiveMode(next);
      if (tabParam === 'deriva') setSearchParams({ tab: 'pulverizacao' }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleModeChange = (mode: WeatherMode) => {
    setActiveMode(mode);
    setSearchParams(mode === 'meteorologia' ? {} : { tab: mode }, { replace: true });
  };

  useEffect(() => { setSelectedDateIso(null); }, [currentLocation?.id, currentLocation?.latitude, currentLocation?.longitude]);
  useEffect(() => {
    if (selectedDateIso && data?.daily && !data.daily.some((d) => d.dateIso === selectedDateIso)) setSelectedDateIso(null);
  }, [data?.daily, selectedDateIso]);

  const currentHourIso = useWeatherTime();
  const futureHourlyAll = useMemo(
    () => filterFutureHours(data?.hourlyFull || data?.hourly || [], currentHourIso, 168),
    [data?.hourlyFull, data?.hourly, currentHourIso]
  );
  const weeklySchedule = useMemo(
    () => aggregateWeeklySpraySchedule(futureHourlyAll, data?.daily || [], context),
    [futureHourlyAll, data?.daily, context]
  );

  const isGeneralMode = activeMode === 'meteorologia';

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-hidden space-y-6 animate-fade-in pb-12">
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-daterra-primary text-white uppercase tracking-wider">
                {isGeneralMode ? 'Estação Meteorológica' : 'Módulo Agronómico Unificado'}
              </span>
              <WeatherLocationSearchDropdown currentLocation={currentLocation} onSelectLocation={selectLocation} onUseGps={useGpsLocation} />
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-daterra-accent" />
                {data?.current?.updatedAt ? `Atualizado às ${data.current.updatedAt}` : 'Em direto'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-daterra-primary">
              {isGeneralMode ? 'Meteorologia' : 'Pulverização & Deriva'}
            </h1>
            <p className="text-xs text-slate-500">
              {isGeneralMode
                ? 'Previsão meteorológica detalhada e condições bioclimáticas da exploração'
                : 'Oportunidade bioclimática, Índice de Risco de Deriva (0–200%) e simulador What-If'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button type="button" onClick={() => setIsGuideOpen(true)} className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl transition-colors touch-target flex items-center gap-2 text-xs font-bold cursor-pointer">
              <BookOpen className="w-4 h-4 text-emerald-700" /><span>Guia Técnico</span>
            </button>
            <button type="button" onClick={refreshWeather} disabled={isLoading} className="p-2.5 sm:px-3.5 sm:py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl transition-colors touch-target flex items-center gap-2 text-xs font-bold cursor-pointer">
              <RefreshCw className={`w-4 h-4 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} /><span className="hidden sm:inline">Atualizar</span>
            </button>
            <Link to="/dashboard" className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl border border-slate-200 transition-colors flex items-center gap-2 touch-target">
              <ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">Voltar</span>
            </Link>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <WeatherModeToggle activeMode={activeMode} onChangeMode={handleModeChange} />
          <span className="text-[11px] text-slate-400 font-medium">
            {isGeneralMode ? 'Modo geral predefinido • Seleção diária ativa' : 'Oportunidade bioclimática + IRD (0–200%) integrados'}
          </span>
        </div>
      </div>

      {isGeneralMode ? (
        <WeatherGeneralView selectedDateIso={selectedDateIso} onSelectDate={setSelectedDateIso} />
      ) : (
        <div role="tabpanel" id="panel-weather-mode-pulverizacao" aria-labelledby="tab-weather-mode-pulverizacao" className="space-y-6 animate-fade-in">
          <WeatherContextAccordion context={context} onContextChange={setContext} currentWeather={data?.current} />
          <WeeklyDecisionSummaryCards current={data?.current} schedule={weeklySchedule} isCached={data?.current?.isCached} hasNetworkError={!!error && !data} context={context} hourly={data?.hourly || []} />
          <WeeklyForecastGrid dailyWindows={weeklySchedule.dailyWindows} selectedDateIso={selectedDateIso} onSelectDate={setSelectedDateIso} hasActiveProfile={Boolean(context && (context.calibrationId || context.cultureId))} />
          <HourlyPlannerExpanded hourly={data?.hourly || []} hourlyFull={data?.hourlyFull} context={context} selectedDateIso={selectedDateIso} />
          <WeatherDriftSection data={data} locationName={currentLocation.name} selectedDateIso={selectedDateIso} context={context} />
          <SprayChartsModule selectedDateIso={selectedDateIso} />
        </div>
      )}

      <WeatherTechnicalGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
};
