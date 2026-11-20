import React, { useMemo, useState, useEffect } from 'react';
import { Wind, WifiOff, AlertTriangle, Table, LineChart } from 'lucide-react';
import type { FullWeatherData } from '../types.ts';
import type { ActiveMachineContext } from '../weatherWeekAggregator.ts';
import { DRIFT_BAND_CSS } from '../utils/weatherDriftTypes.ts';
import { useWeatherTime } from '../services/weatherTimeService.ts';
import { CACHE_DURATION_MS } from '../services/weatherCacheService.ts';
import { assessWeatherDriftReading, buildHourlyDriftSeries, findFavorableDriftPeriods } from '../utils/weatherDriftEvaluator.ts';
import { formatDecimalPt, parseWindDirection } from '../utils/windDirection.ts';
import { WeatherDriftChartSvg } from './charts/WeatherDriftChartSvg.tsx';
import { WeatherDriftWindowsCard } from './WeatherDriftWindowsCard.tsx';
import { WeatherDriftTechPanel } from './WeatherDriftTechPanel.tsx';
import { isIrdEnabledForEnv } from '../../../utils/releasePolicyRoutes.ts';
import { getDaterraEnvironment } from '../../../utils/releasePolicy.ts';

interface WeatherDriftViewProps {
  readonly data: FullWeatherData | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly locationName: string;
  readonly selectedDateIso: string | null;
  readonly context?: ActiveMachineContext | null;
}

