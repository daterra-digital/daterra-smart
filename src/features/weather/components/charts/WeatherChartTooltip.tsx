// src/features/weather/components/charts/WeatherChartTooltip.tsx
import React from 'react';
import type { HourlyForecastItem } from '../../types.ts';
import type { ChartLayout } from '../../utils/weatherChartUtils.ts';
import { formatChartMetric } from '../../utils/weatherChartUtils.ts';
import type { ChartMetricType } from './WeatherChartSvg.tsx';

interface WeatherChartTooltipProps {
  layout: ChartLayout;
  metric: ChartMetricType;
  point: { x: number; y: number };
  hour: HourlyForecastItem;
}

function formatTooltipDateHeader(timeIso: string, timeFormatted: string): string {
  try {
    const d = new Date(timeIso);
    if (isNaN(d.getTime())) return timeFormatted;
    const dateStr = d.toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' });
    return `${dateStr} • ${timeFormatted}`;
  } catch {
    return timeFormatted;
  }
}

export const WeatherChartTooltip: React.FC<WeatherChartTooltipProps> = ({
  layout,
  metric,
  point,
  hour
}) => {
  const boxWidth = 176;
  const rows: Array<{ name: string; value: string }> = [];

  if (metric === 'resumo') {
    rows.push({ name: 'Temperatura', value: formatChartMetric(hour.temperatureC, '°C') });
    rows.push({ name: 'Chuva', value: formatChartMetric(hour.precipitationMm, 'mm') });
  } else if (metric === 'temperatura') {
    rows.push({ name: 'Temperatura', value: formatChartMetric(hour.temperatureC, '°C') });
    if (hour.weatherLabel) rows.push({ name: 'Estado', value: hour.weatherLabel });
  } else if (metric === 'chuva') {
    rows.push({ name: 'Chuva', value: formatChartMetric(hour.precipitationMm, 'mm') });
    rows.push({
      name: 'Probabilidade',
      value: hour.precipitationProbability != null ? `${hour.precipitationProbability}%` : 'Não disponível'
    });
  } else if (metric === 'vento') {
    rows.push({ name: 'Vento', value: formatChartMetric(hour.windSpeedKmh, 'km/h') });
    rows.push({ name: 'Rajadas', value: formatChartMetric(hour.windGustsKmh, 'km/h') });
  } else if (metric === 'humidade') {
    rows.push({
      name: 'Humidade',
      value: hour.humidityPercent != null ? `${hour.humidityPercent}%` : 'Não disponível'
    });
  }

  const boxHeight = 24 + rows.length * 17;
  let boxX = point.x - boxWidth / 2;
  if (boxX < layout.padding.left + 2) boxX = layout.padding.left + 2;
  if (boxX + boxWidth > layout.width - layout.padding.right - 2) {
    boxX = layout.width - layout.padding.right - 2 - boxWidth;
  }

  let boxY = point.y - boxHeight - 10;
  if (boxY < layout.padding.top + 2) {
    boxY = point.y + 12;
  }

  const dateHeader = formatTooltipDateHeader(hour.timeIso, hour.timeFormatted);

  return (
    <g className="chart-tooltip pointer-events-none select-none">
      {/* Linha vertical de referência temporal */}
      <line
        x1={point.x}
        y1={layout.padding.top}
        x2={point.x}
        y2={layout.height - layout.padding.bottom}
        stroke="#114037"
        strokeWidth="1.5"
        strokeDasharray="3,3"
        opacity="0.45"
      />
      {/* Fundo escuro com opacidade de 88% apenas no retângulo */}
      <rect
        x={boxX}
        y={boxY}
        width={boxWidth}
        height={boxHeight}
        rx="8"
        fill="#0f172a"
        fillOpacity="0.88"
        stroke="#334155"
        strokeWidth="1"
      />
      {/* Cabeçalho: data e hora */}
      <text
        x={boxX + 10}
        y={boxY + 15}
        fill="#cbd5e1"
        className="text-[10px] font-mono font-medium"
      >
        {dateHeader}
      </text>
      {/* Linhas de séries com nomes à esquerda e valores à direita */}
      {rows.map((row, i) => {
        const rowY = boxY + 31 + i * 16;
        return (
          <g key={`t-row-${i}`}>
            <text
              x={boxX + 10}
              y={rowY}
              fill="#94a3b8"
              textAnchor="start"
              className="text-[11px] font-medium"
            >
              {row.name}
            </text>
            <text
              x={boxX + boxWidth - 10}
              y={rowY}
              fill="#ffffff"
              textAnchor="end"
              className="text-[11px] font-mono font-bold font-mono-numbers"
            >
              {row.value}
            </text>
          </g>
        );
      })}
    </g>
  );
};
