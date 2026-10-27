/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Componente: UniversalCalculatorTemplate
 * Fase 2, Fase 4 & Fase 6B - Molde Universal com Suporte a Modos e Transferência Canónica
 * 
 * Funcionalidades:
 * - Paridade estética e estrutural absoluta entre todas as calculadoras oficiais
 * - Suporte nativo a modos declarativos (ex: Planta Jovem vs Planta Adulta na Concentração)
 * - Integração da transferência canónica com transferSession em memória
 * - Prevenção de substituição indevida com TransferOverwritePromptModal
 * - Faixas oficiais de aviso ("Valores importados de..." e aviso de volume não utilizado no modo)
 * - Isolamento estrito de histórico (Dose em v2; Concentração no histórico existente)
 * - Sem criação automática de cálculos no histórico
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Pencil, Info } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db/db.ts';
import { useAuth } from '../../../context/AuthContext.tsx';
import { useLanguage } from '../../../context/LanguageContext.tsx';
import type { CalculatorDefinition, CalculatorFieldDefinition } from './types.ts';
import type { StructuredValue, CalculationHistoryRecord } from '../../../types/calculator.ts';
import { CalculatorHeader } from './CalculatorHeader.tsx';
import { CalculatorInputsPanel } from './CalculatorInputsPanel.tsx';
import { CalculatorResultsPanel, type ResultDisplayItem } from './CalculatorResultsPanel.tsx';
import { CalculatorActionBar } from './CalculatorActionBar.tsx';
import { DaterraKeypad } from '../../../components/DaterraKeypad.tsx';
import { DaterraUnifiedKeypadModal } from '../../../components/DaterraUnifiedKeypadModal.tsx';
import type { UnifiedKeypadField, UnifiedKeypadResult } from './unifiedKeypadTypes.ts';
import { formatNumberForDisplay } from './expressionParser.ts';
import { DidacticHelp } from '../../concentracao/DidacticHelp.tsx';
import {
  evaluateHistoryQuota,
  buildCalculationRecord,
  saveCalculationToDb,
  softDeleteCalculationInDb,
  updateCalculationMetadataInDb,
  clearCalculatorHistoryInDb
} from './historyService.ts';
import { CalculatorHistoryDrawer, HistoryLimitModal } from '../history/index.ts';
import {
  usePendingTransfer,
  consumePendingTransfer,
  clearPendingTransfer,
  type ActiveTransferPayload
} from './transferSession.ts';
import {
  TransferOverwritePromptModal,
  type OverwriteComparisonItem
} from '../history/TransferOverwritePromptModal.tsx';
import { CanopyDensitySelector } from '../../volume-calda-trv/components/CanopyDensitySelector.tsx';
import {
  evaluateTrvVolumeInterpretation,
  type CanopyProfileId,
  type CanopyDensityTierId,
  type CanopyDensityTier
} from '../../volume-calda-trv/trvAssistance.ts';
import {
  WorkingWidthCriteriaSelector,
  type WorkingWidthCriterionId
} from '../../debito-total/components/WorkingWidthCriteriaSelector.tsx';
import { CalibracaoMetodoSelector } from '../../calibracao-pulverizador/components/CalibracaoMetodoSelector.tsx';
import { CalibracaoContextSelectors } from '../../calibracao-pulverizador/components/CalibracaoContextSelectors.tsx';
import { CalibracaoPhaseBSection } from '../../calibracao-pulverizador/components/CalibracaoPhaseBSection.tsx';
import { CalibracaoPhaseCNozzleSelectionSection } from '../../calibracao-pulverizador/components/CalibracaoPhaseCNozzleSelectionSection.tsx';
import {
  isAdoptedSprayVolumeVisible,
  isAdoptedSprayVolumeRequired
} from '../../calibracao-pulverizador/calibracaoPulverizadorValidation.ts';
import type {
  CalibracaoMetodo,
  CanopyDensityTierId as CalibracaoCanopyDensityTierId,
  LwaVThicknessId,
  LwaVStageId
} from '../../calibracao-pulverizador/calibracaoPulverizadorTypes.ts';
import { resolveFriendlyValidationMessage } from '../../calibracao-pulverizador/calibracaoPulverizadorValidationFallback.ts';

/**
 * Hook responsivo para detetar viewport desktop (>= 1024px)
 * Garante desmontagem real de nós no DOM em mobile
 */
function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(min-width: 1024px)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isDesktop;
}

export interface UniversalCalculatorTemplateProps {
  /** Configuração declarativa da calculadora */
  definition: CalculatorDefinition;
  /** Identificador opcional do utilizador autenticado (obtido de useAuth se omitido) */
  userId?: string;
  /** Callback para regresso ao catálogo de ferramentas */
  onBack?: () => void;
  /** Callback opcional quando o histórico é aberto */
  onOpenHistory?: () => void;
  /** Valores iniciais pré-carregados (opcional, ex: importados do histórico) */
  initialInputs?: Record<string, { rawValue: number | string; unit?: string }>;
  /** Aviso contextual quando valores são importados */
  importedNotice?: string | null;
  /** Badge opcional de modo no painel de resultados (ex: 'Planta Jovem') */
  badgeMode?: string;
  /** Rótulo customizado do botão de gravação */
  saveButtonLabel?: string;
  /** Callback tipado acionado ao clicar em Guardar Cálculo */
  onSaveCalculation?: (data: {
    inputs: Record<string, StructuredValue>;
    outputs: Record<string, StructuredValue>;
  }) => Promise<void> | void;
  /** Callback para microlearning específico de um resultado (Fase 5) */
  onOpenResultHelp?: (resultId: string) => void;
  /** Callback para transitar de calculadora na transferência de dados (Fase 6B) */
  onExecuteTransfer?: (targetCalculatorId: string) => void;
}

