// src/features/weather/components/charts/WeatherChartAxes.tsx
import React from 'react';
import type { HourlyForecastItem } from '../../types.ts';
import {
  type ChartLayout,
  type ChartScaleResult,
  formatTick
} from '../../utils/weatherChartUtils.ts';
import {
  findDayChangeMarkers,
  getAlternatingHourIndices
} from '../../utils/weatherChartAxisHelpers.ts';
import type { ChartMetricType } from './WeatherChartSvg.tsx';

interface WeatherChartAxesProps {
  layout: ChartLayout;
  metric: ChartMetricType;
  tempScale: ChartScaleResult;
  rainScale: ChartScaleResult;
  windScale: ChartScaleResult;
  humScale: ChartScaleResult;
  points: Array<{ x: number }>;
  hours: HourlyForecastItem[];
}

export const WeatherChartAxes: React.FC<WeatherChartAxesProps> = ({
  layout,
  metric,
  tempScale,
  rainScale,
  windScale,
  humScale,
  points,
  hours
}) => {
  const baseY = layout.height - layout.padding.bottom;
  const plotHeight = baseY - layout.padding.top;
  const visibleXIndices = getAlternatingHourIndices(points.length);
  const dayMarkers = findDayChangeMarkers(hours, points.map((p) => p.x));

  const levels = [0, 0.25, 0.5, 0.75, 1];
  const gridRows = levels.map((lvl) => {
    const gy = Math.round((baseY - lvl * plotHeight) * 10) / 10;
    let leftLabel = '';
    let leftClass = 'fill-slate-600 font-bold';
    let rightLabel = '';
    let rightClass = 'fill-slate-600 font-bold';

    if (metric === 'resumo') {
      const tVal = tempScale.min + lvl * tempScale.range;
      leftLabel = `${formatTick(tVal, tempScale.range / 4)}°C`;
      leftClass = 'fill-amber-600 font-bold';

      const rVal = rainScale.min + lvl * rainScale.range;
      rightLabel = `${formatTick(rVal, rainScale.range / 4)} mm`;
      rightClass = 'fill-sky-700 font-bold';
    } else if (metric === 'temperatura') {
      const tVal = tempScale.min + lvl * tempScale.range;
      leftLabel = `${formatTick(tVal, tempScale.range / 4)}°C`;
      leftClass = 'fill-amber-600 font-bold';
    } else if (metric === 'chuva') {
      const rVal = rainScale.min + lvl * rainScale.range;
      leftLabel = `${formatTick(rVal, rainScale.range / 4)} mm`;
      leftClass = 'fill-sky-700 font-bold';

      rightLabel = `${Math.round(lvl * 100)}%`;
      rightClass = 'fill-sky-600 font-medium';
    } else if (metric === 'vento') {
      const wVal = windScale.min + lvl * windScale.range;
      leftLabel = `${formatTick(wVal, windScale.range / 4)} km/h`;
      leftClass = 'fill-slate-700 font-bold';
    } else if (metric === 'humidade') {
      const hVal = humScale.min + lvl * humScale.range;
      leftLabel = `${Math.round(hVal)}%`;
      leftClass = 'fill-teal-700 font-bold';
    }

    return { gy, leftLabel, leftClass, rightLabel, rightClass };
  });

  return (
    <g className="chart-axes">
      {/* Linhas de Grelha Horizontal e Ticks do Eixo Y */}
      {gridRows.map((row, i) => (
        <g key={`lvl-${i}`}>
          <line
            x1={layout.padding.left}
            y1={row.gy}
            x2={layout.width - layout.padding.right}
            y2={row.gy}
            stroke="#e2e8f0"
            strokeDasharray={i === 0 ? undefined : '3,3'}
            strokeWidth="1"
          />
          {row.leftLabel && (
            <text
              x={layout.padding.left - 6}
              y={row.gy + 3.5}
              textAnchor="end"
              className={`text-[10px] font-mono font-mono-numbers select-none ${row.leftClass}`}
            >
              {row.leftLabel}
            </text>
          )}
          {row.rightLabel && (
            <text
              x={layout.width - layout.padding.right + 6}
              y={row.gy + 3.5}
              textAnchor="start"
              className={`text-[10px] font-mono font-mono-numbers select-none ${row.rightClass}`}
            >
              {row.rightLabel}
            </text>
          )}
        </g>
      ))}

      {/* Linha vertical tracejada subtil às 00:00 para assinalar mudança de dia */}
      {dayMarkers.map((marker) => {
        const clampedX = Math.max(layout.padding.left + 36, Math.min(layout.width - layout.padding.right - 36, marker.x));
        return (
          <g key={`day-${marker.index}`} className="pointer-events-none select-none">
            <line
              x1={marker.x}
              y1={layout.padding.top}
              x2={marker.x}
              y2={baseY}
              stroke="#94a3b8"
              strokeDasharray="4,4"
              strokeWidth="1.2"
              opacity="0.75"
            />
            <rect
              x={clampedX - 34}
              y={layout.padding.top - 18}
              width={68}
              height={15}
              rx="5"
              fill="#f1f5f9"
              stroke="#cbd5e1"
              strokeWidth="0.8"
            />
            <text
              x={clampedX}
              y={layout.padding.top - 7.5}
              textAnchor="middle"
              className="fill-slate-600 text-[9px] font-bold select-none"
            >
              {marker.label}
            </text>
          </g>
        );
      })}

      {/* Eixo X: apenas horas HH:00 alternadas (de 2 em 2 horas) sem dias da semana */}
      {visibleXIndices.map((idx) => {
        const pt = points[idx];
        const h = hours[idx];
        if (!pt || !h) return null;
        return (
          <text
            key={`x-lbl-${idx}`}
            x={pt.x}
            y={layout.height - 10}
            textAnchor="middle"
            className="fill-slate-500 text-[10px] font-mono font-medium select-none"
          >
            {h.timeFormatted}
          </text>
        );
      })}
    </g>
  );
};
