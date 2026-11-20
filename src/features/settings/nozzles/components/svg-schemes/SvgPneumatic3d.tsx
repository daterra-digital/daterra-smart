// src/features/settings/nozzles/components/svg-schemes/SvgPneumatic3d.tsx
import React from 'react';
import type { NozzleSlotConfig } from '../../../../../schemas/nozzle-profile.schema.ts';
import { NOZZLES_BY_ID } from '../../../../nozzle-comparison/nozzleComparison.data.ts';
import { getNozzleColorPresentation } from '../../../../nozzle-comparison/nozzleComparison.calculations.ts';
import { resolveSlotDotFill } from './SvgUniformFanSymbol.tsx';
import { calculateFlowDeviationPct, isIso16122DeviationExceeded, isSlotConfigured } from '../../services/nozzleProfileMath.ts';
import { computePneumaticFlankTotals, type PneumaticArmFilter } from '../../services/nozzlePneumaticHelpers.ts';
import { computeBilateralAxisScale } from './SvgBilateralAxisOverlay.tsx';
import { PNEUMATIC_GEOMETRY, SvgPneumaticCollectorOverlay } from './SvgPneumaticCollectorOverlay.tsx';

interface SvgPneumatic3dProps {
  slots: NozzleSlotConfig[];
  selectedIndex: number;
  arms?: number;
  airAssisted?: boolean;
  activeArmFilter?: PneumaticArmFilter;
  onSelectSlot: (index: number) => void;
  onSelectArmFilter?: (filter: PneumaticArmFilter) => void;
}

