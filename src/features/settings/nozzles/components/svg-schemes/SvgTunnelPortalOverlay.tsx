// src/features/settings/nozzles/components/svg-schemes/SvgTunnelPortalOverlay.tsx
import React from 'react';
import type { TunnelOrientation } from '../../../../../schemas/nozzle-profile.schema.ts';
import { SvgUniformFanSymbol } from './SvgUniformFanSymbol.tsx';

export const TUNNEL_GEOMETRY = {
  cx: 340,
  xLO: 300,
  xLI: 314,
  xRI: 366,
  xRO: 380,
  xLeftBase: 282,
  xRightBase: 398,
  maxBarW: 254,
  yTop: 42,
  yBottom: 204,
  yAxis: 216
} as const;

interface SvgTunnelPortalOverlayProps {
  ticks: number[];
  scaleFlow: (v: number) => number;
  orientation: TunnelOrientation;
  sectors: 2 | 4 | 6;
  airAssisted: boolean;
  curtainTotals: { leftOuter: number; leftInner: number; rightInner: number; rightOuter: number };
}

const fmt = (v: number) => v.toFixed(2).replace('.', ',');

export const SvgTunnelPortalOverlay: React.FC<SvgTunnelPortalOverlayProps> = ({
  ticks,
  scaleFlow,
  orientation,
  sectors,
  airAssisted,
  curtainTotals
}) => {
  const { cx, xLO, xLI, xRI, xRO, xLeftBase, xRightBase, maxBarW, yTop, yBottom, yAxis } = TUNNEL_GEOMETRY;
  const showOuter = orientation === 'OUTER' || orientation === 'BOTH';
  const showInner = orientation === 'INNER' || orientation === 'BOTH';
  const sectorsPerSide = sectors / 2;

  return (
    <g>
      <text x={155} y={14} textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#114037">ESQUERDA</text>
      <text x={155} y={26} textAnchor="middle" fontSize="7.8" fontWeight="700" fill="#475569" style={{ fontVariantNumeric: 'tabular-nums' }}>
        Ext: {fmt(curtainTotals.leftOuter)} · Int: {fmt(curtainTotals.leftInner)} L/min
      </text>

      <text x={525} y={14} textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#114037">DIREITA</text>
      <text x={525} y={26} textAnchor="middle" fontSize="7.8" fontWeight="700" fill="#475569" style={{ fontVariantNumeric: 'tabular-nums' }}>
        Ext: {fmt(curtainTotals.rightOuter)} · Int: {fmt(curtainTotals.rightInner)} L/min
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
      <text x={155} y={248} textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#475569">Débito por Bico (L/min)</text>
      <text x={525} y={248} textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#475569">Débito por Bico (L/min)</text>

      {/* Pórtico Central Limpo (x: 292..388, corredor de 14 px) */}
      <rect x={xLO} y={yTop} width={xLI - xLO} height={yBottom - yTop} fill="#F8FAFC" fillOpacity="0.8" />
      <rect x={xRI} y={yTop} width={xRO - xRI} height={yBottom - yTop} fill="#F8FAFC" fillOpacity="0.8" />
      <line x1={xLO} y1={yTop} x2={xRO} y2={yTop} stroke="#114037" strokeWidth="2" strokeLinecap="round" />

      <line x1={xLO} y1={yTop} x2={xLO} y2={yBottom} stroke={showOuter ? '#114037' : '#CBD5E1'} strokeWidth={showOuter ? 1.75 : 1} />
      <line x1={xLI} y1={yTop} x2={xLI} y2={yBottom} stroke={showInner ? '#114037' : '#CBD5E1'} strokeWidth={showInner ? 1.75 : 1} strokeDasharray="4 3" />
      <line x1={xRI} y1={yTop} x2={xRI} y2={yBottom} stroke={showInner ? '#114037' : '#CBD5E1'} strokeWidth={showInner ? 1.75 : 1} strokeDasharray="4 3" />
      <line x1={xRO} y1={yTop} x2={xRO} y2={yBottom} stroke={showOuter ? '#114037' : '#CBD5E1'} strokeWidth={showOuter ? 1.75 : 1} />

      {sectorsPerSide > 1 &&
        Array.from({ length: sectorsPerSide - 1 }, (_, d) => {
          const y = yBottom - ((d + 1) / sectorsPerSide) * (yBottom - yTop);
          return (
            <g key={d} stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 2">
              <line x1={xLeftBase - maxBarW} y1={y} x2={xLI} y2={y} />
              <line x1={xRI} y1={y} x2={xRightBase + maxBarW} y2={y} />
            </g>
          );
        })}

      {airAssisted && <SvgUniformFanSymbol cx={cx} cy={123} radius={13} showFrontTriangle triangleOffset={4} />}
    </g>
  );
};
