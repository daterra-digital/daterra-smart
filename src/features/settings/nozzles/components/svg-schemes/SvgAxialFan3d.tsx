// src/features/settings/nozzles/components/svg-schemes/SvgAxialFan3d.tsx
import React from 'react';
import type { NozzleSlotConfig } from '../../../../../schemas/nozzle-profile.schema.ts';
import { NOZZLES_BY_ID } from '../../../../nozzle-comparison/nozzleComparison.data.ts';
import { getNozzleColorPresentation } from '../../../../nozzle-comparison/nozzleComparison.calculations.ts';
import { resolveSlotDotFill, SvgUniformFanSymbol } from './SvgUniformFanSymbol.tsx';
import {
  calculateFlowDeviationPct,
  isIso16122DeviationExceeded,
  isSlotConfigured
} from '../../services/nozzleProfileMath.ts';
import {
  BILATERAL_AXIS_GEOMETRY,
  computeBilateralAxisScale,
  SvgBilateralAxisOverlay
} from './SvgBilateralAxisOverlay.tsx';

interface SvgAxialFan3dProps {
  slots: NozzleSlotConfig[];
  selectedIndex: number;
  airAssisted?: boolean;
  sectors?: 2 | 4 | 6;
  onSelectSlot: (index: number) => void;
}

