import React from 'react';
import { FlaskConical, MapPin } from 'lucide-react';
import type { DoseCalculationResult, DoseUnitMode } from './doseDataMapper';
import { DidacticHelp } from '../concentracao/DidacticHelp';

interface DoseResultCardProps {
  calculationResult: DoseCalculationResult;
  volPreparar: number;
  doseValue: number;
  unitMode: DoseUnitMode;
  volCalda: number;
}

export const DoseResultCard: React.FC<DoseResultCardProps> = ({
  calculationResult,
  volPreparar,
  doseValue,
  unitMode,
  volCalda
}) => {
  const {
    primaryValue,
    primaryUnit,
    subValue,
    subUnit,
    area_tratada_ha,
    isValid
  } = calculationResult;

  const doseUnit = unitMode === 'solid' ? 'kg/ha' : 'L/ha';

  return (
    <section
      aria-label="Resultado da quantidade de produto a introduzir no depósito"
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

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
            Q = ({volPreparar} L × {doseValue} {doseUnit}) / {volCalda} L/ha
          </span>
          <DidacticHelp
            faqFile="DoseFAQQuantidadeProduto.md"
            topic="dose-qtd"
            variant="icon"
            iconType="info"
            className="text-slate-300 hover:text-white"
          />
        </div>
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

        {/* Informação da Área Tratada por Depósito */}
        <div className="bg-emerald-950/60 border border-emerald-700/80 rounded-2xl p-3 sm:px-4 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-bold">
              <MapPin className="w-4 h-4 text-[#3AAA35] shrink-0" />
              <span>Área Tratada por Depósito</span>
            </div>
            <DidacticHelp
              faqFile="DoseFAQAreaTratada.md"
              topic="dose-area"
              variant="icon"
              iconType="info"
              className="text-emerald-300 hover:text-white"
            />
          </div>
          <div className="text-base font-mono font-black text-white">
            {isValid && area_tratada_ha > 0 ? `${area_tratada_ha.toFixed(2)} ha` : '--'}
          </div>
          <p className="text-[10px] text-emerald-300/80 leading-tight">
            Depósito {volPreparar} L a debitar {volCalda} L/ha
          </p>
        </div>
      </div>
    </section>
  );
};
