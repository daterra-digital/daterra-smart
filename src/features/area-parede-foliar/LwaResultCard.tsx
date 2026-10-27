import React from 'react';
import { Layers, Droplets, Info } from 'lucide-react';
import type { LwaCalculationResult } from './lwaDataMapper';
import { useLanguage } from '../../context/LanguageContext';

interface LwaResultCardProps {
  lwaResult: LwaCalculationResult;
  alturaVegetacao: number;
  distanciaEntrelinhas: number;
}

export const LwaResultCard: React.FC<LwaResultCardProps> = ({
  lwaResult,
  alturaVegetacao,
  distanciaEntrelinhas
}) => {
  const { t } = useLanguage();
  const { area_parede_foliar, caldaReferenciaLHa, caldaMinLHa, caldaMaxLHa, isValid } = lwaResult;

  const getCanopyClassification = () => {
    if (!isValid || area_parede_foliar <= 0) {
      return {
        label: t('areaParedeFoliar.classifications.awaiting', 'Aguardando parâmetros válidos'),
        color: 'bg-slate-800 text-slate-300'
      };
    }
    if (area_parede_foliar < 10000) {
      return {
        label: t('areaParedeFoliar.classifications.low', 'Parede Baixa / Vinha Jovem'),
        color: 'bg-emerald-950/60 text-emerald-200 border-emerald-700/80'
      };
    }
    if (area_parede_foliar <= 18000) {
      return {
        label: t('areaParedeFoliar.classifications.medium', 'Parede Média / Vinha ou Pomar Padrão'),
        color: 'bg-teal-950/60 text-teal-200 border-teal-700/80'
      };
    }
    return {
      label: t('areaParedeFoliar.classifications.high', 'Parede Elevada / Vegetação Vigorosa'),
      color: 'bg-amber-950/60 text-amber-200 border-amber-800/80'
    };
  };

  const status = getCanopyClassification();

  return (
    <section
      aria-label={t('areaParedeFoliar.resultLabel', 'Resultado da área de parede foliar calculada')}
      className="bg-[#114037] text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-[#1D734B] space-y-4"
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#3CA64C]/20 border border-[#3CA64C]/40 flex items-center justify-center text-[#3AAA35]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-[#3AAA35] block">
              {t('areaParedeFoliar.resultBadge', 'Resultado Oficial')}
            </span>
            <span className="text-xs text-slate-200 font-semibold">
              {t('areaParedeFoliar.resultLabel', 'Área de Parede Foliar (LWA)')}
            </span>
          </div>
        </div>

        <span className="text-[11px] font-mono text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
          LWA = (2 × {alturaVegetacao} × 10.000) / {distanciaEntrelinhas}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-white">
              {isValid ? area_parede_foliar.toLocaleString('pt-PT') : '--'}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#3AAA35]">m² LWA/ha</span>
          </div>
          <p className="text-xs text-slate-300 font-medium mt-1">
            {t('areaParedeFoliar.canopySurfaceNote', 'Superfície vertical foliar tratada (ambas as faces da linha de cultivo)')}
          </p>
        </div>

        {/* Volume de Calda Proporcional de Referência */}
        <div className="bg-emerald-950/60 border border-emerald-700/80 rounded-2xl p-3 sm:px-4 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-bold">
            <Droplets className="w-4 h-4 text-[#3AAA35] shrink-0" />
            <span>{t('areaParedeFoliar.referenceVolume', 'Calda Sugerida de Referência')}</span>
          </div>
          <div className="text-base font-mono font-black text-white">
            {isValid ? `~ ${caldaReferenciaLHa} L/ha` : '--'}
          </div>
          <p className="text-[10px] text-emerald-300/80 leading-tight">
            {isValid
              ? t('areaParedeFoliar.operationalRange', 'Faixa operacional: {{min}} a {{max}} L/ha (0,025 a 0,04 L/m²)', { min: caldaMinLHa, max: caldaMaxLHa })
              : '--'}
          </p>
        </div>
      </div>

      <div className="pt-1 flex items-center justify-between">
        <div className={`px-3 py-1 rounded-xl border text-[11px] font-bold inline-flex items-center gap-1.5 ${status.color}`}>
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>{status.label}</span>
        </div>
      </div>
    </section>
  );
};
