// src/features/settings/nozzles/components/svg-schemes/SvgTunnel3d.tsx
import React from 'react';
import type { NozzleSlotConfig, SlotSectionSide, TunnelOrientation } from '../../../../../schemas/nozzle-profile.schema.ts';
import { NOZZLES_BY_ID } from '../../../../nozzle-comparison/nozzleComparison.data.ts';
import { getNozzleColorPresentation } from '../../../../nozzle-comparison/nozzleComparison.calculations.ts';
import { resolveSlotDotFill } from './SvgUniformFanSymbol.tsx';
import { calculateFlowDeviationPct, isIso16122DeviationExceeded, isSlotConfigured } from '../../services/nozzleProfileMath.ts';
import { computeTunnelCurtainTotals, type TunnelRampFilter } from '../../services/nozzleTunnelHelpers.ts';
import { computeBilateralAxisScale } from './SvgBilateralAxisOverlay.tsx';
import { SvgTunnelPortalOverlay, TUNNEL_GEOMETRY } from './SvgTunnelPortalOverlay.tsx';

interface SvgTunnel3dProps {
  slots: NozzleSlotConfig[];
  selectedIndex: number;
  orientation?: TunnelOrientation;
  airAssisted?: boolean;
  sectors?: 2 | 4 | 6;
  activeRampFilter?: TunnelRampFilter;
  onSelectSlot: (index: number) => void;
  onSelectRampFilter?: (filter: TunnelRampFilter) => void;
}

