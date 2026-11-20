// src/features/settings/nozzles/components/svg-schemes/SvgDroneUav.tsx
import React from 'react';
import type { NozzleSlotConfig, UavNozzleMode } from '../../../../../schemas/nozzle-profile.schema.ts';
import { NOZZLES_BY_ID } from '../../../../nozzle-comparison/nozzleComparison.data.ts';
import { getNozzleColorPresentation } from '../../../../nozzle-comparison/nozzleComparison.calculations.ts';
import { resolveSlotDotFill } from './SvgUniformFanSymbol.tsx';
import { calculateFlowDeviationPct, isIso16122DeviationExceeded, isSlotConfigured } from '../../services/nozzleProfileMath.ts';
import { inferDroneRotorCount, isDroneSlotLeft, type DroneFlankFilter } from '../../services/nozzleDroneHelpers.ts';
import { computeDroneChartScale, DRONE_CHART_GEOMETRY, SvgDroneChartOverlay } from './SvgDroneChartOverlay.tsx';

interface SvgDroneUavProps {
  slots: NozzleSlotConfig[];
  selectedIndex: number;
  uavMode?: UavNozzleMode;
  rotorCount?: number;
  activeFlankFilter?: DroneFlankFilter;
  onSelectSlot: (index: number) => void;
  onSelectFlankFilter?: (filter: DroneFlankFilter) => void;
}