export const WeatherDriftView: React.FC<WeatherDriftViewProps> = ({ data, isLoading, error, locationName, selectedDateIso, context }) => {
  const currentHourIso = useWeatherTime();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showTable, setShowTable] = useState(false);

  const cacheAgeMin = useMemo(() => {
    if (!data?.fetchedAt) return null;
    const ms = Date.now() - new Date(data.fetchedAt).getTime();
    return Number.isFinite(ms) ? Math.max(0, Math.round(ms / 60000)) : null;
  }, [data?.fetchedAt]);

  const isStaleCache = Boolean(data?.current?.isCached && (cacheAgeMin === null || cacheAgeMin * 60000 > CACHE_DURATION_MS));
  const currentEval = useMemo(() => (data?.current ? assessWeatherDriftReading(data.current, { isCached: data.current.isCached, cacheAgeMinutes: cacheAgeMin }) : null), [data, cacheAgeMin]);
  const hourlySeries = useMemo(() => buildHourlyDriftSeries(data?.hourlyFull || data?.hourly || [], currentHourIso, selectedDateIso, { isCached: data?.current?.isCached, cacheAgeMinutes: cacheAgeMin }), [data, currentHourIso, selectedDateIso, cacheAgeMin]);
  const isLegacyOrStale = isStaleCache || currentEval?.validity === 'unverified_legacy_cache';
  const favorable = useMemo(() => findFavorableDriftPeriods(hourlySeries, { isStaleOrLegacyCache: isLegacyOrStale }), [hourlySeries, isLegacyOrStale]);

  useEffect(() => { setSelectedIdx(0); }, [selectedDateIso, locationName]);

  if (isLoading && !data) {
    return <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4 animate-pulse" aria-busy="true"><div className="h-5 w-48 bg-slate-200 rounded" /><div className="h-16 w-40 bg-slate-200 rounded-2xl" /><div className="h-44 w-full bg-slate-100 rounded-2xl" /></div>;
  }

  if (!data || (error && !data.hourly?.length)) {
    return (
      <div role="alert" className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3 shadow-soft">
        <WifiOff className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
        <h2 className="text-base font-extrabold text-slate-900">{error || 'Sem leitura meteorológica para esta localidade'}</h2>
        <p className="text-xs text-slate-600 max-w-lg mx-auto">Não são estimados valores nem janelas sem dados válidos. Utilize leitura presencial no campo.</p>
      </div>
    );
  }

  const activePoint = hourlySeries[selectedIdx] ?? hourlySeries[0];
  const tz = data.timezone || 'local';
  const allowIrd = isIrdEnabledForEnv(getDaterraEnvironment());
  const curDir = parseWindDirection(currentEval?.windDirectionDeg);
  const ptDir = parseWindDirection(activePoint?.evaluation.windDirectionDeg);

  return (
    <div role="tabpanel" id="panel-weather-mode-deriva" aria-labelledby="tab-weather-mode-deriva" className="w-full max-w-full min-w-0 space-y-6 animate-fade-in">
      {isLegacyOrStale && (
        <div role="alert" className="rounded-2xl bg-amber-50 border border-amber-300 px-4 py-3 text-xs font-bold text-amber-950 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{currentEval?.validity === 'unverified_legacy_cache' ? 'Cache local anterior sem metadados completos de integridade: janelas suprimidas por prudência.' : `Cache meteorológica expirada (${cacheAgeMin !== null ? `há ${cacheAgeMin} min` : '> 20 min'}): janelas suprimidas; confirmar no terreno.`}</span>
        </div>
      )}

      <div className="bg-[#114037] text-white rounded-3xl p-5 sm:p-7 shadow-floating border border-[#1D734B] flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0"><Wind className="w-6 h-6 text-[#3CA64C]" aria-hidden="true" /></div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-200">Condições Meteorológicas para Deriva · Agora ({data.current.updatedAt})</span>
              <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-bold">
                {context?.calibrationId ? `Calibração ativa${context.combinedIrdPct != null ? ` · IRD Comb. ${context.combinedIrdPct}%` : ''}` : 'Exclusivamente meteorológico'}
              </span>
            </div>
            {currentEval?.status === 'VALID' ? (
              <div className="flex flex-wrap items-baseline gap-2.5">
                <span className="font-mono-numbers text-4xl sm:text-5xl font-extrabold">{currentEval.score}</span>
                <span className="text-xs font-bold text-emerald-200">pts (índice 10–100)</span>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${DRIFT_BAND_CSS[currentEval.band || 'MODERADO']}`}>{currentEval.bandLabelPt}</span>
                {currentEval.hasPrecipitationBlock && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-sky-200 text-slate-950 border border-sky-300">Bloqueio por Precipitação (Lavagem)</span>
                )}
                {currentEval.isHighGustFactor && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-200 text-slate-950 border border-amber-300">Rajada G = {formatDecimalPt(currentEval.gustFactor)}</span>
                )}
                {currentEval.isCalmInversionSuspected && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-200 text-slate-950 border border-amber-300">Alerta Inversão Térmica</span>
                )}
              </div>
            ) : <div className="text-lg font-extrabold text-amber-200">Leitura atual incompleta</div>}
            <p className="text-xs sm:text-sm text-emerald-50 font-medium">{currentEval?.dominantFactorPt}</p>
          </div>
        </div>
        <div className="text-left sm:text-right text-xs text-emerald-200 space-y-1 font-mono-numbers">
          <div className="font-sans font-bold text-white">{locationName}</div>
          <div>Vento 10 m: {formatDecimalPt(currentEval?.windKmh, '—')} km/h ({curDir ? `${curDir.degrees}° ${curDir.cardinalOrigin}` : '—'}) · Raj.: {formatDecimalPt(currentEval?.gustsKmh, 'N/D')} km/h</div>
          <div>ΔT: {formatDecimalPt(currentEval?.deltaTC, '—')} °C · HR: {currentEval?.humidityPct ?? '—'}% · Precip.: {formatDecimalPt(currentEval?.precipMm, '—')} mm · G: {formatDecimalPt(currentEval?.gustFactor, '—')}</div>
        </div>
      </div>

      <div className="min-w-0 max-w-full overflow-hidden bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-[#114037]">Evolução Horária Futura (Horas Válidas)</h2>
            <p className="text-xs text-slate-500">Toque, clique ou use setas no gráfico ou consulte a tabela ({tz}); lacunas interrompem as linhas.</p>
          </div>
          <button type="button" aria-pressed={showTable} onClick={() => setShowTable((v) => !v)} className="touch-target px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5 cursor-pointer">
            {showTable ? <><LineChart className="w-4 h-4 text-[#114037]" /><span>Ver Gráfico</span></> : <><Table className="w-4 h-4 text-slate-500" /><span>Ver Tabela</span></>}
          </button>
        </div>

        {hourlySeries.length === 0 ? (
          <p className="text-xs text-slate-600 py-6 text-center">Sem horas futuras disponíveis na previsão para o dia selecionado.</p>
        ) : showTable ? (
          <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <caption className="sr-only">Tabela horária de condições meteorológicas para deriva</caption>
              <thead><tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold"><th className="py-2.5 px-3">Hora</th><th className="py-2.5 px-3 text-right">Índice (pts)</th><th className="py-2.5 px-3 text-right">Vento / Rajada</th><th className="py-2.5 px-3 text-right">ΔT</th><th className="py-2.5 px-3 text-right">Humidade</th><th className="py-2.5 px-3 text-right">Precip. (acum.)</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {hourlySeries.map((pt, i) => {
                  const selected = i === selectedIdx;
                  return (
                    <tr key={pt.timeIso} aria-selected={selected} className={selected ? 'bg-emerald-50/80' : 'hover:bg-slate-50'}>
                      <th scope="row" className="p-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedIdx(i)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedIdx(i); } }}
                          aria-pressed={selected}
                          aria-label={`Selecionar previsão das ${pt.timeFormatted}`}
                          className="touch-target w-full text-left px-2 py-1.5 rounded-lg font-mono-numbers font-bold text-[#114037] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#114037]"
                        >
                          {pt.timeFormatted}
                        </button>
                      </th>
                      <td onClick={() => setSelectedIdx(i)} className="py-2 px-3 text-right font-mono-numbers font-bold cursor-pointer">{pt.evaluation.status === 'VALID' ? `${pt.evaluation.score} pts (${pt.evaluation.bandLabelPt})` : pt.evaluation.bandLabelPt}</td>
                      <td onClick={() => setSelectedIdx(i)} className="py-2 px-3 text-right font-mono-numbers cursor-pointer">{pt.evaluation.windKmh !== null ? `${formatDecimalPt(pt.evaluation.windKmh)} / ${formatDecimalPt(pt.evaluation.gustsKmh, 'N/D')} km/h` : '—'}</td>
                      <td onClick={() => setSelectedIdx(i)} className="py-2 px-3 text-right font-mono-numbers cursor-pointer">{pt.evaluation.deltaTC !== null ? `${formatDecimalPt(pt.evaluation.deltaTC)} °C` : '—'}</td>
                      <td onClick={() => setSelectedIdx(i)} className="py-2 px-3 text-right font-mono-numbers cursor-pointer">{pt.evaluation.humidityPct !== null ? `${pt.evaluation.humidityPct}%` : '—'}</td>
                      <td onClick={() => setSelectedIdx(i)} className="py-2 px-3 text-right font-mono-numbers cursor-pointer">{pt.evaluation.precipMm !== null ? `${formatDecimalPt(pt.evaluation.precipMm)} mm` : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <WeatherDriftChartSvg points={hourlySeries} selectedIndex={selectedIdx} onSelectIndex={setSelectedIdx} timezoneLabel={tz} />
        )}

        {activePoint && (
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-extrabold text-[#114037]">Detalhe {activePoint.timeFormatted} · {activePoint.evaluation.status === 'VALID' ? `${activePoint.evaluation.bandLabelPt} (${activePoint.evaluation.score} pts)` : activePoint.evaluation.bandLabelPt}</div>
              <p className="text-xs text-slate-600">{activePoint.evaluation.dominantFactorPt}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-mono-numbers font-bold text-slate-800">
              <span>Vento: {formatDecimalPt(activePoint.evaluation.windKmh, '—')} km/h ({ptDir ? `${ptDir.degrees}° ${ptDir.cardinalOrigin}` : '—'})</span>
              <span>Rajada: {formatDecimalPt(activePoint.evaluation.gustsKmh, 'N/D')} km/h (G: {formatDecimalPt(activePoint.evaluation.gustFactor, '—')})</span>
              <span>ΔT: {formatDecimalPt(activePoint.evaluation.deltaTC, '—')} °C</span>
              <span>HR: {activePoint.evaluation.humidityPct ?? '—'}%</span>
              <span>Precip.: {formatDecimalPt(activePoint.evaluation.precipMm, '—')} mm</span>
            </div>
          </div>
        )}
      </div>

      <WeatherDriftWindowsCard favorable={favorable} />

      <WeatherDriftTechPanel allowIrd={allowIrd} timezoneLabel={tz} />
    </div>
  );
};
