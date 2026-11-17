import React, { useCallback, useRef } from 'react';
import type { HourlyDriftPoint } from '../../utils/weatherDriftEvaluator.ts';
import type { DriftChartSeriesKey } from '../../utils/weatherDriftTypes.ts';
import { getVisibleXAxisIndices, type ChartLayout } from '../../utils/weatherChartUtils.ts';
import { WeatherDriftSeriesTracks } from './WeatherDriftSeriesTracks.tsx';

interface WeatherDriftChartSvgProps {
  readonly points: readonly HourlyDriftPoint[];
  readonly selectedIndex: number;
  readonly onSelectIndex: (idx: number) => void;
  readonly activeSeries?: readonly DriftChartSeriesKey[];
  readonly timezoneLabel?: string;
}

const EMPTY_SERIES: DriftChartSeriesKey[] = [];
const LAYOUT: ChartLayout = { width: 680, height: 224, padding: { top: 28, right: 24, bottom: 38, left: 52 } };
const TRACK_H = 56;
const TRACK_GAP = 26;

export const WeatherDriftChartSvg: React.FC<WeatherDriftChartSvgProps> = ({
  points, selectedIndex, onSelectIndex, activeSeries = EMPTY_SERIES, timezoneLabel = 'local'
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const count = points.length;
  const plotW = LAYOUT.width - LAYOUT.padding.left - LAYOUT.padding.right;
  const baseY = LAYOUT.height - LAYOUT.padding.bottom;
  const plotH = baseY - LAYOUT.padding.top;
  const tracksOffsetY = activeSeries.length > 0 ? baseY + 34 : baseY;
  const totalHeight = activeSeries.length > 0 ? tracksOffsetY + activeSeries.length * (TRACK_H + TRACK_GAP) : LAYOUT.height;

  const coords = points.map((pt, i) => {
    const x = count <= 1 ? LAYOUT.padding.left + plotW / 2 : LAYOUT.padding.left + (i / (count - 1)) * plotW;
    const score = pt.evaluation.status === 'VALID' ? pt.evaluation.score : null;
    const y = score !== null ? Math.round((LAYOUT.padding.top + (1 - score / 100) * plotH) * 10) / 10 : null;
    return { x: Math.round(x * 10) / 10, y, score, pt, i };
  });

  const segments: Array<typeof coords> = [];
  let currentSeg: typeof coords = [];
  for (const c of coords) {
    if (c.y !== null) currentSeg.push(c);
    else if (currentSeg.length > 0) { segments.push(currentSeg); currentSeg = []; }
  }
  if (currentSeg.length > 0) segments.push(currentSeg);

  const visibleIndices = new Set(getVisibleXAxisIndices(coords.map((c) => ({ x: c.x, y: c.y ?? baseY, value: c.score ?? 0, index: c.i })), 48));

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || !coords.length) return;
    const rect = svgRef.current.getBoundingClientRect();
    if (!rect.width) return;
    const svgX = ((e.clientX - rect.left) / rect.width) * LAYOUT.width;
    let best = 0;
    let bestDiff = Infinity;
    for (let i = 0; i < coords.length; i++) {
      const diff = Math.abs(coords[i].x - svgX);
      if (diff < bestDiff) { bestDiff = diff; best = i; }
    }
    if (best !== selectedIndex) onSelectIndex(best);
  }, [coords, selectedIndex, onSelectIndex]);

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
  const threshold25Y = Math.round((LAYOUT.padding.top + (1 - 25 / 100) * plotH) * 10) / 10;

  return (
    <div className="w-full max-w-full overflow-x-auto">
      <svg
        ref={svgRef}
        tabIndex={0}
        role="slider"
        aria-label={`Gráfico horário do índice meteorológico de deriva (10 a 100 pts). Use as setas esquerda e direita para navegar pelas horas (${timezoneLabel}).`}
        aria-valuemin={0}
        aria-valuemax={count - 1}
        aria-valuenow={selectedIndex}
        aria-valuetext={`${active.pt.timeFormatted}: ${active.score !== null ? `${active.score} pts, ${active.pt.evaluation.bandLabelPt}` : 'Sem leitura válida'}`}
        viewBox={`0 0 ${LAYOUT.width} ${totalHeight}`}
        className="w-full min-w-[300px] sm:min-w-[500px] h-auto select-none cursor-crosshair focus:outline-none focus:ring-2 focus:ring-[#3CA64C] rounded-xl"
        onPointerMove={handlePointerMove}
        onKeyDown={handleKeyDown}
      >
        <text x={LAYOUT.padding.left} y={14} className="text-[10px] font-bold fill-[#114037]">Índice meteorológico (10–100 pts · adimensional)</text>
        <text x={LAYOUT.width - LAYOUT.padding.right} y={baseY + 26} textAnchor="end" className="text-[9px] font-semibold fill-slate-500">Eixo X: Hora local ({timezoneLabel})</text>

        <line x1={LAYOUT.padding.left} y1={threshold25Y} x2={LAYOUT.width - LAYOUT.padding.right} y2={threshold25Y} stroke="#3CA64C" strokeDasharray="4,4" strokeWidth="1.2" opacity="0.6" />
        {[10, 25, 50, 75, 100].map((v) => {
          const gy = Math.round((LAYOUT.padding.top + (1 - v / 100) * plotH) * 10) / 10;
          return (
            <g key={v}>
              <line x1={LAYOUT.padding.left} y1={gy} x2={LAYOUT.width - LAYOUT.padding.right} y2={gy} stroke="#e2e8f0" strokeDasharray="3,3" strokeWidth="1" />
              <text x={LAYOUT.padding.left - 6} y={gy + 3.5} textAnchor="end" className="text-[10px] font-mono-numbers fill-slate-500 font-bold">{v}</text>
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

        {activeSeries.length > 0 && (
          <WeatherDriftSeriesTracks
            points={points} activeSeries={activeSeries} xs={coords.map((c) => c.x)}
            startY={tracksOffsetY} plotLeft={LAYOUT.padding.left} plotRight={LAYOUT.width - LAYOUT.padding.right}
            trackHeight={TRACK_H} trackGap={TRACK_GAP}
          />
        )}

        {active && (
          <g className="pointer-events-none select-none">
            <line x1={active.x} y1={LAYOUT.padding.top} x2={active.x} y2={totalHeight - 8} stroke="#114037" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.45" />
            <rect x={Math.max(46, Math.min(LAYOUT.width - 180, active.x - 75))} y={LAYOUT.padding.top + 4} width={154} height={44} rx="8" fill="#0f172a" fillOpacity="0.9" />
            <text x={Math.max(56, Math.min(LAYOUT.width - 170, active.x - 65))} y={LAYOUT.padding.top + 20} fill="#cbd5e1" className="text-[10px] font-mono-numbers">{active.pt.timeFormatted} ({timezoneLabel})</text>
            <text x={Math.max(56, Math.min(LAYOUT.width - 170, active.x - 65))} y={LAYOUT.padding.top + 36} fill="#ffffff" className="text-[11px] font-mono-numbers font-bold">
              {active.score !== null ? `${active.score} pts · ${active.pt.evaluation.bandLabelPt}` : 'Sem leitura válida'}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
