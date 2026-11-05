/**
 * DATERRA Smart - Componente de Parâmetros do Rótulo e Depósito (P3, P4, P5)
 * Cartão de Conteúdo Branco Unificado com ManualNumericCard e ManualChoiceCard (< 200 LOC)
 */

import React from 'react';
import { ChevronLeft, ArrowRight, Sprout, Trees } from 'lucide-react';
import type { ManualCalculationState, ManualStepId } from '../aplicacaoManualTypes';
import { useLanguage } from '../../../context/LanguageContext';
import { ManualChoiceCard } from './ManualChoiceCard';
import { ManualNumericCard } from './ManualNumericCard';

export interface ManualStepParametrosProps {
  step: ManualStepId;
  state: ManualCalculationState;
  onUpdateState: (updates: Partial<ManualCalculationState>) => void;
  onNext: () => void;
  onBack: () => void;
  onOpenKeypad: (field: string, currentVal: number | undefined, unit: string, label: string) => void;
}

export const ManualStepParametros: React.FC<ManualStepParametrosProps> = ({
  step,
  state,
  onUpdateState,
  onNext,
  onBack,
  onOpenKeypad
}) => {
  const { t } = useLanguage();

  const isP3Valid = (state.rotuloValue ?? 0) > 0;
  const isP4Valid = (state.caldaPrepararL ?? 0) > 0;
  const isP5Valid = Boolean(state.plantStage);
  const canContinue =
    (step === 'P3_quantidade_rotulo' && isP3Valid) ||
    (step === 'P4_calda_preparar' && isP4Valid) ||
    (step === 'P5_estado_planta' && isP5Valid);

  // Unidades e atalhos disponíveis para P3
  const isLiq = state.productState === 'liquido';
  const availableUnits = state.mode === 'dose'
    ? (isLiq ? ['L/ha', 'mL/ha'] : ['kg/ha', 'g/ha'])
    : (isLiq ? ['mL/100 L', 'L/100 L'] : ['g/100 L', 'kg/100 L']);

  const isSmallUnit = state.rotuloUnit?.startsWith('m') || state.rotuloUnit?.startsWith('g');
  const isLargeConc = state.rotuloUnit?.startsWith('L') || state.rotuloUnit?.startsWith('k');
  const p3Shortcuts = state.mode === 'dose'
    ? (isSmallUnit ? [500, 1000, 1500, 2000] : [0.5, 1, 1.5, 2])
    : (isLargeConc ? [0.025, 0.05, 0.1, 0.2] : [25, 50, 100, 200]);

  const handleUnitChange = (u: string) => {
    let nextVal = state.rotuloValue;
    if (nextVal !== undefined && state.rotuloUnit !== u) {
      const toMilli = u.startsWith('m') || u.startsWith('g');
      nextVal = toMilli ? nextVal * 1000 : nextVal / 1000;
    }
    onUpdateState({ rotuloUnit: u, rotuloValue: nextVal });
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5 animate-fade-in">
      {/* Fase 1 · P3: Quantidade do Rótulo */}
      {step === 'P3_quantidade_rotulo' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#3CA64C] block">
              {t('manual.step.phase1', 'FASE 1 · TIPO DE APLICAÇÃO')}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
              {state.mode === 'dose'
                ? t('manual.p3.titleDose', 'Qual é a dose indicada no rótulo?')
                : t('manual.p3.titleConc', 'Qual é a concentração indicada no rótulo?')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('manual.p3.desc', 'Consulte o valor indicado no rótulo do produto para a cultura pretendida.')}
            </p>
          </div>

          {/* Seletor de Unidades */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('manual.common.unit', 'Unidade:')}
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {availableUnits.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => handleUnitChange(u)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all touch-target cursor-pointer ${
                    state.rotuloUnit === u ? 'bg-[#114037] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <ManualNumericCard
            fieldLabel={t('manual.p3.fieldLabel', 'Quantidade do Rótulo')}
            currentVal={state.rotuloValue}
            unit={state.rotuloUnit || ''}
            shortcuts={p3Shortcuts}
            onSelectShortcut={(val) => onUpdateState({ rotuloValue: val })}
            onOpenKeypad={() => onOpenKeypad('P3_quantidade_rotulo', state.rotuloValue, state.rotuloUnit || '', t('manual.p3.fieldLabel', 'Quantidade do Rótulo'))}
          />
        </div>
      )}

      {/* Fase 3 · P4: Calda a Preparar */}
      {step === 'P4_calda_preparar' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#3CA64C] block">
              {t('manual.step.phase3', 'FASE 3 · PREPARAR CALDA')}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
              {t('manual.p4.title', 'Quanta calda quer preparar?')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('manual.p4.desc', 'Pode preparar menos que a capacidade máxima do depósito do pulverizador.')}
            </p>
          </div>

          <ManualNumericCard
            fieldLabel={t('manual.p4.fieldLabel', 'Calda a Preparar')}
            currentVal={state.caldaPrepararL}
            unit="L"
            shortcuts={[5, 10, 12, 16, 20]}
            onSelectShortcut={(val) => onUpdateState({ caldaPrepararL: val })}
            onOpenKeypad={() =>
              onOpenKeypad(
                'P4_calda_preparar',
                state.caldaPrepararL,
                'L',
                t('manual.p4.fieldLabel', 'Calda a Preparar')
              )
            }
          />
        </div>
      )}

      {/* Fase 1 · P5: Estado da Planta */}
      {step === 'P5_estado_planta' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#3CA64C] block">
              {t('manual.step.phase1', 'FASE 1 · TIPO DE APLICAÇÃO')}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
              {t('manual.p5.title', 'Em que estado está a planta que irá tratar?')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('manual.p5.desc', 'O volume varia com o desenvolvimento vegetativo da cultura.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <ManualChoiceCard
              title={t('manual.p5.young', 'Planta Jovem')}
              description={t('manual.p5.youngSub', 'Início de vegetação')}
              icon={<Sprout className="w-5 h-5 text-[#3CA64C]" />}
              isSelected={state.plantStage === 'jovem'}
              onSelect={() => onUpdateState({ plantStage: 'jovem' })}
            />
            <ManualChoiceCard
              title={t('manual.p5.adult', 'Planta Adulta')}
              description={t('manual.p5.adultSub', 'Pleno desenvolvimento')}
              icon={<Trees className="w-5 h-5 text-[#3CA64C]" />}
              isSelected={state.plantStage === 'adulta'}
              onSelect={() => onUpdateState({ plantStage: 'adulta' })}
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
