// src/features/weather/components/charts/WeatherChartSvg.tsx
import React, { useCallback, useRef } from 'react';
import type { HourlyForecastItem } from '../../types.ts';
import {
  calcChartScale,
  calcPointCoordinates,
  generateSvgLinePath,
  generateSvgAreaPath,
  type ChartLayout,
  type ChartScaleResult
} from '../../utils/weatherChartUtils.ts';
import { WeatherChartAxes } from './WeatherChartAxes.tsx';
import { WeatherChartTooltip } from './WeatherChartTooltip.tsx';

export type ChartMetricType = 'resumo' | 'temperatura' | 'chuva' | 'vento' | 'humidade';

interface WeatherChartSvgProps {
  hours: HourlyForecastItem[];
  metric: ChartMetricType;
  selectedIndex: number | null;
  onSelectIndex: (index: number) => void;
}

const LAYOUT: ChartLayout = {
  width: 680,
  height: 240,
  padding: { top: 26, right: 48, bottom: 34, left: 48 }
};

export const WeatherChartSvg: React.FC<WeatherChartSvgProps> = ({
  hours,
  metric,
  selectedIndex,
  onSelectIndex
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const count = hours.length;
  const temps = hours.map((h) => h.temperatureC);
  const rains = hours.map((h) => h.precipitationMm);
  const probs = hours.map((h) => h.precipitationProbability);
  const winds = hours.map((h) => h.windSpeedKmh);
  const gusts = hours.map((h) => h.windGustsKmh);
  const hums = hours.map((h) => h.humidityPercent);

  // Escalas matemáticas com proteções contra divisão por zero
  const tempScale = calcChartScale(temps, { padRange: 2 });
  const rainScale = calcChartScale(rains, { forceZeroMin: true, padRange: 1 });
  const windScale = calcChartScale([...winds, ...gusts], { forceZeroMin: true, padRange: 5 });
  const pctScale: ChartScaleResult = { min: 0, max: 100, range: 100, step: 25, ticks: [0, 25, 50, 75, 100] };

  // Coordenadas projetadas
  const tempPts = calcPointCoordinates(temps, tempScale, LAYOUT);
  const rainPts = calcPointCoordinates(rains, rainScale, LAYOUT);
  const probPts = calcPointCoordinates(probs, pctScale, LAYOUT);
  const windPts = calcPointCoordinates(winds, windScale, LAYOUT);
  const gustPts = calcPointCoordinates(gusts, windScale, LAYOUT);
  const humPts = calcPointCoordinates(hums, pctScale, LAYOUT);

  const baseY = LAYOUT.height - LAYOUT.padding.bottom;
  const barWidth = Math.max(6, Math.min(22, (LAYOUT.width / count) * 0.45));

  // Ponto ativo para inspeção
  const activePts = metric === 'humidade' ? humPts : metric === 'vento' ? windPts : tempPts;
  const activePt = selectedIndex != null && activePts[selectedIndex] ? activePts[selectedIndex] : null;
  const activeHour = selectedIndex != null && hours[selectedIndex] ? hours[selectedIndex] : null;

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || !activePts.length) return;
    const rect = svgRef.current.getBoundingClientRect();
    if (!rect.width) return;
    const svgX = ((e.clientX - rect.left) / rect.width) * LAYOUT.width;

    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < activePts.length; i++) {
      const diff = Math.abs(activePts[i].x - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    if (closestIdx !== selectedIndex) onSelectIndex(closestIdx);
  }, [activePts, selectedIndex, onSelectIndex]);

  if (!hours.length) return null;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${LAYOUT.width} ${LAYOUT.height}`}
        className="w-full min-w-[500px] h-auto select-none cursor-crosshair"
        role="img"
        aria-label={`Gráfico de evolução horária para ${metric}`}
        onPointerMove={handlePointerMove}
      >
        {/* Eixos X e Y com Ticks Numéricos e Unidades */}
        <WeatherChartAxes
          layout={LAYOUT}
          metric={metric}
          tempScale={tempScale}
          rainScale={rainScale}
          windScale={windScale}
          humScale={pctScale}
          points={activePts}
          hours={hours}
        />

        {/* 1. Modo RESUMO: Linha Temp (°C) + Barras Chuva (mm) */}
        {metric === 'resumo' && (
          <>
            {rainPts.map((pt, i) => (
              <rect
                key={`rn-${i}`}
                x={pt.x - barWidth / 2}
                y={pt.y}
                width={barWidth}
                height={Math.max(0, baseY - pt.y)}
                className="fill-sky-400/60 hover:fill-sky-500/80 transition-colors"
                rx="2"
              />
            ))}
            <path d={generateSvgAreaPath(tempPts, baseY)} className="fill-amber-500/10" />
            <path d={generateSvgLinePath(tempPts)} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
          </>
        )}

        {/* 2. Modo TEMPERATURA: Linha com preenchimento suave */}
        {metric === 'temperatura' && (
          <>
            <path d={generateSvgAreaPath(tempPts, baseY)} className="fill-amber-500/15" />
            <path d={generateSvgLinePath(tempPts)} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
          </>
        )}

        {/* 3. Modo CHUVA: Barras mm + Linha Probabilidade % */}
        {metric === 'chuva' && (
          <>
            {rainPts.map((pt, i) => (
              <rect
                key={`rb-${i}`}
                x={pt.x - barWidth / 2}
                y={pt.y}
                width={barWidth}
                height={Math.max(0, baseY - pt.y)}
                className="fill-sky-500/70 hover:fill-sky-600 transition-colors"
                rx="2"
              />
            ))}
            <path d={generateSvgLinePath(probPts)} fill="none" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4,3" />
          </>
        )}

        {/* 4. Modo VENTO: Velocidade contínua + Rajadas tracejadas */}
        {metric === 'vento' && (
          <>
            <path d={generateSvgLinePath(gustPts)} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,4" />
            <path d={generateSvgAreaPath(windPts, baseY)} className="fill-emerald-600/10" />
            <path d={generateSvgLinePath(windPts)} fill="none" stroke="#114037" strokeWidth="2.5" />
          </>
        )}

        {/* 5. Modo HUMIDADE: Linha percentual */}
        {metric === 'humidade' && (
          <>
            <path d={generateSvgAreaPath(humPts, baseY)} className="fill-teal-600/15" />
            <path d={generateSvgLinePath(humPts)} fill="none" stroke="#0f766e" strokeWidth="2.5" />
          </>
        )}

        {/* Pontos Visíveis e Tooltip Ancorado */}
        {activePts.map((pt, i) => (
          <circle
            key={`pt-${i}`}
            cx={pt.x}
            cy={pt.y}
            r={selectedIndex === i ? '5' : '3'}
            className={selectedIndex === i ? 'fill-slate-900 stroke-white stroke-2' : 'fill-white stroke-slate-500 stroke-1.5'}
          />
        ))}

        {activePt && activeHour && (
          <WeatherChartTooltip layout={LAYOUT} metric={metric} point={activePt} hour={activeHour} />
        )}
      </svg>
    </div>
  );
};
