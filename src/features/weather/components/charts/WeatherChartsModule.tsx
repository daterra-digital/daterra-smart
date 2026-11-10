// src/features/weather/components/charts/WeatherChartsModule.tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { TrendingUp, Table, LineChart, CloudOff, Info } from 'lucide-react';
import { useWeather } from '../../hooks/useWeather.ts';
import { useLanguage } from '../../../../context/LanguageContext.tsx';
import type { HourlyForecastItem, DailyForecastItem } from '../../types.ts';
import { WeatherChartSvg, type ChartMetricType } from './WeatherChartSvg.tsx';
import { WeatherChartTable } from './WeatherChartTable.tsx';
import { formatDecimalPt } from '../../utils/windDirection.ts';
import { useWeatherTime, filterFutureHours, getEffectiveDateIso } from '../../services/weatherTimeService.ts';

const EMPTY_DAILY: DailyForecastItem[] = [];
const EMPTY_HOURLY: HourlyForecastItem[] = [];

const METRIC_TABS: Array<{ id: ChartMetricType; label: string }> = [
  { id: 'resumo', label: 'Resumo' }, { id: 'temperatura', label: 'Temperatura' },
  { id: 'chuva', label: 'Chuva' }, { id: 'vento', label: 'Vento' }, { id: 'humidade', label: 'Humidade' }
];

function formatDayHeader(dateIso: string, language: string): string {
  try {
    const dObj = new Date(dateIso.includes('T') ? dateIso : `${dateIso}T12:00:00Z`);
    if (isNaN(dObj.getTime())) return dateIso;
    const s = dObj.toLocaleDateString(language === 'en' ? 'en-GB' : 'pt-PT', { weekday: 'long', day: 'numeric', month: 'short' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  } catch { return dateIso; }
}

interface WeatherChartsModuleProps {
  selectedDateIso?: string | null;
}

export const WeatherChartsModule: React.FC<WeatherChartsModuleProps> = ({ selectedDateIso }) => {
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
      const live = filterFutureHours(hourlyFull, currentHourIso, 24);
      return live.length ? live : hourly.slice(0, 24);
    }
    return hourlyFull.filter((h) => h.timeIso.startsWith(targetDateIso));
  }, [isToday, hourly, hourlyFull, currentHourIso, targetDateIso]);

  const [activeMetric, setActiveMetric] = useState<ChartMetricType>('resumo');
  const [showTable, setShowTable] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);

  // Reiniciar ponto selecionado ao mudar de dia
  const prevDateRef = useRef(targetDateIso);
  useEffect(() => {
    if (prevDateRef.current !== targetDateIso) {
      prevDateRef.current = targetDateIso;
      setSelectedIndex(dayHours.length ? 0 : null);
    }
  }, [targetDateIso, dayHours.length]);

  const selectedHour = selectedIndex != null && dayHours[selectedIndex] ? dayHours[selectedIndex] : null;

  const title = isToday
    ? 'Evolução — Próximas 24 horas'
    : `Evolução — ${formatDayHeader(targetDateIso, language)}`;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!dayHours.length) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault(); setSelectedIndex((prev) => (prev == null ? 0 : Math.min(dayHours.length - 1, prev + 1)));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault(); setSelectedIndex((prev) => (prev == null ? 0 : Math.max(0, prev - 1)));
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-slate-200 space-y-4">
      {/* Topo do Módulo Gráfico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-daterra-accent flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-daterra-accent" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-daterra-primary leading-tight">
              {title}
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              {isToday
                ? (dayHours.length >= 24
                    ? 'Variação horária para as próximas 24 horas'
                    : `Previsão parcial — ${dayHours.length} horas disponíveis`)
                : 'Variação horária dos parâmetros meteorológicos'}
            </span>
          </div>
        </div>

        {/* Alternador Visualização: Gráfico vs Tabela */}
        <button
          type="button"
          onClick={() => setShowTable((prev) => !prev)}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3CA64C]"
          aria-label={showTable ? 'Ver gráfico de evolução' : 'Ver tabela acessível'}
        >
          {showTable ? (
            <>
              <LineChart className="w-3.5 h-3.5 text-daterra-accent" aria-hidden="true" />
              <span>Ver Gráfico</span>
            </>
          ) : (
            <>
              <Table className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>Ver Tabela</span>
            </>
          )}
        </button>
      </div>

      {/* Seletor de Variável (5 Opções) */}
      {!showTable && dayHours.length > 0 && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="tablist">
            {METRIC_TABS.map((tab) => {
              const isActive = activeMetric === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveMetric(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-[#3CA64C] ${
                    isActive
                      ? 'bg-daterra-primary text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Leitura do Ponto Ativo */}
          {selectedHour && (
            <div className="text-xs bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl text-slate-700 font-mono-numbers">
              <strong className="text-slate-900 font-bold">{selectedHour.timeFormatted}:</strong>{' '}
              {activeMetric === 'resumo' && `${selectedHour.temperatureC}°C • ${formatDecimalPt(selectedHour.precipitationMm)} mm`}
              {activeMetric === 'temperatura' && `${selectedHour.temperatureC}°C`}
              {activeMetric === 'chuva' && `${formatDecimalPt(selectedHour.precipitationMm)} mm (${selectedHour.precipitationProbability}%)`}
              {activeMetric === 'vento' && `${selectedHour.windSpeedKmh} km/h (raj. ${selectedHour.windGustsKmh} km/h)`}
              {activeMetric === 'humidade' && `${selectedHour.humidityPercent}%`}
            </div>
          )}
        </div>
      )}

      {/* Conteúdo: Gráfico SVG, Tabela ou Estado Vazio */}
      {isLoading ? (
        <div className="py-10 text-center text-xs text-slate-400 font-medium">
          A carregar dados de evolução horária...
        </div>
      ) : dayHours.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 space-y-1.5">
          <CloudOff className="w-7 h-7 text-slate-300 mx-auto" aria-hidden="true" />
          <p className="font-semibold text-slate-700">Sem dados de evolução</p>
          <p className="text-slate-400">Não existem registos horários para a data selecionada.</p>
        </div>
      ) : showTable ? (
        <WeatherChartTable hours={dayHours} />
      ) : (
        <div
          tabIndex={0}
          onKeyDown={handleKeyDown}
          role="region"
          aria-label="Gráfico interativo. Use as setas esquerda e direita para navegar pelas horas"
          className="space-y-2 focus:outline-none focus:ring-1 focus:ring-[#3CA64C] rounded-2xl p-1"
        >
          <WeatherChartSvg
            hours={dayHours}
            metric={activeMetric}
            selectedIndex={selectedIndex}
            onSelectIndex={setSelectedIndex}
          />
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
            <Info className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Passe o cursor, toque ou use as setas do teclado para inspecionar os valores previstos.</span>
          </div>
        </div>
      )}
    </div>
  );
};
