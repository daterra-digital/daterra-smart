// src/features/weather/components/charts/SprayChartSvg.tsx
import React, { useCallback, useRef } from 'react';
import type { HourlyForecastItem } from '../../types.ts';
import {
  calcChartScale,
  calcPointCoordinates,
  generateSvgLinePath,
  generateSvgAreaPath,
  formatTick,
  type ChartLayout,
  type ChartScaleResult
} from '../../utils/weatherChartUtils.ts';
import {
  findClosestPointIndexByClientX,
  findDayChangeMarkers,
  getAlternatingHourIndices
} from '../../utils/weatherChartAxisHelpers.ts';

export type SprayChartMetric = 'deltaT' | 'vento' | 'chuva' | 'humidade';

interface SprayChartSvgProps {
  hours: HourlyForecastItem[];
  metric: SprayChartMetric;
  selectedIndex: number | null;
  onSelectIndex: (index: number) => void;
}

const LAYOUT: ChartLayout = {
  width: 680,
  height: 244,
  padding: { top: 28, right: 48, bottom: 34, left: 48 }
};

export const SprayChartSvg: React.FC<SprayChartSvgProps> = ({
  hours,
  metric,
  selectedIndex,
  onSelectIndex
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const baseY = LAYOUT.height - LAYOUT.padding.bottom;
  const plotH = baseY - LAYOUT.padding.top;

  const winds = hours.map((h) => h.windSpeedKmh), gusts = hours.map((h) => h.windGustsKmh);
  const rains = hours.map((h) => h.precipitationMm), probs = hours.map((h) => h.precipitationProbability);
  const hums = hours.map((h) => h.humidityPercent), deltas = hours.map((h) => h.deltaT);

  const deltaScale = calcChartScale(deltas, { forceZeroMin: true, padRange: 2 });
  const windScale = calcChartScale([...winds, ...gusts], { forceZeroMin: true, padRange: 5 });
  const rainScale = calcChartScale(rains, { forceZeroMin: true, padRange: 1 });
  const pctScale: ChartScaleResult = { min: 0, max: 100, range: 100, step: 25, ticks: [0, 25, 50, 75, 100] };

  const deltaPts = calcPointCoordinates(deltas, deltaScale, LAYOUT);
  const windPts = calcPointCoordinates(winds, windScale, LAYOUT);
  const gustPts = calcPointCoordinates(gusts, windScale, LAYOUT);
  const rainPts = calcPointCoordinates(rains, rainScale, LAYOUT);
  const probPts = calcPointCoordinates(probs, pctScale, LAYOUT);
  const humPts = calcPointCoordinates(hums, pctScale, LAYOUT);

  const activePts = metric === 'deltaT' ? deltaPts : metric === 'vento' ? windPts : metric === 'chuva' ? rainPts : humPts;
  const activePt = selectedIndex != null && activePts[selectedIndex] ? activePts[selectedIndex] : null;
  const activeHour = selectedIndex != null && hours[selectedIndex] ? hours[selectedIndex] : null;
  const activeXs = activePts.map((pt) => pt.x);
  const visibleXIndices = getAlternatingHourIndices(activePts.length);
  const dayMarkers = findDayChangeMarkers(hours, activeXs);

  const selectByClientX = useCallback(
    (clientX: number) => {
      const closestIdx = findClosestPointIndexByClientX(svgRef.current, clientX, LAYOUT.width, activeXs);
      if (closestIdx !== null && closestIdx !== selectedIndex) onSelectIndex(closestIdx);
    },
    [activeXs, selectedIndex, onSelectIndex]
  );

  const handlePointer = useCallback((e: React.PointerEvent<SVGSVGElement>) => selectByClientX(e.clientX), [selectByClientX]);
  const handleTouch = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    const touch = e.touches[0];
    if (touch) selectByClientX(touch.clientX);
  }, [selectByClientX]);

  if (!hours.length) return null;

  const currentScale = metric === 'deltaT' ? deltaScale : metric === 'vento' ? windScale : metric === 'chuva' ? rainScale : pctScale;
  const yUnit = metric === 'deltaT' ? '°C' : metric === 'vento' ? 'km/h' : metric === 'chuva' ? 'mm' : '%';
  const levels = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${LAYOUT.width} ${LAYOUT.height}`}
        className="w-full min-w-0 sm:min-w-[500px] h-auto select-none cursor-crosshair touch-pan-y"
        style={{ touchAction: 'pan-y' }}
        role="img"
        aria-label={`Gráfico de evolução horária para ${metric}`}
        onPointerDown={handlePointer}
        onPointerMove={handlePointer}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
      >
        {levels.map((lvl, i) => {
          const gy = Math.round((baseY - lvl * plotH) * 10) / 10;
          const val = currentScale.min + lvl * currentScale.range;
          const lbl = `${formatTick(val, currentScale.range / 4)} ${yUnit}`;
          return (
            <g key={`lvl-${i}`}>
              <line x1={LAYOUT.padding.left} y1={gy} x2={LAYOUT.width - LAYOUT.padding.right} y2={gy} stroke="#e2e8f0" strokeDasharray={i === 0 ? undefined : '3,3'} strokeWidth="1" />
              <text x={LAYOUT.padding.left - 6} y={gy + 3.5} textAnchor="end" className="text-[10px] font-mono font-mono-numbers fill-slate-600 font-bold select-none">{lbl}</text>
            </g>
          );
        })}

        {dayMarkers.map((marker) => {
          const clampedX = Math.max(LAYOUT.padding.left + 36, Math.min(LAYOUT.width - LAYOUT.padding.right - 36, marker.x));
          return (
            <g key={`day-${marker.index}`} className="pointer-events-none select-none">
              <line x1={marker.x} y1={LAYOUT.padding.top} x2={marker.x} y2={baseY} stroke="#94a3b8" strokeDasharray="4,4" strokeWidth="1.2" opacity="0.75" />
              <rect x={clampedX - 34} y={LAYOUT.padding.top - 18} width={68} height={15} rx="5" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />
              <text x={clampedX} y={LAYOUT.padding.top - 7.5} textAnchor="middle" className="fill-slate-600 text-[9px] font-bold select-none">{marker.label}</text>
            </g>
          );
        })}

        {visibleXIndices.map((idx) => {
          const pt = activePts[idx];
          const h = hours[idx];
          if (!pt || !h) return null;
          return (
            <text key={`x-${idx}`} x={pt.x} y={LAYOUT.height - 10} textAnchor="middle" className="fill-slate-500 text-[10px] font-mono font-medium select-none">
              {h.timeFormatted}
            </text>
          );
        })}

        {metric === 'deltaT' && (
          <>
            <path d={generateSvgAreaPath(deltaPts, baseY)} className="fill-purple-600/10" />
            <path d={generateSvgLinePath(deltaPts)} fill="none" stroke="#7e22ce" strokeWidth="2.5" />
          </>
        )}
        {metric === 'vento' && (
          <>
            <path d={generateSvgLinePath(gustPts)} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,4" />
            <path d={generateSvgAreaPath(windPts, baseY)} className="fill-emerald-600/10" />
            <path d={generateSvgLinePath(windPts)} fill="none" stroke="#114037" strokeWidth="2.5" />
          </>
        )}
        {metric === 'chuva' && (
          <>
            {rainPts.map((pt, i) => (
              <rect key={`rn-${i}`} x={pt.x - 7} y={pt.y} width={14} height={Math.max(0, baseY - pt.y)} className="fill-sky-500/70" rx="2" />
            ))}
            <path d={generateSvgLinePath(probPts)} fill="none" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4,3" />
          </>
        )}
        {metric === 'humidade' && (
          <>
            <path d={generateSvgAreaPath(humPts, baseY)} className="fill-teal-600/15" />
            <path d={generateSvgLinePath(humPts)} fill="none" stroke="#0f766e" strokeWidth="2.5" />
          </>
        )}

        {activePts.map((pt, i) => (
          <circle key={`pt-${i}`} cx={pt.x} cy={pt.y} r={selectedIndex === i ? '5' : '3'} className={selectedIndex === i ? 'fill-slate-900 stroke-white stroke-2' : 'fill-white stroke-slate-500 stroke-1.5'} />
        ))}

        {activePt && activeHour && (
          <g className="pointer-events-none select-none">
            <line x1={activePt.x} y1={LAYOUT.padding.top} x2={activePt.x} y2={baseY} stroke="#114037" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.45" />
            <rect x={Math.max(50, Math.min(LAYOUT.width - 170, activePt.x - 60))} y={LAYOUT.padding.top + 4} width={120} height={38} rx="7" fill="#0f172a" fillOpacity="0.88" stroke="#334155" strokeWidth="1" />
            <text x={Math.max(58, Math.min(LAYOUT.width - 162, activePt.x - 52))} y={LAYOUT.padding.top + 18} fill="#cbd5e1" className="text-[9px] font-mono">{activeHour.timeFormatted}</text>
            <text x={Math.max(58, Math.min(LAYOUT.width - 162, activePt.x - 52))} y={LAYOUT.padding.top + 33} fill="#ffffff" className="text-[10px] font-mono font-bold font-mono-numbers">
              {metric === 'deltaT' && `ΔT: ${activeHour.deltaT}°C`}
              {metric === 'vento' && `${activeHour.windSpeedKmh} km/h (${activeHour.windGustsKmh})`}
              {metric === 'chuva' && `${activeHour.precipitationMm} mm (${activeHour.precipitationProbability}%)`}
              {metric === 'humidade' && `${activeHour.humidityPercent}% HR`}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
