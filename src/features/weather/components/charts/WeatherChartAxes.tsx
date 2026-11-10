// src/features/weather/components/charts/WeatherChartAxes.tsx
import React from 'react';
import type { HourlyForecastItem } from '../../types.ts';
import {
  type ChartLayout,
  type ChartScaleResult,
  getVisibleXAxisIndices,
  formatTick
} from '../../utils/weatherChartUtils.ts';
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
  const visibleXIndices = getVisibleXAxisIndices(points, 48);

  // Geração de 5 níveis de referência sem duplicação de rótulos
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

      {/* Rótulos do Eixo X sem sobreposições e com mudança de data discreta */}
      {visibleXIndices.map((idx) => {
        const pt = points[idx];
        const h = hours[idx];
        if (!pt || !h) return null;

        const prev = idx > 0 ? hours[idx - 1] : null;
        const isDateChange = prev && prev.timeIso.slice(0, 10) !== h.timeIso.slice(0, 10);
        let labelText = h.timeFormatted;
        if (isDateChange || h.timeFormatted === '00:00') {
          try {
            const dObj = new Date(h.timeIso);
            const wDay = dObj.toLocaleDateString('pt-PT', { weekday: 'short' }).replace('.', '');
            labelText = `${h.timeFormatted} (${wDay})`;
          } catch {
            labelText = h.timeFormatted;
          }
        }

        return (
          <text
            key={`x-lbl-${idx}`}
            x={pt.x}
            y={layout.height - 10}
            textAnchor="middle"
            className="fill-slate-500 text-[10px] font-mono font-medium select-none"
          >
            {labelText}
          </text>
        );
      })}
    </g>
  );
};
