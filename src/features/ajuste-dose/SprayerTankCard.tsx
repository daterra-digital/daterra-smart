import React from 'react';
import { Sliders, ChevronDown, ChevronUp, Check, AlertTriangle } from 'lucide-react';
import type { CropReferenceType } from './types';
import { formatEppoNum } from './calculations';
import { EppoNumericField } from './EppoNumericField';

export interface SprayerTankCardProps {
  isOpen: boolean;
  onToggle: () => void;
  tankCapacityL: number;
  sprayVolumeLHa: number;
  cropReference: CropReferenceType;
  onChangeTankCapacity: (val: number) => void;
  onChangeSprayVolume: (val: number) => void;
}

const TANK_SHORTCUTS = [400, 600, 1000, 1500, 2000];
const SPRAY_VOL_SHORTCUTS = [300, 400, 500, 800, 1000];

export const SprayerTankCard: React.FC<SprayerTankCardProps> = ({
  isOpen,
  onToggle,
  tankCapacityL,
  sprayVolumeLHa,
  cropReference,
  onChangeTankCapacity,
  onChangeSprayVolume
}) => {
  const runoffThreshold = cropReference === 'vinha' ? 800 : 1200;
  const isExcessiveVolume = sprayVolumeLHa > runoffThreshold;

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
            {isOpen ? <Sliders className="w-4 h-4" /> : <Check className="w-4 h-4 stroke-[2.5]" />}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C] block">
              Passo 3 de 3 • Calibração de Campo
            </span>
            <h2 className="text-sm sm:text-base font-black text-slate-900 truncate">
              Máquina & Depósito
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isOpen && (
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
              Depósito {formatEppoNum(tankCapacityL, 0)} L • {formatEppoNum(sprayVolumeLHa, 0)} L/ha
            </span>
          )}
          <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1">
            <span>{isOpen ? 'Ocultar' : 'Editar'}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </div>
      </div>

      {/* Corpo Expansível do Passo 3 */}
      {isOpen && (
        <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-slate-100 space-y-4 animate-fade-in">
          <EppoNumericField
            label="Capacidade do Depósito (L)"
            value={tankCapacityL}
            onChange={onChangeTankCapacity}
            unit="L"
            presets={TANK_SHORTCUTS}
            min={50}
            decimals={0}
          />

          <EppoNumericField
            label="Volume de Calda a Aplicar (L/ha)"
            value={sprayVolumeLHa}
            onChange={onChangeSprayVolume}
            unit="L/ha"
            presets={SPRAY_VOL_SHORTCUTS}
            min={50}
            decimals={0}
          />

          {/* Callout de Risco de Escorrimento */}
          {isExcessiveVolume && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs leading-relaxed flex items-start gap-2.5 animate-fade-in">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="font-medium">
                <strong className="font-extrabold">⚠️ Risco de Escorrimento:</strong> Volumes muito
                elevados podem causar perda de produto para o solo. Ajuste a eficiência do
                pulverizador.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