export const SvgTunnel3d: React.FC<SvgTunnel3dProps> = ({
  slots, selectedIndex, orientation = 'BOTH', airAssisted = true, sectors = 2,
  activeRampFilter = 'LEFT_OUTER', onSelectSlot, onSelectRampFilter
}) => {
  const { xLO, xLI, xRI, xRO, xLeftBase, xRightBase, maxBarW, yTop, yBottom } = TUNNEL_GEOMETRY;
  const { ticks, scaleFlow: rawScale } = computeBilateralAxisScale(slots);
  const scaleFlow = (v: number) => rawScale(v) * (maxBarW / 252);
  const curtainTotals = computeTunnelCurtainTotals(slots);
  const sortAsc = (side: SlotSectionSide) =>
    slots.filter((s) => s.sectionSide === side).sort((a, b) => (a.levelIndex ?? 0) - (b.levelIndex ?? 0));

  const isAllMode = activeRampFilter === 'ALL';
  const focusCurtain: 'OUTER' | 'INNER' = isAllMode
    ? (slots.find((s) => s.slotIndex === selectedIndex)?.sectionSide?.includes('INNER') ? 'INNER' : 'OUTER')
    : activeRampFilter.includes('INNER') ? 'INNER' : 'OUTER';
  const showOuter = orientation === 'OUTER' || orientation === 'BOTH';
  const showInner = orientation === 'INNER' || orientation === 'BOTH';

  const getY = (i: number, total: number) =>
    total > 1 ? yBottom - 10 - (i / (total - 1)) * (yBottom - yTop - 20) : (yTop + yBottom) / 2;

  const renderRamp = (rampSlots: NozzleSlotConfig[], side: 'LEFT' | 'RIGHT', cxDot: number, isOuter: boolean, isRampActive: boolean) => {
    const dotR = rampSlots.length > 8 ? 8 : 9.5;
    const rampSide: SlotSectionSide = side === 'LEFT' ? (isOuter ? 'LEFT_OUTER' : 'LEFT_INNER') : (isOuter ? 'RIGHT_OUTER' : 'RIGHT_INNER');
    const isFocusedCurtain = (isOuter && focusCurtain === 'OUTER') || (!isOuter && focusCurtain === 'INNER');
    const showBar = isRampActive && (isAllMode || isFocusedCurtain);
    const showLabel = isRampActive && (isAllMode ? isFocusedCurtain : isFocusedCurtain);

    return rampSlots.map((slot, i) => {
      const y = getY(i, rampSlots.length);
      const isSel = slot.slotIndex === selectedIndex;
      const configured = isSlotConfigured(slot);
      const activeAndCfg = configured && slot.isActive && isRampActive;
      const actualFlow = activeAndCfg ? (slot.measuredFlowLMin ?? slot.flowAtPressureLMin) : 0;
      const barW = activeAndCfg && showBar ? scaleFlow(actualFlow) : 0;
      const minTolW = scaleFlow(slot.flowAtPressureLMin * 0.9);
      const maxTolW = scaleFlow(slot.flowAtPressureLMin * 1.1);
      const tolW = Math.max(2, maxTolW - minTolW);

      const dev = activeAndCfg ? calculateFlowDeviationPct(slot.flowAtPressureLMin, slot.measuredFlowLMin) : null;
      const isOver = isIso16122DeviationExceeded(dev);
      const barColor = !activeAndCfg ? '#CBD5E1' : isOver ? '#E11D48' : '#2563EB';
      const fill = resolveSlotDotFill(slot);
      const pres = getNozzleColorPresentation(configured ? NOZZLES_BY_ID.get(slot.nozzleId) : undefined);

      const barY = isAllMode && orientation === 'BOTH' ? (isOuter ? y - 5.5 : y + 1) : y - 5.5;
      const barH = isAllMode && orientation === 'BOTH' ? 4.5 : 11;
      const barX = side === 'LEFT' ? xLeftBase - barW : xRightBase;
      const tolX = side === 'LEFT' ? xLeftBase - maxTolW : xRightBase + minTolW;
      const labelX = side === 'LEFT' ? xLeftBase - barW - 6 : xRightBase + barW + 6;
      const isInnerPaired = isAllMode && orientation === 'BOTH' && !isOuter;

      return (
        <g key={slot.slotIndex}>
          {activeAndCfg && showLabel && (
            <rect x={tolX} y={y - 7.5} width={tolW} height={15} rx={2} fill="#10B981" fillOpacity="0.18" stroke="#059669" strokeWidth="0.75" strokeDasharray="2 1" />
          )}
          {barW > 0 && showBar && (
            <rect
              x={barX} y={barY} width={barW} height={barH} rx={2}
              fill={barColor} fillOpacity={isInnerPaired ? 0.35 : (isSel ? 1 : 0.88)}
              stroke={isInnerPaired ? barColor : 'none'} strokeWidth={isInnerPaired ? 1 : 0} strokeDasharray={isInnerPaired ? '2 1.5' : undefined}
            />
          )}
          {activeAndCfg && showLabel && (
            <text x={labelX} y={y + 3} textAnchor={side === 'LEFT' ? 'end' : 'start'} fontSize="8" fontWeight="700" fill={isOver ? '#E11D48' : '#334155'} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {actualFlow.toFixed(2).replace('.', ',')}
            </text>
          )}
          {isRampActive && (
            <g role="button" tabIndex={0} onClick={() => { onSelectSlot(slot.slotIndex); if (!isFocusedCurtain && onSelectRampFilter) onSelectRampFilter(rampSide); }} className="cursor-pointer outline-none">
              {isFocusedCurtain ? (
                <>
                  {isSel && <circle cx={cxDot} cy={y} r={dotR + 2.8} fill="none" stroke="#114037" strokeWidth="2" strokeDasharray="3 2" />}
                  <circle cx={cxDot} cy={y} r={dotR} fill={fill} stroke={configured ? '#114037' : '#94A3B8'} strokeWidth="1.4" />
                  <text x={cxDot} y={y + 2.5} textAnchor="middle" fontSize={dotR < 8.5 ? '6.5' : '7.5'} fontWeight="900" fill={!configured ? '#64748B' : pres.isDark || !slot.isActive ? '#FFFFFF' : '#0F172A'}>
                    N{slot.levelIndex ?? i + 1}
                  </text>
                </>
              ) : (
                <circle cx={cxDot} cy={y} r={3.5} fill={fill} stroke={configured ? '#114037' : '#94A3B8'} strokeWidth="1" opacity="0.85" />
              )}
            </g>
          )}
        </g>
      );
    });
  };

  return (
    <div className="w-full flex flex-col">
      <div className="w-full flex justify-center py-0.5">
        <svg viewBox="0 0 680 265" className="w-full h-auto select-none font-sans">
          <SvgTunnelPortalOverlay ticks={ticks} scaleFlow={scaleFlow} orientation={orientation} sectors={sectors} airAssisted={airAssisted} curtainTotals={curtainTotals} />
          {renderRamp(sortAsc('LEFT_OUTER'), 'LEFT', xLO, true, showOuter)}
          {renderRamp(sortAsc('LEFT_INNER'), 'LEFT', xLI, false, showInner)}
          {renderRamp(sortAsc('RIGHT_INNER'), 'RIGHT', xRI, false, showInner)}
          {renderRamp(sortAsc('RIGHT_OUTER'), 'RIGHT', xRO, true, showOuter)}
        </svg>
      </div>
      <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap pt-1.5 text-[10px] font-bold text-slate-600 border-t border-slate-100">
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#2563EB]" />Conforme (≤ 10%)</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#E11D48]" />Desvio Crítico (&gt; 10%)</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-3.5 h-2.5 rounded-xs bg-emerald-500/20 border border-dashed border-emerald-700" />Faixa Alvo ±10%</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1]" />Fechado</span>
        {isAllMode && orientation === 'BOTH' && (
          <>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-xs bg-[#2563EB]" />Exterior (sólida)</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-xs bg-[#2563EB]/35 border border-dashed border-[#2563EB]" />Interior (tracejada)</span>
          </>
        )}
      </div>
    </div>
  );
};
