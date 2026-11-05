/**
 * DATERRA Smart - Calculadora de Aplicação Manual (v2.0 PWA SaaS)
 * Padrão Canónico LWA / First-Offline / Master Blueprint (< 200 LOC)
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/db';
import { DaterraKeypadModal } from '../../components/keypad/DaterraKeypadModal';
import { CalculatorHistoryDrawer } from '../calculators/history/CalculatorHistoryDrawer';
import type { ManualCalculationState, ManualStepId } from './aplicacaoManualTypes';
import { calculateManualApplication } from './aplicacaoManualEngine';
import { getNextManualStep } from './aplicacaoManualRouting';
import {
  MANUAL_CALC_ID, saveManualCalculation, extractManualStateFromRecord,
  softDeleteCalculationInDb, updateCalculationMetadataInDb, clearCalculatorHistoryInDb
} from './services/manualHistoryService';
import {
  ManualStartCard, ManualStepModo, ManualStepParametros, ManualStepEnsaio,
  ManualStepVolumeRec, ManualStepSummary, ManualStepResult, ManualStepGuideModal,
  ManualHeader, ManualFooterBar, ManualResetConfirmModal
} from './components';

export const AplicacaoManualCalculator: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const effectiveUserId = user?.id || '';

  const [step, setStep] = useState<ManualStepId>('start');
  const [stepHistory, setStepHistory] = useState<ManualStepId[]>([]);
  const [state, setState] = useState<ManualCalculationState>({});
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [keypad, setKeypad] = useState({ isOpen: false, field: '', currentVal: 0, unit: '', label: '' });

  const historyRecords = useLiveQuery(async () => {
    if (!effectiveUserId) return [];
    return await db.calculation_history_v2
      .filter((r) => r.calculatorId === MANUAL_CALC_ID && r.userId === effectiveUserId && !r.isDeleted)
      .reverse().sortBy('createdAt');
  }, [effectiveUserId]) ?? [];

  const updateState = (updates: Partial<ManualCalculationState>) => {
    setState((prev) => ({ ...prev, ...updates }));
    setIsSaved(false);
  };

  const goToStep = (next: ManualStepId) => {
    setToastMsg(null);
    setStepHistory((prev) => [...prev, step]);
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setToastMsg(null);
    if (stepHistory.length > 0) {
      setStep(stepHistory[stepHistory.length - 1]);
      setStepHistory((h) => h.slice(0, -1));
    } else {
      setStep('start');
    }
  };

  const handleResetRequest = () => {
    if (Object.keys(state).length > 0) setIsResetConfirmOpen(true);
    else { setState({}); setIsSaved(false); setStepHistory([]); setStep('start'); }
  };

  const calculationResult = useMemo(
    () => calculateManualApplication(state, language === 'en-GB' ? 'en-GB' : 'pt-PT'),
    [state, language]
  );

  const handleSave = async () => {
    if (!effectiveUserId) {
      setToastMsg({ text: t('common.authRequiredToSave', 'É necessária uma sessão com início prévio para guardar os cálculos.'), type: 'error' });
      return;
    }
    if (!calculationResult.isValid || isSaved) return;
    setIsSaving(true);
    try {
      await saveManualCalculation(effectiveUserId, state, calculationResult, historyRecords);
      setIsSaved(true);
      setToastMsg({ text: t('common.calculationSaved', 'Cálculo guardado com sucesso no histórico.'), type: 'success' });
    } catch {
      setToastMsg({ text: t('common.calculationSaveError', 'Não foi possível guardar o cálculo. Tente novamente.'), type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReuse = (rec: any) => {
    setToastMsg(null);
    setIsSaved(false);
    setState(extractManualStateFromRecord(rec));
    setStep('P11_confirmacao');
    setStepHistory(['start']);
  };

  const openKeypad = (field: string, currentVal: number | undefined, unit: string, label: string) =>
    setKeypad({ isOpen: true, field, currentVal: currentVal || 0, unit, label });

  const handleKeypadConfirm = (val: number) => {
    const keyMap: Record<string, keyof ManualCalculationState> = {
      P3_quantidade_rotulo: 'rotuloValue', P4_calda_preparar: 'caldaPrepararL',
      P7A_area_conhecida: 'areaConhecidaM2', P7B_comprimento_faixa: 'faixaComprimentoM',
      P7C_largura_faixa: 'faixaLarguraM', P8_agua_gasta: 'aguaGastaL'
    };
    if (keyMap[step]) updateState({ [keyMap[step]]: val });
    else if (step === 'P9A_volume_recomendado_input') updateState({ recVolumeLHa: val, recOrigin: 'editado' });
  };

  return (
    <div
      className={`max-w-4xl lg:max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 animate-fade-in ${
        step === 'P12_resultado'
          ? 'pb-[var(--calculator-mobile-bottom-offset,7.5rem)] md:pb-16'
          : 'pb-8 md:pb-12'
      }`}
    >
      <ManualHeader
        onBack={() => (step === 'start' ? navigate('/ferramentas') : handleBack())}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onReset={handleResetRequest}
        historyCount={historyRecords.length}
      />

      {toastMsg && (
        <div className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 animate-fade-in ${toastMsg.type === 'success' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
          <span>{toastMsg.text}</span>
          <button type="button" onClick={() => setToastMsg(null)} className="text-slate-500 font-bold px-1.5 py-0.5">✕</button>
        </div>
      )}

      {step === 'start' && (
        <ManualStartCard
          historyCount={historyRecords.length}
          onStart={() => { setState({}); setIsSaved(false); setStepHistory(['start']); setStep('P1_modo'); }}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />
      )}

      {(step === 'P1_modo' || step === 'P2_estado_produto') && (
        <ManualStepModo step={step} state={state} onUpdateState={updateState} onNext={() => goToStep(getNextManualStep(step, state))} onBack={handleBack} />
      )}
      {(step === 'P3_quantidade_rotulo' || step === 'P4_calda_preparar' || step === 'P5_estado_planta') && (
        <ManualStepParametros step={step} state={state} onUpdateState={updateState} onNext={() => goToStep(getNextManualStep(step, state))} onBack={handleBack} onOpenKeypad={openKeypad} />
      )}
      {(step === 'P6_metodo_ensaio' || step === 'P7A_area_conhecida' || step === 'P7B_comprimento_faixa' || step === 'P7C_largura_faixa' || step === 'P8_agua_gasta') && (
        <ManualStepEnsaio step={step} state={state} onUpdateState={updateState} onNext={() => goToStep(getNextManualStep(step, state))} onBack={handleBack} onOpenKeypad={openKeypad} />
      )}
      {(step === 'P9_volume_recomendado_check' || step === 'P9A_volume_recomendado_input' || step === 'P10_calcular_area_check') && (
        <ManualStepVolumeRec step={step} state={state} onUpdateState={updateState} onNext={() => goToStep(getNextManualStep(step, state))} onBack={handleBack} onOpenKeypad={openKeypad} />
      )}
      {step === 'P11_confirmacao' && (
        <ManualStepSummary state={state} onEditStep={(s) => goToStep(s)} onBack={handleBack} onCalculate={() => goToStep('P12_resultado')} />
      )}
      {step === 'P12_resultado' && (
        <>
          <ManualStepResult
            state={state} output={calculationResult}
            onNewCalculation={() => { setState({}); setIsSaved(false); setStepHistory([]); setStep('start'); }}
            onEditResponses={() => goToStep('P11_confirmacao')}
            onRequestAreaJovem={() => { updateState({ hasEnsaio: true }); goToStep('P6_metodo_ensaio'); }}
          />
          <ManualFooterBar
            onSave={handleSave} onOpenHistory={() => setIsHistoryOpen(true)} onOpenGuide={() => setIsGuideOpen(true)}
            historyCount={historyRecords.length} isSaving={isSaving} isSaved={isSaved}
          />
        </>
      )}

      <DaterraKeypadModal
        isOpen={keypad.isOpen}
        onClose={() => setKeypad((prev) => ({ ...prev, isOpen: false }))}
        initialValue={keypad.currentVal ? String(keypad.currentVal) : ''}
        initialUnit={keypad.unit}
        label={keypad.label}
        availableUnits={[]}
        commonValues={[]}
        onConfirm={handleKeypadConfirm}
      />

      <ManualResetConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirmReset={() => { setState({}); setIsSaved(false); setStepHistory([]); setStep('start'); setIsResetConfirmOpen(false); }}
      />

      <ManualStepGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <CalculatorHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        calculatorId={MANUAL_CALC_ID}
        calculatorTitle={t('manual.start.title', 'Aplicação Manual')}
        records={historyRecords}
        onDeleteRecord={(r) => softDeleteCalculationInDb(r.id)}
        onClearHistory={async () => { if (effectiveUserId) await clearCalculatorHistoryInDb(MANUAL_CALC_ID, effectiveUserId); }}
        onUpdateMetadata={updateCalculationMetadataInDb}
        {...({ onReuseCalculation: handleReuse } as any)}
      />
    </div>
  );
};

export default AplicacaoManualCalculator;

