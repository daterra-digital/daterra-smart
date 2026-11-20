// src/features/settings/nozzles/components/svg-schemes/SvgManualChartOverlay.tsx
import React from 'react';
import type { NozzleSlotConfig } from '../../../../../schemas/nozzle-profile.schema.ts';
import { isSlotConfigured } from '../../services/nozzleProfileMath.ts';

export const MANUAL_CHART_GEOMETRY = {
  xZero: 296,
  xMax: 616,
  maxBarW: 320,
  yTop: 32,
  yBottom: 198,
  yAxis: 212
} as const;

export function computeManualChartScale(slots: NozzleSlotConfig[]) {
  const maxFlow = Math.max(
    1.5,
    ...slots.filter((s) => s.isActive && isSlotConfigured(s)).map((s) => Math.max(s.flowAtPressureLMin * 1.15, s.measuredFlowLMin ?? 0))
  );
  const rawStep = maxFlow / 3;
  const step = rawStep <= 0.5 ? 0.5 : rawStep <= 1 ? 1 : rawStep <= 2 ? 2 : Math.ceil(rawStep);
  const axisMax = step * 3;
  const ticks = [0, step, step * 2, axisMax];
  const scaleFlow = (v: number) => Math.min(MANUAL_CHART_GEOMETRY.maxBarW, Math.max(0, (v / axisMax) * MANUAL_CHART_GEOMETRY.maxBarW));
  return { ticks, scaleFlow };
}

interface SvgManualChartOverlayProps {
  ticks: number[];
  scaleFlow: (v: number) => number;
}

export const SvgManualChartOverlay: React.FC<SvgManualChartOverlayProps> = ({ ticks, scaleFlow }) => {
  const { xZero, maxBarW, yTop, yAxis } = MANUAL_CHART_GEOMETRY;
  return (
    <g>
      {ticks.map((t, idx) => {
        const x = xZero + scaleFlow(t);
        const isZero = idx === 0;
        const lbl = t.toFixed(1).replace('.', ',');
        return (
          <g key={t}>
            <line x1={x} y1={yTop - 6} x2={x} y2={yAxis} stroke={isZero ? '#94A3B8' : '#E2E8F0'} strokeWidth={isZero ? 1.25 : 1} />
            <text x={x} y={yAxis + 12} textAnchor="middle" fontSize="8" fontWeight="700" fill="#64748B">{lbl}</text>
          </g>
        );
      })}
      <line x1={xZero} y1={yAxis} x2={xZero + maxBarW} y2={yAxis} stroke="#94A3B8" strokeWidth="1" />
      <text x={xZero + maxBarW / 2} y={244} textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#475569">
        Débito por Bico (L/min)
      </text>
    </g>
  );
};
