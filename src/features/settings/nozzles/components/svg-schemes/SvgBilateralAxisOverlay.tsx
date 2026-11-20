// src/features/settings/nozzles/components/svg-schemes/SvgBilateralAxisOverlay.tsx
import React from 'react';
import type { NozzleSlotConfig } from '../../../../../schemas/nozzle-profile.schema.ts';

export const BILATERAL_AXIS_GEOMETRY = {
  cx: 340,
  xL: 300,
  xR: 380,
  xLeftBase: 282,
  xRightBase: 398,
  maxBarW: 252,
  yTop: 30,
  yBottom: 192,
  yAxis: 204
} as const;

const NICE_STEPS = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0];

export function computeBilateralAxisScale(slots: NozzleSlotConfig[]) {
  const rawMax = Math.max(
    ...slots.map((s) => Math.max(s.flowAtPressureLMin, s.measuredFlowLMin ?? 0)),
    1.2
  );
  const targetMax = rawMax * 1.12;
  const step = NICE_STEPS.find((st) => st * 3 >= targetMax) ?? Math.ceil(targetMax / 3);
  const maxAxis = step * 3;
  const ticks = [0, step, step * 2, maxAxis];
  const scaleFlow = (flow: number): number =>
    Math.min(BILATERAL_AXIS_GEOMETRY.maxBarW, Math.max(0, (flow / maxAxis) * BILATERAL_AXIS_GEOMETRY.maxBarW));

  return { step, maxAxis, ticks, scaleFlow };
}

interface SvgBilateralAxisOverlayProps {
  ticks: number[];
  scaleFlow: (flow: number) => number;
}

export const SvgBilateralAxisOverlay: React.FC<SvgBilateralAxisOverlayProps> = ({
  ticks,
  scaleFlow
}) => {
  const { xLeftBase, xRightBase, maxBarW, yTop, yAxis } = BILATERAL_AXIS_GEOMETRY;
  const formatTick = (val: number) => (val === 0 ? '0' : val.toFixed(1).replace('.', ','));

  return (
    <g className="select-none">
      {/* Linhas verticais de grelha + Marcas graduadas Esquerda e Direita */}
      {ticks.map((t) => {
        const offset = scaleFlow(t);
        const lx = xLeftBase - offset;
        const rx = xRightBase + offset;
        const isZero = t === 0;
        return (
          <g key={t}>
            <line
              x1={lx}
              y1={yTop - 6}
              x2={lx}
              y2={yAxis}
              stroke={isZero ? '#94A3B8' : '#E2E8F0'}
              strokeWidth={isZero ? '1.25' : '1'}
            />
            <line
              x1={rx}
              y1={yTop - 6}
              x2={rx}
              y2={yAxis}
              stroke={isZero ? '#94A3B8' : '#E2E8F0'}
              strokeWidth={isZero ? '1.25' : '1'}
            />
            <line x1={lx} y1={yAxis} x2={lx} y2={yAxis + 4} stroke="#64748B" strokeWidth="1.25" />
            <line x1={rx} y1={yAxis} x2={rx} y2={yAxis + 4} stroke="#64748B" strokeWidth="1.25" />
            <text
              x={lx}
              y={yAxis + 15}
              textAnchor="middle"
              fontSize="8.5"
              fontWeight="700"
              fill="#64748B"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {formatTick(t)}
            </text>
            <text
              x={rx}
              y={yAxis + 15}
              textAnchor="middle"
              fontSize="8.5"
              fontWeight="700"
              fill="#64748B"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {formatTick(t)}
            </text>
          </g>
        );
      })}

      {/* Eixos horizontais X calibrados na base (y=204) */}
      <line x1={xLeftBase - maxBarW} y1={yAxis} x2={xLeftBase} y2={yAxis} stroke="#64748B" strokeWidth="1.25" />
      <line x1={xRightBase} y1={yAxis} x2={xRightBase + maxBarW} y2={yAxis} stroke="#64748B" strokeWidth="1.25" />

      {/* Rótulos explícitos de eixo */}
      <text x={xLeftBase - maxBarW / 2} y={yAxis + 29} textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#475569">
        Débito por Bico (L/min)
      </text>
      <text x={xRightBase + maxBarW / 2} y={yAxis + 29} textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#475569">
        Débito por Bico (L/min)
      </text>
    </g>
  );
};
