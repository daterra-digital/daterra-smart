// src/features/weather/components/charts/SprayChartsModule.tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { TrendingUp, Table, LineChart, CloudOff, Info } from 'lucide-react';
import { useWeather } from '../../hooks/useWeather.ts';
import type { HourlyForecastItem, DailyForecastItem } from '../../types.ts';
import { SprayChartSvg, type SprayChartMetric } from './SprayChartSvg.tsx';
import { WeatherChartTable } from './WeatherChartTable.tsx';
import { formatDecimalPt } from '../../utils/windDirection.ts';
import { useWeatherTime, filterFutureHours, getEffectiveDateIso } from '../../services/weatherTimeService.ts';

const EMPTY_DAILY: DailyForecastItem[] = [];
const EMPTY_HOURLY: HourlyForecastItem[] = [];

const SPRAY_TABS: Array<{ id: SprayChartMetric; label: string }> = [
  { id: 'deltaT', label: 'Delta T (ΔT)' },
  { id: 'vento', label: 'Vento e Rajadas' },
  { id: 'chuva', label: 'Precipitação' },
  { id: 'humidade', label: 'Humidade' }
];

function formatDayHeader(dateIso: string): string {
  try {
    const d = new Date(dateIso.includes('T') ? dateIso : `${dateIso}T12:00:00Z`);
    if (isNaN(d.getTime())) return dateIso;
    const s = d.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'short' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  } catch { return dateIso; }
}

interface SprayChartsModuleProps {
  selectedDateIso?: string | null;
}

export const SprayChartsModule: React.FC<SprayChartsModuleProps> = ({ selectedDateIso }) => {
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

  const [activeMetric, setActiveMetric] = useState<SprayChartMetric>('deltaT');
  const [showTable, setShowTable] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);

  const prevDateRef = useRef(targetDateIso);
  useEffect(() => {
    if (prevDateRef.current !== targetDateIso) {
      prevDateRef.current = targetDateIso;
      setSelectedIndex(dayHours.length ? 0 : null);
    }
  }, [targetDateIso, dayHours.length]);

  const selectedHour = selectedIndex != null && dayHours[selectedIndex] ? dayHours[selectedIndex] : null;
  const title = isToday ? 'Evolução Bioclimática — Próximas 24 horas' : `Evolução Bioclimática — ${formatDayHeader(targetDateIso)}`;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-slate-200 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-daterra-accent flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-daterra-accent" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-daterra-primary leading-tight">{title}</h3>
            <span className="text-[11px] text-slate-400 font-medium">Parâmetros meteorológicos determinantes para a aplicação de caldas</span>
          </div>
        </div>

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

      {!showTable && dayHours.length > 0 && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="tablist">
            {SPRAY_TABS.map((tab) => {
              const isActive = activeMetric === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveMetric(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-[#3CA64C] ${
                    isActive ? 'bg-daterra-primary text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {selectedHour && (
            <div className="text-xs bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-slate-700 font-mono-numbers">
              <strong className="text-slate-900 font-bold">{selectedHour.timeFormatted}:</strong>{' '}
              {activeMetric === 'deltaT' && `ΔT ${selectedHour.deltaT}°C`}
              {activeMetric === 'vento' && `${selectedHour.windSpeedKmh} km/h (raj. ${selectedHour.windGustsKmh} km/h)`}
              {activeMetric === 'chuva' && `${formatDecimalPt(selectedHour.precipitationMm)} mm (${selectedHour.precipitationProbability}%)`}
              {activeMetric === 'humidade' && `${selectedHour.humidityPercent}%`}
            </div>
          )}
        </div>
      )}

      {activeMetric === 'deltaT' && !showTable && (
        <div className="text-[11px] text-slate-500 bg-purple-50/60 px-3 py-1.5 rounded-xl border border-purple-100 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <span>Faixas de referência no sistema: <strong>2–8 °C</strong> recomendada; <strong>8–10 °C</strong> evaporação rápida; <strong>&gt;10 °C</strong> crítica.</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-10 text-center text-xs text-slate-400 font-medium">A carregar dados bioclimáticos...</div>
      ) : dayHours.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 space-y-1.5">
          <CloudOff className="w-7 h-7 text-slate-300 mx-auto" aria-hidden="true" />
          <p className="font-semibold text-slate-700">Sem dados de evolução</p>
        </div>
      ) : showTable ? (
        <WeatherChartTable hours={dayHours} showDeltaT={true} />
      ) : (
        <div
          tabIndex={0}
          role="region"
          aria-label="Gráfico interativo de parâmetros de pulverização"
          className="space-y-2 focus:outline-none focus:ring-1 focus:ring-[#3CA64C] rounded-2xl p-1"
        >
          <SprayChartSvg
            hours={dayHours}
            metric={activeMetric}
            selectedIndex={selectedIndex}
            onSelectIndex={setSelectedIndex}
          />
        </div>
      )}
    </div>
  );
};
