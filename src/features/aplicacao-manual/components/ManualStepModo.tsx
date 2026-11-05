/**
 * DATERRA Smart - Componente de Modo e Estado do Produto (P1 e P2)
 * Cartão de Conteúdo Branco Unificado com ManualChoiceCard (< 200 LOC)
 */

import React, { useState } from 'react';
import { HelpCircle, ChevronLeft, ArrowRight, Droplets, Package } from 'lucide-react';
import type { ManualCalculationState, ManualStepId } from '../aplicacaoManualTypes';
import { useLanguage } from '../../../context/LanguageContext';
import { ManualChoiceCard } from './ManualChoiceCard';

export interface ManualStepModoProps {
  step: ManualStepId;
  state: ManualCalculationState;
  onUpdateState: (updates: Partial<ManualCalculationState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ManualStepModo: React.FC<ManualStepModoProps> = ({
  step,
  state,
  onUpdateState,
  onNext,
  onBack
}) => {
  const { t } = useLanguage();
  const [showHelp, setShowHelp] = useState(false);

  const canContinue =
    (step === 'P1_modo' && Boolean(state.mode)) ||
    (step === 'P2_estado_produto' && Boolean(state.productState));

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5 animate-fade-in">
      {/* Fase 1 · P1: Modo de Cálculo */}
      {step === 'P1_modo' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#3CA64C] block">
              {t('manual.step.phase1', 'FASE 1 · TIPO DE APLICAÇÃO')}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
              {t('manual.p1.title', 'O rótulo indica a quantidade por...?')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('manual.p1.desc', 'Consulte a indicação expressa na embalagem oficial do produto.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <ManualChoiceCard
              title={t('manual.p1.doseTitle', 'Dose — por hectare')}
              description={t('manual.p1.doseDesc', 'Apoio: L/ha ou kg/ha')}
              icon={<Droplets className="w-5 h-5 text-[#3CA64C]" />}
              isSelected={state.mode === 'dose'}
              onSelect={() => onUpdateState({ mode: 'dose' })}
            />
            <ManualChoiceCard
              title={t('manual.p1.concTitle', 'Concentração — por 100 litros')}
              description={t('manual.p1.concDesc', 'mL/100 L, g/100 L, L/100 L ou kg/100 L')}
              icon={<Package className="w-5 h-5 text-[#3CA64C]" />}
              isSelected={state.mode === 'concentracao'}
              onSelect={() => onUpdateState({ mode: 'concentracao' })}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowHelp((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 cursor-pointer touch-target"
          >
            <HelpCircle className="w-4 h-4 text-[#3CA64C]" />
            <span>{t('manual.p1.helpTrigger', 'Não sei identificar? (Exemplos de rótulo)')}</span>
          </button>
        </div>
      )}

      {/* Fase 1 · P2: Estado do Produto */}
      {step === 'P2_estado_produto' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#3CA64C] block">
              {t('manual.step.phase1', 'FASE 1 · TIPO DE APLICAÇÃO')}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
              {t('manual.p2.title', 'O produto é líquido ou sólido?')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('manual.p2.desc', 'É o produto antes de o misturar com água.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <ManualChoiceCard
              title={t('manual.p2.liquid', 'Líquido')}
              subLabel="L ou mL"
              icon={<Droplets className="w-5 h-5 text-[#3CA64C]" />}
              isSelected={state.productState === 'liquido'}
              onSelect={() =>
                onUpdateState({
                  productState: 'liquido',
                  rotuloUnit: state.mode === 'dose' ? 'L/ha' : 'mL/100 L'
                })
              }
            />
            <ManualChoiceCard
              title={t('manual.p2.solid', 'Sólido')}
              subLabel="kg ou g"
              icon={<Package className="w-5 h-5 text-[#3CA64C]" />}
              isSelected={state.productState === 'solido'}
              onSelect={() =>
                onUpdateState({
                  productState: 'solido',
                  rotuloUnit: state.mode === 'dose' ? 'kg/ha' : 'g/100 L'
                })
              }
            />
          </div>
        </div>
      )}

      {/* Ajuda Contextual Retrátil */}
      {showHelp && (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-slate-700 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <strong className="font-bold text-emerald-900">
              {t('manual.help.title', 'Como saber identificar no rótulo?')}
            </strong>
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="text-emerald-700 font-bold px-2 py-0.5 rounded-lg bg-emerald-100/60 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p>{t('manual.help.p1', '• Se o rótulo diz por exemplo "2 L/ha" ou "1,5 kg/ha", trata-se de DOSE.')}</p>
          <p>{t('manual.help.p2', '• Se o rótulo diz "100 mL/100 L", "50 g/hL" ou "0,1 L/hL", trata-se de CONCENTRAÇÃO (1 hL = 100 L).')}</p>
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
