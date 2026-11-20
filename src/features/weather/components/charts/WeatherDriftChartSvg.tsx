// src/features/weather/components/charts/WeatherDriftChartSvg.tsx
import React, { useCallback, useRef } from 'react';
import type { HourlyDriftPoint } from '../../utils/weatherDriftEvaluator.ts';
import type { ChartLayout } from '../../utils/weatherChartUtils.ts';
import {
  findClosestPointIndexByClientX,
  findDayChangeMarkers,
  getAlternatingHourIndices
} from '../../utils/weatherChartAxisHelpers.ts';

interface WeatherDriftChartSvgProps {
  readonly points: readonly HourlyDriftPoint[];
  readonly selectedIndex: number;
  readonly onSelectIndex: (idx: number) => void;
  readonly scaleFactor?: number;
  readonly acceptableLimitPct?: number | null;
  readonly timezoneLabel?: string;
}

const LAYOUT: ChartLayout = { width: 680, height: 228, padding: { top: 30, right: 24, bottom: 38, left: 52 } };

export const WeatherDriftChartSvg: React.FC<WeatherDriftChartSvgProps> = ({
  points, selectedIndex, onSelectIndex, scaleFactor = 1, acceptableLimitPct = 75, timezoneLabel = 'local'
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const count = points.length;
  const plotW = LAYOUT.width - LAYOUT.padding.left - LAYOUT.padding.right;
  const baseY = LAYOUT.height - LAYOUT.padding.bottom;
  const plotH = baseY - LAYOUT.padding.top;

  const coords = points.map((pt, i) => {
    const x = count <= 1 ? LAYOUT.padding.left + plotW / 2 : LAYOUT.padding.left + (i / (count - 1)) * plotW;
    const rawScore = pt.evaluation.status === 'VALID' && pt.evaluation.score !== null ? pt.evaluation.score : null;
    const score = rawScore !== null ? Math.round(Math.min(200, Math.max(5, rawScore * scaleFactor))) : null;
    const y = score !== null ? Math.round((LAYOUT.padding.top + (1 - score / 200) * plotH) * 10) / 10 : null;
    return { x: Math.round(x * 10) / 10, y, score, pt, i };
  });

  const segments: Array<typeof coords> = [];
  let currentSeg: typeof coords = [];
  for (const c of coords) {
    if (c.y !== null) currentSeg.push(c);
    else if (currentSeg.length > 0) { segments.push(currentSeg); currentSeg = []; }
  }
  if (currentSeg.length > 0) segments.push(currentSeg);

  const xs = coords.map((c) => c.x);
  const visibleIndices = new Set(getAlternatingHourIndices(coords.length));
  const dayMarkers = findDayChangeMarkers(points, xs);

  const selectByClientX = useCallback((clientX: number) => {
    const best = findClosestPointIndexByClientX(svgRef.current, clientX, LAYOUT.width, xs);
    if (best !== null && best !== selectedIndex) onSelectIndex(best);
  }, [xs, selectedIndex, onSelectIndex]);

  const handlePointer = useCallback((e: React.PointerEvent<SVGSVGElement>) => selectByClientX(e.clientX), [selectByClientX]);
  const handleTouch = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    const touch = e.touches[0];
    if (touch) selectByClientX(touch.clientX);
  }, [selectByClientX]);

  const handleKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (!count) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); onSelectIndex(Math.min(count - 1, selectedIndex + 1)); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); onSelectIndex(Math.max(0, selectedIndex - 1)); }
    else if (e.key === 'Home') { e.preventDefault(); onSelectIndex(0); }
    else if (e.key === 'End') { e.preventDefault(); onSelectIndex(count - 1); }
  };

  if (!count) return null;
  const active = coords[selectedIndex] ?? coords[0];
  const hitW = count <= 1 ? plotW : plotW / count;
  const safeLimit = acceptableLimitPct ?? 75;
  const yLimit = Math.round((LAYOUT.padding.top + (1 - safeLimit / 200) * plotH) * 10) / 10;
  const y100 = Math.round((LAYOUT.padding.top + (1 - 100 / 200) * plotH) * 10) / 10;

  return (
    <div className="w-full max-w-full overflow-x-auto">
      <svg
        ref={svgRef}
        tabIndex={0}
        role="slider"
        aria-label={`Gráfico horário do Índice de Risco de Deriva (0 a 200%, limiar aceitável ${safeLimit}%). Use as setas para navegar (${timezoneLabel}).`}
        aria-valuemin={0}
        aria-valuemax={count - 1}
        aria-valuenow={selectedIndex}
        aria-valuetext={`${active.pt.timeFormatted}: ${active.score !== null ? `${active.score}%` : 'Sem leitura válida'}`}
        viewBox={`0 0 ${LAYOUT.width} ${LAYOUT.height}`}
        className="w-full min-w-[300px] sm:min-w-[500px] h-auto select-none cursor-crosshair touch-pan-y focus:outline-none focus:ring-2 focus:ring-[#3CA64C] rounded-xl"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={handlePointer}
        onPointerMove={handlePointer}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
        onKeyDown={handleKeyDown}
      >
        <text x={LAYOUT.padding.left} y={14} className="text-[10px] font-bold fill-[#114037]">IRD Horário (0–200% · Limiar aceitável {safeLimit}%)</text>
        <text x={LAYOUT.width - LAYOUT.padding.right} y={baseY + 26} textAnchor="end" className="text-[9px] font-semibold fill-slate-500">Eixo X: Hora local ({timezoneLabel})</text>

        <rect x={LAYOUT.padding.left} y={yLimit} width={plotW} height={Math.max(0, baseY - yLimit)} fill="#3CA64C" opacity="0.08" />
        <line x1={LAYOUT.padding.left} y1={yLimit} x2={LAYOUT.width - LAYOUT.padding.right} y2={yLimit} stroke="#3CA64C" strokeDasharray="4,4" strokeWidth="1.4" opacity="0.85" />
        <line x1={LAYOUT.padding.left} y1={y100} x2={LAYOUT.width - LAYOUT.padding.right} y2={y100} stroke="#f59e0b" strokeDasharray="4,4" strokeWidth="1.2" opacity="0.7" />
        {[0, 50, 100, 150, 200].map((v) => {
          const gy = Math.round((LAYOUT.padding.top + (1 - v / 200) * plotH) * 10) / 10;
          return (
            <g key={v}>
              <line x1={LAYOUT.padding.left} y1={gy} x2={LAYOUT.width - LAYOUT.padding.right} y2={gy} stroke="#e2e8f0" strokeDasharray="3,3" strokeWidth="1" />
              <text x={LAYOUT.padding.left - 6} y={gy + 3.5} textAnchor="end" className="text-[10px] font-mono-numbers fill-slate-500 font-bold">{v}%</text>
            </g>
          );
        })}

        {dayMarkers.map((marker) => {
          const clampedX = Math.max(LAYOUT.padding.left + 36, Math.min(LAYOUT.width - LAYOUT.padding.right - 36, marker.x));
          return (
            <g key={`day-${marker.index}`} className="pointer-events-none select-none">
              <line x1={marker.x} y1={LAYOUT.padding.top} x2={marker.x} y2={LAYOUT.height - 8} stroke="#94a3b8" strokeDasharray="4,4" strokeWidth="1.2" opacity="0.75" />
              <rect x={clampedX - 34} y={LAYOUT.padding.top - 16} width={68} height={14} rx="5" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />
              <text x={clampedX} y={LAYOUT.padding.top - 6} textAnchor="middle" className="fill-slate-600 text-[9px] font-bold select-none">{marker.label}</text>
            </g>
          );
        })}

        {segments.map((seg, idx) => (
          <path key={`seg-${idx}`} d={seg.map((p, k) => `${k === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} fill="none" stroke="#114037" strokeWidth="2.5" strokeLinecap="round" />
        ))}

        {coords.map((c) => (
          <g key={c.pt.timeIso}>
            <rect x={c.x - hitW / 2} y={LAYOUT.padding.top} width={hitW} height={plotH} fill="transparent" className="cursor-pointer" onClick={() => onSelectIndex(c.i)} />
            {visibleIndices.has(c.i) && <text x={c.x} y={baseY + 14} textAnchor="middle" className="fill-slate-600 text-[10px] font-mono-numbers font-medium">{c.pt.timeFormatted}</text>}
            {c.y !== null ? (
              <circle cx={c.x} cy={c.y} r={c.i === selectedIndex ? 5.5 : 3.5} className={c.i === selectedIndex ? 'fill-[#3CA64C] stroke-[#114037] stroke-2 cursor-pointer' : 'fill-white stroke-[#114037] stroke-2 cursor-pointer'} onClick={() => onSelectIndex(c.i)} />
            ) : (
              <text x={c.x} y={LAYOUT.padding.top + plotH / 2} textAnchor="middle" className="text-[9px] font-semibold fill-slate-400">N/D</text>
            )}
          </g>
        ))}

        {active && (
          <g className="pointer-events-none select-none">
            <line x1={active.x} y1={LAYOUT.padding.top} x2={active.x} y2={LAYOUT.height - 8} stroke="#114037" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.45" />
            <rect x={Math.max(46, Math.min(LAYOUT.width - 110, active.x - 44))} y={LAYOUT.padding.top + 4} width={88} height={26} rx="7" fill="#0f172a" fillOpacity="0.9" />
            <text x={Math.max(90, Math.min(LAYOUT.width - 66, active.x))} y={LAYOUT.padding.top + 21} textAnchor="middle" fill="#ffffff" className="text-[11px] font-mono-numbers font-bold">
              {active.score !== null ? `IRD ${active.score}%` : 'N/D'}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