export const SvgAxialFan3d: React.FC<SvgAxialFan3dProps> = ({
  slots,
  selectedIndex,
  airAssisted = true,
  sectors = 2,
  onSelectSlot
}) => {
  const leftSlots = slots.filter((s) => s.sectionSide === 'LEFT').sort((a, b) => (a.levelIndex ?? 0) - (b.levelIndex ?? 0));
  const rightSlots = slots.filter((s) => s.sectionSide === 'RIGHT').sort((a, b) => (a.levelIndex ?? 0) - (b.levelIndex ?? 0));

  const { cx, xL, xR, xLeftBase, xRightBase, maxBarW, yTop, yBottom } = BILATERAL_AXIS_GEOMETRY;
  const { ticks, scaleFlow } = computeBilateralAxisScale(slots);
  const sectorsPerSide = sectors / 2;

  const getY = (i: number, total: number) =>
    total > 1 ? yBottom - (i / (total - 1)) * (yBottom - yTop) : (yTop + yBottom) / 2;

  const renderFlank = (flankSlots: NozzleSlotConfig[], side: 'LEFT' | 'RIGHT') =>
    flankSlots.map((slot, i) => {
      const y = getY(i, flankSlots.length);
      const isSel = slot.slotIndex === selectedIndex;
      const configured = isSlotConfigured(slot);
      const activeAndConfigured = configured && slot.isActive;
      const actualFlow = activeAndConfigured ? (slot.measuredFlowLMin ?? slot.flowAtPressureLMin) : 0;
      const barW = activeAndConfigured ? scaleFlow(actualFlow) : 0;
      const minTolW = scaleFlow(slot.flowAtPressureLMin * 0.9);
      const maxTolW = scaleFlow(slot.flowAtPressureLMin * 1.1);
      const tolW = Math.max(2, maxTolW - minTolW);

      const dev = activeAndConfigured ? calculateFlowDeviationPct(slot.flowAtPressureLMin, slot.measuredFlowLMin) : null;
      const isOver = isIso16122DeviationExceeded(dev);
      const barColor = !activeAndConfigured ? '#CBD5E1' : isOver ? '#E11D48' : '#2563EB';
      const fill = resolveSlotDotFill(slot);
      const pres = getNozzleColorPresentation(NOZZLES_BY_ID.get(slot.nozzleId));

      const dotX = side === 'LEFT' ? xL : xR;
      const barX = side === 'LEFT' ? xLeftBase - barW : xRightBase;
      const tolX = side === 'LEFT' ? xLeftBase - maxTolW : xRightBase + minTolW;
      const labelX = side === 'LEFT' ? xLeftBase - barW - 6 : xRightBase + barW + 6;
      const anchor = side === 'LEFT' ? 'end' : 'start';

      return (
        <g key={slot.slotIndex}>
          {activeAndConfigured && (
            <rect
              x={tolX}
              y={y - 7}
              width={tolW}
              height={14}
              rx={2}
              fill="#10B981"
              fillOpacity="0.18"
              stroke="#059669"
              strokeWidth="0.75"
              strokeDasharray="2 1"
            />
          )}
          {barW > 0 && (
            <rect x={barX} y={y - 4.5} width={barW} height={9} rx={2.5} fill={barColor} opacity={isSel ? 1 : 0.88} />
          )}
          {activeAndConfigured && (
            <text
              x={labelX}
              y={y + 3}
              textAnchor={anchor}
              fontSize="8"
              fontWeight="700"
              fill={isOver ? '#E11D48' : '#334155'}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {actualFlow.toFixed(2).replace('.', ',')}
            </text>
          )}
          <g role="button" tabIndex={0} onClick={() => onSelectSlot(slot.slotIndex)} className="cursor-pointer outline-none">
            {isSel && <circle cx={dotX} cy={y} r={12.5} fill="none" stroke="#114037" strokeWidth="2" strokeDasharray="3 2" />}
            <circle cx={dotX} cy={y} r={9.5} fill={fill} stroke={configured ? '#114037' : '#94A3B8'} strokeWidth="1.5" />
            <text
              x={dotX}
              y={y + 3}
              textAnchor="middle"
              fontSize="8"
              fontWeight="900"
              fill={!configured ? '#64748B' : pres.isDark || !slot.isActive ? '#FFFFFF' : '#0F172A'}
            >
              N{slot.levelIndex ?? i + 1}
            </text>
          </g>
        </g>
      );
    });

  return (
    <div className="w-full flex flex-col">
      <div className="w-full flex justify-center py-0.5">
        <svg viewBox="0 0 680 250" className="w-full h-auto select-none font-sans">
          <SvgBilateralAxisOverlay ticks={ticks} scaleFlow={scaleFlow} />

          <text x={xL} y={16} textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#114037">ESQ.</text>
          <text x={xR} y={16} textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#114037">DIR.</text>

          {airAssisted && <SvgUniformFanSymbol cx={cx} cy={111} radius={16} showFrontTriangle triangleOffset={5} />}

          <line x1={xL} y1={yTop - 6} x2={xL} y2={yBottom + 10} stroke="#114037" strokeWidth="2.5" strokeLinecap="round" />
          <line x1={xR} y1={yTop - 6} x2={xR} y2={yBottom + 10} stroke="#114037" strokeWidth="2.5" strokeLinecap="round" />
          <line x1={xL} y1={yBottom + 10} x2={xR} y2={yBottom + 10} stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 3" />

          {sectorsPerSide > 1 &&
            Array.from({ length: sectorsPerSide - 1 }, (_, d) => {
              const y = yBottom - ((d + 1) / sectorsPerSide) * (yBottom - yTop);
              return (
                <g key={d} stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 2">
                  <line x1={xLeftBase - maxBarW} y1={y} x2={xL - 10} y2={y} />
                  <line x1={xR + 10} y1={y} x2={xRightBase + maxBarW} y2={y} />
                </g>
              );
            })}

          {renderFlank(leftSlots, 'LEFT')}
          {renderFlank(rightSlots, 'RIGHT')}
        </svg>
      </div>

      {/* Legenda Bilateral ISO 16122-3 */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap pt-1.5 text-[10px] font-bold text-slate-600 border-t border-slate-100">
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#2563EB]" />Conforme (≤ 10%)</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#E11D48]" />Desvio Crítico (&gt; 10%)</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-3.5 h-2.5 rounded-xs bg-emerald-500/20 border border-dashed border-emerald-700" />Faixa Alvo ±10%</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1]" />Fechado</span>
      </div>
    </div>
  );
};
