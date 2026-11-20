// src/features/settings/nozzles/components/svg-schemes/SvgBoomAxisOverlay.tsx
import React from 'react';
import type { NozzleSlotConfig } from '../../../../../schemas/nozzle-profile.schema.ts';

export const BOOM_AXIS_GEOMETRY = {
  xAxis: 62,
  xStart: 76,
  xEnd: 650,
  yTop: 42,
  yBoom: 198,
  maxBarH: 144
} as const;

const NICE_STEPS = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0];

export function computeBoomAxisScale(slots: NozzleSlotConfig[]) {
  const rawMax = Math.max(
    ...slots.map((s) => Math.max(s.flowAtPressureLMin, s.measuredFlowLMin ?? 0)),
    1.2
  );
  const targetMax = rawMax * 1.15;
  const step = NICE_STEPS.find((st) => st * 3 >= targetMax) ?? Math.ceil(targetMax / 3);
  const maxAxis = step * 3;
  const ticks = [0, step, step * 2, maxAxis];
  const scaleFlowH = (flow: number): number =>
    Math.min(BOOM_AXIS_GEOMETRY.maxBarH, Math.max(0, (flow / maxAxis) * BOOM_AXIS_GEOMETRY.maxBarH));
  return { step, maxAxis, ticks, scaleFlowH };
}

interface SvgBoomAxisOverlayProps {
  ticks: number[];
  scaleFlowH: (flow: number) => number;
}

export const SvgBoomAxisOverlay: React.FC<SvgBoomAxisOverlayProps> = ({ ticks, scaleFlowH }) => {
  const { xAxis, xStart, xEnd, yTop, yBoom } = BOOM_AXIS_GEOMETRY;
  const formatTick = (val: number) => (val === 0 ? '0' : val.toFixed(1).replace('.', ','));

  return (
    <g className="select-none">
      {ticks.map((t) => {
        const y = yBoom - scaleFlowH(t);
        const isZero = t === 0;
        return (
          <g key={t}>
            <line
              x1={xAxis}
              y1={y}
              x2={xEnd}
              y2={y}
              stroke={isZero ? '#114037' : '#E2E8F0'}
              strokeWidth={isZero ? '2.25' : '1'}
            />
            <line x1={xAxis - 4} y1={y} x2={xAxis} y2={y} stroke="#475569" strokeWidth="1.25" />
            <text
              x={xAxis - 8}
              y={y + 3.5}
              textAnchor="end"
              fontSize="9.5"
              fontWeight="700"
              fill="#334155"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {formatTick(t)}
            </text>
          </g>
        );
      })}

      <line x1={xAxis} y1={yTop - 8} x2={xAxis} y2={yBoom} stroke="#475569" strokeWidth="1.25" />

      <text
        x={16}
        y={(yTop + yBoom) / 2}
        textAnchor="middle"
        fontSize="9.5"
        fontWeight="800"
        fill="#1E293B"
        transform={`rotate(-90 16 ${(yTop + yBoom) / 2})`}
      >
        Débito por Bico (L/min)
      </text>

      <line x1={xStart - 10} y1={yBoom} x2={xEnd} y2={yBoom} stroke="#114037" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
};
