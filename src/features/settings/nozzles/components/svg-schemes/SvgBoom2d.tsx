// src/features/settings/nozzles/components/svg-schemes/SvgBoom2d.tsx
import React from 'react';
import type { NozzleSlotConfig } from '../../../../../schemas/nozzle-profile.schema.ts';
import { resolveSlotDotFill } from './SvgUniformFanSymbol.tsx';
import { calculateFlowDeviationPct, isIso16122DeviationExceeded, isSlotConfigured } from '../../services/nozzleProfileMath.ts';
import { BOOM_AXIS_GEOMETRY, computeBoomAxisScale, SvgBoomAxisOverlay } from './SvgBoomAxisOverlay.tsx';

interface SvgBoom2dProps {
  slots: NozzleSlotConfig[];
  selectedIndex: number;
  activeSectorFilter?: number | 'ALL';
  sectors?: number;
  onSelectSlot: (index: number) => void;
}

export const SvgBoom2d: React.FC<SvgBoom2dProps> = ({
  slots,
  selectedIndex,
  activeSectorFilter = 'ALL',
  sectors = 3,
  onSelectSlot
}) => {
  const { xStart, xEnd, yTop, yBoom } = BOOM_AXIS_GEOMETRY;
  const { ticks, scaleFlowH } = computeBoomAxisScale(slots);
  const visibleSlots = activeSectorFilter === 'ALL'
    ? slots
    : slots.filter((s) => (s.sectorIndex ?? 1) === activeSectorFilter);

  const n = Math.max(1, visibleSlots.length);
  const spanW = xEnd - xStart;
  const slotW = spanW / n;
  const barW = Math.min(26, Math.max(4, slotW * 0.56));
  const dotR = n > 36 ? 4.5 : n > 18 ? 6.5 : 8.5;
  const cadence = n <= 16 ? 1 : n <= 32 ? 2 : 4;

  // Limites entre setores (quando 'Todos' está selecionado)
  const sectorBoundaries: Array<{ x: number; label: string; labelX: number }> = [];
  if (activeSectorFilter === 'ALL' && sectors > 1) {
    let cursor = 0;
    for (let sec = 1; sec <= sectors; sec++) {
      const count = visibleSlots.filter((s) => (s.sectorIndex ?? 1) === sec).length;
      if (count > 0) {
        const startX = xStart + cursor * slotW;
        const endX = xStart + (cursor + count) * slotW;
        sectorBoundaries.push({ x: endX, label: `S${sec}`, labelX: (startX + endX) / 2 });
        cursor += count;
      }
    }
  }

  return (
    <div className="w-full flex flex-col">
      <div className="w-full flex justify-center py-0.5">
        <svg viewBox="0 0 680 265" className="w-full h-auto select-none font-sans">
          <SvgBoomAxisOverlay ticks={ticks} scaleFlowH={scaleFlowH} />

          {/* Orientação ESQUERDA / DIREITA no topo da barra */}
          <text x={xStart} y={16} textAnchor="start" fontSize="11" fontWeight="700" letterSpacing="0.06em" fill="#64748B">
            ESQUERDA
          </text>
          <text x={xEnd} y={16} textAnchor="end" fontSize="11" fontWeight="700" letterSpacing="0.06em" fill="#64748B">
            DIREITA
          </text>

          {/* Rótulos e divisórias subtis de setor */}
          {sectorBoundaries.map((b, i) => (
            <g key={b.label}>
              <text x={b.labelX} y={30} textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#114037">
                {b.label}
              </text>
              {i < sectorBoundaries.length - 1 && (
                <line x1={b.x} y1={yTop - 8} x2={b.x} y2={yBoom + 12} stroke="#94A3B8" strokeWidth="1.25" strokeDasharray="3 3" />
              )}
            </g>
          ))}

          {/* Barras individuais B1..Bn + Faixa Alvo ±10% */}
          {visibleSlots.map((slot, i) => {
            const centerX = xStart + (i + 0.5) * slotW;
            const configured = isSlotConfigured(slot);
            const activeAndCfg = configured && slot.isActive;
            const actualFlow = activeAndCfg ? (slot.measuredFlowLMin ?? slot.flowAtPressureLMin) : 0;
            const barH = activeAndCfg ? scaleFlowH(actualFlow) : 0;
            const minTolY = yBoom - scaleFlowH(slot.flowAtPressureLMin * 1.1);
            const maxTolY = yBoom - scaleFlowH(slot.flowAtPressureLMin * 0.9);
            const tolH = Math.max(2, maxTolY - minTolY);

            const dev = activeAndCfg ? calculateFlowDeviationPct(slot.flowAtPressureLMin, slot.measuredFlowLMin) : null;
            const isOver = isIso16122DeviationExceeded(dev);
            const barColor = !activeAndCfg ? '#CBD5E1' : isOver ? '#E11D48' : '#2563EB';
            const isSel = slot.slotIndex === selectedIndex;
            const fill = resolveSlotDotFill(slot);
            const showLabel = cadence === 1 || i % cadence === 0 || i === n - 1 || isSel;
            const valueY = Math.min(yBoom - barH, minTolY) - 6;

            return (
              <g key={slot.slotIndex}>
                {activeAndCfg && (
                  <rect
                    x={centerX - barW / 2 - 2}
                    y={minTolY}
                    width={barW + 4}
                    height={tolH}
                    rx={2}
                    fill="#10B981"
                    fillOpacity="0.18"
                    stroke="#059669"
                    strokeWidth="0.75"
                    strokeDasharray="2 1"
                  />
                )}
                {barH > 0 && (
                  <rect
                    x={centerX - barW / 2}
                    y={yBoom - barH}
                    width={barW}
                    height={barH}
                    rx={2.5}
                    fill={barColor}
                    stroke={isSel ? '#114037' : 'none'}
                    strokeWidth={isSel ? '1.5' : '0'}
                    opacity={isSel ? 1 : 0.88}
                  />
                )}
                {activeAndCfg && showLabel && (
                  <text
                    x={centerX}
                    y={valueY}
                    textAnchor="middle"
                    fontSize={n > 20 ? '8' : '9'}
                    fontWeight="700"
                    fill={isOver ? '#E11D48' : '#1E293B'}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {actualFlow.toFixed(2).replace('.', ',')}
                  </text>
                )}

                <g role="button" tabIndex={0} onClick={() => onSelectSlot(slot.slotIndex)} className="cursor-pointer outline-none">
                  {isSel && <circle cx={centerX} cy={yBoom + 20} r={dotR + 3} fill="none" stroke="#114037" strokeWidth="1.75" strokeDasharray="3 2" />}
                  <circle cx={centerX} cy={yBoom + 20} r={dotR} fill={fill} stroke={configured ? '#114037' : '#94A3B8'} strokeWidth="1.5" />
                  {showLabel && (
                    <text x={centerX} y={yBoom + 41} textAnchor="middle" fontSize="9" fontWeight="800" fill={isSel ? '#114037' : '#334155'}>
                      B{slot.slotIndex + 1}
                    </text>
                  )}
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legenda Bilateral ISO 16122-3 */}
      <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap pt-1.5 text-[11px] font-bold text-slate-700 border-t border-slate-100">
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#2563EB]" />Conforme (≤ 10%)</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#E11D48]" />Desvio Crítico (&gt; 10%)</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-3.5 h-2.5 rounded-xs bg-emerald-500/20 border border-dashed border-emerald-700" />Faixa Alvo ±10%</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1]" />Fechado</span>
      </div>
    </div>
  );
};
