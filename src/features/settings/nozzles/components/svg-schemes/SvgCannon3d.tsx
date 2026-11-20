// src/features/settings/nozzles/components/svg-schemes/SvgCannon3d.tsx
import React from 'react';
import type { NozzleSlotConfig } from '../../../../../schemas/nozzle-profile.schema.ts';
import { NOZZLES_BY_ID } from '../../../../nozzle-comparison/nozzleComparison.data.ts';
import { getNozzleColorPresentation } from '../../../../nozzle-comparison/nozzleComparison.calculations.ts';
import { resolveSlotDotFill, SvgUniformFanSymbol } from './SvgUniformFanSymbol.tsx';
import { calculateFlowDeviationPct, isIso16122DeviationExceeded, isSlotConfigured } from '../../services/nozzleProfileMath.ts';
import { getCannonSlotBadge, type CannonGroupFilter } from '../../services/nozzleCannonHelpers.ts';
import { CANNON_CHART_GEOMETRY, computeCannonChartScale, SvgCannonChartOverlay } from './SvgCannonChartOverlay.tsx';

interface SvgCannon3dProps {
  slots: NozzleSlotConfig[];
  selectedIndex: number;
  activeGroupFilter?: CannonGroupFilter;
  onSelectSlot: (index: number) => void;
  onSelectGroupFilter?: (filter: CannonGroupFilter) => void;
}