export const SvgDroneUav: React.FC<SvgDroneUavProps> = ({
  slots, selectedIndex, uavMode = 'HYDRAULIC', rotorCount: propRotors, activeFlankFilter = 'ALL', onSelectSlot, onSelectFlankFilter
}) => {
  const cx = 123, cy = 126, armLen = 60;
  const rotors = inferDroneRotorCount(slots, propRotors);
  const rotorR = rotors === 8 ? 13 : 17;
  const half = Math.ceil(slots.length / 2);
  const { xStart, xEnd, yBottom } = DRONE_CHART_GEOMETRY;
  const { ticks, scaleH } = computeDroneChartScale(slots);

  const visibleSlots = activeFlankFilter === 'LEFT' ? slots.slice(0, half) : activeFlankFilter === 'RIGHT' ? slots.slice(half) : slots;
  const labelStep = visibleSlots.length > 8 ? Math.ceil(visibleSlots.length / 6) : 1;
  const slotStep = (xEnd - xStart) / Math.max(1, visibleSlots.length);
  const barW = Math.min(24, Math.max(10, slotStep * 0.48));
  const dividerX = xStart + half * slotStep;

  const handlePick = (slot: NozzleSlotConfig) => {
    onSelectSlot(slot.slotIndex);
    const targetFlank: DroneFlankFilter = isDroneSlotLeft(slot.slotIndex, slots.length) ? 'LEFT' : 'RIGHT';
    if (activeFlankFilter !== 'ALL' && activeFlankFilter !== targetFlank) onSelectFlankFilter?.(targetFlank);
  };

  const getPointPos = (i: number) => {
    const isLeft = isDroneSlotLeft(i, slots.length);
    const localIdx = isLeft ? i : i - half;
    const count = isLeft ? half : slots.length - half;
    const frac = count > 1 ? localIdx / (count - 1) : 0.5;
    const ang = isLeft ? Math.PI * (0.72 + frac * 0.56) : Math.PI * (-0.28 + frac * 0.56);
    const dist = count > 3 ? 42 : 38;
    return { x: cx + dist * Math.cos(ang), y: cy + dist * Math.sin(ang) };
  };

  return (
    <div className="w-full flex flex-col">
      <div className="w-full flex justify-center py-0.5">
        <svg viewBox="0 0 680 265" className="w-full h-auto select-none font-sans">
          {/* Lado Esquerdo (x: 20..226): Planta Zenital do Drone */}
          <polygon points={`${cx},14 ${cx - 6},24 ${cx + 6},24`} fill="#114037" />
          <text x={cx} y={35} textAnchor="middle" fontSize="7.5" fontWeight="900" fill="#114037">▲ FRENTE</text>
          <text x={24} y={cy + 3} textAnchor="start" fontSize="7.5" fontWeight="900" fill="#64748B">ESQ.</text>
          <text x={222} y={cy + 3} textAnchor="end" fontSize="7.5" fontWeight="900" fill="#64748B">DIR.</text>

          <rect x={cx - 17} y={cy - 17} width={34} height={34} rx={8} fill="#F8FAFC" stroke="#114037" strokeWidth="1.6" />
          <circle cx={cx} cy={cy} r={5} fill="#E2E8F0" stroke="#114037" strokeWidth="1.4" />

          {Array.from({ length: rotors }, (_, idx) => {
            const ang = (rotors === 4 ? Math.PI / 4 : Math.PI / rotors) + (idx * 2 * Math.PI) / rotors;
            const rx = cx + armLen * Math.cos(ang), ry = cy + armLen * Math.sin(ang);
            return (
              <g key={idx}>
                <line x1={cx} y1={cy} x2={rx} y2={ry} stroke="#114037" strokeWidth="1.5" />
                <circle cx={rx} cy={ry} r={rotorR} fill="#F8FAFC" stroke="#114037" strokeWidth="1.4" strokeDasharray="3 3" />
                <circle cx={rx} cy={ry} r="2.8" fill="#114037" />
              </g>
            );
          })}

          {slots.map((slot, i) => {
            const { x, y } = getPointPos(i);
            const isSel = slot.slotIndex === selectedIndex;
            const cfg = isSlotConfigured(slot);
            const fill = resolveSlotDotFill(slot);
            const pres = getNozzleColorPresentation(cfg ? NOZZLES_BY_ID.get(slot.nozzleId) : undefined);
            const r = slots.length > 8 ? 7.5 : 8.5;
            return (
              <g key={slot.slotIndex} role="button" tabIndex={0} onClick={() => handlePick(slot)} className="cursor-pointer outline-none">
                {isSel && <circle cx={x} cy={y} r={r + 2.8} fill="none" stroke="#114037" strokeWidth="2" strokeDasharray="3 2" />}
                <circle cx={x} cy={y} r={r} fill={fill} stroke={cfg ? '#114037' : '#94A3B8'} strokeWidth="1.4" />
                <text x={x} y={y + 2.5} textAnchor="middle" fontSize="6.8" fontWeight="900" fill={!cfg ? '#64748B' : pres.isDark || !slot.isActive ? '#FFFFFF' : '#0F172A'}>
                  B{slot.slotIndex + 1}
                </text>
              </g>
            );
          })}
          <text x={cx} y={248} textAnchor="middle" fontSize="8" fontWeight="700" fill="#475569">
            {rotors} rotores · {uavMode === 'ROTARY_CDA' ? 'Centrífugo (CDA)' : 'Hidráulico (BD)'}
          </text>

          {/* Lado Direito (x: 256..656): Gráfico Vertical Calibrado B1..Bn */}
          <SvgDroneChartOverlay ticks={ticks} scaleH={scaleH} showCenterDivider={activeFlankFilter === 'ALL'} dividerX={dividerX} />

          {visibleSlots.map((slot, idx) => {
            const bx = xStart + (idx + 0.5) * slotStep;
            const isSel = slot.slotIndex === selectedIndex;
            const cfg = isSlotConfigured(slot);
            const activeAndCfg = cfg && slot.isActive;
            const actualFlow = activeAndCfg ? (slot.measuredFlowLMin ?? slot.flowAtPressureLMin) : 0;
            const h = activeAndCfg ? scaleH(actualFlow) : 0;
            const hMin = scaleH(slot.flowAtPressureLMin * 0.9);
            const hMax = scaleH(slot.flowAtPressureLMin * 1.1);
            const dev = activeAndCfg ? calculateFlowDeviationPct(slot.flowAtPressureLMin, slot.measuredFlowLMin) : null;
            const isOver = isIso16122DeviationExceeded(dev);
            const topTolY = yBottom - hMax;
            const valY = Math.min(topTolY, yBottom - h) - 4;

            return (
              <g key={slot.slotIndex} role="button" tabIndex={0} onClick={() => handlePick(slot)} className="cursor-pointer outline-none">
                {activeAndCfg && <rect x={bx - barW * 0.62} y={topTolY} width={barW * 1.24} height={Math.max(3, hMax - hMin)} rx={2} fill="#10B981" fillOpacity="0.18" stroke="#059669" strokeWidth="0.75" strokeDasharray="2 1" />}
                {h > 0 && <rect x={bx - barW / 2} y={yBottom - h} width={barW} height={h} rx={2.5} fill={isOver ? '#E11D48' : '#2563EB'} opacity={isSel ? 1 : 0.88} />}
                {activeAndCfg && (idx % labelStep === 0 || isSel) && (
                  <text x={bx} y={valY} textAnchor="middle" fontSize="7.5" fontWeight="700" fill={isOver ? '#E11D48' : '#334155'} style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {actualFlow.toFixed(2).replace('.', ',')}
                  </text>
                )}
                <text x={bx} y={yBottom + 13} textAnchor="middle" fontSize="8" fontWeight={isSel ? '900' : '700'} fill={isSel ? '#114037' : '#475569'}>
                  B{slot.slotIndex + 1}
                </text>
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
