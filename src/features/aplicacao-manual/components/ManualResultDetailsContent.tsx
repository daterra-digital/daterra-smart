/**
 * DATERRA Smart - Conteúdo do Acordeão de Detalhes do Cálculo (P12)
 * Valores de Entrada, Ensaio e Fórmulas Teóricas (< 200 LOC)
 */

import React from 'react';
import type { ManualCalculationState, ManualCalculationOutput } from '../aplicacaoManualTypes';
import { useLanguage } from '../../../context/LanguageContext';

export interface ManualResultDetailsContentProps {
  state: ManualCalculationState;
  output: ManualCalculationOutput;
}

export const ManualResultDetailsContent: React.FC<ManualResultDetailsContentProps> = ({
  state,
  output
}) => {
  const { t, language } = useLanguage();
  const numLocale = language === 'en-GB' ? 'en-GB' : 'pt-PT';
  const T = state.caldaPrepararL ?? 0;

  return (
    <div className="p-4 pt-1 border-t border-slate-100 text-xs text-slate-600 space-y-3 bg-slate-50/50">
      {/* Valores de Entrada Utilizados */}
      <div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
          {t('manual.details.inputsTitle', 'Valores de Entrada')}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="p-2 bg-white rounded-xl border border-slate-200/60 flex justify-between">
            <span className="text-slate-500">{t('manual.details.type', 'Tipo de produto')}:</span>
            <strong className="text-slate-800 font-mono-numbers">
              {output.isSolid ? t('manual.details.solid', 'Sólido') : t('manual.details.liquid', 'Líquido')}
            </strong>
          </div>
          <div className="p-2 bg-white rounded-xl border border-slate-200/60 flex justify-between">
            <span className="text-slate-500">
              {state.mode === 'dose'
                ? t('manual.details.labelDose', 'Dose no rótulo')
                : t('manual.details.labelConc', 'Concentração no rótulo')}
              :
            </span>
            <strong className="text-slate-800 font-mono-numbers">
              {state.rotuloValue} {state.rotuloUnit}
            </strong>
          </div>
          <div className="p-2 bg-white rounded-xl border border-slate-200/60 flex justify-between">
            <span className="text-slate-500">{t('manual.details.tankVol', 'Volume do depósito')}:</span>
            <strong className="text-slate-800 font-mono-numbers">{T} L</strong>
          </div>
          <div className="p-2 bg-white rounded-xl border border-slate-200/60 flex justify-between">
            <span className="text-slate-500">{t('manual.details.stage', 'Estado vegetativo')}:</span>
            <strong className="text-slate-800 font-mono-numbers">
              {state.plantStage === 'jovem' ? t('manual.details.young', 'Planta jovem') : t('manual.details.adult', 'Planta adulta')}
            </strong>
          </div>
        </div>
      </div>

      {/* Parâmetros do Ensaio / Medição */}
      {state.hasEnsaio && (
        <div className="pt-2 border-t border-slate-200/60">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
            {t('manual.details.trialTitle', 'Medição do Ensaio em Branco')}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono-numbers">
            {output.areaEnsaioM2 && (
              <div className="p-2 bg-white rounded-xl border border-slate-200/60 flex justify-between">
                <span className="text-slate-500">{t('manual.details.trialArea', 'Área do ensaio (A)')}:</span>
                <strong className="text-slate-800">{new Intl.NumberFormat(numLocale).format(output.areaEnsaioM2)} m²</strong>
              </div>
            )}
            {state.aguaGastaL && (
              <div className="p-2 bg-white rounded-xl border border-slate-200/60 flex justify-between">
                <span className="text-slate-500">{t('manual.details.trialWater', 'Água gasta (W)')}:</span>
                <strong className="text-slate-800">{new Intl.NumberFormat(numLocale).format(state.aguaGastaL)} L</strong>
              </div>
            )}
            {output.volumeAplicadoLHa && (
              <div className="p-2 bg-white rounded-xl border border-slate-200/60 flex justify-between sm:col-span-2">
                <span className="text-slate-500">{t('manual.details.rateV', 'Volume medido de calda (V)')}:</span>
                <strong className="text-[#114037]">{new Intl.NumberFormat(numLocale).format(Math.round(output.volumeAplicadoLHa))} L/ha</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fórmulas e Relações Teóricas */}
      <div className="pt-2 border-t border-slate-200/60 space-y-1">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
          {t('manual.details.formulaTitle', 'Fórmulas e Ajustes')}
        </span>
        {state.recVolumeLHa !== undefined && (
          <div className="text-[11px] text-slate-600">
            • {t('manual.details.recVolume', 'Volume de referência (R)')}: <strong>{state.recVolumeLHa} L/ha</strong>{' '}
            <span className="text-slate-400">({state.recOrigin === 'predefinido' ? t('manual.details.originDefault', 'Predefinido habitual') : t('manual.details.originLabel', 'Indicado no rótulo / editado')})</span>
          </div>
        )}
        {output.fatorAjusteRV && (
          <div className="text-[11px] text-slate-600">
            • {t('manual.details.factorRV', 'Fator de ajuste (R / V)')}: <strong>{output.fatorAjusteRV.toFixed(2)}</strong>
          </div>
        )}
        {output.doseEquivalenteTeorica && (
          <div className="text-[11px] text-slate-600">
            • {t('manual.details.equivDose', 'Dose equivalente teórica')}: <strong>{output.doseEquivalenteTeorica.toFixed(1)} {output.isSolid ? 'g/ha' : 'mL/ha'}</strong>
          </div>
        )}
      </div>
    </div>
  );
};
