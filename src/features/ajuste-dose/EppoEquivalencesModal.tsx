import React from 'react';
import { X, Scale, ArrowDown, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { EppoDoseInputs, EppoDoseResults } from './types';
import { formatEppoNum } from './calculations';

export interface EppoEquivalencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: EppoDoseInputs;
  results: EppoDoseResults;
  unitLarge: string;
  unitSmall: string;
}

export const EppoEquivalencesModal: React.FC<EppoEquivalencesModalProps> = ({
  isOpen,
  onClose,
  inputs,
  results,
  unitLarge,
  unitSmall
}) => {
  if (!isOpen) return null;

  const isWallCrop = inputs.cropReference === 'vinha';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] overflow-y-auto w-full max-w-4xl bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#114037] text-[#3CA64C] flex items-center justify-center shadow-xs shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C]">
                Triângulo de Conversão • EPPO PP 1/239 (3)
              </span>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                Memória de Cálculo & Interligação
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar memória de cálculo"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* FLUXO DO TRIÂNGULO DE CONVERSÃO EPPO (PASSO A -> PASSO B -> PASSO C) */}
        <div className="space-y-2 text-xs">
          {/* Vértice 1: Dose do Rótulo + Alvo Vegetal */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                1. Origem: Especificação do Rótulo × Copa Real
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[10px] font-bold text-[#114037]">
                Fator: {formatEppoNum(results.canopyAdjustmentRatio * 100, 0)}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
              <span className="font-mono font-black text-slate-900 text-sm">
                Rótulo ({inputs.labelDoseType}): {formatEppoNum(inputs.labelDoseValue, 2)}
              </span>
              <ArrowRight className="w-4 h-4 text-[#3CA64C] shrink-0" />
              <span className="font-mono font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                {isWallCrop
                  ? `tLWA = ${formatEppoNum(results.lwaM2Ha, 0)} m²/ha`
                  : `TRV = ${formatEppoNum(results.trvM3Ha, 0)} m³/ha`}
              </span>
            </div>
          </div>

          {/* Seta Conectora 1 -> 2 */}
          <div className="flex items-center justify-center gap-2 py-0.5 text-[11px] font-mono font-bold text-[#114037]">
            <ArrowDown className="w-4 h-4 text-[#3CA64C]" />
            <span>
              D_GA = D_LWA × (tLWA / 10 000) = D_TRV × (TRV / 10 000)
            </span>
          </div>

          {/* Vértice 2: Dose Ajustada de Solo + Interconversão LWA <-> TRV */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900">
                2. Dose Ajustada de Solo (D_GA Harmonizada)
              </span>
              <span className="font-mono text-base font-black text-[#114037]">
                {formatEppoNum(results.EquivalentDoses.dGa, 2)} {unitLarge}/ha
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-200/60">
              <div className="bg-white/90 p-2 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-slate-500 block">Equivalente D_LWA</span>
                <span className="font-mono font-black text-slate-900">
                  {formatEppoNum(results.EquivalentDoses.dLwa, 2)} {unitLarge} / 10 000 m²
                </span>
              </div>
              <div className="bg-white/90 p-2 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-slate-500 block">Equivalente D_TRV</span>
                <span className="font-mono font-black text-slate-900">
                  {formatEppoNum(results.EquivalentDoses.dTrv, 2)} {unitLarge} / 10 000 m³
                </span>
              </div>
            </div>
          </div>

          {/* Seta Conectora 2 -> 3 */}
          <div className="flex items-center justify-center gap-2 py-0.5 text-[11px] font-mono font-bold text-[#114037]">
            <ArrowDown className="w-4 h-4 text-[#3CA64C]" />
            <span>
              Diluído em {inputs.sprayVolumeLHa} L/ha → Depósito de {inputs.tankCapacityL} L
            </span>
          </div>

          {/* Vértice 3: Concentração na Calda -> Produto no Depósito */}
          <div className="p-3.5 rounded-2xl bg-[#114037] text-white space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#a2d0c3] block">
                  3. Concentração na Calda (D_hL)
                </span>
                <span className="font-mono text-sm font-black text-white">
                  {formatEppoNum(results.EquivalentDoses.dHl, 0)} {unitSmall}/hL
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8ffa94] shrink-0" />
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8ffa94] block">
                  Produto no Depósito
                </span>
                <span className="font-mono text-base font-black text-[#8ffa94]">
                  {formatEppoNum(results.productInTankMethod1Large, 2)} {unitLarge} (
                  {formatEppoNum(results.productInTankMethod1Small, 0)} {unitSmall})
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-[#a2d0c3]">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#8ffa94]" />
                Convergência Método 1 = Método 2
              </span>
              <span className="font-mono font-bold text-white">
                {formatEppoNum(results.treatedAreaPerTankHa, 2)} ha / depósito
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-[#114037] hover:bg-[#18564a] text-white text-xs font-extrabold transition-colors cursor-pointer"
        >
          Fechar Memória de Cálculo
        </button>
      </div>
    </div>
  );
};
