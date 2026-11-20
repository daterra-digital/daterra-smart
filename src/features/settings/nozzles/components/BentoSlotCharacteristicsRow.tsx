// src/features/settings/nozzles/components/BentoSlotCharacteristicsRow.tsx
import React from 'react';
import { Edit2, Power } from 'lucide-react';
import type { NozzleSlotConfig } from '../../../../schemas/nozzle-profile.schema.ts';
import { NOZZLES_BY_ID } from '../../../nozzle-comparison/nozzleComparison.data.ts';
import { formatPt, getNozzleColorPresentation } from '../../../nozzle-comparison/nozzleComparison.calculations.ts';
import { resolveSlotDotFill } from './svg-schemes/SvgUniformFanSymbol.tsx';
import {
  calculateFlowDeviationPct,
  isIso16122DeviationExceeded,
  isSlotConfigured
} from '../services/nozzleProfileMath.ts';

export interface BentoSlotCharacteristicsRowProps {
  slot: NozzleSlotConfig;
  positionBadge: string;
  rampLabel?: string;
  referencePressureBar?: number;
  isSelected: boolean;
  onSelect: () => void;
  onEditNozzle: () => void;
  onEditMeasuredFlow: () => void;
  onToggleActive?: () => void;
  hideToggle?: boolean;
}

