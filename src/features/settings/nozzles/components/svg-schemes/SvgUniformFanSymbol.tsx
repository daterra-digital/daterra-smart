// src/features/settings/nozzles/components/svg-schemes/SvgUniformFanSymbol.tsx
import React from 'react';
import { NOZZLES_BY_ID } from '../../../../nozzle-comparison/nozzleComparison.data.ts';
import { getNozzleColorPresentation } from '../../../../nozzle-comparison/nozzleComparison.calculations.ts';
import { isSlotConfigured } from '../../services/nozzleProfileMath.ts';
import type { NozzleSlotConfig } from '../../../../../schemas/nozzle-profile.schema.ts';

export interface SvgUniformFanSymbolProps {
  cx: number;
  cy: number;
  radius?: number;
  showFrontTriangle?: boolean;
  triangleOffset?: number;
}

/**
 * Símbolo único uniformizado de ventilador DATERRA Smart:
 * Aro circular + cubo central + 3 pás curvas minimalistas (stroke-width: 1.75px)
 * e triângulo frontal opcional (▲) indicando o sentido de marcha.
 */
export const SvgUniformFanSymbol: React.FC<SvgUniformFanSymbolProps> = ({
  cx,
  cy,
  radius = 22,
  showFrontTriangle = false,
  triangleOffset = 7
}) => {
  const hubR = Math.max(3.5, radius * 0.2);
  const bladeOuter = radius * 0.82;
  const angles = [0, 120, 240];
  const triY = cy - radius - triangleOffset;

  return (
    <g aria-label="Ventilador">
      {showFrontTriangle && (
        <polygon
          points={`${cx},${triY - 10} ${cx - 8},${triY + 2} ${cx + 8},${triY + 2}`}
          fill="#114037"
          stroke="#114037"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      )}
      <circle cx={cx} cy={cy} r={radius} fill="#F8FAFC" stroke="#114037" strokeWidth="1.75" />
      {angles.map((deg) => (
        <g key={deg} transform={`rotate(${deg} ${cx} ${cy})`}>
          <path
            d={`M ${cx} ${cy - hubR} C ${cx + bladeOuter * 0.48} ${cy - bladeOuter * 0.35}, ${cx + bladeOuter * 0.55} ${cy - bladeOuter * 0.95}, ${cx} ${cy - bladeOuter} C ${cx - bladeOuter * 0.32} ${cy - bladeOuter * 0.8}, ${cx - bladeOuter * 0.18} ${cy - hubR * 1.4}, ${cx} ${cy - hubR} Z`}
            fill="#E2E8F0"
            stroke="#114037"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </g>
      ))}
      <circle cx={cx} cy={cy} r={hubR} fill="#114037" />
    </g>
  );
};

export function resolveSlotDotFill(slot: NozzleSlotConfig): string {
  if (!isSlotConfigured(slot)) return '#F1F5F9';
  if (!slot.isActive) return '#CBD5E1';
  const obj = NOZZLES_BY_ID.get(slot.nozzleId);
  const hex = getNozzleColorPresentation(obj).hex;
  return hex || '#3CA64C';
}

export interface SvgNozzleDotProps {
  cx: number;
  cy: number;
  slot: NozzleSlotConfig;
  isSelected: boolean;
  onSelect: () => void;
  shape?: 'circle' | 'square';
}

export const SvgNozzleDot: React.FC<SvgNozzleDotProps> = ({
  cx,
  cy,
  slot,
  isSelected,
  onSelect,
  shape = 'circle'
}) => {
  const fill = resolveSlotDotFill(slot);
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${slot.slotLabel} — ${slot.isActive ? 'Ativo' : 'Fechado'}`}
      className="cursor-pointer outline-none"
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {isSelected && (
        <circle
          cx={cx}
          cy={cy}
          r={12}
          fill="none"
          stroke="#114037"
          strokeWidth="1.75"
          strokeDasharray="3 2"
        />
      )}
      {shape === 'square' ? (
        <rect
          x={cx - 7}
          y={cy - 7}
          width={14}
          height={14}
          rx={3.5}
          fill={fill}
          stroke="#114037"
          strokeWidth="1.75"
        />
      ) : (
        <circle
          cx={cx}
          cy={cy}
          r={isSelected ? 8 : 6.5}
          fill={fill}
          stroke="#114037"
          strokeWidth="1.75"
        />
      )}
      {!slot.isActive && (
        <line
          x1={cx - 4.5}
          y1={cy - 4.5}
          x2={cx + 4.5}
          y2={cy + 4.5}
          stroke="#475569"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      )}
    </g>
  );
};

export const SvgSchemeLegendFooter: React.FC<{ subtitle?: string }> = ({ subtitle }) => (
  <div className="w-full pt-2 mt-2 border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-2 text-[10px] font-semibold text-slate-600 px-1">
    <div className="flex items-center gap-3 flex-wrap">
      <span className="inline-flex items-center gap-1">
        <span className="w-2.5 h-2.5 rounded-full bg-[#3CA64C] border border-[#114037]" />
        Ativo (Cor ISO)
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-[#114037]" />
        Fechado
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="w-2.5 h-2.5 rounded-full border border-dashed border-[#114037]" />
        Selecionado
      </span>
    </div>
    {subtitle && <span className="text-[#1D734B] font-bold">{subtitle}</span>}
  </div>
);
