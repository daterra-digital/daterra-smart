// src/features/settings/nozzles/components/svg-schemes/SvgDroneChartOverlay.tsx
import React from 'react';
import type { NozzleSlotConfig } from '../../../../../schemas/nozzle-profile.schema.ts';
import { isSlotConfigured } from '../../services/nozzleProfileMath.ts';

export const DRONE_CHART_GEOMETRY = {
  xStart: 288,
  xEnd: 652,
  yTop: 42,
  yBottom: 198,
  chartH: 156
} as const;

export function computeDroneChartScale(slots: NozzleSlotConfig[]) {
  const maxFlow = Math.max(
    1.5,
    ...slots.filter((s) => s.isActive && isSlotConfigured(s)).map((s) => Math.max(s.flowAtPressureLMin * 1.15, s.measuredFlowLMin ?? 0))
  );
  const rawStep = maxFlow / 3;
  const step = rawStep <= 0.5 ? 0.5 : rawStep <= 1 ? 1 : rawStep <= 2 ? 2 : Math.ceil(rawStep);
  const axisMax = step * 3;
  const ticks = [0, step, step * 2, axisMax];
  const scaleH = (v: number) => Math.min(DRONE_CHART_GEOMETRY.chartH, Math.max(0, (v / axisMax) * DRONE_CHART_GEOMETRY.chartH));
  return { ticks, scaleH };
}

interface SvgDroneChartOverlayProps {
  ticks: number[];
  scaleH: (v: number) => number;
  showCenterDivider: boolean;
  dividerX: number;
}

export const SvgDroneChartOverlay: React.FC<SvgDroneChartOverlayProps> = ({
  ticks,
  scaleH,
  showCenterDivider,
  dividerX
}) => {
  const { xStart, xEnd, yTop, yBottom } = DRONE_CHART_GEOMETRY;
  return (
    <g>
      <text x={(xStart + xEnd) / 2} y={18} textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#475569">
        Débito por Bico (L/min)
      </text>

      {ticks.map((t, idx) => {
        const y = yBottom - scaleH(t);
        const isZero = idx === 0;
        const lbl = t.toFixed(1).replace('.', ',');
        return (
          <g key={t}>
            <line x1={xStart} y1={y} x2={xEnd} y2={y} stroke={isZero ? '#94A3B8' : '#E2E8F0'} strokeWidth={isZero ? 1.25 : 1} />
            <text x={xStart - 6} y={y + 3} textAnchor="end" fontSize="7.8" fontWeight="700" fill="#64748B">{lbl}</text>
          </g>
        );
      })}

      {showCenterDivider && (
        <g>
          <line x1={dividerX} y1={yTop - 6} x2={dividerX} y2={yBottom + 6} stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
          <text x={(xStart + dividerX) / 2} y={232} textAnchor="middle" fontSize="7.8" fontWeight="900" fill="#114037">ESQUERDA</text>
          <text x={(dividerX + xEnd) / 2} y={232} textAnchor="middle" fontSize="7.8" fontWeight="900" fill="#114037">DIREITA</text>
        </g>
      )}
    </g>
  );
};
