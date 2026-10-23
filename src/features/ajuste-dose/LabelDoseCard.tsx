import React from 'react';
import { FileText, ChevronDown, ChevronUp, ArrowRight, Check } from 'lucide-react';
import type { DoseUnitMode, LabelDoseType } from './types';
import { formatEppoNum } from './calculations';
import { EppoNumericField } from './EppoNumericField';

export interface LabelDoseCardProps {
  isOpen: boolean;
  onToggle: () => void;
  onNextStep: () => void;
  labelDoseType: LabelDoseType;
  labelDoseValue: number;
  unitMode: DoseUnitMode;
  onChangeDoseType: (type: LabelDoseType) => void;
  onChangeDoseValue: (val: number) => void;
  onChangeUnitMode: (mode: DoseUnitMode) => void;
}

const DOSE_TYPE_OPTIONS: {
  id: LabelDoseType;
  shortLabel: string;
  description: string;
  unitLiquid: string;
  unitSolid: string;
  presets: number[];
  decimals: number;
}[] = [
  {
    id: 'D_GA',
    shortLabel: 'Área de Superfície ha',
    description: 'Dose por hectare de superfície de solo (ajustada à copa real)',
    unitLiquid: 'L/ha',
    unitSolid: 'kg/ha',
    presets: [0.5, 1.0, 1.5, 2.0, 3.0],
    decimals: 2
  },
  {
    id: 'D_LWA',
    shortLabel: 'Parede Foliar (LWA)',
    description: 'Dose expressa por 10 000 m² de Área de Parede Foliar (LWA)',
    unitLiquid: 'L/LWA',
    unitSolid: 'kg/LWA',
    presets: [0.5, 1.0, 1.5, 2.0, 2.5],
    decimals: 2
  },
  {
    id: 'D_TRV',
    shortLabel: 'Volume Copa (TRV)',
    description: 'Dose expressa por 10 000 m³ de Volume de Copa (TRV)',
    unitLiquid: 'L/TRV',
    unitSolid: 'kg/TRV',
    presets: [0.5, 1.0, 1.5, 2.0, 2.5],
    decimals: 2
  },
  {
    id: 'D_hl',
    shortLabel: 'Concentração (hL)',
    description: 'Dose expressa por hectolitro de água (100 L de calda)',
    unitLiquid: 'mL/hL',
    unitSolid: 'g/hL',
    presets: [50, 100, 150, 200, 250],
    decimals: 0
  }
];

export const LabelDoseCard: React.FC<LabelDoseCardProps> = ({
  isOpen,
  onToggle,
  onNextStep,
  labelDoseType,
  labelDoseValue,
  unitMode,
  onChangeDoseType,
  onChangeDoseValue,
  onChangeUnitMode
}) => {
  const activeOption =
    DOSE_TYPE_OPTIONS.find((o) => o.id === labelDoseType) || DOSE_TYPE_OPTIONS[0];
  const currentUnitLabel =
    unitMode === 'liquid' ? activeOption.unitLiquid : activeOption.unitSolid;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all">
      {/* Cabeçalho Clicável do Acordeão */}
      <div
        onClick={onToggle}
        className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${
              isOpen
                ? 'bg-[#114037] text-[#8ffa94]'
                : 'bg-emerald-50 text-[#114037] border border-emerald-200'
            }`}
          >
            {isOpen ? <FileText className="w-4 h-4" /> : <Check className="w-4 h-4 stroke-[2.5]" />}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C] block">
              Passo 2 de 3 • Especificação Homologada
            </span>
            <h2 className="text-sm sm:text-base font-black text-slate-900 truncate">
              Dados do Rótulo
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isOpen && (
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
              {activeOption.shortLabel} • {formatEppoNum(labelDoseValue, activeOption.decimals)}{' '}
              {currentUnitLabel}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1">
            <span>{isOpen ? 'Ocultar' : 'Editar'}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </div>
      </div>

      {/* Corpo Expansível do Passo 2 */}
      {isOpen && (
        <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-slate-100 space-y-4 animate-fade-in">
          {/* Seletor Rápido Líquido vs Sólido */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => onChangeUnitMode('liquid')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                unitMode === 'liquid'
                  ? 'bg-[#114037] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Produto Líquido (L / mL)
            </button>
            <button
              type="button"
              onClick={() => onChangeUnitMode('solid')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                unitMode === 'solid'
                  ? 'bg-[#114037] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Produto Sólido (kg / g)
            </button>
          </div>

          {/* 5. Grelha 2x2 Sem Overflow para Expressão da Dose no Rótulo (Com Separação Visual) */}
          <div className="mt-6 border-t border-slate-100 pt-4 space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
              Expressão da Dose no Rótulo
            </span>
            <div className="grid grid-cols-2 gap-2">
              {DOSE_TYPE_OPTIONS.map((opt) => {
                const isSelected = opt.id === labelDoseType;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeDoseType(opt.id)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer touch-target ${
                      isSelected
                        ? 'bg-[#114037] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {opt.shortLabel}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 font-medium px-0.5">
              {activeOption.description}
            </p>
          </div>

          {/* Input Numérico com DaterraKeypad ao Toque + Máx 5 Atalhos */}
          <EppoNumericField
            label={`Valor da Dose (${currentUnitLabel})`}
            value={labelDoseValue}
            onChange={onChangeDoseValue}
            unit={currentUnitLabel}
            presets={activeOption.presets}
            min={0.01}
            decimals={activeOption.decimals}
          />

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={onNextStep}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#114037] hover:bg-[#19584b] text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Seguinte: Máquina & Depósito</span>
              <ArrowRight className="w-4 h-4 text-[#8ffa94]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
