// src/features/settings/nozzles/components/svg-schemes/SvgPneumaticCollectorOverlay.tsx
import React from 'react';
import { SvgUniformFanSymbol } from './SvgUniformFanSymbol.tsx';

export const PNEUMATIC_GEOMETRY = {
  cx: 340,
  xLeftBase: 276,
  xRightBase: 404,
  maxBarW: 248,
  yTop: 42,
  yBottom: 196,
  yAxis: 216
} as const;

interface SvgPneumaticCollectorOverlayProps {
  ticks: number[];
  scaleFlow: (v: number) => number;
  airAssisted?: boolean;
  flankTotals: { leftTotal: number; rightTotal: number };
}

const fmt = (v: number) => v.toFixed(2).replace('.', ',');

export const SvgPneumaticCollectorOverlay: React.FC<SvgPneumaticCollectorOverlayProps> = ({
  ticks,
  scaleFlow,
  airAssisted = true,
  flankTotals
}) => {
  const { cx, xLeftBase, xRightBase, maxBarW, yTop, yAxis } = PNEUMATIC_GEOMETRY;

  return (
    <g>
      <text x={152} y={14} textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#114037">ESQUERDA</text>
      <text x={152} y={26} textAnchor="middle" fontSize="7.8" fontWeight="700" fill="#475569" style={{ fontVariantNumeric: 'tabular-nums' }}>
        Total Esq.: {fmt(flankTotals.leftTotal)} L/min
      </text>

      <text x={528} y={14} textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#114037">DIREITA</text>
      <text x={528} y={26} textAnchor="middle" fontSize="7.8" fontWeight="700" fill="#475569" style={{ fontVariantNumeric: 'tabular-nums' }}>
        Total Dir.: {fmt(flankTotals.rightTotal)} L/min
      </text>

      {ticks.map((t, idx) => {
        const dx = scaleFlow(t);
        const lx = xLeftBase - dx;
        const rx = xRightBase + dx;
        const isZero = idx === 0;
        const lbl = t.toFixed(1).replace('.', ',');
        return (
          <g key={t}>
            <line x1={lx} y1={yTop - 6} x2={lx} y2={yAxis} stroke={isZero ? '#94A3B8' : '#E2E8F0'} strokeWidth={isZero ? 1.2 : 1} />
            <line x1={rx} y1={yTop - 6} x2={rx} y2={yAxis} stroke={isZero ? '#94A3B8' : '#E2E8F0'} strokeWidth={isZero ? 1.2 : 1} />
            <text x={lx} y={yAxis + 12} textAnchor="middle" fontSize="8" fontWeight="700" fill="#64748B">{lbl}</text>
            <text x={rx} y={yAxis + 12} textAnchor="middle" fontSize="8" fontWeight="700" fill="#64748B">{lbl}</text>
          </g>
        );
      })}

      <line x1={xLeftBase - maxBarW} y1={yAxis} x2={xLeftBase} y2={yAxis} stroke="#94A3B8" strokeWidth="1" />
      <line x1={xRightBase} y1={yAxis} x2={xRightBase + maxBarW} y2={yAxis} stroke="#94A3B8" strokeWidth="1" />
      <text x={152} y={248} textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#475569">Débito por Bico (L/min)</text>
      <text x={528} y={248} textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#475569">Débito por Bico (L/min)</text>

      {airAssisted && <SvgUniformFanSymbol cx={cx} cy={118} radius={15} showFrontTriangle triangleOffset={4} />}
    </g>
  );
};
