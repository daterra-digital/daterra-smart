import React, { useMemo, useCallback } from 'react';
import type { Nozzle, CalculatedNozzleFlow } from '../../../nozzle-comparison/nozzleComparison.types.ts';
import { formatPt, getNozzleColorPresentation } from '../../../nozzle-comparison/nozzleComparison.calculations.ts';
import { buildNozzleSegmentedPaths, getDiamondSvgPath } from '../services/curvasGraficoUtils.ts';

export interface ComparadorCurvasGraficoProps {
  nozzleA?: Nozzle;
  nozzleB?: Nozzle;
  flowA?: CalculatedNozzleFlow;
  flowB?: CalculatedNozzleFlow;
  workingPressureBar: number;
  width?: number;
  height?: number;
  className?: string;
}

export const ComparadorCurvasGrafico: React.FC<ComparadorCurvasGraficoProps> = ({
  nozzleA,
  nozzleB,
  flowA,
  flowB,
  workingPressureBar,
  width = 520,
  height = 250,
  className = ''
}) => {
  const padL = 40;
  const padR = 20;
  const padT = 32;
  const padB = 44;

  const maxP = useMemo(() => {
    const rawMax = Math.max(
      Math.ceil((workingPressureBar * 1.25) / 5) * 5,
      nozzleA?.pressureMaxBar || 5,
      nozzleB?.pressureMaxBar || 5,
      10
    );
    return Math.min(rawMax <= 10 ? 10 : rawMax <= 15 ? 15 : rawMax <= 20 ? 20 : rawMax <= 25 ? 25 : 30, 30);
  }, [workingPressureBar, nozzleA, nozzleB]);

  const toSvgX = useCallback(
    (p: number) => padL + (Math.max(0, p) / maxP) * (width - padL - padR),
    [maxP, width]
  );

  const maxQ = useMemo(() => {
    const qA = flowA?.flowLMin ? flowA.flowLMin * 1.3 : 1.5;
    const qB = flowB?.flowLMin ? flowB.flowLMin * 1.3 : 1.5;
    return Math.max(2.0, qA, qB, 2.5);
  }, [flowA, flowB]);

  const toSvgY = useCallback(
    (q: number) => height - padB - (q / maxQ) * (height - padT - padB),
    [height, maxQ]
  );

  const pathsA = useMemo(() => buildNozzleSegmentedPaths(nozzleA, maxP, toSvgX, toSvgY), [nozzleA, maxP, toSvgX, toSvgY]);
  const pathsB = useMemo(() => buildNozzleSegmentedPaths(nozzleB, maxP, toSvgX, toSvgY), [nozzleB, maxP, toSvgX, toSvgY]);

  const currentX = toSvgX(workingPressureBar);
  const curYA = flowA ? toSvgY(flowA.flowLMin) : null;
  const curYB = flowB ? toSvgY(flowB.flowLMin) : null;

  const isExceededA = nozzleA && (workingPressureBar > (nozzleA.pressureMaxBar ?? 20) || workingPressureBar < (nozzleA.pressureMinBar ?? 1.5));
  const isExceededB = nozzleB && (workingPressureBar > (nozzleB.pressureMaxBar ?? 20) || workingPressureBar < (nozzleB.pressureMinBar ?? 1.5));

  const presA = useMemo(() => getNozzleColorPresentation(nozzleA), [nozzleA]);
  const presB = useMemo(() => getNozzleColorPresentation(nozzleB), [nozzleB]);

  const stepX = maxP <= 10 ? 2 : maxP <= 15 ? 3 : 5;
  const xLabels = Array.from({ length: Math.floor(maxP / stepX) + 1 }, (_, i) => i * stepX);
  const yLabels = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0].filter((q) => q <= maxQ);

  return (
    <div className={`w-full bg-[#FAFBFB] p-3 rounded-2xl border border-slate-200 shadow-inner space-y-2.5 ${className}`}>
      {/* 1. Legenda Dinâmica com Swatches Reais */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-bold border-b border-slate-200/60 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs" style={{ backgroundColor: presA.hex }} />
          <span className="text-[#114037] flex items-center gap-1 font-extrabold">
            ● Bico A: {nozzleA ? `${nozzleA.model} (${nozzleA.color || 'A'})` : 'Bico A'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">[{nozzleA?.pressureMinBar ?? 1.5}–{nozzleA?.pressureMaxBar ?? 20} bar]</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs" style={{ backgroundColor: presB.hex }} />
          <span className="text-[#0D9488] flex items-center gap-1 font-extrabold">
            ◆ Bico B: {nozzleB ? `${nozzleB.model} (${nozzleB.color || 'B'})` : 'Bico B'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">[{nozzleB?.pressureMinBar ?? 1.5}–{nozzleB?.pressureMaxBar ?? 20} bar]</span>
        </div>
      </div>

      {/* 2. SVG com Curvas Segmentadas */}
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none overflow-visible">
          {/* Grelha Y */}
          {yLabels.map((q) => (
            <g key={q}>
              <line x1={padL} y1={toSvgY(q)} x2={width - padR} y2={toSvgY(q)} stroke="#E2E8F0" strokeDasharray="2 2" />
              <text x={padL - 6} y={toSvgY(q) + 3} textAnchor="end" className="font-mono text-[9px] fill-slate-400 font-semibold">{formatPt(q, 1)}</text>
            </g>
          ))}

          {/* Grelha X */}
          {xLabels.map((p) => (
            <g key={p}>
              <line x1={toSvgX(p)} y1={padT} x2={toSvgX(p)} y2={height - padB} stroke="#F1F5F9" />
              <text x={toSvgX(p)} y={height - padB + 12} textAnchor="middle" className="font-mono text-[9px] fill-slate-500 font-semibold">{p}b</text>
            </g>
          ))}

          {/* Curva Bico A (Segmentada: sólida dentro da gama, atenuada fora) */}
          {pathsA.pathOutLow && <path d={pathsA.pathOutLow} fill="none" stroke="#114037" strokeWidth="2" strokeDasharray="2 3" strokeOpacity="0.35" />}
          {pathsA.pathIn && <path d={pathsA.pathIn} fill="none" stroke="#114037" strokeWidth="3.5" strokeLinecap="round" />}
          {pathsA.pathOutHigh && <path d={pathsA.pathOutHigh} fill="none" stroke="#114037" strokeWidth="2" strokeDasharray="2 3" strokeOpacity="0.35" />}

          {/* Curva Bico B (Segmentada: tracejada teal dentro da gama, atenuada fora) */}
          {pathsB.pathOutLow && <path d={pathsB.pathOutLow} fill="none" stroke="#0D9488" strokeWidth="1.8" strokeDasharray="2 3" strokeOpacity="0.35" />}
          {pathsB.pathIn && <path d={pathsB.pathIn} fill="none" stroke="#0D9488" strokeWidth="3" strokeDasharray="8 5" strokeLinecap="round" />}
          {pathsB.pathOutHigh && <path d={pathsB.pathOutHigh} fill="none" stroke="#0D9488" strokeWidth="1.8" strokeDasharray="2 3" strokeOpacity="0.35" />}

          {/* Linha Vertical de Pressão Neutra (Ardósia #334155) */}
          <line x1={currentX} y1={padT} x2={currentX} y2={height - padB} stroke="#334155" strokeWidth="1.6" strokeDasharray="3 3" />

          {/* Badge de Pressão Neutro */}
          <rect x={currentX - 58} y={padT - 22} width="116" height="18" rx="6" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
          <text x={currentX} y={padT - 10} textAnchor="middle" className="font-mono text-[9px] font-black fill-[#334155]">
            Ref: {formatPt(workingPressureBar, 1)} bar
          </text>

          {/* Marcador Bico A (●) com alerta âmbar se fora da gama */}
          {curYA !== null && (
            <g>
              <circle cx={currentX} cy={curYA} r="7" fill={isExceededA ? '#D97706' : '#114037'} opacity="0.22" />
              <circle cx={currentX} cy={curYA} r="4.2" fill={isExceededA ? '#D97706' : '#114037'} stroke="#FFFFFF" strokeWidth="1.8" />
              {isExceededA && (
                <text x={currentX + 9} y={curYA - 4} fill="#D97706" fontSize="8" fontWeight="black">⚠️ Fora da gama A</text>
              )}
            </g>
          )}

          {/* Marcador Bico B (◆) com alerta âmbar se fora da gama */}
          {curYB !== null && (
            <g>
              <path d={getDiamondSvgPath(currentX, curYB, 8)} fill={isExceededB ? '#D97706' : '#0D9488'} opacity="0.22" />
              <path d={getDiamondSvgPath(currentX, curYB, 5)} fill={isExceededB ? '#D97706' : '#0D9488'} stroke="#FFFFFF" strokeWidth="1.8" />
              {isExceededB && (
                <text x={currentX + 9} y={curYB + 9} fill="#D97706" fontSize="8" fontWeight="black">⚠️ Fora da gama B</text>
              )}
            </g>
          )}
        </svg>
      </div>

      {/* 3. Réguas Horizontais Compactas de Alcance por Bico */}
      <div className="pt-1 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-bold">
        <div className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1.5 rounded-xl border border-slate-200/80 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-[#114037] shrink-0" />
          <span className="text-[#114037]">Janela Bico A:</span>
          <span className="font-mono ml-auto text-slate-900">{formatPt(nozzleA?.pressureMinBar ?? 1.5, 1)} – {formatPt(nozzleA?.pressureMaxBar ?? 20, 1)} bar</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1.5 rounded-xl border border-slate-200/80 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-xs rotate-45 bg-[#0D9488] shrink-0" />
          <span className="text-[#0D9488]">Janela Bico B:</span>
          <span className="font-mono ml-auto text-slate-900">{formatPt(nozzleB?.pressureMinBar ?? 1.5, 1)} – {formatPt(nozzleB?.pressureMaxBar ?? 20, 1)} bar</span>
        </div>
      </div>
    </div>
  );
};
