import React from 'react';
import type { HourlyDriftPoint } from '../../utils/weatherDriftEvaluator.ts';
import type { DriftChartSeriesKey } from '../../utils/weatherDriftTypes.ts';
import { calcChartScale, formatTick } from '../../utils/weatherChartUtils.ts';

interface WeatherDriftSeriesTracksProps {
  readonly points: readonly HourlyDriftPoint[];
  readonly activeSeries: readonly DriftChartSeriesKey[];
  readonly xs: readonly number[];
  readonly startY: number;
  readonly plotLeft: number;
  readonly plotRight: number;
  readonly trackHeight: number;
  readonly trackGap: number;
}

function splitSegments(coords: ReadonlyArray<{ x: number; y: number | null }>): Array<Array<{ x: number; y: number }>> {
  const segs: Array<Array<{ x: number; y: number }>> = [];
  let cur: Array<{ x: number; y: number }> = [];
  for (const c of coords) {
    if (c.y !== null) cur.push({ x: c.x, y: c.y });
    else if (cur.length > 0) { segs.push(cur); cur = []; }
  }
  if (cur.length > 0) segs.push(cur);
  return segs;
}

export const WeatherDriftSeriesTracks: React.FC<WeatherDriftSeriesTracksProps> = ({
  points, activeSeries, xs, startY, plotLeft, plotRight, trackHeight, trackGap
}) => {
  const mapY = (val: number | null, min: number, range: number, topY: number) =>
    val === null ? null : Math.round((topY + (1 - (val - min) / range) * trackHeight) * 10) / 10;

  return (
    <g>
      {activeSeries.map((key, idx) => {
        const topY = startY + idx * (trackHeight + trackGap);
        const baseY = topY + trackHeight;

        if (key === 'wind') {
          const vals = points.flatMap((p) => [p.evaluation.windKmh, p.evaluation.gustsKmh].filter((v): v is number => typeof v === 'number'));
          const scale = calcChartScale(vals, { forceZeroMin: true, padRange: 4 });
          const windCoords = points.map((p, i) => ({ x: xs[i], y: mapY(p.evaluation.windKmh, scale.min, scale.range, topY) }));
          const gustCoords = points.map((p, i) => ({ x: xs[i], y: mapY(p.evaluation.gustsKmh, scale.min, scale.range, topY) }));
          return (
            <g key={key} aria-label="Faixa Vento e Rajada em km/h">
              <text x={plotLeft} y={topY - 6} className="text-[10px] font-bold fill-[#1D734B]">▲ Vento médio / ◇ Rajada (km/h · entrada)</text>
              {[scale.min, scale.max].map((tick, tIdx) => {
                const ty = tIdx === 0 ? baseY : topY;
                return <g key={tIdx}><line x1={plotLeft} y1={ty} x2={plotRight} y2={ty} stroke="#e2e8f0" strokeWidth="1" /><text x={plotLeft - 6} y={ty + 3} textAnchor="end" className="text-[9px] font-mono-numbers fill-slate-500 font-bold">{formatTick(tick, scale.range)}</text></g>;
              })}
              {splitSegments(gustCoords).map((seg, s) => <path key={`g-${s}`} d={seg.map((p, k) => `${k === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4,3" />)}
              {splitSegments(windCoords).map((seg, s) => <path key={`w-${s}`} d={seg.map((p, k) => `${k === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} fill="none" stroke="#1D734B" strokeWidth="2" />)}
              {windCoords.map((c, i) => c.y !== null && <polygon key={`wm-${i}`} points={`${c.x},${c.y - 3.5} ${c.x - 3},${c.y + 2.5} ${c.x + 3},${c.y + 2.5}`} className="fill-[#1D734B]" />)}
              {gustCoords.map((c, i) => c.y !== null && <polygon key={`gm-${i}`} points={`${c.x},${c.y - 3} ${c.x + 3},${c.y} ${c.x},${c.y + 3} ${c.x - 3},${c.y}`} className="fill-white stroke-slate-500 stroke-1" />)}
            </g>
          );
        }

        if (key === 'deltaT') {
          const vals = points.map((p) => p.evaluation.deltaTC).filter((v): v is number => typeof v === 'number');
          const scale = calcChartScale(vals, { forceZeroMin: true, padRange: 2 });
          const coords = points.map((p, i) => ({ x: xs[i], y: mapY(p.evaluation.deltaTC, scale.min, scale.range, topY) }));
          return (
            <g key={key} aria-label="Faixa Delta T em graus Celsius">
              <text x={plotLeft} y={topY - 6} className="text-[10px] font-bold fill-purple-800">■ Delta T (°C · derivada)</text>
              {[scale.min, scale.max].map((tick, tIdx) => {
                const ty = tIdx === 0 ? baseY : topY;
                return <g key={tIdx}><line x1={plotLeft} y1={ty} x2={plotRight} y2={ty} stroke="#e2e8f0" strokeWidth="1" /><text x={plotLeft - 6} y={ty + 3} textAnchor="end" className="text-[9px] font-mono-numbers fill-slate-500 font-bold">{formatTick(tick, scale.range)}</text></g>;
              })}
              {splitSegments(coords).map((seg, s) => <path key={`dt-${s}`} d={seg.map((p, k) => `${k === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} fill="none" stroke="#7e22ce" strokeWidth="2" />)}
              {coords.map((c, i) => c.y !== null && <rect key={`dtm-${i}`} x={c.x - 2.5} y={c.y - 2.5} width="5" height="5" className="fill-purple-700" />)}
            </g>
          );
        }

        if (key === 'humidity') {
          const coords = points.map((p, i) => ({ x: xs[i], y: mapY(p.evaluation.humidityPct, 0, 100, topY) }));
          return (
            <g key={key} aria-label="Faixa Humidade Relativa em percentagem">
              <text x={plotLeft} y={topY - 6} className="text-[10px] font-bold fill-teal-800">◆ Humidade relativa (% · entrada)</text>
              {[0, 100].map((tick, tIdx) => {
                const ty = tIdx === 0 ? baseY : topY;
                return <g key={tIdx}><line x1={plotLeft} y1={ty} x2={plotRight} y2={ty} stroke="#e2e8f0" strokeWidth="1" /><text x={plotLeft - 6} y={ty + 3} textAnchor="end" className="text-[9px] font-mono-numbers fill-slate-500 font-bold">{tick}%</text></g>;
              })}
              {splitSegments(coords).map((seg, s) => <path key={`rh-${s}`} d={seg.map((p, k) => `${k === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} fill="none" stroke="#0f766e" strokeWidth="2" strokeDasharray="6,2" />)}
              {coords.map((c, i) => c.y !== null && <polygon key={`rhm-${i}`} points={`${c.x},${c.y - 3} ${c.x + 3},${c.y} ${c.x},${c.y + 3} ${c.x - 3},${c.y}`} className="fill-teal-700" />)}
            </g>
          );
        }

        const rainVals = points.map((p) => p.evaluation.precipMm).filter((v): v is number => typeof v === 'number');
        const rainScale = calcChartScale([...rainVals, 0.2], { forceZeroMin: true, padRange: 0.5 });
        return (
          <g key={key} aria-label="Faixa Precipitação acumulada em mm">
            <text x={plotLeft} y={topY - 6} className="text-[10px] font-bold fill-sky-800">▮ Precipitação acumulada (mm · entrada)</text>
            {[rainScale.min, rainScale.max].map((tick, tIdx) => {
              const ty = tIdx === 0 ? baseY : topY;
              return <g key={tIdx}><line x1={plotLeft} y1={ty} x2={plotRight} y2={ty} stroke="#e2e8f0" strokeWidth="1" /><text x={plotLeft - 6} y={ty + 3} textAnchor="end" className="text-[9px] font-mono-numbers fill-slate-500 font-bold">{formatTick(tick, rainScale.range)}</text></g>;
            })}
            {points.map((p, i) => {
              const val = p.evaluation.precipMm;
              if (val === null) return <text key={`pnd-${i}`} x={xs[i]} y={topY + trackHeight / 2} textAnchor="middle" className="text-[8px] fill-slate-400">N/D</text>;
              const py = mapY(val, rainScale.min, rainScale.range, topY) ?? baseY;
              return <rect key={`pr-${i}`} x={xs[i] - 5} y={py} width={10} height={Math.max(1.5, baseY - py)} rx="1.5" className="fill-sky-600/80" />;
            })}
          </g>
        );
      })}
    </g>
  );
};
