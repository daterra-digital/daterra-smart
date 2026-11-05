/**
 * DATERRA Smart - Componente de Perguntas de Ensaio (P6 a P8)
 * Cartão de Conteúdo Branco Unificado com ManualNumericCard e ManualChoiceCard (< 200 LOC)
 */

import React from 'react';
import { ChevronLeft, ArrowRight, Ruler, MapPin } from 'lucide-react';
import type { ManualCalculationState, ManualStepId } from '../aplicacaoManualTypes';
import { useLanguage } from '../../../context/LanguageContext';
import { ManualChoiceCard } from './ManualChoiceCard';
import { ManualNumericCard } from './ManualNumericCard';

export interface ManualStepEnsaioProps {
  step: ManualStepId;
  state: ManualCalculationState;
  onUpdateState: (updates: Partial<ManualCalculationState>) => void;
  onNext: () => void;
  onBack: () => void;
  onOpenKeypad: (field: string, currentVal: number | undefined, unit: string, label: string) => void;
}

export const ManualStepEnsaio: React.FC<ManualStepEnsaioProps> = ({
  step,
  state,
  onUpdateState,
  onNext,
  onBack,
  onOpenKeypad
}) => {
  const { t } = useLanguage();

  const canContinue =
    (step === 'P6_metodo_ensaio' && Boolean(state.areaMethod)) ||
    (step === 'P7A_area_conhecida' && (state.areaConhecidaM2 ?? 0) > 0) ||
    (step === 'P7B_comprimento_faixa' && (state.faixaComprimentoM ?? 0) > 0) ||
    (step === 'P7C_largura_faixa' && (state.faixaLarguraM ?? 0) > 0) ||
    (step === 'P8_agua_gasta' && (state.aguaGastaL ?? 0) > 0);

  const openKeypadHandler = (field: string, val: number | undefined, unit: string, label: string) => () =>
    onOpenKeypad(field, val, unit, label);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5 animate-fade-in">
      {/* Fase 2 · P6: Método de Medição da Área */}
      {step === 'P6_metodo_ensaio' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#3CA64C] block">
              {t('manual.step.phase2', 'FASE 2 · MEDIR APLICAÇÃO')}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
              {t('manual.p6.title', 'Sabe quanto gasta numa área conhecida?')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('manual.p6.desc', 'Escolha como mediu a área do ensaio em branco com água limpa.')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <ManualChoiceCard
              title={t('manual.p6.knownArea', 'Área conhecida')}
              description={t('manual.p6.knownAreaDesc', 'Ex: canteiro, talhão ou medição direta em m²')}
              icon={<MapPin className="w-5 h-5 text-[#3CA64C]" />}
              isSelected={state.areaMethod === 'area_conhecida'}
              onSelect={() => onUpdateState({ hasEnsaio: true, areaMethod: 'area_conhecida' })}
            />
            <ManualChoiceCard
              title={t('manual.p6.measuredStrip', 'Faixa medida')}
              description={t('manual.p6.measuredStripDesc', 'Comprimento e largura efetiva tratada (m)')}
              icon={<Ruler className="w-5 h-5 text-[#3CA64C]" />}
              isSelected={state.areaMethod === 'faixa_medida'}
              onSelect={() => onUpdateState({ hasEnsaio: true, areaMethod: 'faixa_medida' })}
            />
          </div>
        </div>
      )}

      {/* Fase 2 · P7A: Área Conhecida */}
      {step === 'P7A_area_conhecida' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#3CA64C] block">
              {t('manual.step.phase2', 'FASE 2 · MEDIR APLICAÇÃO')}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
              {t('manual.p7a.title', 'Que área tratou no ensaio?')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('manual.p7a.desc', 'Superfície de ensaio tratada com o pulverizador e água limpa.')}
            </p>
          </div>
          <ManualNumericCard
            fieldLabel={t('manual.p7a.fieldLabel', 'Área Tratada no Ensaio')}
            currentVal={state.areaConhecidaM2}
            unit="m²"
            shortcuts={[10, 20, 50, 100]}
            onSelectShortcut={(val) => onUpdateState({ areaConhecidaM2: val })}
            onOpenKeypad={openKeypadHandler('P7A_area_conhecida', state.areaConhecidaM2, 'm²', t('manual.p7a.fieldLabel', 'Área Tratada no Ensaio'))}
          />
        </div>
      )}

      {/* Fase 2 · P7B: Comprimento da Faixa */}
      {step === 'P7B_comprimento_faixa' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#3CA64C] block">
              {t('manual.step.phase2', 'FASE 2 · MEDIR APLICAÇÃO')}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
              {t('manual.p7b.title', 'Qual é o comprimento da faixa?')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('manual.p7b.desc', 'Distância percorrida durante a aplicação de teste.')}
            </p>
          </div>
          <ManualNumericCard
            fieldLabel={t('manual.p7b.fieldLabel', 'Comprimento da Faixa')}
            currentVal={state.faixaComprimentoM}
            unit="m"
            shortcuts={[5, 10, 20, 50]}
            onSelectShortcut={(val) => onUpdateState({ faixaComprimentoM: val })}
            onOpenKeypad={openKeypadHandler('P7B_comprimento_faixa', state.faixaComprimentoM, 'm', t('manual.p7b.fieldLabel', 'Comprimento da Faixa'))}
          />
        </div>
      )}

      {/* Fase 2 · P7C: Largura da Faixa */}
      {step === 'P7C_largura_faixa' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#3CA64C] block">
              {t('manual.step.phase2', 'FASE 2 · MEDIR APLICAÇÃO')}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
              {t('manual.p7c.title', 'Qual é a largura da faixa tratada?')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('manual.p7c.desc', 'Largura molhada pelo bico ou lança (não usar a entrelinha inteira se não a molhar toda).')}
            </p>
          </div>
          <ManualNumericCard
            fieldLabel={t('manual.p7c.fieldLabel', 'Largura da Faixa')}
            currentVal={state.faixaLarguraM}
            unit="m"
            shortcuts={[0.5, 1, 1.5, 2]}
            onSelectShortcut={(val) => onUpdateState({ faixaLarguraM: val })}
            onOpenKeypad={openKeypadHandler('P7C_largura_faixa', state.faixaLarguraM, 'm', t('manual.p7c.fieldLabel', 'Largura da Faixa'))}
          />
        </div>
      )}

      {/* Fase 2 · P8: Água Gasta */}
      {step === 'P8_agua_gasta' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#3CA64C] block">
              {t('manual.step.phase2', 'FASE 2 · MEDIR APLICAÇÃO')}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
              {t('manual.p8.title', 'Quanta água gastou no ensaio?')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('manual.p8.desc', 'Água medida gasta no pulverizador para tratar a superfície indicada.')}
            </p>
          </div>
          <ManualNumericCard
            fieldLabel={t('manual.p8.fieldLabel', 'Água Gasta no Ensaio')}
            currentVal={state.aguaGastaL}
            unit="L"
            shortcuts={[0.5, 1, 2, 5]}
            onSelectShortcut={(val) => onUpdateState({ aguaGastaL: val })}
            onOpenKeypad={openKeypadHandler('P8_agua_gasta', state.aguaGastaL, 'L', t('manual.p8.fieldLabel', 'Água Gasta no Ensaio'))}
          />
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
