import React, { useMemo } from 'react';
import { LineChart, Info } from 'lucide-react';
import type { IsoNozzleColor } from '../debitoTypes';
import { formatPt } from '../../../nozzle-comparison/nozzleComparison.calculations';

export interface UnitarioCurvaHidraulicaProps {
  selectedNozzle: IsoNozzleColor;
  pressureBar: number;
}

export const UnitarioCurvaHidraulica: React.FC<UnitarioCurvaHidraulicaProps> = ({
  selectedNozzle,
  pressureBar
}) => {
  const q0 = selectedNozzle.nominalFlow3Bar;
  const maxP = useMemo(() => {
    return Math.min(30.0, Math.max(15.0, Math.ceil((pressureBar * 1.25) / 5) * 5));
  }, [pressureBar]);

  const gridPressures = useMemo(() => {
    return maxP <= 15 ? [3, 6, 9, 12, 15] : [5, 10, 15, 20, 25, 30];
  }, [maxP]);

  // Gerar pontos da curva de 0.5 a maxP
  const { pointsNom, pathShaded, activePt, maxFlowChart } = useMemo(() => {
    const width = 440;
    const height = 140;
    const padL = 36;
    const padB = 24;
    const padT = 12;
    const padR = 16;
    const w = width - padL - padR;
    const h = height - padT - padB;

    const qMaxAt15 = q0 * Math.sqrt(maxP / 3.0) * 1.15;
    const maxQ = Math.max(1.0, Number((Math.ceil(qMaxAt15 * 2) / 2).toFixed(1)));

    const getX = (p: number) => padL + (p / maxP) * w;
    const getY = (q: number) => padT + h - (q / maxQ) * h;

    const ptsNom: { x: number; y: number; p: number; q: number }[] = [];
    const ptsUpper: { x: number; y: number }[] = [];
    const ptsLower: { x: number; y: number }[] = [];

    const steps = 30;
    for (let i = 0; i <= steps; i++) {
      const p = 0.5 + (i / steps) * (maxP - 0.5);
      const q = q0 * Math.sqrt(p / 3.0);
      const qUp = q * 1.10;
      const qLow = q * 0.90;

      const x = getX(p);
      ptsNom.push({ x, y: getY(q), p, q });
      ptsUpper.push({ x, y: getY(qUp) });
      ptsLower.push({ x, y: getY(qLow) });
    }

    // Path sombreado para a faixa de tolerância ±10%
    let shaded = `M ${ptsUpper[0].x} ${ptsUpper[0].y} `;
    ptsUpper.forEach((pt) => { shaded += `L ${pt.x} ${pt.y} `; });
    for (let i = ptsLower.length - 1; i >= 0; i--) {
      shaded += `L ${ptsLower[i].x} ${ptsLower[i].y} `;
    }
    shaded += 'Z';

    // Ponto de trabalho ativo
    const boundedP = Math.max(0.5, Math.min(maxP, pressureBar));
    const activeQ = q0 * Math.sqrt(boundedP / 3.0);
    const act = {
      x: getX(boundedP),
      y: getY(activeQ),
      flow: activeQ,
      pressure: boundedP
    };

    return { pointsNom: ptsNom, pathShaded: shaded, activePt: act, maxFlowChart: maxQ };
  }, [q0, maxP, pressureBar]);

  const pathNom = useMemo(() => {
    return pointsNom.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
  }, [pointsNom]);

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#114037] text-[#3CA64C] flex items-center justify-center shadow-xs">
            <LineChart className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C]">
              Dinâmica Hidráulica
            </span>
            <h3 className="text-base font-black text-slate-900 leading-tight">
              Curva de Pressão vs. Débito (Bico {selectedNozzle.code})
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500" />
          <span>Tolerância ISO 16122 (±10%)</span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox="0 0 440 140" className="w-full h-auto select-none overflow-visible">
          {/* Grelha de Fundo Dinâmica */}
          {gridPressures.map((p) => {
            const x = 36 + (p / maxP) * (440 - 36 - 16);
            return (
              <g key={p}>
                <line x1={x} y1={12} x2={x} y2={116} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                <text x={x} y={130} fill="#94A3B8" fontSize="8" fontWeight="bold" textAnchor="middle">{p}b</text>
              </g>
            );
          })}
          <text x={26} y={16} fill="#94A3B8" fontSize="8" fontWeight="bold" textAnchor="end">{formatPt(maxFlowChart)}</text>
          <text x={26} y={116} fill="#94A3B8" fontSize="8" fontWeight="bold" textAnchor="end">0</text>

          {/* Faixa Sombreada de Tolerância ±10% */}
          <path d={pathShaded} fill="#10B981" fillOpacity="0.18" />

          {/* Curva Nominal */}
          <path d={pathNom} fill="none" stroke="#114037" strokeWidth="2.5" strokeLinecap="round" />

          {/* Marcador Concêntrico Estático Ancorado */}
          <circle cx={activePt.x} cy={activePt.y} r="7" fill="#3CA64C" fillOpacity="0.20" />
          <circle cx={activePt.x} cy={activePt.y} r="3.5" fill="#114037" stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between text-xs font-bold text-slate-700">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#3CA64C]" />
          <span>Ponto Selecionado:</span>
          <span className="font-mono text-[#114037]">{formatPt(pressureBar)} bar</span>
        </div>
        <div className="font-mono text-[#114037]">
          Débito: <strong>{formatPt(activePt.flow)} L/min</strong>
        </div>
      </div>
    </div>
  );
};
