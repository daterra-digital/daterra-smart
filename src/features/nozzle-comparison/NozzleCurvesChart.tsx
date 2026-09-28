import React from 'react';
import type { Nozzle, CalculatedNozzleFlow } from './nozzleComparison.types';
import { formatPt } from './nozzleComparison.calculations';

export interface NozzleCurvesChartProps {
  nozzleA?: Nozzle;
  nozzleB?: Nozzle;
  flowA?: CalculatedNozzleFlow;
  flowB?: CalculatedNozzleFlow;
  workingPressureBar: number;
  width?: number;
  height?: number;
  className?: string;
}

// Calcular pontos das curvas segundo a lei física q = q0 * sqrt(p / p0)
const getNozzleCurvePoints = (nozzle?: Nozzle, maxP: number = 30) => {
  if (!nozzle) return [];
  const p0 = nozzle.referencePressureBar || 3.0;
  const q0 = nozzle.nominalFlowLMin || 1.0;
  const points: { p: number; q: number }[] = [];
  for (let p = 0.5; p <= maxP; p += 0.5) {
    const q = q0 * Math.sqrt(p / p0);
    points.push({ p, q });
  }
  return points;
};

export const NozzleCurvesChart: React.FC<NozzleCurvesChartProps> = ({
  nozzleA,
  nozzleB,
  flowA,
  flowB,
  workingPressureBar,
  width = 360,
  height = 220,
  className = ''
}) => {
  const maxP = React.useMemo(() => {
    const rawMax = Math.max(
      Math.ceil((workingPressureBar * 1.3) / 5) * 5,
      nozzleA?.pressureMaxBar || 5,
      nozzleB?.pressureMaxBar || 5,
      10
    );
    return Math.min(rawMax <= 10 ? 10 : rawMax <= 15 ? 15 : rawMax <= 20 ? 20 : rawMax <= 25 ? 25 : 30, 30);
  }, [workingPressureBar, nozzleA, nozzleB]);

  const padL = 42;
  const padR = 20;
  const padT = 24;
  const padB = 36;

  const toSvgX = (p: number) => padL + (p / maxP) * (width - padL - padR);

  const pointsA = React.useMemo(() => getNozzleCurvePoints(nozzleA, maxP), [nozzleA, maxP]);
  const pointsB = React.useMemo(() => getNozzleCurvePoints(nozzleB, maxP), [nozzleB, maxP]);

  const maxQ = React.useMemo(() => {
    return Math.max(
      2.0,
      flowA?.flowLMin ? flowA.flowLMin * 1.25 : 0,
      flowB?.flowLMin ? flowB.flowLMin * 1.25 : 0,
      ...pointsA.map(pt => pt.q),
      ...pointsB.map(pt => pt.q)
    );
  }, [pointsA, pointsB, flowA, flowB]);

  const toSvgY = (q: number) => height - padB - (q / maxQ) * (height - padT - padB);

  const pathA = pointsA.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(pt.p).toFixed(1)} ${toSvgY(pt.q).toFixed(1)}`).join(' ');
  const pathB = pointsB.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(pt.p).toFixed(1)} ${toSvgY(pt.q).toFixed(1)}`).join(' ');

  const currentX = toSvgX(workingPressureBar);
  const currentYA = flowA ? toSvgY(flowA.flowLMin) : null;
  const currentYB = flowB ? toSvgY(flowB.flowLMin) : null;

  // Pressões do eixo X
  const stepX = maxP <= 10 ? 2 : maxP <= 15 ? 3 : 5;
  const xLabels: number[] = [];
  for (let p = 0; p <= maxP; p += stepX) {
    xLabels.push(p);
  }

  // Débitos do eixo Y
  const yLabels = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0].filter(q => q <= maxQ);

  // Zona recomendada comum
  const zoneMinP = Math.max(nozzleA?.pressureMinBar || 1.5, nozzleB?.pressureMinBar || 1.5);
  const zoneMaxP = Math.min(nozzleA?.pressureMaxBar || maxP, nozzleB?.pressureMaxBar || maxP);
  const showZone = zoneMaxP > zoneMinP && zoneMinP < maxP;

  return (
    <div className={`w-full bg-[#FAFBFB] p-2.5 sm:p-3 rounded-2xl border border-slate-200 relative overflow-hidden shadow-inner ${className}`}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
        <defs>
          <linearGradient id="gradOptimalZone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3CA64C" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#3CA64C" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Zona Recomendada de Trabalho */}
        {showZone && (
          <g>
            <rect
              x={toSvgX(zoneMinP)}
              y={padT}
              width={Math.max(0, toSvgX(Math.min(zoneMaxP, maxP)) - toSvgX(zoneMinP))}
              height={height - padT - padB}
              fill="url(#gradOptimalZone)"
            />
            <text
              x={(toSvgX(zoneMinP) + toSvgX(Math.min(zoneMaxP, maxP))) / 2}
              y={padT + 11}
              textAnchor="middle"
              className="text-[8px] font-bold fill-[#3CA64C] tracking-wider uppercase opacity-80"
            >
              Gama Ótima Recomendada
            </text>
          </g>
        )}

        {/* Linhas de Grelha Horizontais (Débito) */}
        {yLabels.map(q => {
          const y = toSvgY(q);
          return (
            <g key={q}>
              <line x1={padL} y1={y} x2={width - padR} y2={y} stroke="#E2E8F0" strokeDasharray="2 2" />
              <text x={padL - 6} y={y + 3} textAnchor="end" className="font-mono text-[9px] fill-slate-400 font-semibold">
                {formatPt(q, 1)}
              </text>
            </g>
          );
        })}

        {/* Linhas de Grelha Verticais (Pressão) */}
        {xLabels.map(p => {
          const x = toSvgX(p);
          return (
            <g key={p}>
              <line x1={x} y1={padT} x2={x} y2={height - padB} stroke="#F1F5F9" />
              <text x={x} y={height - padB + 13} textAnchor="middle" className="font-mono text-[9px] fill-slate-500 font-semibold">
                {p} bar
              </text>
            </g>
          );
        })}

        {/* Curva Bico A (Sólida #114037) */}
        {pathA && <path d={pathA} fill="none" stroke="#114037" strokeWidth="2.8" strokeLinecap="round" />}

        {/* Curva Bico B (Tracejada #3CA64C) */}
        {pathB && <path d={pathB} fill="none" stroke="#3CA64C" strokeWidth="2.8" strokeDasharray="5 3.5" strokeLinecap="round" />}

        {/* Linha Vertical de Pressão Atual */}
        <line
          x1={currentX}
          y1={padT}
          x2={currentX}
          y2={height - padB}
          stroke="#DC2626"
          strokeWidth="1.8"
          strokeDasharray="3 3"
        />

        {/* Ponto Bico A */}
        {currentYA !== null && (
          <g>
            <circle cx={currentX} cy={currentYA} r="6.5" fill="#114037" opacity="0.2" />
            <circle cx={currentX} cy={currentYA} r="4.5" fill="#114037" stroke="#FFFFFF" strokeWidth="2" />
          </g>
        )}

        {/* Ponto Bico B */}
        {currentYB !== null && (
          <g>
            <circle cx={currentX} cy={currentYB} r="6.5" fill="#3CA64C" opacity="0.2" />
            <circle cx={currentX} cy={currentYB} r="4.5" fill="#3CA64C" stroke="#FFFFFF" strokeWidth="2" />
          </g>
        )}

        {/* Rótulo de Pressão Atual com Badge */}
        <g>
          <rect x={currentX - 35} y={height - 18} width="70" height="16" rx="4" fill="#FEE2E2" />
          <text x={currentX} y={height - 6} textAnchor="middle" className="font-mono text-[8.5px] font-black fill-red-700">
            {formatPt(workingPressureBar, 1)} bar (Atual)
          </text>
        </g>
      </svg>
    </div>
  );
};
