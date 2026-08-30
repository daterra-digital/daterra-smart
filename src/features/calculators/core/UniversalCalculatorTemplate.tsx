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
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db/db.ts';
import { useAuth } from '../../../context/AuthContext.tsx';
import type { CalculatorDefinition, CalculatorFieldDefinition } from './types.ts';
import type { StructuredValue, CalculationHistoryRecord } from '../../../types/calculator.ts';
import { MAX_ACTIVE_CALCULATIONS_PER_TOOL } from '../../../types/calculator.ts';
import { CalculatorHeader } from './CalculatorHeader.tsx';
import { CalculatorInputsPanel } from './CalculatorInputsPanel.tsx';
import { CalculatorResultsPanel, type ResultDisplayItem } from './CalculatorResultsPanel.tsx';
import { DaterraKeypad } from '../../../components/DaterraKeypad.tsx';
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
  saveButtonLabel = 'Guardar Cálculo no Histórico',
  onSaveCalculation,
  onOpenResultHelp,
  onExecuteTransfer
}) => {
  // 1. Identidade do Utilizador Autenticado (Sessão Persistida Localmente)
  const { user } = useAuth();
  const effectiveUserId = propUserId || user?.id || '';

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

  // 8. Interoperabilidade e Transferência Transitória em Memória (Fase 6B)
  const pendingTransfer = usePendingTransfer();
  const [overwriteConflict, setOverwriteConflict] = useState<{
    payload: ActiveTransferPayload;
    comparisons: OverwriteComparisonItem[];
    dateText: string;
  } | null>(null);

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
      setActiveImportedNotice(`Valores importados do cálculo de ${dateFormatted}.`);
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
    setFieldValues((prev) => ({ ...prev, [fieldId]: newValue }));
    setFieldUnits((prev) => ({ ...prev, [fieldId]: newUnit }));
  };

  const handleOpenKeypad = (field: CalculatorFieldDefinition) => {
    setActiveKeypadField(field);
    setIsKeypadOpen(true);
  };

  const handleKeypadConfirm = (val: number, unit?: string) => {
    if (activeKeypadField) {
      handleFieldChange(activeKeypadField.id, val, unit ?? activeKeypadField.defaultUnit);
    }
    setIsKeypadOpen(false);
    setActiveKeypadField(null);
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
        label: 'Modo de Operação Vegetativa',
        source: 'user_input',
        localId: 'mode',
        calculatorId: definition.id,
        calculatorVersion: definition.version
      };
    }

    return inputs;
  }, [definition, fieldValues, fieldUnits, activeModeId]);

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

  // 12. Resolução Dinâmica de Microlearning de Resultados por Modo
  const resolvedResults = useMemo(() => {
    return definition.results.map((res) => {
      let resolvedHelpFile = res.helpFile;
      if (res.helpFileByMode && activeModeId && res.helpFileByMode[activeModeId]) {
        resolvedHelpFile = res.helpFileByMode[activeModeId];
      }
      return {
        ...res,
        helpFile: resolvedHelpFile
      };
    });
  }, [definition.results, activeModeId]);

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

      map[resDef.id] = {
        value: validation.isValid && out ? out.rawValue : 0,
        unit: out ? out.unit : resDef.defaultUnit,
        subValue: validation.isValid ? (subVal ?? undefined) : undefined,
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
        msg: 'Corrija os erros de validação antes de guardar o cálculo.',
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
        setToastInfo({ msg: 'Cálculo guardado com sucesso no histórico.', type: 'success' });
      } catch (err) {
        console.error('Erro ao guardar o cálculo via onSaveCalculation:', err);
        setToastInfo({ msg: 'Não foi possível guardar o cálculo. Tente novamente.', type: 'error' });
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // Fluxo padrão para calculadoras migradas para calculation_history_v2 (ex: calc_dose, calc_concentracao, calc_velocidade_real)
    if (!effectiveUserId) {
      setToastInfo({
        msg: 'Não foi possível guardar o cálculo. É necessária uma sessão com início prévio para associar os cálculos.',
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
      setToastInfo({ msg: 'Cálculo guardado com sucesso no histórico.', type: 'success' });
    } catch (err) {
      console.error('Erro ao guardar o cálculo:', err);
      setToastInfo({ msg: 'Não foi possível guardar o cálculo. Tente novamente.', type: 'error' });
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
      setToastInfo({ msg: 'Cálculo guardado com sucesso no histórico.', type: 'success' });
    } catch (err) {
      console.error('Erro ao gerir limite de histórico:', err);
      setToastInfo({ msg: 'Não foi possível guardar o cálculo. Tente novamente.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHistoryRecord = async (record: CalculationHistoryRecord) => {
    await softDeleteCalculationInDb(record.id);
    setToastInfo({ msg: 'Cálculo eliminado do histórico.', type: 'success' });
  };

  const handleClearCalculatorHistory = async () => {
    if (!effectiveUserId) return;
    await clearCalculatorHistoryInDb(definition.id, effectiveUserId);
    setToastInfo({ msg: 'Histórico desta calculadora limpo.', type: 'success' });
  };

  const handleUpdateMetadata = async (
    id: string,
    metadata: { name?: string; notes?: string; tags?: string[] }
  ) => {
    await updateCalculationMetadataInDb(id, metadata);
    setToastInfo({ msg: 'Informações do cálculo atualizadas.', type: 'success' });
  };

  // Determina o rótulo do modo ativo para o badge do resultado
  const currentModeLabel = definition.modes?.find((m) => m.id === activeModeId)?.label ?? badgeMode;

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* 1. Barra de Topo Oficial */}
      <CalculatorHeader
        title={definition.title}
        category={definition.category}
        badgeLabel={definition.badgeLabel ?? 'Ferramenta Ativa'}
        onBack={onBack}
        onOpenHistory={() => {
          setIsHistoryDrawerOpen(true);
          onOpenHistory?.();
        }}
        historyCount={historyCount > 0 ? historyCount : undefined}
        maxHistory={MAX_ACTIVE_CALCULATIONS_PER_TOOL}
      />

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

      {/* 3. Estrutura Responsiva Principal (5/12 Entradas à Esquerda + 7/12 Resultados à Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda: Painel de Entradas (Cartão Branco) */}
        <div className="lg:col-span-5 space-y-6">
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

          {/* Aviso contextual se houver valor transferido desnecessário no modo ativo */}
          {unneededNotice && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{unneededNotice}</span>
            </div>
          )}
        </div>

        {/* Coluna Direita: Painel de Resultados (Cartão Verde Escuro Institucional) */}
        <div className="lg:col-span-7 space-y-6">
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
        </div>
      </div>

      {/* 4. Teclado Numérico DaterraKeypad (Modal Sobreposto) */}
      {activeKeypadField && (
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

      {/* 5. Drawer de Histórico Responsivo */}
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

      {/* 6. Modal de Gestão de Limite de Quota (20 Cálculos) */}
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

      {/* 7. Modal de Prevenção de Substituição Indevida (Conflito de Transferência) */}
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