export const SvgCannon3d: React.FC<SvgCannon3dProps> = ({
  slots, selectedIndex, activeGroupFilter = 'MAIN', onSelectSlot, onSelectGroupFilter
}) => {
  const fanCx = 74, fanCy = 196, mouthCx = 164, mouthCy = 86, mouthR = 42;
  const { xZero, maxBarW, yTop, yBottom } = CANNON_CHART_GEOMETRY;
  const { ticks, scaleFlow } = computeCannonChartScale(slots);

  const mainSlots = slots.filter((s) => s.sectionSide === 'CANNON_MAIN');
  const deflSlots = slots.filter((s) => s.sectionSide === 'CANNON_DEFLECTOR');
  const orderedSlots = [...mainSlots, ...deflSlots];
  const labelStep = orderedSlots.length > 10 ? Math.ceil(orderedSlots.length / 8) : 1;

  const handlePick = (slot: NozzleSlotConfig) => {
    onSelectSlot(slot.slotIndex);
    const targetGroup: CannonGroupFilter = slot.sectionSide === 'CANNON_DEFLECTOR' ? 'DEFLECTOR' : 'MAIN';
    if (activeGroupFilter !== 'ALL' && activeGroupFilter !== targetGroup) {
      onSelectGroupFilter?.(targetGroup);
    }
  };

  const renderDot = (slot: NozzleSlotConfig, cx: number, cy: number, r: number, idx: number) => {
    const isSel = slot.slotIndex === selectedIndex;
    const cfg = isSlotConfigured(slot);
    const fill = resolveSlotDotFill(slot);
    const pres = getNozzleColorPresentation(cfg ? NOZZLES_BY_ID.get(slot.nozzleId) : undefined);
    return (
      <g key={slot.slotIndex} role="button" tabIndex={0} onClick={() => handlePick(slot)} className="cursor-pointer outline-none">
        {isSel && <circle cx={cx} cy={cy} r={r + 2.8} fill="none" stroke="#114037" strokeWidth="2" strokeDasharray="3 2" />}
        <circle cx={cx} cy={cy} r={r} fill={fill} stroke={cfg ? '#114037' : '#94A3B8'} strokeWidth="1.4" />
        <text x={cx} y={cy + 2.5} textAnchor="middle" fontSize={r < 8 ? '6.5' : '7.5'} fontWeight="900" fill={!cfg ? '#64748B' : pres.isDark || !slot.isActive ? '#FFFFFF' : '#0F172A'}>
          {getCannonSlotBadge(slot, idx)}
        </text>
      </g>
    );
  };

  const sepY = mainSlots.length > 0 && deflSlots.length > 0
    ? yTop + ((mainSlots.length - 0.5) / Math.max(1, orderedSlots.length)) * (yBottom - yTop)
    : null;

  return (
    <div className="w-full flex flex-col">
      <div className="w-full flex justify-center py-0.5">
        <svg viewBox="0 0 680 265" className="w-full h-auto select-none font-sans">
          {/* Lado Esquerdo (x: 24..228): Esquema Mecânico do Canhão */}
          <text x={mouthCx} y={24} textAnchor="middle" fontSize="8" fontWeight="900" fill="#114037">BOCA PRINCIPAL</text>
          <path d={`M ${fanCx - 10} ${fanCy - 16} L ${fanCx - 10} 122 Q ${fanCx - 10} 86 ${mouthCx - mouthR} ${mouthCy - 12}`} fill="none" stroke="#114037" strokeWidth="1.75" strokeLinecap="round" />
          <path d={`M ${fanCx + 12} ${fanCy - 14} L ${fanCx + 12} 130 Q ${fanCx + 18} 102 ${mouthCx - mouthR} ${mouthCy + 14}`} fill="none" stroke="#114037" strokeWidth="1.75" strokeLinecap="round" />

          <circle cx={mouthCx} cy={mouthCy} r={mouthR} fill="#F8FAFC" stroke="#114037" strokeWidth="1.75" />
          <line x1={mouthCx - mouthR + 6} y1={mouthCy} x2={mouthCx + mouthR - 6} y2={mouthCy} stroke="#94A3B8" strokeWidth="1.5" />
          <line x1={mouthCx} y1={mouthCy - mouthR + 6} x2={mouthCx} y2={mouthCy + mouthR - 6} stroke="#94A3B8" strokeWidth="1.5" />
          <path d={`M ${mouthCx + mouthR + 4} ${mouthCy} L ${mouthCx + mouthR + 18} ${mouthCy} m -4 -3 l 4 3 l -4 3`} fill="none" stroke="#3CA64C" strokeWidth="1.5" strokeLinecap="round" />

          {mainSlots.map((slot, i) => {
            const ang = (i / Math.max(1, mainSlots.length)) * Math.PI * 2 - Math.PI / 2;
            const rDot = mainSlots.length === 1 ? 0 : mouthR * 0.64;
            return renderDot(slot, mouthCx + rDot * Math.cos(ang), mouthCy + rDot * Math.sin(ang), mainSlots.length > 8 ? 7 : 8.5, i);
          })}

          {deflSlots.length > 0 && (
            <g>
              <path d={`M ${fanCx + 16} ${fanCy - 6} L 136 188 L 196 172 L 196 204 L 136 188`} fill="#F8FAFC" stroke="#114037" strokeWidth="1.75" strokeLinejoin="round" />
              <path d="M 222 188 L 236 188 m -4 -3 l 4 3 l -4 3" fill="none" stroke="#3CA64C" strokeWidth="1.5" strokeLinecap="round" />
              <text x={164} y={232} textAnchor="middle" fontSize="8" fontWeight="900" fill="#114037">DEFLETOR INFERIOR</text>
              {deflSlots.map((slot, i) => {
                const off = deflSlots.length > 1 ? (i - (deflSlots.length - 1) / 2) * 14 : 0;
                return renderDot(slot, 208, 188 + off, deflSlots.length > 4 ? 6.5 : 8, i);
              })}
            </g>
          )}
          <SvgUniformFanSymbol cx={fanCx} cy={fanCy} radius={16} showFrontTriangle triangleOffset={4} />

          {/* Lado Direito (x: 256..656): Gráfico Horizontal Calibrado */}
          <SvgCannonChartOverlay ticks={ticks} scaleFlow={scaleFlow} />
          {sepY !== null && <line x1={xZero - 24} y1={sepY} x2={xZero + maxBarW} y2={sepY} stroke="#CBD5E1" strokeWidth="1" strokeDasharray="4 3" />}

          {orderedSlots.map((slot, idx) => {
            const y = orderedSlots.length > 1 ? yTop + (idx / (orderedSlots.length - 1)) * (yBottom - yTop) : (yTop + yBottom) / 2;
            const isSel = slot.slotIndex === selectedIndex;
            const cfg = isSlotConfigured(slot);
            const activeAndCfg = cfg && slot.isActive;
            const actualFlow = activeAndCfg ? (slot.measuredFlowLMin ?? slot.flowAtPressureLMin) : 0;
            const barW = activeAndCfg ? scaleFlow(actualFlow) : 0;
            const minTolW = scaleFlow(slot.flowAtPressureLMin * 0.9);
            const maxTolW = scaleFlow(slot.flowAtPressureLMin * 1.1);
            const dev = activeAndCfg ? calculateFlowDeviationPct(slot.flowAtPressureLMin, slot.measuredFlowLMin) : null;
            const isOver = isIso16122DeviationExceeded(dev);
            const barH = orderedSlots.length > 10 ? 7 : 10;

            return (
              <g key={slot.slotIndex} role="button" tabIndex={0} onClick={() => handlePick(slot)} className="cursor-pointer outline-none">
                <text x={xZero - 8} y={y + 3} textAnchor="end" fontSize="8" fontWeight={isSel ? '900' : '700'} fill={isSel ? '#114037' : '#475569'}>
                  {getCannonSlotBadge(slot, idx)}
                </text>
                {activeAndCfg && <rect x={xZero + minTolW} y={y - (barH / 2 + 2)} width={Math.max(2, maxTolW - minTolW)} height={barH + 4} rx={2} fill="#10B981" fillOpacity="0.18" stroke="#059669" strokeWidth="0.75" strokeDasharray="2 1" />}
                {barW > 0 && <rect x={xZero} y={y - barH / 2} width={barW} height={barH} rx={2.5} fill={isOver ? '#E11D48' : '#2563EB'} opacity={isSel ? 1 : 0.88} />}
                {activeAndCfg && (idx % labelStep === 0 || isSel) && (
                  <text x={xZero + barW + 6} y={y + 3} textAnchor="start" fontSize="8" fontWeight="700" fill={isOver ? '#E11D48' : '#334155'} style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {actualFlow.toFixed(2).replace('.', ',')}
                  </text>
                )}
              </g>
            );
          })}
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
