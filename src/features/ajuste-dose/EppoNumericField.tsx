import React, { useState } from 'react';
import { Info, Pencil } from 'lucide-react';
import { DaterraKeypadModal, type KeypadValidationRules } from '../../components/DaterraKeypad';
import { formatEppoNum } from './calculations';

export interface EppoNumericFieldProps {
  label: string;
  value: number;
  onChange: (numValue: number) => void;
  unit: string;
  presets?: number[];
  validationRules?: KeypadValidationRules;
  min?: number;
  tooltipText?: string;
  decimals?: number;
}

export const EppoNumericField: React.FC<EppoNumericFieldProps> = ({
  label,
  value,
  onChange,
  unit,
  presets = [],
  validationRules,
  min = 0,
  tooltipText,
  decimals = 2
}) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  // Limite estrito de no máximo 5 atalhos rápidos
  const visiblePresets = presets.slice(0, 5);

  const handleSelectValue = (numVal: number) => {
    if (!isNaN(numVal) && isFinite(numVal)) {
      onChange(Math.max(min, numVal));
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
          {label}
        </span>
        {tooltipText && (
          <button
            type="button"
            onClick={() => setShowTooltip((prev) => !prev)}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#114037] border border-emerald-200 text-[10px] font-bold transition-colors cursor-pointer"
          >
            <Info className="w-3 h-3 text-[#3CA64C]" />
            <span>O que medir?</span>
          </button>
        )}
      </div>

      {showTooltip && tooltipText && (
        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 leading-relaxed animate-fade-in">
          {tooltipText}
        </div>
      )}

      {/* Zona de toque integral (min 48px) que abre automaticamente o DaterraKeypadModal */}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="w-full min-h-[52px] px-4 py-3 bg-slate-50 hover:bg-white border border-slate-300 hover:border-[#3CA64C] rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer touch-target text-left group shadow-2xs"
      >
        <span className="font-mono text-lg font-black text-slate-900">
          {formatEppoNum(value, decimals)}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {unit && (
            <span className="px-2.5 py-1 bg-slate-200/80 text-slate-700 text-xs font-extrabold rounded-lg">
              {unit}
            </span>
          )}
          <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-500 group-hover:text-[#114037] flex items-center justify-center">
            <Pencil className="w-3.5 h-3.5" />
          </span>
        </div>
      </button>

      {/* Atalhos Rápidos (Máximo 5 opções) */}
      {visiblePresets.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-0.5">
            Atalhos:
          </span>
          {visiblePresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleSelectValue(preset)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all shrink-0 active:scale-95 cursor-pointer ${
                Math.abs(value - preset) < 1e-6
                  ? 'bg-[#114037] text-white border-[#114037] shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-[#3CA64C] hover:bg-[#3CA64C]/10'
              }`}
            >
              {formatEppoNum(preset, decimals)} {unit}
            </button>
          ))}
        </div>
      )}

      {modalOpen && (
        <DaterraKeypadModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          initialValue={String(value)}
          initialUnit={unit}
          availableUnits={unit ? [unit] : []}
          commonValues={visiblePresets}
          label={label}
          validationRules={validationRules}
          onConfirm={(numVal) => {
            handleSelectValue(numVal);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
