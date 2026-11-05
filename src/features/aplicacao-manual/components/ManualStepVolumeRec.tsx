/**
 * DATERRA Smart - Componente de Volume Recomendado e Área Jovem (P9, P9A, P10)
 * Cartão de Conteúdo Branco Unificado com ManualChoiceCard e ManualNumericCard (< 200 LOC)
 */

import React from 'react';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import type { ManualCalculationState, ManualStepId } from '../aplicacaoManualTypes';
import { useLanguage } from '../../../context/LanguageContext';
import { ManualChoiceCard } from './ManualChoiceCard';
import { ManualNumericCard } from './ManualNumericCard';

export interface ManualStepVolumeRecProps {
  step: ManualStepId;
  state: ManualCalculationState;
  onUpdateState: (updates: Partial<ManualCalculationState>) => void;
  onNext: () => void;
  onBack: () => void;
  onOpenKeypad: (field: string, currentVal: number | undefined, unit: string, label: string) => void;
}

export const ManualStepVolumeRec: React.FC<ManualStepVolumeRecProps> = ({
  step,
  state,
  onUpdateState,
  onNext,
  onBack,
  onOpenKeypad
}) => {
  const { t } = useLanguage();

  const canContinue =
    (step === 'P9_volume_recomendado_check' && state.hasRecVolume !== undefined) ||
    (step === 'P9A_volume_recomendado_input' && (state.recVolumeLHa ?? 0) > 0) ||
    (step === 'P10_calcular_area_check' && state.hasEnsaio !== undefined);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5 animate-fade-in">
      {/* Fase 1 · P9: Volume Recomendado no Rótulo */}
      {step === 'P9_volume_recomendado_check' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#3CA64C] block">
              {t('manual.step.phase1', 'FASE 1 · TIPO DE APLICAÇÃO')}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
              {t('manual.p9.title', 'O rótulo tem um volume de calda recomendado?')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('manual.p9.desc', 'Volume de calda por hectare de referência para a cultura adulta.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <ManualChoiceCard
              title={t('common.answers.yes', 'Sim')}
              description={t('manual.p9.yesDesc', 'Indicar valor expresso no rótulo')}
              isSelected={state.hasRecVolume === true}
              onSelect={() => onUpdateState({ hasRecVolume: true, recOrigin: 'rotulo' })}
            />
            <ManualChoiceCard
              title={t('manual.p9.no', 'Não / Não sei')}
              description={t('manual.p9.noDesc', 'Usar referência habitual 1000 L/ha')}
              isSelected={state.hasRecVolume === false}
              onSelect={() => onUpdateState({ hasRecVolume: false, recVolumeLHa: 1000, recOrigin: 'predefinido' })}
            />
          </div>

          {state.hasRecVolume === false && (
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-slate-700 flex items-center justify-between gap-3 animate-fade-in">
              <span>{t('manual.p9.refMsg', 'Vamos usar a referência habitual de 1000 L/ha.')}</span>
              <button
                type="button"
                onClick={() => onUpdateState({ hasRecVolume: true, recOrigin: 'editado' })}
                className="text-xs font-bold text-emerald-800 underline cursor-pointer shrink-0"
              >
                {t('manual.p9.changeRef', 'Alterar referência')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Fase 1 · P9A: Input de Volume Recomendado */}
      {step === 'P9A_volume_recomendado_input' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#3CA64C] block">
              {t('manual.step.phase1', 'FASE 1 · TIPO DE APLICAÇÃO')}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
              {t('manual.p9a.title', 'Qual é o volume de calda recomendado?')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('manual.p9a.desc', 'Volume por hectare indicado no rótulo para a cultura.')}
            </p>
          </div>
          <ManualNumericCard
            fieldLabel={t('manual.p9a.fieldLabel', 'Volume Recomendado')}
            currentVal={state.recVolumeLHa ?? 1000}
            unit="L/ha"
            shortcuts={[500, 800, 1000, 1200]}
            onSelectShortcut={(val) => onUpdateState({ recVolumeLHa: val, recOrigin: 'editado' })}
            onOpenKeypad={() =>
              onOpenKeypad('P9A_volume_recomendado_input', state.recVolumeLHa ?? 1000, 'L/ha', t('manual.p9a.fieldLabel', 'Volume Recomendado'))
            }
          />
        </div>
      )}

      {/* Fase 2 · P10: Calcular Área a Tratar (Só Jovem) */}
      {step === 'P10_calcular_area_check' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#3CA64C] block">
              {t('manual.step.phase2', 'FASE 2 · MEDIR APLICAÇÃO')}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
              {t('manual.p10.title', 'Quer calcular a área a tratar?')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('manual.p10.desc', 'Estime a área que consegue tratar com a calda que vai preparar no depósito.')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <ManualChoiceCard
              title={t('common.answers.yes', 'Sim')}
              description={t('manual.p10.yesDesc', 'Indicar medição do ensaio')}
              isSelected={state.hasEnsaio === true}
              onSelect={() => onUpdateState({ hasEnsaio: true })}
            />
            <ManualChoiceCard
              title={t('common.answers.no', 'Não')}
              description={t('manual.p10.noDesc', 'Apenas dose para o depósito')}
              isSelected={state.hasEnsaio === false}
              onSelect={() => onUpdateState({ hasEnsaio: false })}
            />
          </div>
        </div>
      )}

      {/* Barra de Navegação Voltar / Continuar */}
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
          onClick={onNext}
          disabled={!canContinue}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 touch-target ${
            canContinue
              ? 'bg-[#114037] hover:bg-[#114037]/90 text-white cursor-pointer active:scale-98'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          <span>{t('common.actions.continue', 'Continuar')}</span>
          <ArrowRight className="w-4 h-4 text-[#3CA64C]" />
        </button>
      </div>
    </div>
  );
};
