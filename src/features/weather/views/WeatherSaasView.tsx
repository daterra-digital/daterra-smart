// src/features/weather/views/WeatherSaasView.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { aggregateWeeklySpraySchedule, type ActiveMachineContext } from '../weatherWeekAggregator.ts';

export const WeatherSaasView: React.FC = () => {
  const {
    data, isLoading, error, currentLocation,
    selectLocation, useGpsLocation, refreshWeather
  } = useWeather();

  // Modo predefinido: Meteorologia
  const [activeMode, setActiveMode] = useState<WeatherMode>('meteorologia');

  // Seleção de dia na vista meteorológica generalista
  const [selectedDateIso, setSelectedDateIso] = useState<string | null>(null);

  // Inicia vazio, sem perfis pré-selecionados por omissão (preservado entre modos)
  const [context, setContext] = useState<ActiveMachineContext | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Ao mudar de localidade, repõe seleção diária em Hoje
  useEffect(() => {
    setSelectedDateIso(null);
  }, [currentLocation?.id, currentLocation?.latitude, currentLocation?.longitude]);

  // Se a previsão for atualizada e a data selecionada deixar de existir, repõe Hoje
  useEffect(() => {
    if (selectedDateIso && data?.daily && !data.daily.some((d) => d.dateIso === selectedDateIso)) {
      setSelectedDateIso(null);
    }
  }, [data?.daily, selectedDateIso]);

  // Agrega a previsão semanal com base no motor agronómico e no contexto ativo
  const weeklySchedule = useMemo(() => {
    return aggregateWeeklySpraySchedule(
      data?.hourly || [],
      data?.daily || [],
      context
    );
  }, [data?.hourly, data?.daily, context]);

  const isGeneralMode = activeMode === 'meteorologia';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Topo da SaaS: Cabeçalho com Navegação, Localidade, Modo e Guia Técnico */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-daterra-primary text-white uppercase tracking-wider">
                {isGeneralMode ? 'Estação Meteorológica' : 'Módulo Agronómico Avançado'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-950 border border-amber-400 uppercase tracking-widest shadow-2xs">RC</span>
              <WeatherLocationSearchDropdown
                currentLocation={currentLocation}
                onSelectLocation={selectLocation}
                onUseGps={useGpsLocation}
              />
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-daterra-accent" />
                {data?.current?.updatedAt ? `Atualizado às ${data.current.updatedAt}` : 'Em direto'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-daterra-primary">
              {isGeneralMode ? 'Meteorologia' : 'Meteorologia Agrícola'}
            </h1>
            <p className="text-xs text-slate-500">
              {isGeneralMode
                ? 'Previsão meteorológica detalhada e condições bioclimáticas da exploração'
                : 'Janelas de oportunidade fitossanitária com base em meteorologia e perfis da exploração'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl transition-colors touch-target flex items-center gap-2 text-xs font-bold cursor-pointer"
              title="Abrir guia técnico sobre metodologia e limiares"
            >
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>Guia Técnico</span>
            </button>

            <button
              type="button"
              onClick={refreshWeather}
              disabled={isLoading}
              className="p-2.5 sm:px-3.5 sm:py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl transition-colors touch-target flex items-center gap-2 text-xs font-bold cursor-pointer"
              title="Atualizar dados meteorológicos"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            <Link
              to="/dashboard"
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl border border-slate-200 transition-colors flex items-center gap-2 touch-target"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Link>
          </div>
        </div>

        {/* Barra de Alternância Acessível entre Modos [Meteorologia] [Pulverização] */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <WeatherModeToggle
            activeMode={activeMode}
            onChangeMode={setActiveMode}
          />
          <span className="text-[11px] text-slate-400 font-medium">
            {isGeneralMode
              ? 'Modo geral predefinido • Seleção diária ativa'
              : 'Modo especializado • Modelos de deriva e perfis'}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: MODO METEOROLOGIA (Geral Predefinido)                            */}
      {/* ========================================================================= */}
      {isGeneralMode ? (
        <WeatherGeneralView
          selectedDateIso={selectedDateIso}
          onSelectDate={setSelectedDateIso}
        />
      ) : (
        /* ======================================================================= */
        /* VISTA 2: MODO PULVERIZAÇÃO (Especializado Preservado)                   */
        /* ======================================================================= */
        <div
          role="tabpanel"
          id="panel-weather-mode-pulverizacao"
          aria-labelledby="tab-weather-mode-pulverizacao"
          className="space-y-6 animate-fade-in"
        >
          {/* 1. Decisão Gráfica: Resumo Agora e Próxima Janela Prevista */}
          <WeeklyDecisionSummaryCards
            current={data?.current}
            schedule={weeklySchedule}
            isCached={data?.current?.isCached}
            hasNetworkError={!!error && !data}
            context={context}
            hourly={data?.hourly || []}
          />

          {/* 2. Contexto da Exploração: Acordeão Inicialmente Recolhido */}
          <WeatherContextAccordion
            context={context}
            onContextChange={setContext}
          />

          {/* 3. Previsão Semanal: Carrossel com Botões Anterior/Seguinte e Seleção */}
          <WeeklyForecastGrid
            dailyWindows={weeklySchedule.dailyWindows}
            selectedDateIso={selectedDateIso}
            onSelectDate={setSelectedDateIso}
          />

          {/* 4. Planeador Horário do Dia Selecionado */}
          <HourlyPlannerExpanded
            hourly={data?.hourly || []}
            hourlyFull={data?.hourlyFull}
            context={context}
            selectedDateIso={selectedDateIso}
          />

          {/* 5. Gráficos de Evolução Bioclimática & Pulverização */}
          <SprayChartsModule
            selectedDateIso={selectedDateIso}
          />
        </div>
      )}

      {/* Modal Acessível do Guia Técnico */}
      <WeatherTechnicalGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};
