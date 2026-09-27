import React from 'react';
import { X } from 'lucide-react';
import type { Nozzle, CalculatedNozzleFlow } from './nozzleComparison.types';
import { formatPt } from './nozzleComparison.calculations';

export interface NozzleCurvesModalProps {
  isOpen: boolean;
  onClose: () => void;
  nozzleA?: Nozzle;
  nozzleB?: Nozzle;
  flowA?: CalculatedNozzleFlow;
  flowB?: CalculatedNozzleFlow;
  workingPressureBar: number;
}

export const NozzleCurvesModal: React.FC<NozzleCurvesModalProps> = ({
  isOpen,
  onClose,
  nozzleA,
  nozzleB,
  flowA,
  flowB,
  workingPressureBar
}) => {
  if (!isOpen) return null;

  const maxP = Math.max(
    30,
    nozzleA?.pressureMaxBar || 30,
    nozzleB?.pressureMaxBar || 30
  );

  const pressures = [0, 5, 10, 15, 20, 25, 30].filter(p => p <= maxP);

  const formatNozzleFullName = (nozzle?: Nozzle) => {
    if (!nozzle) return 'Não selecionado';
    const colorPart = nozzle.color || nozzle.disc || 'Ref';
    const codePart = nozzle.isoCode ? `(${nozzle.isoCode})` : '(ND)';
    return `${nozzle.brand} ${nozzle.model} ${colorPart} ${codePart}`;
  };

  // Calcular pontos das curvas segundo a lei física q = q0 * sqrt(p / p0)
  const getPoints = (nozzle?: Nozzle) => {
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

  const pointsA = getPoints(nozzleA);
  const pointsB = getPoints(nozzleB);

  const maxQ = Math.max(
    2.5,
    ...pointsA.map(pt => pt.q),
    ...pointsB.map(pt => pt.q)
  );

  // Dimensões do SVG
  const width = 360;
  const height = 220;
  const padL = 40;
  const padR = 20;
  const padT = 20;
  const padB = 35;

  const toSvgX = (p: number) => padL + (p / maxP) * (width - padL - padR);
  const toSvgY = (q: number) => height - padB - (q / maxQ) * (height - padT - padB);

  const pathA = pointsA.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(pt.p).toFixed(1)} ${toSvgY(pt.q).toFixed(1)}`).join(' ');
  const pathB = pointsB.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(pt.p).toFixed(1)} ${toSvgY(pt.q).toFixed(1)}`).join(' ');

  const currentX = toSvgX(workingPressureBar);
  const currentYA = flowA ? toSvgY(flowA.flowLMin) : 0;
  const currentYB = flowB ? toSvgY(flowB.flowLMin) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in font-sans">
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-daterra-accent">
              Comparativo Hidráulico
            </span>
            <h3 className="text-base font-black text-slate-900 leading-tight">
              Curvas de Pressão vs. Débito
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Comparativo de performance em regime contínuo
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legenda dos Bicos alinhada ao centro na vertical */}
        <div className="px-4 py-2.5 flex flex-col items-center justify-center gap-1.5 text-xs text-center border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1.5 bg-[#114037] rounded-full shrink-0" />
            <span className="font-bold text-slate-800 text-[11px] sm:text-xs">
              Bico A | {formatNozzleFullName(nozzleA)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1.5 border-b-2 border-dashed border-[#3CA64C] shrink-0" />
            <span className="font-bold text-slate-800 text-[11px] sm:text-xs">
              Bico B | {formatNozzleFullName(nozzleB)}
            </span>
          </div>
        </div>

        {/* Gráfico SVG */}
        <div className="p-4 bg-slate-50/50 flex flex-col items-center">
          <div className="w-full max-w-sm bg-white p-3 rounded-2xl border border-slate-200 shadow-inner">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
              {/* Linhas de grelha horizontais */}
              {[0.5, 1.0, 1.5, 2.0, 2.5].filter(q => q <= maxQ).map(q => (
                <g key={q}>
                  <line
                    x1={padL}
                    y1={toSvgY(q)}
                    x2={width - padR}
                    y2={toSvgY(q)}
                    stroke="#E2E8F0"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={padL - 6}
                    y={toSvgY(q) + 3}
                    textAnchor="end"
                    className="font-mono text-[9px] fill-slate-400 font-semibold"
                  >
                    {formatPt(q, 1)}
                  </text>
                </g>
              ))}

              {/* Linhas de grelha verticais e rótulos de pressão */}
              {pressures.filter((_, idx) => idx % 2 === 0).map(p => (
                <g key={p}>
                  <line
                    x1={toSvgX(p)}
                    y1={padT}
                    x2={toSvgX(p)}
                    y2={height - padB}
                    stroke="#F1F5F9"
                  />
                  <text
                    x={toSvgX(p)}
                    y={height - padB + 14}
                    textAnchor="middle"
                    className="font-mono text-[9px] fill-slate-500 font-semibold"
                  >
                    {p} bar
                  </text>
                </g>
              ))}

              {/* Curva Bico A (linha contínua #114037) */}
              {pathA && (
                <path
                  d={pathA}
                  fill="none"
                  stroke="#114037"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Curva Bico B (linha tracejada #3CA64C) */}
              {pathB && (
                <path
                  d={pathB}
                  fill="none"
                  stroke="#3CA64C"
                  strokeWidth="2.5"
                  strokeDasharray="4 3"
                  strokeLinecap="round"
                />
              )}

              {/* Linha vertical de Pressão Atual */}
              <line
                x1={currentX}
                y1={padT}
                x2={currentX}
                y2={height - padB}
                stroke="#DC2626"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* Ponto Bico A */}
              {flowA && (
                <circle
                  cx={currentX}
                  cy={currentYA}
                  r="4"
                  fill="#114037"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              )}

              {/* Ponto Bico B */}
              {flowB && (
                <circle
                  cx={currentX}
                  cy={currentYB}
                  r="4"
                  fill="#3CA64C"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              )}

              {/* Rótulo de Pressão Atual */}
              <text
                x={currentX}
                y={height - 4}
                textAnchor="middle"
                className="font-mono text-[9px] fill-red-600 font-bold"
              >
                {formatPt(workingPressureBar, 1)} bar (Atual)
              </text>
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full max-w-sm mt-3 text-center">
            <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold block">Débito Bico A</span>
              <span className="font-mono text-sm font-bold text-[#114037]">
                {flowA ? `${formatPt(flowA.flowLMin)} L/min` : '—'}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold block">Débito Bico B</span>
              <span className="font-mono text-sm font-bold text-[#3CA64C]">
                {flowB ? `${formatPt(flowB.flowLMin)} L/min` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 h-12 rounded-xl bg-daterra-primary text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            Fechar Gráfico
          </button>
        </div>
      </div>
    </div>
  );
};
