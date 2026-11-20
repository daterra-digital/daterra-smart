// src/features/weather/components/WeatherDriftSection.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { Table, LineChart } from 'lucide-react';
import type { FullWeatherData } from '../types.ts';
import type { ActiveMachineContext } from '../weatherWeekAggregator.ts';
import { useWeatherTime } from '../services/weatherTimeService.ts';
import { CACHE_DURATION_MS } from '../services/weatherCacheService.ts';
import { buildHourlyDriftSeries } from '../utils/weatherDriftEvaluator.ts';
import { computeContextScaleFactor, getIrdOperationalBand } from '../utils/irdOperationalThresholds.ts';
import { formatDecimalPt, parseWindDirection } from '../utils/windDirection.ts';
import { WeatherDriftChartSvg } from './charts/WeatherDriftChartSvg.tsx';

interface WeatherDriftSectionProps {
  readonly data: FullWeatherData | null;
  readonly locationName: string;
  readonly selectedDateIso: string | null;
  readonly context?: ActiveMachineContext | null;
}

export const WeatherDriftSection: React.FC<WeatherDriftSectionProps> = ({ data, locationName, selectedDateIso, context }) => {
  const currentHourIso = useWeatherTime();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showTable, setShowTable] = useState(false);

  const cacheAgeMin = useMemo(() => {
    if (!data?.fetchedAt) return null;
    const ms = Date.now() - new Date(data.fetchedAt).getTime();
    return Number.isFinite(ms) ? Math.max(0, Math.round(ms / 60000)) : null;
  }, [data?.fetchedAt]);

  const isStaleCache = Boolean(data?.current?.isCached && (cacheAgeMin === null || cacheAgeMin * 60000 > CACHE_DURATION_MS));
  const hourlySeries = useMemo(
    () => buildHourlyDriftSeries(data?.hourlyFull || data?.hourly || [], currentHourIso, selectedDateIso, { isCached: data?.current?.isCached || isStaleCache, cacheAgeMinutes: cacheAgeMin }),
    [data, currentHourIso, selectedDateIso, isStaleCache, cacheAgeMin]
  );

  const scaleFactor = useMemo(() => computeContextScaleFactor(context), [context]);
  const hasActiveProfile = Boolean(context && (context.calibrationId || context.cultureId));
  const acceptableLimitPct = context?.acceptableIrdLimitPct ?? 75;

  useEffect(() => { setSelectedIdx(0); }, [selectedDateIso, locationName]);
  if (!data || !data.hourly?.length) return null;

  const activePoint = hourlySeries[selectedIdx] ?? hourlySeries[0];
  const minScore = context?.calibrationId ? 10 : 5;
  const activeIrd = activePoint?.evaluation.status === 'VALID' && activePoint.evaluation.score !== null
    ? Math.round(Math.min(200, Math.max(minScore, activePoint.evaluation.score * scaleFactor)))
    : null;
  const ptDir = parseWindDirection(activePoint?.evaluation.windDirectionDeg);
  const tz = data.timezone || 'local';

  return (
    <div className="min-w-0 max-w-full overflow-hidden bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-slate-200 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-extrabold text-[#114037]">Evolução Horária de Risco de Deriva ({tz})</h2>
            {hasActiveProfile && (
              <span className="text-[10px] font-extrabold bg-emerald-50 text-[#114037] border border-emerald-200 px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                Ajustado ao perfil
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">Escala 0–200% · Limiar máximo aceitável da parcela: {acceptableLimitPct}%</p>
        </div>
        <button type="button" onClick={() => setShowTable((v) => !v)} className="touch-target px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5 cursor-pointer shrink-0">
          {showTable ? <><LineChart className="w-4 h-4 text-[#114037]" /><span>Ver Gráfico</span></> : <><Table className="w-4 h-4 text-slate-500" /><span>Ver Tabela</span></>}
        </button>
      </div>

      {hourlySeries.length === 0 ? (
        <p className="text-xs text-slate-600 py-6 text-center">Sem horas futuras disponíveis na previsão para o dia selecionado.</p>
      ) : showTable ? (
        <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-2.5 px-3">Hora</th>
                <th className="py-2.5 px-3 text-right">IRD (0–200%)</th>
                <th className="py-2.5 px-3 text-right">Vento / Rajada</th>
                <th className="py-2.5 px-3 text-right">ΔT</th>
                <th className="py-2.5 px-3 text-right">Precip.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hourlySeries.map((pt, i) => {
                const ptIrd = pt.evaluation.status === 'VALID' && pt.evaluation.score !== null
                  ? Math.round(Math.min(200, Math.max(minScore, pt.evaluation.score * scaleFactor)))
                  : null;
                return (
                  <tr key={pt.timeIso} aria-selected={i === selectedIdx} onClick={() => setSelectedIdx(i)} className={`cursor-pointer ${i === selectedIdx ? 'bg-emerald-50/80' : 'hover:bg-slate-50'}`}>
                    <td className="py-2 px-3 font-mono-numbers font-bold text-[#114037]">{pt.timeFormatted}</td>
                    <td className="py-2 px-3 text-right font-mono-numbers font-bold">{ptIrd !== null ? `${ptIrd}% (${getIrdOperationalBand(ptIrd).shortLabel})` : pt.evaluation.bandLabelPt}</td>
                    <td className="py-2 px-3 text-right font-mono-numbers">{pt.evaluation.windKmh !== null ? `${formatDecimalPt(pt.evaluation.windKmh)} / ${formatDecimalPt(pt.evaluation.gustsKmh, 'N/D')} km/h` : '—'}</td>
                    <td className="py-2 px-3 text-right font-mono-numbers">{pt.evaluation.deltaTC !== null ? `${formatDecimalPt(pt.evaluation.deltaTC)} °C` : '—'}</td>
                    <td className="py-2 px-3 text-right font-mono-numbers">{pt.evaluation.precipMm !== null ? `${formatDecimalPt(pt.evaluation.precipMm)} mm` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <WeatherDriftChartSvg points={hourlySeries} selectedIndex={selectedIdx} onSelectIndex={setSelectedIdx} scaleFactor={scaleFactor} acceptableLimitPct={acceptableLimitPct} timezoneLabel={tz} />
      )}

      {activePoint && (
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 min-h-[56px]">
          <div className="text-sm font-extrabold text-[#114037] font-mono-numbers tabular-nums">
            {activePoint.timeFormatted} · {activeIrd !== null ? `IRD ${activeIrd}% (${getIrdOperationalBand(activeIrd).shortLabel})` : activePoint.evaluation.bandLabelPt}
          </div>
          <div className="flex flex-wrap gap-3 text-xs sm:text-sm font-mono-numbers tabular-nums font-bold text-slate-800">
            <span>Vento: {formatDecimalPt(activePoint.evaluation.windKmh, '—')} km/h ({ptDir ? `${ptDir.degrees}° ${ptDir.cardinalOrigin}` : '—'})</span>
            <span>Rajada: {formatDecimalPt(activePoint.evaluation.gustsKmh, 'N/D')} km/h</span>
            <span>ΔT: {formatDecimalPt(activePoint.evaluation.deltaTC, '—')} °C</span>
            {activePoint.evaluation.precipMm !== null && activePoint.evaluation.precipMm > 0 && (
              <span>Precip.: {formatDecimalPt(activePoint.evaluation.precipMm)} mm</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
