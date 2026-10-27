import React from 'react';
import { FlaskConical, AlertTriangle, CheckCircle, ShieldAlert, Droplets } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import type { PhCalculationResult, TipoCalda } from './phDataMapper';
import { TIPO_CALDA_CONFIG } from './phDataMapper';
import { DidacticHelp } from '../concentracao/DidacticHelp';

interface PhResultCardProps {
  calculationResult: PhCalculationResult;
  ph: number;
  tipoCalda: TipoCalda;
}

export const PhResultCard: React.FC<PhResultCardProps> = ({
  calculationResult,
  ph,
  tipoCalda
}) => {
  const { t } = useTranslation();
  const {
    status,
    statusLabel,
    actionRecommendation,
    alertLevel,
    intervaloMin,
    intervaloMax,
    isValid
  } = calculationResult;

  const caldaConfig = TIPO_CALDA_CONFIG[tipoCalda];

  return (
    <section
      aria-label={t('calculators.ph.resultAria', 'Resultado da avaliação de pH da calda')}
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
              Diagnóstico do pH da Água • {caldaConfig.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
            Alvo: {intervaloMin.toFixed(1)} – {intervaloMax.toFixed(1)} pH
          </span>
          <DidacticHelp
            faqFile="MisturaFAQpH.md"
            topic="ph-resultado"
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
              {isValid ? ph.toFixed(2) : '--'}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#3AAA35]">pH</span>
            <div className="ml-2 inline-flex">
              {alertLevel === 'success' && (
                <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-500/20 text-[#8ffa94] border border-emerald-500/40 inline-flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Ideal</span>
                </span>
              )}
              {alertLevel === 'warning' && (
                <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{status.includes('alcalino') ? t('calculators.ph.alkaline', 'Alcalino') : t('calculators.ph.acidic', 'Ácido')}</span>
                </span>
              )}
              {alertLevel === 'danger' && (
                <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 inline-flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{t('calculators.ph.critical', 'Crítico')}</span>
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-300 font-medium mt-1">
            {statusLabel}
          </p>
        </div>

        {/* Card de Orientação Agronómica de Ação Direta */}
        <div
          className={`rounded-2xl p-3 sm:px-4 space-y-1 border ${
            alertLevel === 'success'
              ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-200'
              : alertLevel === 'warning'
              ? 'bg-amber-950/60 border-amber-700/80 text-amber-200'
              : 'bg-rose-950/60 border-rose-700/80 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <Droplets className="w-4 h-4 shrink-0" />
            <span>{t('calculators.ph.fieldGuidance', 'Orientação de Campo')}</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-white leading-snug">
            {actionRecommendation}
          </p>
        </div>
      </div>
    </section>
  );
};