export const UniversalCalculatorTemplate: React.FC<UniversalCalculatorTemplateProps> = ({
  definition,
  userId: propUserId,
  onBack,
  onOpenHistory,
  initialInputs,
  importedNotice,
  badgeMode,
  saveButtonLabel,
  onSaveCalculation,
  onOpenResultHelp,
  onExecuteTransfer
}) => {
  // 1. Identidade do Utilizador Autenticado (Sessão Persistida Localmente)
  const { user } = useAuth();
  const { t } = useLanguage();
  const effectiveUserId = propUserId || user?.id || '';

  // Resposta reativa ao breakpoint desktop (min-width: 1024px)
  const isDesktop = useIsDesktop();

  // Identificador de Calculadora Unificada (Fase 1A: calc_concentracao e calc_dose; Fase 1B.1: calc_velocidade_real; Fase 1B.2: calc_area_parede_foliar; Fase 1B.3: calc_volume_copa; Fase 1B.4A/B: calc_volume_calda_trv; Fase 1B.5: calc_debito_total)
  const isPilotCalculator =
    definition.id === 'calc_concentracao' ||
    definition.id === 'calc_dose' ||
    definition.id === 'calc_velocidade_real' ||
    definition.id === 'calc_area_parede_foliar' ||
    definition.id === 'calc_volume_copa' ||
    definition.id === 'calc_volume_calda_trv' ||
    definition.id === 'calc_debito_total' ||
    definition.id === 'calc_eppo' ||
    definition.id === 'calc_calibracao_pulverizador';
  const [isUnifiedKeypadOpen, setIsUnifiedKeypadOpen] = useState<boolean>(false);

  // Estados Locais e Voláteis de Apoio Agronómico TRV (Subfase 1B.4B)
  const isVolumeCaldaTrv = definition.id === 'calc_volume_calda_trv';
  const [canopyProfile, setCanopyProfile] = useState<CanopyProfileId>(null);
  const [selectedDensityTier, setSelectedDensityTier] = useState<CanopyDensityTierId | null>(null);
  const [isManualK, setIsManualK] = useState<boolean>(false);

  // Estados Locais e Voláteis de Débito Total (Subfase 1B.5)
  const isDebitoTotal = definition.id === 'calc_debito_total';
  const [showNozzleCalculation, setShowNozzleCalculation] = useState<boolean>(() => {
    return Boolean(initialInputs?.['numeroBicos']?.rawValue);
  });

  // Reset transversal de scroll ao entrar ou trocar de calculadora (isolado de modais, inputs e parâmetros)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [definition.id]);

  // Estados Locais e Voláteis de Calibração de Pulverizador (Fase A e Fase B)
  const isCalibracaoPulverizador = definition.id === 'calc_calibracao_pulverizador';
  const [calibracaoCulture, setCalibracaoCulture] = useState<string>('vinha');
  const [calibracaoConduction, setCalibracaoConduction] = useState<string>('espaldeira');
  const [calibracaoPhenology, setCalibracaoPhenology] = useState<string>('vinha_pintor_maturacao');
  const [calibracaoDensity, setCalibracaoDensity] = useState<CalibracaoCanopyDensityTierId>('moderate');
  const [calibracaoThickness, setCalibracaoThickness] = useState<LwaVThicknessId>('estreita');
  const [calibracaoStage, setCalibracaoStage] = useState<LwaVStageId>('int_5');
  const [useManualAdoptedVolumeInLwa, setUseManualAdoptedVolumeInLwa] = useState<boolean>(false);
  const [calibracaoWorkingWidthSource, setCalibracaoWorkingWidthSource] = useState<'auto-row-spacing' | 'manual'>(() => {
    if (initialInputs && initialInputs['workingWidthM'] !== undefined) {
      return 'manual';
    }
    return 'auto-row-spacing';
  });

  // 2. Consulta Reativa do Histórico Offline em calculation_history_v2
  const dbHistoryRecords = useLiveQuery(
    async () => {
      if (!effectiveUserId) return [];
      return await db.calculation_history_v2
        .filter((r) => r.calculatorId === definition.id && r.userId === effectiveUserId && !r.isDeleted)
        .reverse()
        .sortBy('createdAt');
    },
    [definition.id, effectiveUserId]
  );
  const historyRecords: CalculationHistoryRecord[] = dbHistoryRecords ?? [];
  const historyCount = historyRecords.length;

  // 3. Modo Ativo da Calculadora (ex: 'jovem' vs 'adulta' na Concentração)
  const [activeModeId, setActiveModeId] = useState<string>(
    () => definition.defaultModeId || (definition.modes && definition.modes[0]?.id) || 'jovem'
  );

  // 4. Inicialização dos Valores e Unidades dos Campos Declarados
  const [fieldValues, setFieldValues] = useState<Record<string, number | string>>(() => {
    const initial: Record<string, number | string> = {};
    for (const f of definition.fields) {
      if (initialInputs && initialInputs[f.id] !== undefined) {
        initial[f.id] = initialInputs[f.id].rawValue;
      } else {
        initial[f.id] = f.defaultValue ?? '';
      }
    }
    if (definition.id === 'calc_calibracao_pulverizador') {
      if (initial['workingWidthM'] === '' || initial['workingWidthM'] === undefined) {
        initial['workingWidthM'] = initial['rowSpacingM'] || 2.5;
      }
    }
    if (definition.id === 'calc_debito_total') {
      if (!initial['baseLargura']) {
        initial['baseLargura'] = 'boom_total_width';
      }
    }
    return initial;
  });

  const [fieldUnits, setFieldUnits] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const f of definition.fields) {
      if (initialInputs && initialInputs[f.id]?.unit) {
        initial[f.id] = initialInputs[f.id].unit!;
      } else {
        initial[f.id] = f.defaultUnit;
      }
    }
    return initial;
  });

  // Rastreio de campos editados manualmente pelo utilizador para prevenir sobreposições
  const [userModifiedFields, setUserModifiedFields] = useState<Set<string>>(new Set());

  // Mensagens e avisos contextuais de transferência
  const [activeImportedNotice, setActiveImportedNotice] = useState<string | null>(importedNotice ?? null);
  const [unneededNotice, setUnneededNotice] = useState<string | null>(null);

  // 5. Estado do Teclado Virtual DaterraKeypad
  const [activeKeypadField, setActiveKeypadField] = useState<CalculatorFieldDefinition | null>(null);
  const [isKeypadOpen, setIsKeypadOpen] = useState<boolean>(false);

  // 6. Estados do Módulo de Histórico (apenas para calc_dose nesta fase)
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState<boolean>(false);
  const [pendingCalculation, setPendingCalculation] = useState<{
    inputs: Record<string, StructuredValue>;
    outputs: Record<string, StructuredValue>;
  } | null>(null);

  // 7. Estados de Feedback e Notificações Toast (3,5 segundos)
  const [toastInfo, setToastInfo] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDirectDidacticHelpOpen, setIsDirectDidacticHelpOpen] = useState<boolean>(false);

  // 8. Interoperabilidade e Transferência Transitória em Memória (Fase 6B)
  const pendingTransfer = usePendingTransfer();
  const [overwriteConflict, setOverwriteConflict] = useState<{
    payload: ActiveTransferPayload;
    comparisons: OverwriteComparisonItem[];
    dateText: string;
  } | null>(null);

  // Supressão de barras contextuais e overlays quando qualquer modal estiver aberto
  const isAnyModalOpen =
    isUnifiedKeypadOpen ||
    isHistoryDrawerOpen ||
    isLimitModalOpen ||
    isDirectDidacticHelpOpen ||
    isKeypadOpen ||
    !!overwriteConflict;

  useEffect(() => {
    if (toastInfo) {
      const timer = setTimeout(() => {
        setToastInfo(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastInfo]);

  // Atualização caso initialInputs mude
  useEffect(() => {
    if (initialInputs) {
      setFieldValues((prev) => {
        const next = { ...prev };
        for (const [key, val] of Object.entries(initialInputs)) {
          if (val !== undefined) next[key] = val.rawValue;
        }
        return next;
      });
      setFieldUnits((prev) => {
        const next = { ...prev };
        for (const [key, val] of Object.entries(initialInputs)) {
          if (val?.unit) next[key] = val.unit;
        }
        return next;
      });
    }
  }, [initialInputs]);

  // Função interna para aplicar os valores transferidos
  const applyTransferValues = useCallback((payload: ActiveTransferPayload, dateFormatted: string) => {
    const currentMode = definition.modes?.find((m) => m.id === activeModeId);
    const visibleFieldIds = new Set(
      currentMode?.fieldIds || definition.fields.map((f) => f.id)
    );

    let appliedCount = 0;
    setFieldValues((prev) => {
      const next = { ...prev };
      for (const [id, item] of Object.entries(payload.fields)) {
        if (visibleFieldIds.has(id)) {
          next[id] = item.rawValue;
          appliedCount++;
        }
      }
      return next;
    });

    setFieldUnits((prev) => {
      const next = { ...prev };
      for (const [id, item] of Object.entries(payload.fields)) {
        if (visibleFieldIds.has(id)) {
          next[id] = item.unit;
        }
      }
      return next;
    });

    // Apenas apresenta faixa se pelo menos um valor foi realmente aplicado no formulário
    if (appliedCount > 0) {
      if (payload.sourceCalculatorId === 'calc_volume_copa') {
        setActiveImportedNotice('TRV importado da Calculadora de Volume de Copa.');
      } else {
        setActiveImportedNotice(`Valores importados do cálculo de ${dateFormatted}.`);
      }
    } else {
      setActiveImportedNotice(null);
    }

    // Apenas apresenta aviso de volume aplicado se foi efetivamente recebido na sessão e não é usado pelo modo ativo
    if (payload.fields['volAplicado'] && !visibleFieldIds.has('volAplicado')) {
      setUnneededNotice('O valor de Volume Aplicado foi recebido, mas não é necessário no modo atualmente selecionado.');
    } else {
      setUnneededNotice(null);
    }

    consumePendingTransfer();
  }, [activeModeId, definition]);

  // Deteta a chegada de uma transferência destinada a esta calculadora
  useEffect(() => {
    if (!pendingTransfer || pendingTransfer.targetCalculatorId !== definition.id) {
      return;
    }

    // Se o payload não contiver campos transferíveis, limpa imediatamente sem alterar UI
    if (Object.keys(pendingTransfer.fields).length === 0) {
      consumePendingTransfer();
      return;
    }

    const dateFormatted = new Date(pendingTransfer.sourceCreatedAt).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Avalia se o utilizador já introduziu dados manuais diferentes dos predefinidos
    const conflictingItems: OverwriteComparisonItem[] = [];
    for (const [fieldId, item] of Object.entries(pendingTransfer.fields)) {
      const isModified = userModifiedFields.has(fieldId);
      const currentVal = fieldValues[fieldId];
      if (isModified && currentVal !== undefined && currentVal !== item.rawValue) {
        conflictingItems.push({
          fieldId,
          label: item.label,
          currentValue: currentVal,
          currentUnit: fieldUnits[fieldId] || item.unit,
          receivedValue: item.rawValue,
          receivedUnit: item.unit
        });
      }
    }

    if (conflictingItems.length > 0) {
      // Bloqueia substituição automática e solicita decisão explícita ao utilizador
      setOverwriteConflict({
        payload: pendingTransfer,
        comparisons: conflictingItems,
        dateText: dateFormatted
      });
    } else {
      // Sem conflito manual: aplica diretamente
      applyTransferValues(pendingTransfer, dateFormatted);
    }
  }, [pendingTransfer, definition.id, userModifiedFields, fieldValues, fieldUnits, applyTransferValues]);

  // Resolução do modal de conflito
  const handleKeepCurrent = () => {
    consumePendingTransfer();
    setOverwriteConflict(null);
  };

  const handleApplyReceived = () => {
    if (overwriteConflict) {
      applyTransferValues(overwriteConflict.payload, overwriteConflict.dateText);
      setOverwriteConflict(null);
    }
  };

  const handleCancelTransfer = () => {
    clearPendingTransfer();
    setOverwriteConflict(null);
  };

  // Alteração de modo com limpeza de avisos irrelevantes
  const handleModeChange = (newModeId: string) => {
    setActiveModeId(newModeId);
    if (newModeId === 'adulta') {
      setUnneededNotice(null);
    }
  };

  // Handlers do Formulário
  const handleFieldChange = (fieldId: string, newValue: number | string, newUnit: string) => {
    setUserModifiedFields((prev) => new Set(prev).add(fieldId));
    setFieldValues((prev) => {
      const next = { ...prev, [fieldId]: newValue };
      if (isCalibracaoPulverizador) {
        if (fieldId === 'rowSpacingM' && calibracaoWorkingWidthSource === 'auto-row-spacing') {
          next['workingWidthM'] = newValue;
        }
      }
      return next;
    });
    setFieldUnits((prev) => ({ ...prev, [fieldId]: newUnit }));

    if (isCalibracaoPulverizador && fieldId === 'workingWidthM') {
      setCalibracaoWorkingWidthSource('manual');
    }

    if (isVolumeCaldaTrv && fieldId === 'coeficienteVolumeCalda') {
      setSelectedDensityTier(null);
      setIsManualK(true);
    }
  };

  const handleNozzleCountChange = useCallback((count: number) => {
    const val = count && count > 0 ? count : '';
    setFieldValues((prev) => {
      if (prev['activeNozzleCount'] === val) return prev;
      return { ...prev, activeNozzleCount: val };
    });
    setFieldUnits((prev) => {
      if (prev['activeNozzleCount'] === 'bicos') return prev;
      return { ...prev, activeNozzleCount: 'bicos' };
    });
  }, []);

  // Handlers e Interpretação de Apoio Agronómico TRV (Subfase 1B.4B)
  const handleSelectCanopyProfile = useCallback((newProfile: CanopyProfileId) => {
    setCanopyProfile(newProfile);
    setSelectedDensityTier(null);
    if (fieldValues['coeficienteVolumeCalda'] !== '' && fieldValues['coeficienteVolumeCalda'] !== undefined) {
      setIsManualK(true);
    }
  }, [fieldValues]);

  const handleSelectDensityTier = useCallback((tier: CanopyDensityTier) => {
    setUserModifiedFields((prev) => new Set(prev).add('coeficienteVolumeCalda'));
    setFieldValues((prev) => ({ ...prev, coeficienteVolumeCalda: tier.kValue }));
    setFieldUnits((prev) => ({ ...prev, coeficienteVolumeCalda: 'L/m³' }));
    setSelectedDensityTier(tier.id);
    setIsManualK(false);
  }, []);

  const trvInterpretation = useMemo(() => {
    if (!isVolumeCaldaTrv) {
      return { status: 'none' as const, severity: 'none' as const };
    }
    const rawTrv = fieldValues['volumeCopaTrv'];
    const rawK = fieldValues['coeficienteVolumeCalda'];
    const numTrv = typeof rawTrv === 'number' ? rawTrv : Number(rawTrv);
    const numK = typeof rawK === 'number' ? rawK : Number(rawK);
    return evaluateTrvVolumeInterpretation(canopyProfile, numTrv, numK);
  }, [isVolumeCaldaTrv, canopyProfile, fieldValues]);

  const [activeUnifiedFieldId, setActiveUnifiedFieldId] = useState<string | undefined>(undefined);

  const handleOpenUnifiedKeypad = (fieldId?: string) => {
    if (fieldId) {
      setActiveUnifiedFieldId(fieldId);
    } else {
      const firstIncomplete = currentActiveFields.find(
        (f) => f.required && (fieldValues[f.id] === '' || fieldValues[f.id] === undefined)
      );
      setActiveUnifiedFieldId(firstIncomplete ? firstIncomplete.id : currentActiveFields[0]?.id);
    }
    setIsUnifiedKeypadOpen(true);
  };

  const handleOpenKeypad = (field: CalculatorFieldDefinition) => {
    if (isPilotCalculator) {
      handleOpenUnifiedKeypad(field.id);
    } else {
      setActiveKeypadField(field);
      setIsKeypadOpen(true);
    }
  };

  const handleKeypadConfirm = (val: number, unit?: string) => {
    if (activeKeypadField) {
      handleFieldChange(activeKeypadField.id, val, unit ?? activeKeypadField.defaultUnit);
    }
    setIsKeypadOpen(false);
    setActiveKeypadField(null);
  };

  // Lista de campos ativos de acordo com o modo selecionado e regras de divulgação progressiva
  const currentActiveFields = useMemo(() => {
    let fields = definition.fields;
    if (definition.modes && activeModeId) {
      const modeDef = definition.modes.find((m) => m.id === activeModeId);
      fields = modeDef?.fieldIds
        ? definition.fields.filter((f) => modeDef.fieldIds!.includes(f.id))
        : definition.fields;
    }

    if (isCalibracaoPulverizador) {
      const currentDoseUnit = fieldUnits['doseValue'] || 'L/ha';
      const isVisible = isAdoptedSprayVolumeVisible({
        method: activeModeId,
        cultureId: calibracaoCulture,
        useManualAdoptedVolumeInLwa,
        doseUnit: currentDoseUnit
      });
      const isRequired = isAdoptedSprayVolumeRequired({
        method: activeModeId,
        cultureId: calibracaoCulture,
        useManualAdoptedVolumeInLwa,
        doseUnit: currentDoseUnit,
        finalTankVolumeL: fieldValues['finalTankVolumeL'],
        doseValue: fieldValues['doseValue']
      });

      if (!isVisible) {
        // Não pedir volume adotado quando o método não for LWA ou dose for por 100 L / concentração
        fields = fields.filter((f) => f.id !== 'adoptedSprayVolumeLHa');
      } else if (isRequired) {
        fields = fields.map((f) => {
          if (f.id === 'adoptedSprayVolumeLHa') {
            return { ...f, required: true };
          }
          return f;
        });
      }

      // Filtrar campos operacionais da Fase B geridos na secção específica
      fields = fields.filter(
        (f) =>
          ![
            'travelSpeedKmH',
            'workingWidthM',
            'activeNozzleCount'
          ].includes(f.id)
      );
    }

    if (isDebitoTotal) {
      // 1. Filtrar baseLargura (gerida pelo WorkingWidthCriteriaSelector)
      // 2. Filtrar numeroBicos caso a opção de cálculo por bico não esteja ativa
      fields = fields.filter((f) => {
        if (f.id === 'baseLargura') return false;
        if (f.id === 'numeroBicos' && !showNozzleCalculation) return false;
        return true;
      });

      // 3. Adaptar rótulo e descrição dos campos ao critério de trabalho selecionado
      const base = fieldValues['baseLargura'] || 'boom_total_width';
      fields = fields.map((f) => {
        if (f.id === 'numeroBicos') {
          return {
            ...f,
            label: t('debitoTotal.assistance.nozzleCalculation.fieldLabel', f.label),
            description: t('debitoTotal.assistance.nozzleCalculation.fieldDescription', f.description || '')
          };
        }
        if (f.id === 'larguraTrabalho') {
          let dynamicLabel = f.label;
          let dynamicPresets = f.presets;
          if (base === 'boom_total_width') {
            dynamicLabel = `${t('debitoTotal.assistance.widthCriteria.boom', 'Barra Horizontal')} (m)`;
            dynamicPresets = [12.0, 15.0, 18.0, 24.0];
          } else if (base === 'row_spacing') {
            dynamicLabel = `${t('debitoTotal.assistance.widthCriteria.rowSpacing', 'Distância Entrelinha')} (m)`;
            dynamicPresets = [2.5, 3.0, 3.5, 4.0];
          } else if (base === 'effective_treated_band') {
            dynamicLabel = `${t('debitoTotal.assistance.widthCriteria.band', 'Pulverização em Banda')} (m)`;
            dynamicPresets = [0.5, 0.75, 1.25, 1.5];
          }
          return {
            ...f,
            label: dynamicLabel,
            presets: dynamicPresets
          };
        }
        return f;
      });
    }

    return fields;
  }, [
    definition.fields,
    definition.modes,
    activeModeId,
    isCalibracaoPulverizador,
    calibracaoCulture,
    useManualAdoptedVolumeInLwa,
    isDebitoTotal,
    showNozzleCalculation,
    fieldValues,
    fieldUnits,
    t
  ]);

  // Preparação Declarativa dos Campos para o DaterraUnifiedKeypadModal (inclui todos os campos para suporte a modos dinâmicos)
  const allUnifiedFields = useMemo<UnifiedKeypadField[]>(() => {
    let fieldsToMap = definition.fields;
    if (definition.modes && activeModeId) {
      const modeDef = definition.modes.find((m) => m.id === activeModeId);
      if (modeDef?.fieldIds) {
        fieldsToMap = definition.fields.filter((f) => modeDef.fieldIds!.includes(f.id));
      }
    }

    if (isDebitoTotal) {
      fieldsToMap = fieldsToMap.filter((f) => {
        if (f.id === 'baseLargura') return false;
        if (f.id === 'numeroBicos' && !showNozzleCalculation) return false;
        return true;
      });
    }

    if (isCalibracaoPulverizador) {
      const currentDoseUnit = fieldUnits['doseValue'] || 'L/ha';
      const isVisible = isAdoptedSprayVolumeVisible({
        method: activeModeId,
        cultureId: calibracaoCulture,
        useManualAdoptedVolumeInLwa,
        doseUnit: currentDoseUnit
      });
      const isRequired = isAdoptedSprayVolumeRequired({
        method: activeModeId,
        cultureId: calibracaoCulture,
        useManualAdoptedVolumeInLwa,
        doseUnit: currentDoseUnit,
        finalTankVolumeL: fieldValues['finalTankVolumeL'],
        doseValue: fieldValues['doseValue']
      });

      if (!isVisible) {
        fieldsToMap = fieldsToMap.filter((f) => f.id !== 'adoptedSprayVolumeLHa');
      } else if (isRequired) {
        fieldsToMap = fieldsToMap.map((f) => {
          if (f.id === 'adoptedSprayVolumeLHa') {
            return { ...f, required: true };
          }
          return f;
        });
      }
    }

    return fieldsToMap.map((f) => {
      const currentRaw = fieldValues[f.id];
      const numericVal =
        typeof currentRaw === 'number'
          ? currentRaw
          : currentRaw !== '' && currentRaw !== undefined
          ? Number(currentRaw)
          : '';

      let label = f.label;
      let description = f.description;
      let presets = f.getDynamicPresets ? f.getDynamicPresets(fieldValues) : f.presets;

      if (isDebitoTotal) {
        if (f.id === 'numeroBicos') {
          label = t('debitoTotal.assistance.nozzleCalculation.fieldLabel', f.label);
          description = t('debitoTotal.assistance.nozzleCalculation.fieldDescription', f.description || '');
        } else if (f.id === 'larguraTrabalho') {
          const base = fieldValues['baseLargura'] || 'boom_total_width';
          if (base === 'boom_total_width') {
            label = `${t('debitoTotal.assistance.widthCriteria.boom', 'Barra Horizontal')} (m)`;
            presets = [12.0, 15.0, 18.0, 24.0];
          } else if (base === 'row_spacing') {
            label = `${t('debitoTotal.assistance.widthCriteria.rowSpacing', 'Distância Entrelinha')} (m)`;
            presets = [2.5, 3.0, 3.5, 4.0];
          } else if (base === 'effective_treated_band') {
            label = `${t('debitoTotal.assistance.widthCriteria.band', 'Pulverização em Banda')} (m)`;
            presets = [0.5, 0.75, 1.25, 1.5];
          }
        }
      }

      return {
        id: f.id,
        label,
        value: Number.isFinite(numericVal as number) ? (numericVal as number) : '',
        rawExpression:
          currentRaw !== '' && currentRaw !== undefined ? String(currentRaw).replace('.', ',') : '',
        unit: fieldUnits[f.id] || f.defaultUnit,
        availableUnits: f.allowedUnits,
        onUnitChange: f.onUnitChange,
        presets,
        required: f.required,
        min: f.min,
        max: f.max,
        minInclusive: f.minInclusive,
        maxInclusive: f.maxInclusive,
        decimalPlaces: f.maxDecimals ?? 2,
        helpKey: f.helpFile,
        description
      };
    });
  }, [definition.fields, definition.modes, isCalibracaoPulverizador, activeModeId, isDebitoTotal, showNozzleCalculation, fieldValues, fieldUnits, calibracaoCulture, useManualAdoptedVolumeInLwa, t]);

  const unifiedModes = useMemo(() => {
    if (!definition.modes || definition.modes.length <= 1) return undefined;
    return definition.modes.map((m) => ({
      id: m.id,
      label: m.label,
      fieldIds: m.fieldIds
    }));
  }, [definition.modes]);

  // Cálculo reativo em tempo real para o visor do DaterraUnifiedKeypadModal
  const handleUnifiedKeypadCalculate = useCallback(
    (
      currentValues: Record<string, { value: number; unit: string }>,
      modeId?: string
    ): UnifiedKeypadResult => {
      const effMode = modeId || activeModeId;
      const tempInputs: Record<string, StructuredValue> = {};

      for (const f of definition.fields) {
        const fieldEntry = currentValues[f.id];
        const rawVal = fieldEntry ? fieldEntry.value : (fieldValues[f.id] ?? f.defaultValue ?? 0);
        const unitVal = fieldEntry ? fieldEntry.unit : (fieldUnits[f.id] ?? f.defaultUnit);

        tempInputs[f.id] = {
          rawValue: rawVal,
          unit: unitVal,
          normalizedValue: typeof rawVal === 'number' ? rawVal : Number(rawVal) || 0,
          dimension: f.dimension,
          canonicalKey: f.canonicalKey,
          label: f.label,
          source: 'user_input',
          localId: f.id,
          calculatorId: definition.id,
          calculatorVersion: definition.version
        };
      }

      if (isCalibracaoPulverizador) {
        if (calibracaoCulture) {
          tempInputs['cultureId'] = {
            rawValue: calibracaoCulture,
            unit: '',
            normalizedValue: 0,
            dimension: 'text',
            canonicalKey: 'crop_profile',
            label: 'Cultura',
            source: 'user_input',
            localId: 'cultureId',
            calculatorId: definition.id,
            calculatorVersion: definition.version
          };
        }
        if (calibracaoConduction) {
          tempInputs['conductionId'] = {
            rawValue: calibracaoConduction,
            unit: '',
            normalizedValue: 0,
            dimension: 'text',
            canonicalKey: 'training_system',
            label: t('calibracao.conductionMode', 'Modo de Condução'),
            source: 'user_input',
            localId: 'conductionId',
            calculatorId: definition.id,
            calculatorVersion: definition.version
          };
        }
        if (calibracaoPhenology) {
          tempInputs['phenologyId'] = {
            rawValue: calibracaoPhenology,
            unit: '',
            normalizedValue: 0,
            dimension: 'text',
            canonicalKey: 'phenology_stage',
            label: t('calibracao.phenologyStage', 'Estado Fenológico'),
            source: 'user_input',
            localId: 'phenologyId',
            calculatorId: definition.id,
            calculatorVersion: definition.version
          };
        }
        if (calibracaoDensity) {
          tempInputs['canopyDensity'] = {
            rawValue: calibracaoDensity,
            unit: '',
            normalizedValue: 0,
            dimension: 'text',
            canonicalKey: 'canopy_density',
            label: 'Densidade Foliar',
            source: 'user_input',
            localId: 'canopyDensity',
            calculatorId: definition.id,
            calculatorVersion: definition.version
          };
        }
        if (calibracaoThickness) {
          tempInputs['canopyThickness'] = {
            rawValue: calibracaoThickness,
            unit: '',
            normalizedValue: 0,
            dimension: 'text',
            canonicalKey: 'canopy_thickness',
            label: 'Espessura da Sebe',
            source: 'user_input',
            localId: 'canopyThickness',
            calculatorId: definition.id,
            calculatorVersion: definition.version
          };
        }
        if (calibracaoStage) {
          tempInputs['phenologyStage'] = {
            rawValue: calibracaoStage,
            unit: '',
            normalizedValue: 0,
            dimension: 'text',
            canonicalKey: 'phenology_interval',
            label: t('calibracao.phenologyInterval', 'Intervalo Fenológico'),
            source: 'user_input',
            localId: 'phenologyStage',
            calculatorId: definition.id,
            calculatorVersion: definition.version
          };
        }
        if (useManualAdoptedVolumeInLwa) {
          tempInputs['useManualAdoptedVolumeInLwa'] = {
            rawValue: 'true',
            unit: '',
            normalizedValue: 1,
            dimension: 'text',
            canonicalKey: 'lwa_manual_volume_override',
            label: t('calibracao.useManualAdoptedVolume', 'Usar Volume Adotado Manual'),
            source: 'user_input',
            localId: 'useManualAdoptedVolumeInLwa',
            calculatorId: definition.id,
            calculatorVersion: definition.version
          };
        }
      }

      if (definition.modes && effMode) {
        tempInputs['mode'] = {
          rawValue: effMode,
          unit: '',
          normalizedValue: 0,
          dimension: 'text',
          canonicalKey: 'calculator_mode',
          label: t('calibracao.vegetativeMode', 'Modo de Operação Vegetativa'),
          source: 'user_input',
          localId: 'mode',
          calculatorId: definition.id,
          calculatorVersion: definition.version
        };
      }

      try {
        const outputs = definition.calculate(tempInputs);
        const primaryRes = definition.results[0];
        const primaryOut = primaryRes ? outputs[primaryRes.id] : undefined;

        if (primaryOut && primaryOut.rawValue !== undefined) {
          let secondaryText: string | undefined;

          if (definition.id === 'calc_concentracao') {
            const volPrepRaw = tempInputs['volPrepararConc']?.rawValue;
            const volPrepUnit = tempInputs['volPrepararConc']?.unit || 'L';
            if (volPrepRaw !== undefined && volPrepRaw !== null && volPrepRaw !== '') {
              secondaryText = `${t('unifiedKeypad.tankToPrepare', 'Depósito a preparar')}: ${formatNumberForDisplay(Number(volPrepRaw))} ${volPrepUnit}`;
            }
          } else if (definition.id === 'calc_dose') {
            const areaOut = outputs['area_tratada_ha'];
            if (areaOut && areaOut.rawValue !== undefined) {
              secondaryText = `${t('unifiedKeypad.coveredArea', 'Área coberta')}: ${formatNumberForDisplay(Number(areaOut.rawValue))} ha ${t('unifiedKeypad.perTank', 'por depósito')}`;
            }
          } else if (definition.id === 'calc_area_parede_foliar') {
            secondaryText = t('areaParedeFoliar.submetric', '2 faces da vegetação tratada');
          } else if (definition.id === 'calc_volume_copa') {
            const alt = tempInputs['alturaCopa']?.rawValue;
            const larg = tempInputs['larguraCopa']?.rawValue;
            const ent = tempInputs['distanciaEntrelinhas']?.rawValue;
            if (alt && larg && ent) {
              secondaryText = `${formatNumberForDisplay(Number(alt))} × ${formatNumberForDisplay(Number(larg))} m • ${formatNumberForDisplay(Number(ent))} m entrelinha`;
            }
          } else if (definition.id === 'calc_volume_calda_trv') {
            const trv = tempInputs['volumeCopaTrv']?.rawValue;
            const k = tempInputs['coeficienteVolumeCalda']?.rawValue;
            if (trv && k) {
              secondaryText = `TRV: ${formatNumberForDisplay(Number(trv))} m³/ha · k: ${formatNumberForDisplay(Number(k), 3)} L/m³`;
            }
          } else if (definition.id === 'calc_debito_total') {
            const nRaw = tempInputs['numeroBicos']?.rawValue;
            const largRaw = tempInputs['larguraTrabalho']?.rawValue;
            const velRaw = tempInputs['velocidadeTrabalho']?.rawValue;
            if (showNozzleCalculation && nRaw && primaryOut.subValue !== undefined) {
              secondaryText = `${nRaw} ${t('debitoTotal.assistance.nozzleCalculation.nozzlesUnit', 'bicos')} • ${t('debitoTotal.assistance.nozzleCalculation.averageFlow', 'Débito médio:')} ${formatNumberForDisplay(Number(primaryOut.subValue), 2)} L/min por bico`;
            } else if (largRaw && velRaw) {
              secondaryText = `${formatNumberForDisplay(Number(largRaw))} m • ${formatNumberForDisplay(Number(velRaw))} km/h`;
            }
          } else if (definition.id === 'calc_eppo') {
            const areaParc = outputs['areaParcela']?.rawValue;
            const geomVal = outputs['indiceGeometria']?.rawValue;
            const geomUnit = outputs['indiceGeometria']?.unit || '';
            if (geomVal !== undefined && areaParc !== undefined) {
              secondaryText = `${formatNumberForDisplay(Number(geomVal))} ${geomUnit} • ${formatNumberForDisplay(Number(areaParc))} ha`;
            }
          } else if (definition.id === 'calc_calibracao_pulverizador') {
            if (effMode === 'lwa') {
              const h = tempInputs['treatedHeightM']?.rawValue;
              const r = tempInputs['rowSpacingM']?.rawValue;
              const faces = tempInputs['treatedSides']?.rawValue || 2;
              const lwaOut = outputs['lwaHa']?.rawValue ?? outputs['primaryResult']?.subValue;
              const taxaOut = outputs['taxaLwa']?.rawValue;
              if (h && r) {
                secondaryText = `${formatNumberForDisplay(Number(h))} m • ${faces} faces • ${formatNumberForDisplay(Number(r))} m entrelinha${lwaOut ? ` (LWA: ${formatNumberForDisplay(Number(lwaOut))} m²/ha${taxaOut ? ` · ${taxaOut} L/10 000 m²` : ''})` : ''}`;
              }
            } else {
              const h = tempInputs['treatedHeightM']?.rawValue;
              const w = tempInputs['canopyWidthM']?.rawValue;
              const r = tempInputs['rowSpacingM']?.rawValue;
              const trvOut = outputs['trvM3PerHa']?.rawValue;
              if (h && w && r) {
                secondaryText = `${formatNumberForDisplay(Number(h))} × ${formatNumberForDisplay(Number(w))} m • ${formatNumberForDisplay(Number(r))} m entrelinha${trvOut ? ` (TRV: ${formatNumberForDisplay(Number(trvOut))} m³/ha)` : ''}`;
              }
            }
          }

          const primaryLabel = primaryRes?.label || 'Resultado';

          return {
            label: primaryLabel,
            primaryValue: primaryOut.rawValue,
            primaryUnit: primaryOut.unit,
            secondaryText,
            subValue: primaryOut.subValue ?? undefined,
            subUnit: primaryOut.subUnit ?? undefined,
            isValid: true,
            isComplete: true
          };
        }
      } catch (err) {
        console.warn('Erro transitório no cálculo do mostrador:', err);
      }

      let defaultStatusMsg = t('unifiedKeypad.enterDataPrompt', 'Introduza os dados para ver o resultado');
      if (definition.id === 'calc_velocidade_real') {
        defaultStatusMsg = t('velocidadeReal.enterDataPrompt', 'Introduza distância e tempo para calcular a velocidade real.');
      } else if (definition.id === 'calc_area_parede_foliar') {
        defaultStatusMsg = t('areaParedeFoliar.enterDataPrompt', 'Introduza a altura da vegetação e a distância entrelinhas para calcular a área de parede foliar.');
      } else if (definition.id === 'calc_volume_copa') {
        defaultStatusMsg = t('volumeCopa.enterDataPrompt', 'Introduza a altura, largura e distância entrelinhas para calcular o volume de copa.');
      } else if (definition.id === 'calc_volume_calda_trv') {
        defaultStatusMsg = t('volumeCaldaTrv.enterDataPrompt', 'Introduza o volume de copa e o coeficiente k para calcular o volume de calda.');
      } else if (definition.id === 'calc_debito_total') {
        defaultStatusMsg = t('debitoTotal.enterDataPrompt', 'Introduza o volume de calda, velocidade e largura para calcular o débito total.');
      } else if (definition.id === 'calc_eppo') {
        defaultStatusMsg = t('eppo.enterDataPrompt', 'Introduza as dimensões da parcela e coeficiente para calcular o volume EPPO.');
      } else if (definition.id === 'calc_calibracao_pulverizador') {
        defaultStatusMsg = activeModeId === 'lwa'
          ? t('calibracaoPulverizador.enterDataPromptLwa', 'Introduza a altura e a distância entrelinhas para calcular o LWA.')
          : t('calibracaoPulverizador.enterDataPromptTrv', 'Introduza a altura, largura e entrelinha para calcular o TRV e calda.');
      }

      const primaryLabel = definition.results[0]?.label || 'Resultado';

      return {
        label: primaryLabel,
        primaryValue: '—',
        primaryUnit: '',
        isValid: false,
        isComplete: false,
        statusMessage: defaultStatusMsg
      };
    },
    [
      definition,
      activeModeId,
      fieldValues,
      fieldUnits,
      showNozzleCalculation,
      isCalibracaoPulverizador,
      calibracaoCulture,
      calibracaoConduction,
      calibracaoPhenology,
      calibracaoDensity,
      calibracaoThickness,
      calibracaoStage,
      useManualAdoptedVolumeInLwa,
      t
    ]
  );

  const handleUnifiedKeypadConfirm = (
    confirmedFields: Record<string, { value: number; unit: string; rawExpression: string }>,
    confirmedModeId?: string
  ) => {
    if (confirmedModeId && confirmedModeId !== activeModeId) {
      setActiveModeId(confirmedModeId);
    }

    setFieldValues((prev) => {
      const next = { ...prev };
      for (const [fId, item] of Object.entries(confirmedFields)) {
        next[fId] = item.value;
      }
      return next;
    });

    setFieldUnits((prev) => {
      const next = { ...prev };
      for (const [fId, item] of Object.entries(confirmedFields)) {
        next[fId] = item.unit;
      }
      return next;
    });

    setUserModifiedFields((prev) => {
      const next = new Set(prev);
      for (const fId of Object.keys(confirmedFields)) {
        next.add(fId);
      }
      return next;
    });

    setIsUnifiedKeypadOpen(false);

    if (isCalibracaoPulverizador) {
      if ('workingWidthM' in confirmedFields) {
        setCalibracaoWorkingWidthSource('manual');
      } else if ('rowSpacingM' in confirmedFields && calibracaoWorkingWidthSource === 'auto-row-spacing') {
        setFieldValues((prev) => ({
          ...prev,
          workingWidthM: confirmedFields['rowSpacingM'].value
        }));
      }
    }

    if (isVolumeCaldaTrv && 'coeficienteVolumeCalda' in confirmedFields) {
      setSelectedDensityTier(null);
      setIsManualK(true);
    }
  };

  // 9. Construção dos Valores Estruturados de Entrada
  const structuredInputs = useMemo<Record<string, StructuredValue>>(() => {
    const inputs: Record<string, StructuredValue> = {};
    for (const f of definition.fields) {
      const rawVal = fieldValues[f.id] ?? f.defaultValue ?? 0;
      const unitVal = fieldUnits[f.id] ?? f.defaultUnit;

      inputs[f.id] = {
        rawValue: rawVal,
        unit: unitVal,
        normalizedValue: typeof rawVal === 'number' ? rawVal : Number(rawVal) || 0,
        dimension: f.dimension,
        canonicalKey: f.canonicalKey,
        label: f.label,
        source: 'user_input',
        localId: f.id,
        calculatorId: definition.id,
        calculatorVersion: definition.version
      };
    }

    // Inclui o modo ativo estruturado caso existam modos declarados
    if (definition.modes && definition.modes.length > 0) {
      const normalizedMode =
        activeModeId === 'jovem' || activeModeId === 'planta_jovem'
          ? 'planta_jovem'
          : activeModeId === 'adulta' || activeModeId === 'planta_adulta'
          ? 'planta_adulta'
          : activeModeId;

      inputs['mode'] = {
        rawValue: normalizedMode,
        unit: '',
        normalizedValue: 0,
        dimension: 'text',
        canonicalKey: 'calculator_mode',
        label: t('calibracao.vegetativeMode', 'Modo de Operação Vegetativa'),
        source: 'user_input',
        localId: 'mode',
        calculatorId: definition.id,
        calculatorVersion: definition.version
      };
    }

    if (isCalibracaoPulverizador) {
      if (calibracaoCulture) {
        inputs['cultureId'] = {
          rawValue: calibracaoCulture,
          unit: '',
          normalizedValue: 0,
          dimension: 'text',
          canonicalKey: 'crop_profile',
          label: 'Cultura',
          source: 'user_input',
          localId: 'cultureId',
          calculatorId: definition.id,
          calculatorVersion: definition.version
        };
      }
      if (calibracaoConduction) {
        inputs['conductionId'] = {
          rawValue: calibracaoConduction,
          unit: '',
          normalizedValue: 0,
          dimension: 'text',
          canonicalKey: 'training_system',
          label: t('calibracao.conductionMode', 'Modo de Condução'),
          source: 'user_input',
          localId: 'conductionId',
          calculatorId: definition.id,
          calculatorVersion: definition.version
        };
      }
      if (calibracaoPhenology) {
        inputs['phenologyId'] = {
          rawValue: calibracaoPhenology,
          unit: '',
          normalizedValue: 0,
          dimension: 'text',
          canonicalKey: 'phenology_stage',
          label: t('calibracao.phenologyStage', 'Estado Fenológico'),
          source: 'user_input',
          localId: 'phenologyId',
          calculatorId: definition.id,
          calculatorVersion: definition.version
        };
      }
      if (calibracaoDensity) {
        inputs['canopyDensity'] = {
          rawValue: calibracaoDensity,
          unit: '',
          normalizedValue: 0,
          dimension: 'text',
          canonicalKey: 'canopy_density',
          label: t('calibracao.canopyDensity', 'Densidade Foliar'),
          source: 'user_input',
          localId: 'canopyDensity',
          calculatorId: definition.id,
          calculatorVersion: definition.version
        };
      }
      if (calibracaoThickness) {
        inputs['canopyThickness'] = {
          rawValue: calibracaoThickness,
          unit: '',
          normalizedValue: 0,
          dimension: 'text',
          canonicalKey: 'canopy_thickness',
          label: t('calibracao.canopyThickness', 'Espessura da Sebe'),
          source: 'user_input',
          localId: 'canopyThickness',
          calculatorId: definition.id,
          calculatorVersion: definition.version
        };
      }
      if (calibracaoStage) {
        inputs['phenologyStage'] = {
          rawValue: calibracaoStage,
          unit: '',
          normalizedValue: 0,
          dimension: 'text',
          canonicalKey: 'phenology_interval',
          label: t('calibracao.phenologyInterval', 'Intervalo Fenológico'),
          source: 'user_input',
          localId: 'phenologyStage',
          calculatorId: definition.id,
          calculatorVersion: definition.version
        };
      }
      if (useManualAdoptedVolumeInLwa) {
        inputs['useManualAdoptedVolumeInLwa'] = {
          rawValue: 'true',
          unit: '',
          normalizedValue: 1,
          dimension: 'text',
          canonicalKey: 'lwa_manual_volume_override',
          label: 'Usar Volume Adotado Manual',
          source: 'user_input',
          localId: 'useManualAdoptedVolumeInLwa',
          calculatorId: definition.id,
          calculatorVersion: definition.version
        };
      }
    }

    return inputs;
  }, [
    definition,
    fieldValues,
    fieldUnits,
    activeModeId,
    isCalibracaoPulverizador,
    calibracaoCulture,
    calibracaoConduction,
    calibracaoPhenology,
    calibracaoDensity,
    calibracaoThickness,
    calibracaoStage,
    useManualAdoptedVolumeInLwa
  ]);

  // 10. Execução do Motor de Cálculo em Tempo Real
  const structuredOutputs = useMemo<Record<string, StructuredValue>>(() => {
    try {
      return definition.calculate(structuredInputs);
    } catch (err) {
      console.error(`Erro ao executar o cálculo em ${definition.id}:`, err);
      return {};
    }
  }, [definition, structuredInputs]);

  // 11. Execução de Validação Declarativa
  const validation = useMemo(() => {
    if (definition.validate) {
      return definition.validate(structuredInputs);
    }
    return { isValid: true, errors: {}, warnings: {} };
  }, [definition, structuredInputs]);

  // Título e avisos amigáveis para a caixa de validação dedicada ("Atenção aos dados introduzidos")
  const validationCardTitle = t(
    'calibracaoPulverizador.validation.title',
    t('validationNotes.title', 'Atenção aos dados introduzidos')
  );

  const { bulletNotices, legalNote } = useMemo(() => {
    if (!validation.warnings || Object.keys(validation.warnings).length === 0) {
      return { bulletNotices: [], legalNote: null };
    }

    const notices: { key: string; message: string }[] = [];
    const seenMessages = new Set<string>();
    let legal: string | null = null;

    for (const [key, rawMsg] of Object.entries(validation.warnings)) {
      const resolved = resolveFriendlyValidationMessage(rawMsg || key, t);
      if (!resolved) continue;

      // Se for a nota legal (labelPrevalence ou general)
      if (
        key === 'general' ||
        key.startsWith('general:') ||
        rawMsg === 'calibracaoPulverizador.warnings.labelPrevalence' ||
        resolved.includes('autorização de venda prevalecem sempre') ||
        resolved.startsWith('Nota: As indicações do rótulo')
      ) {
        legal = resolved;
        continue;
      }

      // Deduplicação de mensagens
      if (!seenMessages.has(resolved)) {
        seenMessages.add(resolved);
        notices.push({ key, message: resolved });
      }
    }

    return { bulletNotices: notices, legalNote: legal };
  }, [validation.warnings, t]);

  // 12. Resolução Dinâmica de Microlearning de Resultados por Modo
  const resolvedResults = useMemo(() => {
    let list = definition.results;
    if (definition.modes && activeModeId) {
      const modeDef = definition.modes.find((m) => m.id === activeModeId);
      if (modeDef?.resultIds && modeDef.resultIds.length > 0) {
        list = list.filter((r) => modeDef.resultIds!.includes(r.id));
      }
    }

    if (isCalibracaoPulverizador) {
      if (activeModeId === 'lwa') {
        list = list.filter((r) => r.id !== 'trvM3PerHa');
        if (!structuredOutputs['volCaldaAdotado']) {
          list = list.filter((r) => r.id !== 'volCaldaAdotado');
        }
      } else if (activeModeId === 'trv') {
        list = list.filter((r) => r.id !== 'lwaHa' && r.id !== 'taxaLwa' && r.id !== 'volCaldaAdotado');
      }
      if (!structuredOutputs['caudalMedioPorBico']) {
        list = list.filter((r) => r.id !== 'caudalMedioPorBico');
      }
      if (!structuredOutputs['caudalTotalNecessario']) {
        list = list.filter((r) => r.id !== 'caudalTotalNecessario');
      }
      if (!structuredOutputs['tempoTeoricoPorHa']) {
        list = list.filter((r) => r.id !== 'tempoTeoricoPorHa');
      }
    }

    return list.map((res) => {
      let resolvedHelpFile = res.helpFile;
      if (res.helpFileByMode && activeModeId && res.helpFileByMode[activeModeId]) {
        resolvedHelpFile = res.helpFileByMode[activeModeId];
      }
      return {
        ...res,
        helpFile: resolvedHelpFile
      };
    });
  }, [definition.results, definition.modes, activeModeId, isCalibracaoPulverizador, structuredOutputs]);

  const primaryResultDef = resolvedResults[0];
  const primaryOutput = primaryResultDef ? structuredOutputs[primaryResultDef.id] : undefined;

  // 12b. Preparação dos Itens de Visualização para o Painel de Resultados
  const outputValues = useMemo<Record<string, ResultDisplayItem>>(() => {
    const map: Record<string, ResultDisplayItem> = {};
    for (const resDef of resolvedResults) {
      const out = structuredOutputs[resDef.id];
      let subVal = out?.subValue;
      let subUnit = out?.subUnit;

      if (out && typeof out.rawValue === 'number' && subVal === undefined) {
        const rawNum = out.rawValue;
        if (out.unit === 'L') {
          subVal = rawNum * 1000;
          subUnit = 'mL';
        } else if (out.unit === 'kg') {
          subVal = rawNum * 1000;
          subUnit = 'g';
        } else if (out.unit === 'mL') {
          subVal = rawNum / 1000;
          subUnit = 'L';
        } else if (out.unit === 'g') {
          subVal = rawNum / 1000;
          subUnit = 'kg';
        } else if (resDef.subUnit) {
          subUnit = resDef.subUnit;
        }
      }

      const hasValue = validation.isValid && out !== undefined && out.rawValue !== undefined && out.rawValue !== null;

      map[resDef.id] = {
        value: hasValue ? out.rawValue : (validation.isValid ? 'A completar dados' : 0),
        unit: hasValue ? out.unit : (validation.isValid ? '' : resDef.defaultUnit),
        subValue: validation.isValid && hasValue ? (subVal ?? undefined) : undefined,
        subUnit: subUnit ?? undefined,
        hasHelp: !!resDef.helpFile,
        isInvalid: !validation.isValid,
        invalidMessage: definition.invalidResultNotice || 'Resultado indisponível. Verifique se todos os campos foram preenchidos corretamente.'
      };
    }
    return map;
  }, [resolvedResults, structuredOutputs, validation.isValid, definition.invalidResultNotice]);

  // 13. Gravação Controlada de Histórico
  const handleSave = async () => {
    if (!validation.isValid) {
      setToastInfo({
        msg: t('common.fixValidationErrors', 'Corrija os erros de validação antes de guardar o cálculo.'),
        type: 'error'
      });
      return;
    }

    // Se foi fornecido um handler de gravação personalizado (ex: Concentração na tabela existente)
    if (onSaveCalculation) {
      setIsSaving(true);
      try {
        await onSaveCalculation({
          inputs: structuredInputs,
          outputs: structuredOutputs
        });
        setToastInfo({
          msg: t('common.calculationSaved', 'Cálculo guardado com sucesso no histórico.'),
          type: 'success'
        });
      } catch (err) {
        console.error('Erro ao guardar o cálculo via onSaveCalculation:', err);
        setToastInfo({
          msg: t('common.calculationSaveError', 'Não foi possível guardar o cálculo. Tente novamente.'),
          type: 'error'
        });
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // Fluxo padrão para calculadoras migradas para calculation_history_v2 (ex: calc_dose, calc_concentracao, calc_velocidade_real)
    if (!effectiveUserId) {
      setToastInfo({
        msg: t(
          'common.authRequiredToSave',
          'Não foi possível guardar o cálculo. É necessária uma sessão com início prévio para associar os cálculos.'
        ),
        type: 'error'
      });
      return;
    }

    const quota = evaluateHistoryQuota(definition.id, effectiveUserId, historyRecords);

    if (quota.isLimitReached) {
      setPendingCalculation({ inputs: structuredInputs, outputs: structuredOutputs });
      setIsLimitModalOpen(true);
      return;
    }

    setIsSaving(true);
    try {
      const record = buildCalculationRecord({
        userId: effectiveUserId,
        calculatorId: definition.id,
        calculatorVersion: definition.version,
        inputs: structuredInputs,
        outputs: structuredOutputs
      });

      await saveCalculationToDb(record);
      setToastInfo({
        msg: t('common.calculationSaved', 'Cálculo guardado com sucesso no histórico.'),
        type: 'success'
      });
    } catch (err) {
      console.error('Erro ao guardar o cálculo:', err);
      setToastInfo({
        msg: t('common.calculationSaveError', 'Não foi possível guardar o cálculo. Tente novamente.'),
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handler de resolução do limite de 20 (Dose)
  const handleLimitModalSelectAndDelete = async (recordToDelete: CalculationHistoryRecord) => {
    if (!pendingCalculation || !effectiveUserId) return;
    setIsSaving(true);
    try {
      await softDeleteCalculationInDb(recordToDelete.id);

      const newRecord = buildCalculationRecord({
        userId: effectiveUserId,
        calculatorId: definition.id,
        calculatorVersion: definition.version,
        inputs: pendingCalculation.inputs,
        outputs: pendingCalculation.outputs
      });
      await saveCalculationToDb(newRecord);

      setIsLimitModalOpen(false);
      setPendingCalculation(null);
      setToastInfo({
        msg: t('common.calculationSaved', 'Cálculo guardado com sucesso no histórico.'),
        type: 'success'
      });
    } catch (err) {
      console.error('Erro ao gerir limite de histórico:', err);
      setToastInfo({
        msg: t('common.calculationSaveError', 'Não foi possível guardar o cálculo. Tente novamente.'),
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHistoryRecord = async (record: CalculationHistoryRecord) => {
    await softDeleteCalculationInDb(record.id);
    setToastInfo({
      msg: t('common.calculationDeleted', 'Cálculo eliminado do histórico.'),
      type: 'success'
    });
  };

  const handleClearCalculatorHistory = async () => {
    if (!effectiveUserId) return;
    await clearCalculatorHistoryInDb(definition.id, effectiveUserId);
    setToastInfo({
      msg: t('common.historyCleared', 'Histórico desta calculadora limpo.'),
      type: 'success'
    });
  };

  const handleUpdateMetadata = async (
    id: string,
    metadata: { name?: string; notes?: string; tags?: string[] }
  ) => {
    await updateCalculationMetadataInDb(id, metadata);
    setToastInfo({
      msg: t('common.calculationUpdated', 'Informações do cálculo atualizadas.'),
      type: 'success'
    });
  };

  // Determina o rótulo do modo ativo para o badge do resultado
  const currentModeLabel = definition.modes?.find((m) => m.id === activeModeId)?.label ?? badgeMode;

  return (
    <div className="space-y-3.5 sm:space-y-4 animate-fade-in calculator-content-spacing">
      {/* 1. Barra de Topo Oficial */}
      <CalculatorHeader
        title={definition.title}
        category={definition.category}
        badgeLabel={definition.badgeLabel ?? t('common.activeTool', 'Ferramenta Ativa')}
        onBack={onBack}
      />

      {/* 1b. Sticky Result Header Móvel - Piloto Fase 1A */}
      {!isDesktop && isPilotCalculator && (
        <aside
          aria-label="Resumo dinâmico do cálculo"
          className="sticky top-20 z-20 bg-gradient-to-r from-[#114037] to-[#175348] text-white p-3.5 sm:p-4 rounded-2xl shadow-floating border border-[#1D734B]/40 sticky-result-container"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  {primaryResultDef?.label || 'Resultado'}
                </span>
                {currentModeLabel && (
                  <span className="text-[10px] font-extrabold bg-[#3CA64C]/20 text-[#3CA64C] px-1.5 py-0.5 rounded">
                    {currentModeLabel}
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl sm:text-2xl font-black font-mono-numbers text-white tracking-tight">
                  {validation.isValid && primaryOutput?.rawValue !== undefined
                    ? formatNumberForDisplay(Number(primaryOutput.rawValue))
                    : '—'}
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#3CA64C]">
                  {validation.isValid && primaryOutput?.rawValue !== undefined
                    ? (primaryOutput?.unit || primaryResultDef?.defaultUnit || '')
                    : ''}
                </span>
              </div>
              {validation.isValid ? (
                <div className="space-y-0.5 mt-0.5">
                  {definition.id === 'calc_concentracao' && fieldValues['volPrepararConc'] && (
                    <span className="text-[11px] text-[#3CA64C] font-semibold block truncate">
                      {t('unifiedKeypad.tankToPrepare', 'Depósito a preparar')}: {formatNumberForDisplay(Number(fieldValues['volPrepararConc']))} {fieldUnits['volPrepararConc'] || 'L'}
                    </span>
                  )}
                  {definition.id === 'calc_dose' && outputValues['area_tratada_ha']?.value !== undefined && (
                    <span className="text-[11px] text-[#3CA64C] font-semibold block truncate">
                      {t('unifiedKeypad.coveredArea', 'Área coberta')}: {formatNumberForDisplay(Number(outputValues['area_tratada_ha'].value))} ha {t('unifiedKeypad.perTank', 'por depósito')}
                    </span>
                  )}
                  {definition.id === 'calc_area_parede_foliar' && (
                    <span className="text-[11px] text-[#3CA64C] font-semibold block truncate">
                      {t('areaParedeFoliar.submetric', '2 faces da vegetação tratada')}
                    </span>
                  )}
                  {definition.id === 'calc_volume_copa' && (
                    <span className="text-[11px] text-[#3CA64C] font-semibold block truncate">
                      {fieldValues['alturaCopa'] && fieldValues['larguraCopa'] && fieldValues['distanciaEntrelinhas']
                        ? `${formatNumberForDisplay(Number(fieldValues['alturaCopa']))} × ${formatNumberForDisplay(Number(fieldValues['larguraCopa']))} m • ${formatNumberForDisplay(Number(fieldValues['distanciaEntrelinhas']))} m entrelinha`
                        : t('volumeCopa.submetric', 'Geometria tridimensional de copa')}
                    </span>
                  )}
                  {definition.id === 'calc_volume_calda_trv' && (
                    <span className="text-[11px] text-[#3CA64C] font-semibold block truncate">
                      {fieldValues['volumeCopaTrv'] && fieldValues['coeficienteVolumeCalda']
                        ? `TRV: ${formatNumberForDisplay(Number(fieldValues['volumeCopaTrv']))} m³/ha · k: ${formatNumberForDisplay(Number(fieldValues['coeficienteVolumeCalda']), 3)} L/m³`
                        : t('volumeCaldaTrv.submetric', 'TRV · Coeficiente de volume de calda')}
                    </span>
                  )}
                  {definition.id === 'calc_debito_total' && (
                    <span className="text-[11px] text-[#3CA64C] font-semibold block truncate">
                      {showNozzleCalculation && fieldValues['numeroBicos'] && primaryOutput?.subValue !== undefined
                        ? `${fieldValues['numeroBicos']} ${t('debitoTotal.assistance.nozzleCalculation.nozzlesUnit', 'bicos')} • ${t('debitoTotal.assistance.nozzleCalculation.averageFlow', 'Débito médio:')} ${formatNumberForDisplay(Number(primaryOutput.subValue), 2)} L/min por bico`
                        : fieldValues['larguraTrabalho'] && fieldValues['velocidadeTrabalho']
                        ? `${formatNumberForDisplay(Number(fieldValues['larguraTrabalho']))} m • ${formatNumberForDisplay(Number(fieldValues['velocidadeTrabalho']))} km/h`
                        : t('debitoTotal.submetric', 'Débito total da máquina')}
                    </span>
                  )}
                  {definition.id === 'calc_eppo' && outputValues['areaParcela']?.value !== undefined && (
                    <span className="text-[11px] text-[#3CA64C] font-semibold block truncate">
                      {t('eppo.parcelAreaLabel', 'Área da Parcela')}: {formatNumberForDisplay(Number(outputValues['areaParcela'].value))} ha ({formatNumberForDisplay(Number(outputValues['areaParcela'].subValue || 0))} m²)
                    </span>
                  )}
                  {definition.id === 'calc_calibracao_pulverizador' && (
                    <span className="text-[11px] text-[#3CA64C] font-semibold block truncate">
                      {activeModeId === 'lwa'
                        ? `${t('calibracaoPulverizador.methods.lwa.label', 'LWA')} · ${formatNumberForDisplay(Number(outputValues['lwaHa']?.value || outputValues['primaryResult']?.subValue || 0))} m²/ha${outputValues['taxaLwa']?.value ? ` · ${outputValues['taxaLwa']?.value} L/10 000 m²` : ''}`
                        : `${t('calibracaoPulverizador.methods.trv.label', 'TRV')} · ${formatNumberForDisplay(Number(outputValues['trvM3PerHa']?.value || 0))} m³/ha`}
                    </span>
                  )}
                  {primaryOutput?.subValue !== undefined && definition.id !== 'calc_debito_total' && (
                    <span className="text-[10.5px] text-slate-300 block truncate">
                      {t('unifiedKeypad.productEquivalence', 'Equivalente a')} {formatNumberForDisplay(Number(primaryOutput.subValue))} {primaryOutput.subUnit}{['mL', 'g', 'L', 'kg'].includes(primaryOutput.subUnit || '') ? ` ${t('unifiedKeypad.ofProduct', 'de produto')}` : ''}
                    </span>
                  )}
                </div>
              ) : (
                <div className="mt-0.5">
                  <span className="text-[11px] text-slate-300 block truncate">
                    {definition.id === 'calc_velocidade_real'
                      ? t('velocidadeReal.enterDataPrompt', 'Introduza distância e tempo para calcular a velocidade real.')
                      : definition.id === 'calc_area_parede_foliar'
                      ? t('areaParedeFoliar.enterDataPrompt', 'Introduza a altura da vegetação e a distância entrelinhas para calcular a área de parede foliar.')
                      : definition.id === 'calc_volume_copa'
                      ? t('volumeCopa.enterDataPrompt', 'Introduza a altura, largura e distância entrelinhas para calcular o volume de copa.')
                      : definition.id === 'calc_volume_calda_trv'
                      ? t('volumeCaldaTrv.enterDataPrompt', 'Introduza o volume de copa e o coeficiente k para calcular o volume de calda.')
                      : definition.id === 'calc_debito_total'
                      ? t('debitoTotal.enterDataPrompt', 'Introduza o volume de calda, velocidade e largura para calcular o débito total.')
                      : definition.id === 'calc_eppo'
                      ? t('eppo.enterDataPrompt', 'Introduza as dimensões da parcela e coeficiente para calcular o volume EPPO.')
                      : definition.id === 'calc_calibracao_pulverizador'
                      ? t('calibracaoPulverizador.enterDataPrompt', 'Introduza a geometria da vegetação para planear o volume e produto.')
                      : t('unifiedKeypad.enterDataPrompt', 'Introduza os dados para ver o resultado')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* 2. Toast Oficial de Feedback (3,5 segundos) */}
      {toastInfo && (
        <div
          role="status"
          aria-live="polite"
          className={`p-4 rounded-2xl font-bold text-xs shadow-md flex items-center gap-2 animate-fade-in ${
            toastInfo.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}
        >
          {toastInfo.type === 'error' ? (
            <AlertCircle className="w-5 h-5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          )}
          <span>{toastInfo.msg}</span>
        </div>
      )}

      {/* 3. Estrutura Responsiva Principal */}
      {isPilotCalculator ? (
        !isDesktop ? (
          /* Mobile View: Estritamente ZERO inputs no DOM e ZERO duplicação de resultados */
          <div className="space-y-2.5 sm:space-y-3">
            {/* Assistência Agronómica de Densidade de Copa (calc_volume_calda_trv) em Mobile */}
            {isVolumeCaldaTrv && (
              <CanopyDensitySelector
                selectedProfile={canopyProfile}
                onSelectProfile={handleSelectCanopyProfile}
                selectedTier={selectedDensityTier}
                onSelectTier={handleSelectDensityTier}
                isManualK={isManualK}
                kValue={fieldValues['coeficienteVolumeCalda']}
                interpretation={trvInterpretation}
                isDesktop={false}
              />
            )}

            {/* Seletor de Critério de Largura (calc_debito_total) em Mobile */}
            {isDebitoTotal && (
              <>
                <WorkingWidthCriteriaSelector
                  selectedCriterion={
                    (fieldValues['baseLargura'] === 'row_spacing' ||
                    fieldValues['baseLargura'] === 'effective_treated_band' ||
                    fieldValues['baseLargura'] === 'boom_total_width')
                      ? (fieldValues['baseLargura'] as WorkingWidthCriterionId)
                      : 'boom_total_width'
                  }
                  onSelectCriterion={(crit) => handleFieldChange('baseLargura', crit, '')}
                  isDesktop={false}
                />
                <div className="flex items-center justify-between px-1">
                  <button
                    type="button"
                    onClick={() => setShowNozzleCalculation((prev) => !prev)}
                    className={`min-h-[44px] px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      showNozzleCalculation
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-[#114037]/10 hover:bg-[#114037]/15 text-[#114037] border border-[#114037]/20'
                    }`}
                    aria-pressed={showNozzleCalculation}
                  >
                    <span className="text-sm font-extrabold">{showNozzleCalculation ? '−' : '+'}</span>
                    <span>
                      {showNozzleCalculation
                        ? t('debitoTotal.assistance.nozzleCalculation.hide', 'Ocultar cálculo por bico')
                        : t('debitoTotal.assistance.nozzleCalculation.show', 'Calcular débito por bico (opcional)')}
                    </span>
                  </button>
                </div>
              </>
            )}
            {/* Seletor de Método e Contexto de Calibração de Pulverizador (calc_calibracao_pulverizador) em Mobile */}
            {isCalibracaoPulverizador && (
              <div className="space-y-3">
                <CalibracaoMetodoSelector
                  selectedMethod={activeModeId as CalibracaoMetodo}
                  onSelectMethod={(m: CalibracaoMetodo) => handleModeChange(m)}
                />
                <CalibracaoContextSelectors
                  method={activeModeId as CalibracaoMetodo}
                  cultureId={calibracaoCulture}
                  conductionId={calibracaoConduction}
                  phenologyId={calibracaoPhenology}
                  canopyDensity={calibracaoDensity}
                  canopyThickness={calibracaoThickness}
                  phenologyStage={calibracaoStage}
                  useManualAdoptedVolumeInLwa={useManualAdoptedVolumeInLwa}
                  onSelectCulture={setCalibracaoCulture}
                  onSelectConduction={setCalibracaoConduction}
                  onSelectPhenology={setCalibracaoPhenology}
                  onSelectCanopyDensity={setCalibracaoDensity}
                  onSelectCanopyThickness={setCalibracaoThickness}
                  onSelectPhenologyStage={setCalibracaoStage}
                  onToggleManualAdoptedVolumeInLwa={setUseManualAdoptedVolumeInLwa}
                />
              </div>
            )}

            {/* Seletor de Modo Mobile (se existirem modos declarados) */}
            {definition.modes && definition.modes.length > 1 && !isCalibracaoPulverizador && (
              <div className="bg-white rounded-2xl p-2 sm:p-2.5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-600 shrink-0">Modo:</span>
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  {definition.modes.map((m) => {
                    const isSelected = activeModeId === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleModeChange(m.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#114037] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Faixa de Notificação de Transferência Importada em Mobile */}
            {activeImportedNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-900 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{activeImportedNotice}</span>
              </div>
            )}

            {/* Cartão de Resumo de Valores Atribuídos (Apenas Leitura Clicável) */}
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-soft space-y-2">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-xs sm:text-sm font-black text-slate-800 tracking-tight">
                  {t('unifiedKeypad.inputSummaryTitle', 'Valores Introduzidos')}
                </h3>
              </div>

              {/* Lista de Campos de Leitura */}
              <div className="space-y-1.5">
                {currentActiveFields.map((f) => {
                  const rawVal = fieldValues[f.id];
                  const unit = fieldUnits[f.id] || f.defaultUnit;
                  const displayVal =
                    rawVal !== '' && rawVal !== undefined
                      ? formatNumberForDisplay(Number(rawVal))
                      : '—';
                  const hasError = validation.errors && validation.errors[f.id];

                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleOpenUnifiedKeypad(f.id)}
                      aria-label={`${t('unifiedKeypad.edit', 'Editar')} ${f.label}`}
                      className={`w-full min-h-[44px] sm:min-h-[48px] px-3 py-2 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer touch-target focus-visible:outline-2 focus-visible:outline-[#114037] ${
                        hasError
                          ? 'border-rose-300 bg-rose-50/60'
                          : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 active:bg-slate-200/70'
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="text-xs sm:text-sm font-semibold text-slate-800 block truncate">
                          {f.label}
                        </span>
                        {hasError ? (
                          <span className="text-[10.5px] font-medium text-rose-600 block truncate mt-0.5">
                            {resolveFriendlyValidationMessage(hasError, t)}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span className="text-sm sm:text-base font-extrabold font-mono-numbers text-slate-900">
                            {displayVal}
                          </span>
                          <span className="ml-1 text-xs font-bold text-[#1D734B]">{unit}</span>
                        </div>
                        <div
                          aria-hidden="true"
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-2xs"
                        >
                          <Pencil className="w-3 h-3 stroke-[2.2]" aria-hidden="true" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Caixa Dedicada: Atenção aos dados introduzidos */}
            {bulletNotices.length > 0 && (
              <div
                role="note"
                aria-label={validationCardTitle}
                className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 text-amber-900 shadow-2xs space-y-3 animate-fade-in"
              >
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-950">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
                  <span>{validationCardTitle}</span>
                </div>
                <ul className="space-y-2 text-xs leading-relaxed text-amber-900 list-disc pl-5">
                  {bulletNotices.map((notice, idx) => (
                    <li key={notice.key || idx} className="pl-0.5">
                      <span>{notice.message}</span>
                    </li>
                  ))}
                </ul>
                {legalNote && (
                  <div className="pt-2 border-t border-amber-200/70 text-[11.5px] leading-relaxed text-amber-800/90 font-medium">
                    <span>{legalNote}</span>
                  </div>
                )}
              </div>
            )}

            {/* Secção da Fase B — Ajuste Operacional (calc_calibracao_pulverizador) em Mobile */}
            {isCalibracaoPulverizador && (
              <CalibracaoPhaseBSection
                travelSpeedKmH={fieldValues['travelSpeedKmH']}
                workingWidthM={fieldValues['workingWidthM']}
                activeNozzleCount={fieldValues['activeNozzleCount']}
                workingWidthSource={calibracaoWorkingWidthSource}
                rowSpacingM={fieldValues['rowSpacingM']}
                phaseAVolume={
                  structuredOutputs['volCaldaAdotado']?.rawValue !== undefined
                    ? Number(structuredOutputs['volCaldaAdotado'].rawValue)
                    : structuredOutputs['volCaldaRecomendado']?.rawValue !== undefined
                    ? Number(structuredOutputs['volCaldaRecomendado'].rawValue)
                    : structuredOutputs['volCaldaSugerido']?.rawValue !== undefined
                    ? Number(structuredOutputs['volCaldaSugerido'].rawValue)
                    : undefined
                }
                totalFlowRequiredLMin={
                  structuredOutputs['caudalTotalNecessario']?.rawValue !== undefined
                    ? Number(structuredOutputs['caudalTotalNecessario'].rawValue)
                    : undefined
                }
                flowPerNozzleLMin={
                  structuredOutputs['caudalMedioPorBico']?.rawValue !== undefined
                    ? Number(structuredOutputs['caudalMedioPorBico'].rawValue)
                    : undefined
                }
                theoreticalTimePerHaMinutes={
                  structuredOutputs['tempoTeoricoPorHa']?.rawValue !== undefined
                    ? Number(structuredOutputs['tempoTeoricoPorHa'].rawValue)
                    : undefined
                }
                phaseBState={structuredOutputs['phaseBState']?.rawValue as any}
                onSpeedChange={(speed) => handleFieldChange('travelSpeedKmH', speed, 'km/h')}
                onWidthChange={(width, source) => {
                  if (source) setCalibracaoWorkingWidthSource(source);
                  handleFieldChange('workingWidthM', width, 'm');
                }}
                onOpenKeypad={handleOpenUnifiedKeypad}
                isDesktop={false}
              />
            )}

            {/* Secção da Fase C — Seleção de bicos e pressão de trabalho (calc_calibracao_pulverizador) em Mobile */}
            {isCalibracaoPulverizador && (
              <CalibracaoPhaseCNozzleSelectionSection
                phaseAVolume={
                  structuredOutputs['volCaldaAdotado']?.rawValue !== undefined
                    ? Number(structuredOutputs['volCaldaAdotado'].rawValue)
                    : structuredOutputs['volCaldaRecomendado']?.rawValue !== undefined
                    ? Number(structuredOutputs['volCaldaRecomendado'].rawValue)
                    : structuredOutputs['volCaldaSugerido']?.rawValue !== undefined
                    ? Number(structuredOutputs['volCaldaSugerido'].rawValue)
                    : undefined
                }
                travelSpeedKmH={
                  fieldValues['travelSpeedKmH'] !== undefined && fieldValues['travelSpeedKmH'] !== ''
                    ? Number(fieldValues['travelSpeedKmH'])
                    : undefined
                }
                workingWidthM={
                  fieldValues['workingWidthM'] !== undefined && fieldValues['workingWidthM'] !== ''
                    ? Number(fieldValues['workingWidthM'])
                    : undefined
                }
                activeNozzleCount={fieldValues['activeNozzleCount']}
                totalFlowRequiredLMin={
                  structuredOutputs['caudalTotalNecessario']?.rawValue !== undefined
                    ? Number(structuredOutputs['caudalTotalNecessario'].rawValue)
                    : undefined
                }
                flowPerNozzleLMin={
                  structuredOutputs['caudalMedioPorBico']?.rawValue !== undefined
                    ? Number(structuredOutputs['caudalMedioPorBico'].rawValue)
                    : undefined
                }
                onNozzleCountChange={handleNozzleCountChange}
                isDesktop={false}
              />
            )}


            {/* Ação e Bloco de Divulgação Progressiva do Cálculo por Bico (calc_debito_total) em Mobile */}
            {isDebitoTotal && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (!showNozzleCalculation) {
                        setShowNozzleCalculation(true);
                        if (!fieldValues['numeroBicos']) {
                          handleOpenUnifiedKeypad('numeroBicos');
                        }
                      } else {
                        setShowNozzleCalculation(false);
                      }
                    }}
                    className={`min-h-[48px] px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      showNozzleCalculation
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-[#114037]/10 hover:bg-[#114037]/15 text-[#114037] border border-[#114037]/20'
                    }`}
                    aria-pressed={showNozzleCalculation}
                  >
                    <span className="text-sm font-extrabold">{showNozzleCalculation ? '−' : '+'}</span>
                    <span>
                      {showNozzleCalculation
                        ? t('debitoTotal.assistance.nozzleCalculation.hide', 'Ocultar cálculo por bico')
                        : t('debitoTotal.assistance.nozzleCalculation.show', 'Calcular débito por bico (opcional)')}
                    </span>
                  </button>
                </div>

                {/* Descrição curta auxiliar de N em mobile quando cálculo por bico ativo */}
                {showNozzleCalculation && (
                  <p className="text-[11px] text-slate-500 px-1 leading-relaxed">
                    {t(
                      'debitoTotal.assistance.nozzleCalculation.fieldDescription',
                      'Indique apenas os bicos que contribuem para o débito total calculado nesta passagem.'
                    )}
                  </p>
                )}

                {/* Nota Principal e Complementar de Débito Médio por Bico quando cálculo ativo e N válido em Mobile */}
                {showNozzleCalculation &&
                  fieldValues['numeroBicos'] &&
                  primaryOutput?.subValue !== undefined && (
                    <div
                      role="note"
                      className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-slate-600 animate-fade-in"
                    >
                      <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="leading-relaxed space-y-1">
                        <p>
                          {t(
                            'debitoTotal.assistance.nozzleCalculation.averageFlowNotice',
                            'O débito médio é calculado com base no número de bicos ativos em simultâneo. Confirme que todos os bicos considerados têm débito semelhante.'
                          )}
                        </p>
                        {fieldValues['baseLargura'] === 'row_spacing' && (
                          <p className="text-slate-500 text-[11px]">
                            {t(
                              'debitoTotal.assistance.nozzleCalculation.rowSpacingDifferentiatedDistributionNotice',
                              'Pulverizadores com distribuição vertical diferenciada, bicos de diferentes calibres ou secções com funcionamento distinto devem ser avaliados numa ferramenta própria.'
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Resultados Secundários (se existirem, ex: área tratada no cálculo de dose) */}
            {resolvedResults.slice(1).map((secDef) => {
              const secItem = outputValues[secDef.id];
              return (
                <div
                  key={secDef.id}
                  className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs flex items-center justify-between"
                >
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">
                    {secDef.label}
                  </span>
                  <div className="text-right">
                    <span className="text-sm sm:text-base font-black font-mono-numbers text-slate-900">
                      {validation.isValid && secItem?.value !== undefined
                        ? formatNumberForDisplay(Number(secItem.value))
                        : '—'}
                    </span>
                    <span className="ml-1 text-xs font-bold text-[#1D734B]">
                      {secItem?.unit || secDef.defaultUnit}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Aviso contextual se houver valor transferido desnecessário no modo ativo */}
            {unneededNotice && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{unneededNotice}</span>
              </div>
            )}
          </div>
        ) : (
          /* Desktop View: Cartão de Resultados Superior em Largura Total seguido de Entradas Empilhadas */
          <div className="space-y-3.5 sm:space-y-4">
            {/* 1. Cartão de Resultados Superior em Largura Total */}
            <CalculatorResultsPanel
              headerTitle={`RESULTADO DO CÁLCULO DE ${definition.category.toUpperCase()}`}
              badgeMode={currentModeLabel}
              results={resolvedResults}
              outputValues={outputValues}
              onSave={handleSave}
              isSaving={isSaving}
              saveButtonLabel={saveButtonLabel}
              onOpenResultHelp={onOpenResultHelp}
            />

            {/* 2. Cartões de Entrada de Dados Empilhados por Baixo */}
            <div className="space-y-3.5 sm:space-y-4">
              {/* Assistência Agronómica de Densidade de Copa (calc_volume_calda_trv) em Desktop */}
              {isVolumeCaldaTrv && (
                <CanopyDensitySelector
                  selectedProfile={canopyProfile}
                  onSelectProfile={handleSelectCanopyProfile}
                  selectedTier={selectedDensityTier}
                  onSelectTier={handleSelectDensityTier}
                  isManualK={isManualK}
                  kValue={fieldValues['coeficienteVolumeCalda']}
                  interpretation={trvInterpretation}
                  isDesktop={true}
                />
              )}

              {/* Seletor de Critério de Largura (calc_debito_total) em Desktop */}
              {isDebitoTotal && (
                <WorkingWidthCriteriaSelector
                  selectedCriterion={
                    (fieldValues['baseLargura'] === 'row_spacing' ||
                    fieldValues['baseLargura'] === 'effective_treated_band' ||
                    fieldValues['baseLargura'] === 'boom_total_width')
                      ? (fieldValues['baseLargura'] as WorkingWidthCriterionId)
                      : 'boom_total_width'
                  }
                  onSelectCriterion={(crit) => handleFieldChange('baseLargura', crit, '')}
                  isDesktop={true}
                />
              )}

              {/* Divulgação Progressiva do Cálculo por Bico (calc_debito_total) em Desktop */}
              {isDebitoTotal && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowNozzleCalculation((prev) => !prev);
                      }}
                      className={`min-h-[48px] px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        showNozzleCalculation
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-[#114037]/10 hover:bg-[#114037]/15 text-[#114037] border border-[#114037]/20'
                      }`}
                      aria-pressed={showNozzleCalculation}
                    >
                      <span className="text-sm font-extrabold">{showNozzleCalculation ? '−' : '+'}</span>
                      <span>
                        {showNozzleCalculation
                          ? t('debitoTotal.assistance.nozzleCalculation.hide', 'Ocultar cálculo por bico')
                          : t('debitoTotal.assistance.nozzleCalculation.show', 'Calcular débito por bico (opcional)')}
                      </span>
                    </button>
                  </div>

                  {/* Descrição curta auxiliar de N em desktop quando cálculo por bico ativo */}
                  {showNozzleCalculation && (
                    <p className="text-xs text-slate-500 px-1 leading-relaxed">
                      {t(
                        'debitoTotal.assistance.nozzleCalculation.fieldDescription',
                        'Indique apenas os bicos que contribuem para o débito total calculado nesta passagem.'
                      )}
                    </p>
                  )}

                  {/* Nota Principal e Complementar de Débito Médio por Bico quando cálculo ativo e N válido em Desktop */}
                  {showNozzleCalculation &&
                    fieldValues['numeroBicos'] &&
                    primaryOutput?.subValue !== undefined && (
                      <div
                        role="note"
                        className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-slate-600 animate-fade-in"
                      >
                        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
                        <div className="leading-relaxed space-y-1">
                          <p>
                            {t(
                              'debitoTotal.assistance.nozzleCalculation.averageFlowNotice',
                              'O débito médio é calculado com base no número de bicos ativos em simultâneo. Confirme que todos os bicos considerados têm débito semelhante.'
                            )}
                          </p>
                          {fieldValues['baseLargura'] === 'row_spacing' && (
                            <p className="text-slate-500 text-[11.5px]">
                              {t(
                                'debitoTotal.assistance.nozzleCalculation.rowSpacingDifferentiatedDistributionNotice',
                                'Pulverizadores com distribuição vertical diferenciada, bicos de diferentes calibres ou secções com funcionamento distinto devem ser avaliados numa ferramenta própria.'
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* Seletor de Método e Contexto de Calibração de Pulverizador (calc_calibracao_pulverizador) em Desktop */}
              {isCalibracaoPulverizador && (
                <div className="space-y-4">
                  <CalibracaoMetodoSelector
                    selectedMethod={activeModeId as CalibracaoMetodo}
                    onSelectMethod={(m: CalibracaoMetodo) => handleModeChange(m)}
                  />
                  <CalibracaoContextSelectors
                    method={activeModeId as CalibracaoMetodo}
                    cultureId={calibracaoCulture}
                    conductionId={calibracaoConduction}
                    phenologyId={calibracaoPhenology}
                    canopyDensity={calibracaoDensity}
                    canopyThickness={calibracaoThickness}
                    phenologyStage={calibracaoStage}
                    useManualAdoptedVolumeInLwa={useManualAdoptedVolumeInLwa}
                    onSelectCulture={setCalibracaoCulture}
                    onSelectConduction={setCalibracaoConduction}
                    onSelectPhenology={setCalibracaoPhenology}
                    onSelectCanopyDensity={setCalibracaoDensity}
                    onSelectCanopyThickness={setCalibracaoThickness}
                    onSelectPhenologyStage={setCalibracaoStage}
                    onToggleManualAdoptedVolumeInLwa={setUseManualAdoptedVolumeInLwa}
                  />
                </div>
              )}

              {/* Seletor de Modo Desktop (se existirem modos declarados fora da Calibração) */}
              {definition.modes && definition.modes.length > 1 && !isCalibracaoPulverizador && (
                <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-600 shrink-0">Modo:</span>
                  <div className="flex items-center gap-2">
                    {definition.modes.map((m) => {
                      const isSelected = activeModeId === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleModeChange(m.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#114037] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <CalculatorInputsPanel
                title={definition.title}
                subtitle={definition.subtitle}
                generalHelpFile={definition.generalHelpFile}
                modes={isCalibracaoPulverizador ? undefined : definition.modes}
                activeModeId={activeModeId}
                onModeChange={handleModeChange}
                fields={currentActiveFields}
                values={fieldValues}
                units={fieldUnits}
                onChange={handleFieldChange}
                onOpenKeypad={handleOpenKeypad}
                errors={validation.errors}
                warnings={isCalibracaoPulverizador ? undefined : validation.warnings}
                importedNotice={activeImportedNotice}
              />

              {/* Caixa Dedicada de Validação em Desktop */}
              {bulletNotices.length > 0 && (
                <div
                  role="note"
                  aria-label={validationCardTitle}
                  className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 text-amber-900 shadow-2xs space-y-3 animate-fade-in"
                >
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-950">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
                    <span>{validationCardTitle}</span>
                  </div>
                  <ul className="space-y-2 text-xs leading-relaxed text-amber-900 list-disc pl-5">
                    {bulletNotices.map((notice, idx) => (
                      <li key={notice.key || idx} className="pl-0.5">
                        <span>{notice.message}</span>
                      </li>
                    ))}
                  </ul>
                  {legalNote && (
                    <div className="pt-2 border-t border-amber-200/70 text-[11.5px] leading-relaxed text-amber-800/90 font-medium">
                      <span>{legalNote}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Secção da Fase B — Ajuste Operacional (calc_calibracao_pulverizador) em Desktop */}
              {isCalibracaoPulverizador && (
                <CalibracaoPhaseBSection
                  travelSpeedKmH={fieldValues['travelSpeedKmH']}
                  workingWidthM={fieldValues['workingWidthM']}
                  activeNozzleCount={fieldValues['activeNozzleCount']}
                  workingWidthSource={calibracaoWorkingWidthSource}
                  rowSpacingM={fieldValues['rowSpacingM']}
                  phaseAVolume={
                    structuredOutputs['volCaldaAdotado']?.rawValue !== undefined
                      ? Number(structuredOutputs['volCaldaAdotado'].rawValue)
                      : structuredOutputs['volCaldaRecomendado']?.rawValue !== undefined
                      ? Number(structuredOutputs['volCaldaRecomendado'].rawValue)
                      : structuredOutputs['volCaldaSugerido']?.rawValue !== undefined
                      ? Number(structuredOutputs['volCaldaSugerido'].rawValue)
                      : undefined
                  }
                  totalFlowRequiredLMin={
                    structuredOutputs['caudalTotalNecessario']?.rawValue !== undefined
                      ? Number(structuredOutputs['caudalTotalNecessario'].rawValue)
                      : undefined
                  }
                  flowPerNozzleLMin={
                    structuredOutputs['caudalMedioPorBico']?.rawValue !== undefined
                      ? Number(structuredOutputs['caudalMedioPorBico'].rawValue)
                      : undefined
                  }
                  theoreticalTimePerHaMinutes={
                    structuredOutputs['tempoTeoricoPorHa']?.rawValue !== undefined
                      ? Number(structuredOutputs['tempoTeoricoPorHa'].rawValue)
                      : undefined
                  }
                  phaseBState={structuredOutputs['phaseBState']?.rawValue as any}
                  onSpeedChange={(speed) => handleFieldChange('travelSpeedKmH', speed, 'km/h')}
                  onWidthChange={(width, source) => {
                    if (source) setCalibracaoWorkingWidthSource(source);
                    handleFieldChange('workingWidthM', width, 'm');
                  }}
                  onOpenKeypad={handleOpenUnifiedKeypad}
                  isDesktop={true}
                />
              )}

              {/* Secção da Fase C — Seleção de bicos e pressão de trabalho (calc_calibracao_pulverizador) em Desktop */}
              {isCalibracaoPulverizador && (
                <CalibracaoPhaseCNozzleSelectionSection
                  phaseAVolume={
                    structuredOutputs['volCaldaAdotado']?.rawValue !== undefined
                      ? Number(structuredOutputs['volCaldaAdotado'].rawValue)
                      : structuredOutputs['volCaldaRecomendado']?.rawValue !== undefined
                      ? Number(structuredOutputs['volCaldaRecomendado'].rawValue)
                      : structuredOutputs['volCaldaSugerido']?.rawValue !== undefined
                      ? Number(structuredOutputs['volCaldaSugerido'].rawValue)
                      : undefined
                  }
                  travelSpeedKmH={
                    fieldValues['travelSpeedKmH'] !== undefined && fieldValues['travelSpeedKmH'] !== ''
                      ? Number(fieldValues['travelSpeedKmH'])
                      : undefined
                  }
                  workingWidthM={
                    fieldValues['workingWidthM'] !== undefined && fieldValues['workingWidthM'] !== ''
                      ? Number(fieldValues['workingWidthM'])
                      : undefined
                  }
                  activeNozzleCount={fieldValues['activeNozzleCount']}
                  totalFlowRequiredLMin={
                    structuredOutputs['caudalTotalNecessario']?.rawValue !== undefined
                      ? Number(structuredOutputs['caudalTotalNecessario'].rawValue)
                      : undefined
                  }
                  flowPerNozzleLMin={
                    structuredOutputs['caudalMedioPorBico']?.rawValue !== undefined
                      ? Number(structuredOutputs['caudalMedioPorBico'].rawValue)
                      : undefined
                  }
                  onNozzleCountChange={handleNozzleCountChange}
                  isDesktop={true}
                />
              )}

              {unneededNotice && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-relaxed">{unneededNotice}</span>
                </div>
              )}
            </div>
          </div>
        )
      ) : (
        /* Calculadoras Não-Piloto (Legadas / Fora da Fase 1): Resultados no Topo e Entradas Empilhadas */
        <div className="space-y-3.5 sm:space-y-4">
          <CalculatorResultsPanel
            headerTitle={`RESULTADO DO CÁLCULO DE ${definition.category.toUpperCase()}`}
            badgeMode={currentModeLabel}
            results={resolvedResults}
            outputValues={outputValues}
            onSave={handleSave}
            isSaving={isSaving}
            saveButtonLabel={saveButtonLabel}
            onOpenResultHelp={onOpenResultHelp}
          />

          <CalculatorInputsPanel
            title={definition.title}
            subtitle={definition.subtitle}
            generalHelpFile={definition.generalHelpFile}
            modes={definition.modes}
            activeModeId={activeModeId}
            onModeChange={handleModeChange}
            fields={definition.fields}
            values={fieldValues}
            units={fieldUnits}
            onChange={handleFieldChange}
            onOpenKeypad={handleOpenKeypad}
            errors={validation.errors}
            warnings={validation.warnings}
            importedNotice={activeImportedNotice}
          />

          {unneededNotice && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{unneededNotice}</span>
            </div>
          )}
        </div>
      )}



      {/* 4. Teclado Numérico DaterraKeypad (Legado para calculadoras fora do piloto) */}
      {!isPilotCalculator && activeKeypadField && (
        <DaterraKeypad
          isOpen={isKeypadOpen}
          onClose={() => {
            setIsKeypadOpen(false);
            setActiveKeypadField(null);
          }}
          initialValue={String(fieldValues[activeKeypadField.id] ?? activeKeypadField.defaultValue ?? '')}
          initialUnit={fieldUnits[activeKeypadField.id] ?? activeKeypadField.defaultUnit}
          availableUnits={activeKeypadField.allowedUnits}
          commonValues={activeKeypadField.presets}
          label={activeKeypadField.label}
          validationRules={{
            required: activeKeypadField.required ?? true,
            min: activeKeypadField.min,
            max: activeKeypadField.max,
            minInclusive: activeKeypadField.minInclusive ?? true,
            maxInclusive: activeKeypadField.maxInclusive ?? true,
            allowDecimal: activeKeypadField.allowDecimal ?? !activeKeypadField.integerOnly,
            maxDecimals: activeKeypadField.maxDecimals ?? (activeKeypadField.integerOnly ? 0 : 3),
            allowNegative: activeKeypadField.allowNegative ?? false,
            allowExpressions: activeKeypadField.allowExpressions ?? true,
            integerOnly: activeKeypadField.integerOnly ?? false,
            unit: fieldUnits[activeKeypadField.id] ?? activeKeypadField.defaultUnit
          }}
          onConfirm={handleKeypadConfirm}
        />
      )}

      {/* 5. DaterraKeypad Unificado (Fase 1A - Piloto calc_concentracao e calc_dose) */}
      {isPilotCalculator && (
        <DaterraUnifiedKeypadModal
          isOpen={isUnifiedKeypadOpen}
          title={definition.title}
          subtitle={definition.subtitle}
          modes={unifiedModes}
          activeModeId={activeModeId}
          onModeChange={handleModeChange}
          initialFieldId={activeUnifiedFieldId}
          fields={allUnifiedFields}
          onCancel={() => {
            setIsUnifiedKeypadOpen(false);
            setActiveUnifiedFieldId(undefined);
          }}
          onConfirm={(confirmed, confirmedMode) => {
            handleUnifiedKeypadConfirm(confirmed, confirmedMode);
            setActiveUnifiedFieldId(undefined);
          }}
          onCalculate={handleUnifiedKeypadCalculate}
        />
      )}

      {/* 5b. Barra Contextual Inferior de Ações para Calculadoras (Mobile & Tablet < 1024px) */}
      {!isDesktop && !isAnyModalOpen && (
        <CalculatorActionBar
          isValid={validation.isValid && primaryOutput?.rawValue !== undefined}
          isSaving={isSaving}
          saveButtonLabel={saveButtonLabel}
          onSave={handleSave}
          onOpenHistory={() => {
            setIsHistoryDrawerOpen(true);
            onOpenHistory?.();
          }}
          onOpenTechnicalGuide={
            definition.generalHelpFile ? () => setIsDirectDidacticHelpOpen(true) : undefined
          }
          hasTechnicalGuide={!!definition.generalHelpFile}
          historyCount={historyCount > 0 ? historyCount : undefined}
        />
      )}

      {/* 5c. Modal Direto de Microlearning DidacticHelp acionado pela CalculatorActionBar */}
      {definition.generalHelpFile && (
        <DidacticHelp
          faqFile={definition.generalHelpFile as any}
          isOpen={isDirectDidacticHelpOpen}
          onClose={() => setIsDirectDidacticHelpOpen(false)}
          variant="modal-only"
        />
      )}

      {/* 6. Drawer de Histórico Responsivo */}
      <CalculatorHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        calculatorId={definition.id}
        calculatorTitle={definition.title}
        records={historyRecords}
        onDeleteRecord={handleDeleteHistoryRecord}
        onClearHistory={handleClearCalculatorHistory}
        onUpdateMetadata={handleUpdateMetadata}
        onExecuteTransfer={onExecuteTransfer}
      />

      {/* 7. Modal de Gestão de Limite de Quota (20 Cálculos) */}
      <HistoryLimitModal
        isOpen={isLimitModalOpen}
        onClose={() => {
          setIsLimitModalOpen(false);
          setPendingCalculation(null);
        }}
        existingRecords={historyRecords}
        onSelectAndDelete={handleLimitModalSelectAndDelete}
        isProcessing={isSaving}
      />

      {/* 8. Modal de Prevenção de Substituição Indevida (Conflito de Transferência) */}
      {overwriteConflict && (
        <TransferOverwritePromptModal
          isOpen={!!overwriteConflict}
          onKeepCurrent={handleKeepCurrent}
          onApplyReceived={handleApplyReceived}
          onCancelTransfer={handleCancelTransfer}
          sourceDateText={overwriteConflict.dateText}
          comparisons={overwriteConflict.comparisons}
        />
      )}
    </div>
  );
};
