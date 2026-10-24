import React from 'react';
import { Target, TrendingDown, Layers, Droplets, BookmarkCheck } from 'lucide-react';
import type { EppoDoseCalculationResult, DoseUnitMode, TreatmentMode } from './eppoDoseDataMapper';

interface EppoDoseResultCardProps {
  calculationResult: EppoDoseCalculationResult;
  doseRotulo: number;
  treatmentMode: TreatmentMode;
  unitMode: DoseUnitMode;
  capacidadeDeposito: number;
  canopyMethod?: 'lwa' | 'trv';
  onUpdateCultureProfile?: () => void;
  selectedCultureName?: string;
}

export const EppoDoseResultCard: React.FC<EppoDoseResultCardProps> = ({
  calculationResult,
  doseRotulo,
  treatmentMode,
  unitMode,
  capacidadeDeposito,
  canopyMethod = 'lwa',
  onUpdateCultureProfile,
  selectedCultureName
}) => {
  const {
    lwaReal,
    trvReal,
    racioAjuste,
    doseAjustada,
    reducaoPercentual,
    produtoPorDeposito,
    hectaresPorDeposito,
    concentracaoPor100L,
    concentracaoPor100LSub,
    isValid
  } = calculationResult;

  const unitRate = unitMode === 'liquid' ? 'L/ha' : 'kg/ha';
  const unitTank = unitMode === 'liquid' ? 'L' : 'kg';
  const unitConcSub = unitMode === 'liquid' ? 'mL/100L' : 'g/100L';
  const unitConcMain = unitMode === 'liquid' ? 'L/100L' : 'kg/100L';

  const isSaving = reducaoPercentual > 0;
  const isNeutral = reducaoPercentual === 0;

  return (
    <section
      aria-label="Resultado da dose ajustada pelo método EPPO"
      className="bg-[#114037] text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-[#1D734B] space-y-4"
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#3CA64C]/20 border border-[#3CA64C]/40 flex items-center justify-center text-[#3AAA35]">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-[#3AAA35] block">
              Resultado Oficial
            </span>
            <span className="text-xs text-slate-200 font-semibold">
              {canopyMethod === 'trv'
                ? 'Dose Proporcional ao Volume de Copa (EPPO PP 1/239)'
                : 'Dose Proporcional à Parede Foliar (EPPO PP 1/239)'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {treatmentMode === 'band' && (
            <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-400/20 text-amber-200 border border-amber-400/40 px-2 py-0.5 rounded-lg">
              Em Faixa
            </span>
          )}
          <span className="text-[11px] font-mono text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
            {canopyMethod === 'trv' ? 'Rácio TRV: ' : 'Rácio LWA: '}
            {racioAjuste.toFixed(3)}
          </span>
        </div>
      </div>

      {/* Cartão Verde Dividido: Concentração vs Total Depósito */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Lado Esquerdo: Concentração por 100L */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Layers className="w-3.5 h-3.5 text-[#3AAA35]" />
              <span>Concentração</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Por 100 L de calda</p>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-white">
                {isValid ? concentracaoPor100LSub.toFixed(1) : '--'}
              </span>
              <span className="text-base font-bold text-[#3AAA35]">{unitConcSub}</span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              ({isValid ? concentracaoPor100L.toFixed(3) : '--'} {unitConcMain})
            </p>
          </div>
        </div>

        {/* Lado Direito: Quantidade Total por Depósito */}
        <div className="bg-emerald-950/70 border border-emerald-600/50 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-1">
              <Droplets className="w-3.5 h-3.5 text-[#8ffa94]" />
              <span>Total por Depósito</span>
            </div>
            <p className="text-[11px] text-emerald-300/80 font-medium">
              Depósito: {capacidadeDeposito} L • Cobertura: {isValid ? `${hectaresPorDeposito.toFixed(2)} ha` : '--'}
            </p>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-white">
                {isValid ? produtoPorDeposito.toFixed(2) : '--'}
              </span>
              <span className="text-base font-bold text-[#8ffa94]">{unitTank} / dep.</span>
            </div>
            <p className="text-[11px] font-medium text-emerald-200/90 mt-0.5">
              Dose ajustada: <strong>{isValid ? doseAjustada.toFixed(3) : '--'} {unitRate}</strong> (Rótulo: {doseRotulo} {unitRate})
            </p>
          </div>
        </div>
      </div>

      <div className="pt-1 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div
          className={`px-3 py-1.5 rounded-xl border font-bold inline-flex items-center gap-1.5 ${
            isSaving
              ? 'bg-emerald-500/20 text-[#8ffa94] border-emerald-500/40'
              : isNeutral
              ? 'bg-white/10 text-slate-200 border-white/20'
              : 'bg-amber-500/20 text-amber-200 border-amber-500/40'
          }`}
        >
          <TrendingDown className="w-4 h-4 shrink-0" />
          <span>
            {isSaving
              ? `Poupança de produto: ${reducaoPercentual}% face ao rótulo`
              : isNeutral
              ? 'Dose igual à referência do rótulo'
              : `Acréscimo foliar: +${Math.abs(reducaoPercentual)}%`}
          </span>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          {canopyMethod === 'trv'
            ? `TRV: ${isValid ? `${trvReal.toLocaleString('pt-PT')} m³/ha` : '--'}`
            : `LWA: ${isValid ? `${lwaReal.toLocaleString('pt-PT')} m²/ha` : '--'}`}
        </span>
      </div>

      {onUpdateCultureProfile && selectedCultureName && (
        <div className="pt-2 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
          <span className="text-[11px] text-emerald-200/80 font-medium">
            Cultura ativa: {selectedCultureName}
          </span>
          <button
            type="button"
            onClick={onUpdateCultureProfile}
            className="min-h-[44px] px-3.5 py-1.5 bg-[#3CA64C]/30 hover:bg-[#3CA64C]/40 border border-[#3CA64C]/60 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer touch-target"
          >
            <BookmarkCheck className="w-4 h-4 text-[#8ffa94]" />
            <span>Atualizar Dados no Perfil da Cultura</span>
          </button>
        </div>
      )}
    </section>
  );
};
