// src/features/settings/nozzles/components/svg-schemes/SvgManualLance.tsx
import React from 'react';
import type { NozzleSlotConfig } from '../../../../../schemas/nozzle-profile.schema.ts';
import { NOZZLES_BY_ID } from '../../../../nozzle-comparison/nozzleComparison.data.ts';
import { getNozzleColorPresentation } from '../../../../nozzle-comparison/nozzleComparison.calculations.ts';
import { resolveSlotDotFill } from './SvgUniformFanSymbol.tsx';
import { calculateFlowDeviationPct, isIso16122DeviationExceeded, isSlotConfigured } from '../../services/nozzleProfileMath.ts';
import { getManualSlotBadge } from '../../services/nozzleManualHelpers.ts';
import { computeManualChartScale, MANUAL_CHART_GEOMETRY, SvgManualChartOverlay } from './SvgManualChartOverlay.tsx';

interface SvgManualLanceProps {
  slots: NozzleSlotConfig[];
  selectedIndex: number;
  onSelectSlot: (index: number) => void;
}

export const SvgManualLance: React.FC<SvgManualLanceProps> = ({ slots, selectedIndex, onSelectSlot }) => {
  const count = slots.length;
  const cxReel = 64, cyReel = 118, manifoldX = 114, lanceTipX = 196;
  const { xZero, yTop, yBottom } = MANUAL_CHART_GEOMETRY;
  const { ticks, scaleFlow } = computeManualChartScale(slots);
  const labelStep = count > 10 ? Math.ceil(count / 8) : 1;
  const dotR = count > 8 ? 7 : 8.5;
  const barH = count > 10 ? 7 : 10;

  const getY = (i: number) => (count > 1 ? yTop + (i / (count - 1)) * (yBottom - yTop) : (yTop + yBottom) / 2);
  const firstY = count > 0 ? getY(0) : cyReel;
  const lastY = count > 0 ? getY(count - 1) : cyReel;

  return (
    <div className="w-full flex flex-col">
      <div className="w-full flex justify-center py-0.5">
        <svg viewBox="0 0 680 265" className="w-full h-auto select-none font-sans">
          {/* Lado Esquerdo (x: 20..226): Enrolador + Coletor Vertical Limpo + Lanças L1..Ln */}
          <line x1={cxReel - 22} y1={cyReel + 38} x2={cxReel + 22} y2={cyReel + 38} stroke="#114037" strokeWidth="1.75" strokeLinecap="round" />
          <line x1={cxReel - 13} y1={cyReel + 38} x2={cxReel} y2={cyReel} stroke="#114037" strokeWidth="1.75" />
          <line x1={cxReel + 13} y1={cyReel + 38} x2={cxReel} y2={cyReel} stroke="#114037" strokeWidth="1.75" />
          <circle cx={cxReel} cy={cyReel} r={24} fill="#F8FAFC" stroke="#114037" strokeWidth="1.75" strokeDasharray="5 3" />
          <circle cx={cxReel} cy={cyReel} r={8.5} fill="#E2E8F0" stroke="#114037" strokeWidth="1.75" />

          <line x1={cxReel + 24} y1={cyReel} x2={manifoldX} y2={cyReel} stroke="#114037" strokeWidth="1.75" />
          <line x1={manifoldX} y1={firstY} x2={manifoldX} y2={lastY} stroke="#94A3B8" strokeWidth="1.75" strokeLinecap="round" />
          <text x={118} y={248} textAnchor="middle" fontSize="8" fontWeight="700" fill="#475569">
            {count} {count === 1 ? 'pistola / lança' : 'pistolas / lanças'}
          </text>

          {/* Lado Direito (x: 256..656): Gráfico Horizontal Calibrado L1..Ln */}
          <SvgManualChartOverlay ticks={ticks} scaleFlow={scaleFlow} />

          {slots.map((slot, i) => {
            const y = getY(i);
            const isSel = slot.slotIndex === selectedIndex;
            const cfg = isSlotConfigured(slot);
            const activeAndCfg = cfg && slot.isActive;
            const actualFlow = activeAndCfg ? (slot.measuredFlowLMin ?? slot.flowAtPressureLMin) : 0;
            const barW = activeAndCfg ? scaleFlow(actualFlow) : 0;
            const minTolW = scaleFlow(slot.flowAtPressureLMin * 0.9);
            const maxTolW = scaleFlow(slot.flowAtPressureLMin * 1.1);
            const dev = activeAndCfg ? calculateFlowDeviationPct(slot.flowAtPressureLMin, slot.measuredFlowLMin) : null;
            const isOver = isIso16122DeviationExceeded(dev);
            const fill = resolveSlotDotFill(slot);
            const pres = getNozzleColorPresentation(cfg ? NOZZLES_BY_ID.get(slot.nozzleId) : undefined);
            const badge = getManualSlotBadge(slot, i);

            return (
              <g key={slot.slotIndex}>
                {/* Ramo horizontal da lança + ponteira estilizada + círculo ISO L1..Ln */}
                <line x1={manifoldX} y1={y} x2={148} y2={y} stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 2" />
                <rect x={148} y={y - 3.5} width="14" height="7" rx="2" fill="#114037" />
                <line x1={162} y1={y} x2={lanceTipX - dotR} y2={y} stroke="#114037" strokeWidth="1.75" strokeLinecap="round" />
                <g role="button" tabIndex={0} onClick={() => onSelectSlot(slot.slotIndex)} className="cursor-pointer outline-none">
                  {isSel && <circle cx={lanceTipX} cy={y} r={dotR + 2.8} fill="none" stroke="#114037" strokeWidth="2" strokeDasharray="3 2" />}
                  <circle cx={lanceTipX} cy={y} r={dotR} fill={fill} stroke={cfg ? '#114037' : '#94A3B8'} strokeWidth="1.4" />
                  <text x={lanceTipX} y={y + 2.5} textAnchor="middle" fontSize={dotR < 8 ? '6.5' : '7.5'} fontWeight="900" fill={!cfg ? '#64748B' : pres.isDark || !slot.isActive ? '#FFFFFF' : '#0F172A'}>
                    {badge}
                  </text>
                </g>

                {/* Barra horizontal calibrada 1:1 à direita */}
                <g role="button" tabIndex={0} onClick={() => onSelectSlot(slot.slotIndex)} className="cursor-pointer outline-none">
                  <text x={xZero - 8} y={y + 3} textAnchor="end" fontSize="8" fontWeight={isSel ? '900' : '700'} fill={isSel ? '#114037' : '#475569'}>
                    {badge}
                  </text>
                  {activeAndCfg && <rect x={xZero + minTolW} y={y - (barH / 2 + 2)} width={Math.max(2, maxTolW - minTolW)} height={barH + 4} rx={2} fill="#10B981" fillOpacity="0.18" stroke="#059669" strokeWidth="0.75" strokeDasharray="2 1" />}
                  {barW > 0 && <rect x={xZero} y={y - barH / 2} width={barW} height={barH} rx={2.5} fill={isOver ? '#E11D48' : '#2563EB'} opacity={isSel ? 1 : 0.88} />}
                  {activeAndCfg && (i % labelStep === 0 || isSel) && (
                    <text x={xZero + barW + 6} y={y + 3} textAnchor="start" fontSize="8" fontWeight="700" fill={isOver ? '#E11D48' : '#334155'} style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {actualFlow.toFixed(2).replace('.', ',')}
                    </text>
                  )}
                </g>
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
