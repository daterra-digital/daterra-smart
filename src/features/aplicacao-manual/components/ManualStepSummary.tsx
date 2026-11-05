/**
 * DATERRA Smart - Resumo e Confirmação de Respostas (P11)
 * Cartão de Conteúdo Branco Unificado (< 200 LOC)
 */

import React from 'react';
import { ChevronLeft, Calculator, Edit2, AlertCircle } from 'lucide-react';
import type { ManualCalculationState, ManualStepId } from '../aplicacaoManualTypes';
import { useLanguage } from '../../../context/LanguageContext';

export interface ManualStepSummaryProps {
  state: ManualCalculationState;
  onEditStep: (step: ManualStepId) => void;
  onBack: () => void;
  onCalculate: () => void;
}

export const ManualStepSummary: React.FC<ManualStepSummaryProps> = ({
  state,
  onEditStep,
  onBack,
  onCalculate
}) => {
  const { t } = useLanguage();

  const isDose = state.mode === 'dose';
  const isConcentracao = state.mode === 'concentracao';
  const isAdulta = isConcentracao && state.plantStage === 'adulta';
  const isJovem = isConcentracao && state.plantStage === 'jovem';

  let calculatedV: number | undefined;
  if (state.hasEnsaio) {
    let A = state.areaMethod === 'area_conhecida' ? state.areaConhecidaM2 : undefined;
    if (state.areaMethod === 'faixa_medida' && state.faixaComprimentoM && state.faixaLarguraM) {
      A = state.faixaComprimentoM * state.faixaLarguraM;
    }
    const W = state.aguaGastaL;
    if (A && W && A > 0 && W > 0) {
      calculatedV = (W * 10000) / A;
    }
  }

  const renderRow = (label: string, value: string, stepTarget: ManualStepId) => (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-b-0 gap-3">
      <div>
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">{label}</span>
        <span className="text-sm font-extrabold text-slate-800">{value}</span>
      </div>
      <button
        type="button"
        onClick={() => onEditStep(stepTarget)}
        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs flex items-center gap-1 transition-colors touch-target min-h-0 h-auto cursor-pointer"
        aria-label={`${t('manual.summary.edit', 'Alterar')} ${label}`}
      >
        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
        <span>{t('manual.summary.edit', 'Alterar')}</span>
      </button>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5 animate-fade-in">
      <div className="space-y-1">
        <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#3CA64C] block">
          {t('manual.step.phase4', 'FASE 4 · REVER E CALCULAR')}
        </span>
        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
          {t('manual.p11.title', 'Confirme os valores introduzidos')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {t('manual.p11.desc', 'Verifique os parâmetros antes de calcular a calda a preparar.')}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 p-4 bg-slate-50/50 space-y-1">
        {renderRow(t('manual.summary.mode', 'Tipo de aplicação'), isDose ? t('manual.summary.dose', 'Dose por hectare') : t('manual.summary.conc', 'Concentração por 100 L'), 'P1_modo')}
        {renderRow(t('manual.summary.state', 'Tipo de produto'), state.productState === 'solido' ? t('manual.p2.solid', 'Sólido') : t('manual.p2.liquid', 'Líquido'), 'P2_estado_produto')}
        {renderRow(t('manual.summary.rate', 'Indicação do rótulo'), `${new Intl.NumberFormat('pt-PT').format(state.rotuloValue ?? 0)} ${state.rotuloUnit || ''}`, 'P3_quantidade_rotulo')}
        {renderRow(t('manual.summary.tank', 'Volume de calda a preparar'), `${new Intl.NumberFormat('pt-PT').format(state.caldaPrepararL ?? 0)} L`, 'P4_calda_preparar')}

        {isConcentracao && renderRow(t('manual.summary.plant', 'Estado vegetativo'), isAdulta ? t('manual.p5.adult', 'Planta adulta') : t('manual.p5.young', 'Planta jovem'), 'P5_estado_planta')}

        {state.hasEnsaio && (
          <>
            {state.areaMethod === 'area_conhecida'
              ? renderRow(t('manual.summary.area', 'Área do ensaio'), `${new Intl.NumberFormat('pt-PT').format(state.areaConhecidaM2 ?? 0)} m²`, 'P7A_area_conhecida')
              : renderRow(t('manual.summary.strip', 'Dimensões da faixa'), `${new Intl.NumberFormat('pt-PT').format(state.faixaComprimentoM ?? 0)} m × ${new Intl.NumberFormat('pt-PT').format(state.faixaLarguraM ?? 0)} m`, 'P7B_comprimento_faixa')}
            {renderRow(t('manual.summary.water', 'Água gasta no ensaio'), `${new Intl.NumberFormat('pt-PT').format(state.aguaGastaL ?? 0)} L`, 'P8_agua_gasta')}
            {calculatedV && (
              <div className="py-2.5 bg-emerald-50/70 px-3.5 rounded-2xl border border-emerald-200/60 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">{t('manual.summary.appliedV', 'Volume de calda medido (V)')}</span>
                <span className="text-sm font-black font-mono-numbers text-emerald-950">{Math.round(calculatedV)} L/ha</span>
              </div>
            )}
          </>
        )}

        {isAdulta && (
          <div className="py-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">{t('manual.summary.recVolume', 'Volume de referência (R)')}</span>
              <span className="text-sm font-extrabold text-slate-800">
                {new Intl.NumberFormat('pt-PT').format(state.recVolumeLHa ?? 1000)} L/ha
                <span className="text-xs font-medium text-slate-500 ml-1.5">
                  ({state.recOrigin === 'rotulo' ? t('manual.summary.recRotulo', 'Rótulo') : state.recOrigin === 'editado' ? t('manual.summary.recEditado', 'Editado') : t('manual.summary.recDefault', 'Referência 1000 L/ha')})
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep('P9A_volume_recomendado_input')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs flex items-center gap-1 transition-colors touch-target min-h-0 h-auto cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('manual.summary.edit', 'Alterar')}</span>
            </button>
          </div>
        )}

        {isJovem && !state.hasEnsaio && (
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{t('manual.summary.noEnsaioJovem', 'Sem ensaio: o cálculo será direto para o volume de calda a preparar.')}</span>
          </div>
        )}
      </div>

      {/* Ações Voltar / Calcular */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-all flex items-center gap-1.5 touch-target cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{t('common.actions.back', 'Voltar')}</span>
        </button>
        <button
          type="button"
          onClick={onCalculate}
          className="px-6 py-3 rounded-2xl bg-[#114037] hover:bg-[#114037]/90 text-white font-extrabold text-sm shadow-md transition-all flex items-center gap-2 touch-target cursor-pointer active:scale-98"
        >
          <Calculator className="w-4 h-4 text-[#3CA64C]" />
          <span>{t('manual.summary.calculate', 'Calcular calda a preparar')}</span>
        </button>
      </div>
    </div>
  );
};
