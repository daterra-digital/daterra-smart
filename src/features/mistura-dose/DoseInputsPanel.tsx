import React from 'react';
import { Pencil, Droplet, Layers } from 'lucide-react';
import type { DoseUnitMode } from './doseDataMapper';
import { DidacticHelp, type FAQFileType } from '../concentracao/DidacticHelp';

interface DoseInputsPanelProps {
  volPreparar: number;
  doseValue: number;
  unitMode: DoseUnitMode;
  volCalda: number;
  onSetUnitMode: (mode: DoseUnitMode) => void;
  onOpenKeypad: (field: 'volPreparar' | 'doseValue' | 'volCalda') => void;
  onSelectPresetVolPreparar: (val: number) => void;
  onSelectPresetDose: (val: number) => void;
  onSelectPresetVolCalda: (val: number) => void;
}

const PresetButtons: React.FC<{
  presets: number[];
  selected: number;
  unit: string;
  onSelect: (val: number) => void;
}> = ({ presets, selected, unit, onSelect }) => (
  <div className="flex items-center gap-1.5 flex-wrap pt-1">
    {presets.map((preset) => (
      <button
        key={preset}
        type="button"
        onClick={() => onSelect(preset)}
        className={`min-h-[48px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer touch-target ${
          selected === preset
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
        }`}
      >
        {preset} {unit}
      </button>
    ))}
  </div>
);

export const DoseInputsPanel: React.FC<DoseInputsPanelProps> = ({
  volPreparar,
  doseValue,
  unitMode,
  volCalda,
  onSetUnitMode,
  onOpenKeypad,
  onSelectPresetVolPreparar,
  onSelectPresetDose,
  onSelectPresetVolCalda
}) => {
  const isSolid = unitMode === 'solid';
  const doseUnit = isSolid ? 'kg/ha' : 'L/ha';

  const renderCard = (
    label: string,
    valueStr: string,
    field: 'volPreparar' | 'doseValue' | 'volCalda',
    faqFile: FAQFileType,
    topic: string,
    presets: number[],
    selected: number,
    presetUnit: string,
    onSelectPreset: (val: number) => void
  ) => (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-700">{label}</span>
          <DidacticHelp faqFile={faqFile} topic={topic} variant="icon" iconType="info" className="text-slate-400 hover:text-slate-600" />
        </div>
        <button
          type="button"
          onClick={() => onOpenKeypad(field)}
          aria-label={`Editar ${label}`}
          className="min-h-[48px] px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 rounded-xl flex items-center gap-2 shadow-xs cursor-pointer touch-target group"
        >
          <span className="font-mono text-base font-black text-slate-800 group-hover:text-emerald-700">{valueStr}</span>
          <Pencil className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
        </button>
      </div>
      <PresetButtons presets={presets} selected={selected} unit={presetUnit} onSelect={onSelectPreset} />
    </div>
  );

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
      {/* Seletor de Formulação: Líquida vs Sólida */}
      <div>
        <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2 block">
          Formulação do Produto Comercial
        </label>
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => onSetUnitMode('liquid')}
            className={`min-h-[48px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer touch-target ${
              !isSolid ? 'bg-[#114037] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Droplet className="w-4 h-4 shrink-0" />
            <span>Produto Líquido (L/ha)</span>
          </button>
          <button
            type="button"
            onClick={() => onSetUnitMode('solid')}
            className={`min-h-[48px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer touch-target ${
              isSolid ? 'bg-[#114037] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>Produto Sólido (kg/ha)</span>
          </button>
        </div>
      </div>

      {renderCard(
        'Capacidade Útil do Depósito (L)',
        `${volPreparar} L`,
        'volPreparar',
        'DoseFAQVolumePreparar.md',
        'dose-vol-preparar',
        [200, 500, 1000, 1500],
        volPreparar,
        'L',
        onSelectPresetVolPreparar
      )}

      {renderCard(
        `Dose Recomendada no Rótulo (${doseUnit})`,
        `${doseValue} ${doseUnit}`,
        'doseValue',
        'DoseFAQDoseRecomendada.md',
        'dose-recomendada',
        [1, 2, 3, 5],
        doseValue,
        doseUnit,
        onSelectPresetDose
      )}

      {renderCard(
        'Volume de Calda Aplicado (L/ha)',
        `${volCalda} L/ha`,
        'volCalda',
        'DoseFAQVolumeAplicado.md',
        'dose-vol-aplicado',
        [100, 200, 300, 400],
        volCalda,
        'L/ha',
        onSelectPresetVolCalda
      )}
    </div>
  );
};
