import React from 'react';
import { FlaskConical, Droplet, Sprout, Trees } from 'lucide-react';
import type {
  ConcentracaoCalculationResult,
  ConcentracaoUnit,
  ConcentracaoMode
} from './concentracaoDataMapper';

interface ConcentracaoResultCardProps {
  calculationResult: ConcentracaoCalculationResult;
  concValue: number;
  concUnit: ConcentracaoUnit;
  volPreparar: number;
  mode: ConcentracaoMode;
  volRecomendado: number;
  volAplicado: number;
}

export const ConcentracaoResultCard: React.FC<ConcentracaoResultCardProps> = ({
  calculationResult,
  concValue,
  concUnit,
  volPreparar,
  mode,
  volRecomendado,
  volAplicado
}) => {
  const {
    primaryValue,
    primaryUnit,
    subValue,
    subUnit,
    doseEquivalenteLHa,
    isValid
  } = calculationResult;

  const isJovem = mode === 'jovem';

  return (
    <section
      aria-label="Resultado da quantidade de produto a adicionar ao depósito"
      className="bg-[#114037] text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-[#1D734B] space-y-4"
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#3CA64C]/20 border border-[#3CA64C]/40 flex items-center justify-center text-[#3AAA35]">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-[#3AAA35] block">
              Resultado Oficial
            </span>
            <span className="text-xs text-slate-200 font-semibold">
              Quantidade de Produto por Depósito
            </span>
          </div>
        </div>

        <span className="text-[11px] font-mono text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
          {isJovem
            ? `Q = (${concValue} ${concUnit} × ${volPreparar} L) / 100`
            : `Q = (${volPreparar} × ${concValue} × ${volRecomendado}) / (${volAplicado} × 100)`}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-white">
              {isValid ? primaryValue.toFixed(2) : '--'}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#3AAA35]">{primaryUnit}</span>
            {isValid && (
              <span className="text-sm font-mono text-slate-300 font-semibold ml-1">
                ({subValue.toLocaleString('pt-PT')} {subUnit})
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 font-medium mt-1">
            Produto comercial a introduzir no depósito de {volPreparar} Litros
          </p>
        </div>

        {/* Informação Operacional e Rendimento por Hectare */}
        <div className="bg-emerald-950/60 border border-emerald-700/80 rounded-2xl p-3 sm:px-4 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-bold">
            <Droplet className="w-4 h-4 text-[#3AAA35] shrink-0" />
            <span>Dose Equivalente de Campo</span>
          </div>
          <div className="text-base font-mono font-black text-white">
            {isValid && doseEquivalenteLHa > 0
              ? `~ ${doseEquivalenteLHa} ${primaryUnit}/ha`
              : 'Conforme volume aplicado'}
          </div>
          <p className="text-[10px] text-emerald-300/80 leading-tight">
            Volume de calda: {isJovem ? `${volAplicado} L/ha` : `${volAplicado} L/ha (Ref: ${volRecomendado} L)`}
          </p>
        </div>
      </div>

      <div className="pt-1 flex items-center justify-between flex-wrap gap-2">
        <div className="px-3 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 bg-emerald-500/20 text-[#8ffa94] border-emerald-500/40">
          {isJovem ? <Sprout className="w-4 h-4 shrink-0" /> : <Trees className="w-4 h-4 shrink-0" />}
          <span>
            {isJovem
              ? 'Modo Planta Jovem (Diluição Direta na Calda)'
              : 'Modo Copa Adulta (Compensação Hidráulica da Calda)'}
          </span>
        </div>
      </div>
    </section>
  );
};