export const BentoSlotCharacteristicsRow: React.FC<BentoSlotCharacteristicsRowProps> = ({
  slot,
  positionBadge,
  rampLabel,
  isSelected,
  onSelect,
  onEditNozzle,
  onEditMeasuredFlow,
  onToggleActive,
  hideToggle = false
}) => {
  const configured = isSlotConfigured(slot);
  const nozzleObj = configured ? NOZZLES_BY_ID.get(slot.nozzleId) : undefined;
  const pres = getNozzleColorPresentation(nozzleObj);
  const dotFill = resolveSlotDotFill(slot);
  const isoCode = slot.isoCode || nozzleObj?.isoCode;
  const isModular = Boolean(slot.swirlPlate || slot.disc);
  const canComputeDev = configured && slot.isActive && slot.measuredFlowLMin !== undefined;
  const deviationPct = canComputeDev
    ? calculateFlowDeviationPct(slot.flowAtPressureLMin, slot.measuredFlowLMin)
    : null;
  const hasIsoAlert = deviationPct !== null && isIso16122DeviationExceeded(deviationPct);

  return (
    <div
      onClick={onSelect}
      className={`flex flex-wrap lg:grid lg:grid-cols-[44px_minmax(180px,1.4fr)_150px_145px_138px_190px] lg:items-center justify-between gap-2 lg:gap-3 py-2 px-3 border-b border-slate-100 last:border-b-0 text-xs cursor-pointer transition-colors ${
        isSelected ? 'bg-emerald-50/60' : 'hover:bg-slate-50'
      }`}
    >
      {/* Coluna 1 (44px): Badge N1..Nx com cor ISO 1:1 ou neutro */}
      <span
        className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-black shrink-0 border shadow-2xs w-[40px] text-center ${
          configured ? 'border-black/10' : 'bg-slate-200 text-slate-600 border-slate-300'
        }`}
        style={
          configured
            ? { backgroundColor: dotFill, color: pres.isDark || !slot.isActive ? '#FFFFFF' : '#0F172A' }
            : undefined
        }
      >
        {positionBadge}
      </span>

      {/* Coluna 2: Círculo ISO + Botão clicável Marca/Modelo + Ângulo/Cor */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onEditNozzle(); }}
        className="flex items-center gap-2 min-w-0 flex-1 text-left rounded-lg px-1.5 py-0.5 -mx-1.5 hover:bg-emerald-50/80 transition-colors cursor-pointer group"
      >
        <span
          className={`w-3.5 h-3.5 rounded-full border shrink-0 shadow-2xs ${configured ? 'border-black/20' : 'border-slate-400'}`}
          style={{ backgroundColor: dotFill }}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`truncate ${configured ? 'font-bold text-slate-900 group-hover:text-[#114037]' : 'font-semibold text-slate-600 group-hover:text-[#114037]'}`}>
              {configured ? `${slot.brand} ${slot.model}` : 'Sem bico configurado'}
            </span>
            {rampLabel && (
              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-extrabold shrink-0">
                {rampLabel}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-600 font-medium block truncate">
            {!configured
              ? 'Clique para escolher bico...'
              : isModular
                ? `Difusor ${slot.swirlPlate || '—'} · Disco ${slot.disc || '—'}`
                : `${slot.sprayAngleDeg ? `${slot.sprayAngleDeg}° · ` : ''}${slot.color}${isoCode ? ` · ISO ${isoCode}` : ''}`}
          </span>
        </div>
      </button>

      {/* Coluna 3 (150px fixo): Débito Tabelado */}
      <span className="w-[150px] text-[11px] font-medium text-slate-600 tabular-nums whitespace-nowrap">
        Tabelado:{' '}
        <strong className="font-semibold text-slate-900">
          {!configured ? '—' : slot.isActive ? `${formatPt(slot.flowAtPressureLMin)} L/min` : 'Fechado'}
        </strong>
      </span>

      {/* Coluna 4 (145px fixo): Botão 1 toque Débito Real */}
      <div className="w-[145px]">
        <button
          type="button"
          disabled={!configured}
          onClick={(e) => { e.stopPropagation(); if (configured) onEditMeasuredFlow(); }}
          className={`w-full h-7 px-2.5 rounded-lg border text-[11px] font-semibold inline-flex items-center justify-center gap-1 transition-colors tabular-nums whitespace-nowrap ${
            configured
              ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-[#114037] cursor-pointer'
              : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>
            Real:{' '}
            <strong>
              {!configured ? '—' : slot.measuredFlowLMin !== undefined ? `${formatPt(slot.measuredFlowLMin)} L/min` : 'Medir...'}
            </strong>
          </span>
        </button>
      </div>

      {/* Coluna 5 (138px fixo): Badge Desvio ISO 16122 */}
      <div className="w-[138px] flex lg:justify-start">
        {deviationPct === null ? (
          <span className="w-full text-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 tabular-nums">
            —
          </span>
        ) : (
          <span
            className={`w-full text-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tabular-nums whitespace-nowrap ${
              hasIsoAlert ? 'bg-rose-600 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {`${deviationPct > 0 ? '+' : ''}${String(deviationPct).replace('.', ',')}% ISO 16122`}
          </span>
        )}
      </div>

      {/* Coluna 6 (190px fixo): Botões compactos Configurar/Alterar (84px) + Ativo/Fechado (94px) */}
      <div className="flex items-center justify-end gap-3 shrink-0">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEditNozzle(); }}
          className="w-[84px] h-7 px-2 text-xs font-bold rounded-lg bg-[#114037] hover:bg-[#1D734B] text-white flex items-center justify-center gap-1 cursor-pointer transition-colors shrink-0"
        >
          <Edit2 className="w-3 h-3 text-[#3CA64C] shrink-0" />
          <span>{configured ? 'Alterar' : 'Configurar'}</span>
        </button>

        {!hideToggle && onToggleActive && (
          <button
            type="button"
            disabled={!configured}
            onClick={(e) => { e.stopPropagation(); if (configured) onToggleActive(); }}
            className={`w-[94px] h-7 px-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-1 transition-colors shrink-0 ${
              !configured
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : slot.isActive
                  ? 'bg-emerald-50 text-[#114037] border-emerald-300 cursor-pointer'
                  : 'bg-slate-100 text-slate-500 border-slate-300 cursor-pointer'
            }`}
          >
            <Power className="w-3 h-3 shrink-0" />
            <span>{slot.isActive ? 'Ativo' : 'Fechado'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