export const SvgPneumatic3d: React.FC<SvgPneumatic3dProps> = ({
  slots, selectedIndex, arms = 6, airAssisted = true, activeArmFilter = 'LEFT_1', onSelectSlot, onSelectArmFilter
}) => {
  const { xLeftBase, xRightBase, maxBarW, yTop, yBottom } = PNEUMATIC_GEOMETRY;
  const safeArms = [2, 4, 6, 8].includes(arms) ? arms : 6;
  const armsPerSide = safeArms / 2;
  const { ticks, scaleFlow: rawScale } = computeBilateralAxisScale(slots);
  const scaleFlow = (v: number) => rawScale(v) * (maxBarW / 252);
  const flankTotals = computePneumaticFlankTotals(slots);

  const isAllMode = activeArmFilter === 'ALL';
  const focusArmMatch = /^(LEFT|RIGHT)_(\d+)$/.exec(activeArmFilter);
  const focusArmIdx = focusArmMatch ? Number(focusArmMatch[2]) : 1;

  const getArmSlots = (side: 'LEFT' | 'RIGHT', armIdx: number) =>
    slots.filter((s) => s.sectionSide === side && (s.armIndex ?? 1) === armIdx).sort((a, b) => (a.levelIndex ?? 0) - (b.levelIndex ?? 0));

  const renderSide = (side: 'LEFT' | 'RIGHT') => {
    const dotX = side === 'LEFT' ? 296 : 384;
    const flankSlots = Array.from({ length: armsPerSide }, (_, idx) => getArmSlots(side, idx + 1));
    const totalFlankCount = flankSlots.reduce((acc, l) => acc + l.length, 0);
    const labelStep = isAllMode && totalFlankCount > 10 ? Math.ceil(totalFlankCount / 8) : 1;
    let globalPos = 0;

    return flankSlots.map((armSlots, idx) => {
      const armNum = idx + 1;
      const isFocusedArm = !isAllMode && armNum === focusArmIdx;
      const armFrac = armsPerSide > 1 ? idx / (armsPerSide - 1) : 0.5;
      const armCenterY = yBottom - 16 - armFrac * (yBottom - yTop - 32);
      const focusedSlots = isFocusedArm ? armSlots : [];
      const armRowCount = isAllMode ? totalFlankCount : focusedSlots.length;
      const barH = isAllMode ? (totalFlankCount > 12 ? 5.5 : 7.5) : 11;
      const dotR = isAllMode ? (totalFlankCount > 12 ? 6.5 : 8) : 9;

      const slotYs = armSlots.map((_, bi) =>
        isAllMode
          ? (armRowCount > 1 ? yBottom - 6 - ((globalPos + bi) / (armRowCount - 1)) * (yBottom - yTop - 12) : (yTop + yBottom) / 2)
          : isFocusedArm
            ? (focusedSlots.length > 1 ? yBottom - 12 - (bi / (focusedSlots.length - 1)) * (yBottom - yTop - 24) : (yTop + yBottom) / 2)
            : armCenterY + (bi - (armSlots.length - 1) / 2) * 9
      );
      const minY = slotYs.length ? Math.min(...slotYs) - 5 : armCenterY - 6;
      const maxY = slotYs.length ? Math.max(...slotYs) + 5 : armCenterY + 6;
      const midY = (minY + maxY) / 2;
      const bracketX = side === 'LEFT' ? dotX + 11 : dotX - 11;
      const armLblX = side === 'LEFT' ? dotX + 15 : dotX - 15;
      const isArmActive = activeArmFilter === `${side}_${armNum}` || isFocusedArm;

      return (
        <g key={`${side}-${armNum}`}>
          {isAllMode && idx > 0 && (
            <line
              x1={side === 'LEFT' ? xLeftBase - maxBarW : dotX} y1={yBottom - (idx / armsPerSide) * (yBottom - yTop)}
              x2={side === 'LEFT' ? dotX : xRightBase + maxBarW} y2={yBottom - (idx / armsPerSide) * (yBottom - yTop)}
              stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 2"
            />
          )}

          {/* Chaveta/marca vertical subtil por braço com etiqueta compacta E1..Ek / D1..Dk clicável */}
          <g
            role="button" tabIndex={0} className="cursor-pointer outline-none"
            onClick={() => { if (armSlots[0]) onSelectSlot(armSlots[0].slotIndex); onSelectArmFilter?.(`${side}_${armNum}`); }}
          >
            <line x1={bracketX} y1={minY} x2={bracketX} y2={maxY} stroke={isArmActive ? '#114037' : '#CBD5E1'} strokeWidth={isArmActive ? 1.75 : 1.25} strokeLinecap="round" />
            <text x={armLblX} y={midY + 2.5} textAnchor={side === 'LEFT' ? 'start' : 'end'} fontSize="7.5" fontWeight="800" fill={isArmActive ? '#114037' : '#94A3B8'}>
              {side === 'LEFT' ? `E${armNum}` : `D${armNum}`}
            </text>
          </g>

          {armSlots.map((slot, bi) => {
            const myGlobal = globalPos++;
            const y = slotYs[bi];
            const isSel = slot.slotIndex === selectedIndex;
            const configured = isSlotConfigured(slot);
            const activeAndCfg = configured && slot.isActive;
            const actualFlow = activeAndCfg ? (slot.measuredFlowLMin ?? slot.flowAtPressureLMin) : 0;
            const showBar = isAllMode || isFocusedArm;
            const barW = activeAndCfg && showBar ? scaleFlow(actualFlow) : 0;
            const minTolW = scaleFlow(slot.flowAtPressureLMin * 0.9);
            const maxTolW = scaleFlow(slot.flowAtPressureLMin * 1.1);
            const dev = activeAndCfg ? calculateFlowDeviationPct(slot.flowAtPressureLMin, slot.measuredFlowLMin) : null;
            const isOver = isIso16122DeviationExceeded(dev);
            const barColor = !activeAndCfg ? '#CBD5E1' : isOver ? '#E11D48' : '#2563EB';
            const fill = resolveSlotDotFill(slot);
            const pres = getNozzleColorPresentation(configured ? NOZZLES_BY_ID.get(slot.nozzleId) : undefined);

            const barX = side === 'LEFT' ? xLeftBase - barW : xRightBase;
            const tolX = side === 'LEFT' ? xLeftBase - maxTolW : xRightBase + minTolW;
            const labelX = side === 'LEFT' ? xLeftBase - barW - 6 : xRightBase + barW + 6;
            const showValueText = activeAndCfg && showBar && (!isAllMode || myGlobal % labelStep === 0 || isSel);

            return (
              <g key={slot.slotIndex}>
                {activeAndCfg && showBar && (
                  <rect x={tolX} y={y - (barH / 2 + 2)} width={Math.max(2, maxTolW - minTolW)} height={barH + 4} rx={2} fill="#10B981" fillOpacity="0.18" stroke="#059669" strokeWidth="0.75" strokeDasharray="2 1" />
                )}
                {barW > 0 && <rect x={barX} y={y - barH / 2} width={barW} height={barH} rx={2.5} fill={barColor} opacity={isSel ? 1 : 0.88} />}
                {showValueText && (
                  <text x={labelX} y={y + 3} textAnchor={side === 'LEFT' ? 'end' : 'start'} fontSize="8" fontWeight="700" fill={isOver ? '#E11D48' : '#334155'} style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {actualFlow.toFixed(2).replace('.', ',')}
                  </text>
                )}
                <g role="button" tabIndex={0} onClick={() => { onSelectSlot(slot.slotIndex); if (!isAllMode && !isFocusedArm && onSelectArmFilter) onSelectArmFilter(`${side}_${armNum}`); }} className="cursor-pointer outline-none">
                  {showBar ? (
                    <>
                      {isSel && <circle cx={dotX} cy={y} r={dotR + 2.8} fill="none" stroke="#114037" strokeWidth="2" strokeDasharray="3 2" />}
                      <circle cx={dotX} cy={y} r={dotR} fill={fill} stroke={configured ? '#114037' : '#94A3B8'} strokeWidth="1.4" />
                      <text x={dotX} y={y + 2.5} textAnchor="middle" fontSize={dotR < 8 ? '6.5' : '7.5'} fontWeight="900" fill={!configured ? '#64748B' : pres.isDark || !slot.isActive ? '#FFFFFF' : '#0F172A'}>
                        N{slot.levelIndex ?? bi + 1}
                      </text>
                    </>
                  ) : (
                    <circle cx={dotX} cy={y} r={4} fill={fill} stroke={configured ? '#114037' : '#94A3B8'} strokeWidth="1" opacity="0.85" />
                  )}
                </g>
              </g>
            );
          })}
        </g>
      );
    });
  };

  return (
    <div className="w-full flex flex-col">
      <div className="w-full flex justify-center py-0.5">
        <svg viewBox="0 0 680 265" className="w-full h-auto select-none font-sans">
          <SvgPneumaticCollectorOverlay ticks={ticks} scaleFlow={scaleFlow} airAssisted={airAssisted} flankTotals={flankTotals} />
          {renderSide('LEFT')}
          {renderSide('RIGHT')}
        </svg>
      </div>
      <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap pt-1.5 text-[10px] font-bold text-slate-600 border-t border-slate-100">
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#2563EB]" />Conforme (≤ 10%)</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#E11D48]" />Desvio Crítico (&gt; 10%)</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-3.5 h-2.5 rounded-xs bg-emerald-500/20 border border-dashed border-emerald-700" />Faixa Alvo ±10%</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1]" />Fechado</span>
      </div>
    </div>
  );
};
