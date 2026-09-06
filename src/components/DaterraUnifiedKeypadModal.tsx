import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { X, Delete, Check, RotateCcw, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { lockBodyScroll, unlockBodyScroll } from '../utils/scrollLock';
import { parseExpression, formatNumberForDisplay } from '../features/calculators/core/expressionParser';
import type {
  DaterraUnifiedKeypadModalProps,
  UnifiedKeypadField,
  UnifiedKeypadResult
} from '../features/calculators/core/unifiedKeypadTypes';

export const DaterraUnifiedKeypadModal: React.FC<DaterraUnifiedKeypadModalProps> = ({
  isOpen,
  title,
  subtitle,
  modes,
  activeModeId: initialModeId,
  onModeChange,
  initialFieldId,
  fields,
  onCancel,
  onConfirm,
  onCalculate
}) => {
  const { t, language } = useLanguage();
  const decimalSeparator = language === 'en' ? '.' : ',';

  // 1. Estado Temporário Isolado (Deep Copy ao Abrir)
  const [tempFields, setTempFields] = useState<UnifiedKeypadField[]>([]);
  const [tempModeId, setTempModeId] = useState<string>(initialModeId || '');
  const [activeFieldId, setActiveFieldId] = useState<string>('');
  const [inlineNotice, setInlineNotice] = useState<string | null>(null);

  // Referência para restaurar foco original ao fechar e auto-scroll do campo ativo
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  // Garante que o campo ativo está sempre visível na lista interna com scroll
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeFieldId]);

  const handleCancelAndClose = useCallback(() => {
    unlockBodyScroll();
    onCancel();
    previousActiveElementRef.current?.focus();
  }, [onCancel]);

  // Inicialização do estado temporário profundo
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement | null;
      lockBodyScroll();

      // Deep copy dos campos para isolamento absoluto
      const clonedFields: UnifiedKeypadField[] = fields.map((f) => ({
        ...f,
        availableUnits: [...f.availableUnits],
        presets: f.presets ? [...f.presets] : undefined,
        rawExpression:
          f.rawExpression || (f.value !== '' && f.value !== undefined ? String(f.value).replace('.', ',') : '')
      }));

      setTempFields(clonedFields);
      const activeMode = initialModeId || (modes && modes[0]?.id) || '';
      setTempModeId(activeMode);

      const currentModeDef = modes?.find((m) => m.id === activeMode);
      const visibleFieldIds = currentModeDef?.fieldIds;
      const availableFields = visibleFieldIds
        ? clonedFields.filter((f) => visibleFieldIds.includes(f.id))
        : clonedFields;

      const targetFieldId =
        initialFieldId && availableFields.some((f) => f.id === initialFieldId)
          ? initialFieldId
          : availableFields.find((f) => f.required && (f.value === '' || f.value === undefined))?.id ||
            availableFields[0]?.id ||
            '';
      setActiveFieldId(targetFieldId);
      setInlineNotice(null);

      // Foco inicial seguro
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    } else {
      unlockBodyScroll();
    }

    return () => {
      if (isOpen) {
        unlockBodyScroll();
      }
    };
  }, [isOpen, fields, initialModeId, modes, initialFieldId]);

  // Lista dinâmica de campos visíveis de acordo com o modo ativo no keypad
  const visibleFields = useMemo<UnifiedKeypadField[]>(() => {
    if (!modes || modes.length <= 1 || !tempModeId) {
      return tempFields;
    }
    const currentMode = modes.find((m) => m.id === tempModeId);
    if (!currentMode || !currentMode.fieldIds) {
      return tempFields;
    }
    return tempFields.filter((f) => currentMode.fieldIds!.includes(f.id));
  }, [tempFields, modes, tempModeId]);

  // Campo ativo em edição
  const activeField = useMemo(() => {
    return visibleFields.find((f) => f.id === activeFieldId) || visibleFields[0];
  }, [visibleFields, activeFieldId]);

  // Gestão de Teclado Global do Modal (Escape & Focus Trap)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancelAndClose();
        return;
      }

      if (e.key === 'Tab') {
        const modal = modalContainerRef.current;
        if (!modal) return;

        const focusable = modal.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleCancelAndClose]);

  // 2. Cálculo Reativo em Tempo Real para o Mostrador
  const liveResult: UnifiedKeypadResult = useMemo(() => {
    if (!isOpen || visibleFields.length === 0) {
      return {
        label: title,
        primaryValue: '—',
        primaryUnit: '',
        isValid: false,
        statusMessage: t('unifiedKeypad.enterDataPrompt', 'Introduza os dados para ver o resultado')
      };
    }

    const currentValuesRecord: Record<string, { value: number; unit: string }> = {};
    let hasIncomplete = false;

    for (const f of visibleFields) {
      const num = typeof f.value === 'number' ? f.value : 0;
      currentValuesRecord[f.id] = {
        value: num,
        unit: f.unit
      };

      if (f.required && (f.value === '' || f.value === undefined)) {
        hasIncomplete = true;
      }
    }

    const res = onCalculate(currentValuesRecord, tempModeId);

    if (hasIncomplete) {
      return {
        ...res,
        isValid: false,
        statusMessage: t('unifiedKeypad.completingValue', 'A completar valor...')
      };
    }

    return res;
  }, [isOpen, visibleFields, tempModeId, title, onCalculate, t]);

  const handleConfirmAndClose = () => {
    // Validação estrita dos campos visíveis no modo ativo
    let hasBlockingError = false;

    for (const f of visibleFields) {
      if (f.required && (f.value === '' || f.value === undefined || Number.isNaN(f.value))) {
        hasBlockingError = true;
        break;
      }
      const parsed = parseExpression(f.rawExpression || '0');
      if (parsed.error && parsed.error !== 'emptyExpression') {
        hasBlockingError = true;
        break;
      }
    }

    if (hasBlockingError) {
      setInlineNotice(t('unifiedKeypad.errors.invalidSyntax', 'Por favor, corrija os campos antes de concluir.'));
      return;
    }

    const confirmedRecord: Record<string, { value: number; unit: string; rawExpression: string }> = {};
    for (const f of visibleFields) {
      const val = typeof f.value === 'number' ? f.value : 0;
      confirmedRecord[f.id] = {
        value: val,
        unit: f.unit,
        rawExpression: f.rawExpression
      };
    }

    if (onModeChange && tempModeId) {
      onModeChange(tempModeId);
    }

    unlockBodyScroll();
    onConfirm(confirmedRecord, tempModeId);
    previousActiveElementRef.current?.focus();
  };

  // Alteração de Valor via Teclado Virtual
  const handleInputChar = (char: string) => {
    if (!activeField) return;
    setInlineNotice(null);

    const prevExpr = activeField.rawExpression || '';
    let nextExpr = prevExpr;

    if (prevExpr === '0' && !['+', '-', '×', '÷', ',', '.'].includes(char)) {
      nextExpr = char;
    } else {
      // Impede múltiplos operadores aritméticos consecutivos
      const isOperator = ['+', '-', '×', '÷', ',', '.'].includes(char);
      const endsWithOperator = /[+\-×÷,.]$/.test(prevExpr);

      if (isOperator && endsWithOperator) {
        nextExpr = prevExpr.slice(0, -1) + char;
      } else {
        nextExpr = prevExpr + char;
      }
    }

    // Avaliação segura através do parser
    const parsed = parseExpression(nextExpr);
    const newValue = parsed.value !== null ? parsed.value : activeField.value;

    setTempFields((prev) =>
      prev.map((f) =>
        f.id === activeField.id
          ? {
              ...f,
              rawExpression: nextExpr,
              value: newValue
            }
          : f
      )
    );
  };

  const handleBackspace = () => {
    if (!activeField) return;
    setInlineNotice(null);

    const prevExpr = activeField.rawExpression || '';
    if (prevExpr.length <= 1) {
      setTempFields((prev) =>
        prev.map((f) =>
          f.id === activeField.id
            ? {
                ...f,
                rawExpression: '',
                value: ''
              }
            : f
        )
      );
      return;
    }

    const nextExpr = prevExpr.slice(0, -1);
    const parsed = parseExpression(nextExpr);

    setTempFields((prev) =>
      prev.map((f) =>
        f.id === activeField.id
          ? {
              ...f,
              rawExpression: nextExpr,
              value: parsed.value !== null ? parsed.value : ''
            }
          : f
      )
    );
  };

  const handleClearField = () => {
    if (!activeField) return;
    setInlineNotice(null);

    setTempFields((prev) =>
      prev.map((f) =>
        f.id === activeField.id
          ? {
              ...f,
              rawExpression: '',
              value: ''
            }
          : f
      )
    );
  };

  const handlePresetSelect = (presetVal: number) => {
    if (!activeField) return;
    setInlineNotice(null);

    const strVal = formatNumberForDisplay(presetVal);
    setTempFields((prev) =>
      prev.map((f) =>
        f.id === activeField.id
          ? {
              ...f,
              rawExpression: strVal,
              value: presetVal
            }
          : f
      )
    );
  };

  // Alteração de Unidade com Gestão Estrita de Domínio
  const handleUnitSelect = (newUnit: string) => {
    if (!activeField || activeField.unit === newUnit) return;

    const oldUnit = activeField.unit;
    const currentVal = activeField.value;

    // Consulta ao contrato de domínio da calculadora
    if (activeField.onUnitChange) {
      const resolution = activeField.onUnitChange(oldUnit, newUnit, currentVal);

      if (resolution.action === 'reset') {
        setTempFields((prev) =>
          prev.map((f) =>
            f.id === activeField.id
              ? {
                  ...f,
                  unit: newUnit,
                  value: '',
                  rawExpression: ''
                }
              : f
          )
        );
        setInlineNotice(
          resolution.noticeKey
            ? t(resolution.noticeKey, resolution.noticeText)
            : t(
                'unifiedKeypad.unitChangedValueReset',
                'A unidade foi alterada. Introduza novamente o valor para esta unidade.'
              )
        );
        return;
      }

      if (resolution.action === 'convert') {
        const converted = resolution.convertedValue ?? (typeof currentVal === 'number' ? currentVal : 0);
        const expr = formatNumberForDisplay(converted, activeField.decimalPlaces ?? 3);
        setTempFields((prev) =>
          prev.map((f) =>
            f.id === activeField.id
              ? {
                  ...f,
                  unit: newUnit,
                  value: converted,
                  rawExpression: expr
                }
              : f
          )
        );
        setInlineNotice(
          resolution.noticeKey
            ? t(resolution.noticeKey, resolution.noticeText)
            : t('unifiedKeypad.unitChangedValueConverted', 'Valor convertido automaticamente para a nova unidade.')
        );
        return;
      }
    }

    // Ação por omissão: preserve (apenas se expressamente autorizado ou sem onUnitChange)
    setTempFields((prev) =>
      prev.map((f) =>
        f.id === activeField.id
          ? {
              ...f,
              unit: newUnit
            }
          : f
      )
    );
  };

  if (!isOpen) return null;

  const cleanUnit = liveResult.primaryUnit ? liveResult.primaryUnit.trim() : '';

  let displayPrimaryValue = '—';
  if (liveResult.isValid && liveResult.isComplete && liveResult.primaryValue !== '—') {
    if (typeof liveResult.primaryValue === 'number') {
      displayPrimaryValue = formatNumberForDisplay(liveResult.primaryValue);
    } else {
      displayPrimaryValue = String(liveResult.primaryValue).trim();
      if (cleanUnit && displayPrimaryValue.endsWith(cleanUnit)) {
        displayPrimaryValue = displayPrimaryValue.replace(new RegExp(`\\s*${cleanUnit}$`), '').trim();
      }
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="unified-keypad-title"
      aria-describedby="unified-keypad-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs keypad-modal-overlay"
    >
      <div
        ref={modalContainerRef}
        className="w-full h-dvh sm:h-auto sm:max-h-[92vh] sm:max-w-[560px] bg-[#114037] text-white flex flex-col sm:rounded-3xl shadow-2xl border border-[#1D734B]/50 overflow-hidden keypad-modal-container"
      >
        {/* Cabeçalho do Modal com Botão X (Cancelar Seguro) */}
        <header className="px-3.5 py-1.5 sm:px-5 sm:py-2.5 bg-[#0d332c] border-b border-[#1D734B]/40 flex items-center justify-between shrink-0 min-h-[52px]">
          <div className="min-w-0 flex-1 mr-2">
            <h2 id="unified-keypad-title" className="text-sm sm:text-base font-black tracking-tight text-white truncate">
              {title}
            </h2>
            {subtitle && <p className="text-[11px] text-[#3CA64C] font-semibold truncate">{subtitle}</p>}
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleCancelAndClose}
            aria-label={t('unifiedKeypad.srCloseModal', 'Fechar e cancelar alterações')}
            className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#3CA64C]"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </header>

        {/* Mostrador Superior Verde Institucional em Tempo Real (máx 20% da altura) */}
        <section
          id="unified-keypad-desc"
          className="px-4 py-2 sm:py-2.5 bg-gradient-to-br from-[#114037] to-[#175348] border-b border-[#1D734B]/40 shrink-0 flex flex-col justify-center min-h-[70px] max-h-[20%]"
        >
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider truncate">
              {liveResult.label || 'Quantidade de produto'}
            </span>
            {liveResult.statusMessage && !liveResult.isValid && (
              <span className="text-[10px] font-bold text-[#3CA64C] bg-[#0d332c]/80 px-2 py-0.5 rounded shrink-0">
                {liveResult.statusMessage}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2 min-w-0 my-0.5">
            {liveResult.isValid && liveResult.isComplete ? (
              <>
                <span className="text-3xl sm:text-4xl font-black text-white font-mono-numbers tracking-tight truncate">
                  {displayPrimaryValue}
                </span>
                {cleanUnit && (
                  <span className="text-xl sm:text-2xl font-extrabold text-[#3CA64C] shrink-0">
                    {cleanUnit}
                  </span>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 py-0.5">
                <span className="text-2xl sm:text-3xl font-bold text-slate-400 font-mono-numbers">
                  —
                </span>
                <span className="text-xs text-slate-300 italic truncate">
                  {liveResult.statusMessage || t('unifiedKeypad.enterDataPrompt', 'Introduza os dados para ver o resultado')}
                </span>
              </div>
            )}
          </div>

          {liveResult.secondaryText && (
            <div className="text-[12px] text-[#3CA64C] font-bold truncate">
              <span>{liveResult.secondaryText}</span>
            </div>
          )}

          {liveResult.subValue !== undefined && liveResult.subValue !== null && liveResult.subValue !== '' && (
            <div className="text-[11px] text-white/80 truncate">
              <span>
                {t('unifiedKeypad.productEquivalence', 'Equivalente a')}{' '}
                {typeof liveResult.subValue === 'number'
                  ? formatNumberForDisplay(liveResult.subValue)
                  : liveResult.subValue}{' '}
                {liveResult.subUnit || ''}
                {['mL', 'g', 'L', 'kg'].includes(liveResult.subUnit || '') ? ` ${t('unifiedKeypad.ofProduct', 'de produto')}` : ''}
              </span>
            </div>
          )}

          {inlineNotice && (
            <div
              role="status"
              aria-live="polite"
              className="mt-1 px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[11px] flex items-center gap-1.5 truncate shrink-0"
            >
              <Info className="w-3.5 h-3.5 text-amber-300 shrink-0" aria-hidden="true" />
              <span className="truncate">{inlineNotice}</span>
            </div>
          )}
        </section>

        {/* Seletor de Modos (se existirem modos declarados) */}
        {modes && modes.length > 1 && (
          <div className="px-3.5 py-1.5 bg-[#0d332c] border-b border-[#1D734B]/30 flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Modo:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {modes.map((m) => {
                const isSelected = tempModeId === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setTempModeId(m.id);
                      setInlineNotice(null);
                      if (m.fieldIds && !m.fieldIds.includes(activeFieldId)) {
                        setActiveFieldId(m.fieldIds[0] || '');
                      }
                    }}
                    aria-pressed={isSelected}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#3CA64C] text-[#0d332c] shadow-xs'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Lista Vertical de Variáveis (30-38% da altura, scroll interno se necessário) */}
        <div className="flex-1 min-h-0 max-h-[38%] overflow-y-auto px-3 sm:px-4 py-2 space-y-1.5 scrollbar-thin">
          {visibleFields.map((f) => {
            const isActive = f.id === activeFieldId;
            const displayVal =
              f.rawExpression !== ''
                ? f.rawExpression
                : typeof f.value === 'number'
                ? formatNumberForDisplay(f.value)
                : '—';

            return (
              <button
                key={f.id}
                ref={isActive ? activeItemRef : undefined}
                type="button"
                onClick={() => {
                  setActiveFieldId(f.id);
                  setInlineNotice(null);
                }}
                aria-pressed={isActive}
                aria-current={isActive ? 'true' : undefined}
                aria-label={`${f.label}, valor atual ${displayVal} ${f.unit}${isActive ? ', campo ativo a editar' : ''}`}
                className={`w-full min-h-[48px] h-[48px] sm:h-[50px] px-3 py-1.5 rounded-xl flex items-center justify-between text-left transition-all border cursor-pointer focus-visible:outline-2 focus-visible:outline-[#3CA64C] ${
                  isActive
                    ? 'bg-[#175348] border-[#3CA64C] ring-1 ring-[#3CA64C]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 pr-2">
                  {isActive && (
                    <>
                      <span className="hidden min-[360px]:inline-block px-1.5 py-0.5 bg-[#3CA64C] text-[#0d332c] text-[9px] sm:text-[10px] font-black rounded uppercase tracking-wide shrink-0">
                        A editar
                      </span>
                      <span
                        className="inline-block min-[360px]:hidden w-2.5 h-2.5 rounded-full bg-[#3CA64C] shrink-0"
                        role="img"
                        aria-label="Campo ativo a editar"
                      />
                    </>
                  )}
                  <span className="text-xs sm:text-sm font-semibold text-white truncate">
                    {f.label}
                  </span>
                </div>

                <div className="flex items-baseline gap-1 shrink-0">
                  <span className="text-xs sm:text-sm font-bold font-mono-numbers text-white truncate max-w-[90px] sm:max-w-[120px]">
                    {displayVal}
                  </span>
                  <span className="text-xs font-semibold text-[#3CA64C]">{f.unit}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Barra Semântica da Expressão Ativa do Campo em Edição (Acessibilidade & Visibilidade da Expressão) */}
        {activeField && (
          <div className="px-3.5 py-1.5 bg-[#09221d] border-t border-[#1D734B]/40 shrink-0 flex items-center justify-between gap-2 min-h-[44px]">
            <div className="flex items-baseline gap-2 min-w-0 flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 shrink-0 truncate max-w-[130px] sm:max-w-none">
                {activeField.label}:
              </span>
              <div className="flex items-baseline gap-1.5 min-w-0 flex-1">
                <input
                  type="text"
                  readOnly
                  inputMode="none"
                  value={activeField.rawExpression || ''}
                  placeholder="0"
                  aria-label={`${activeField.label}, expressão em edição: ${activeField.rawExpression || '0'} ${activeField.unit}`}
                  aria-describedby="keypad-input-instructions"
                  className="bg-transparent font-mono-numbers text-base sm:text-lg font-black text-white focus:outline-none w-full cursor-default select-all"
                />
                <span id="keypad-input-instructions" className="sr-only">
                  {t('unifiedKeypad.srKeypadInstructions', 'Edição através do teclado numérico DATERRA')}
                </span>
                {activeField.rawExpression && /[+\-×÷]/.test(activeField.rawExpression) && typeof activeField.value === 'number' && (
                  <span className="text-xs font-bold text-slate-300 shrink-0">
                    (= {formatNumberForDisplay(activeField.value)})
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs font-bold text-[#3CA64C] shrink-0 bg-[#114037] px-2 py-0.5 rounded-md border border-[#1D734B]/50">
              {activeField.unit}
            </span>
          </div>
        )}

        {/* Seletor de Unidades e Atalhos Rápidos (Presets) entre a lista e o teclado (10-12% da altura) */}
        {activeField && (
          <div className="px-3 sm:px-4 py-1.5 bg-[#0e3830] border-t border-[#1D734B]/30 shrink-0 space-y-1.5">
            {/* Seletor de Unidades Segmentado com Altura Mínima de 48px e Pista Visual de Scroll */}
            {activeField.availableUnits.length > 1 && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                  {t('unifiedKeypad.unit', 'Unidade')}:
                </span>
                <div className="relative flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pr-6">
                    {activeField.availableUnits.map((u) => {
                      const isCurrent = activeField.unit === u;
                      return (
                        <button
                          key={u}
                          type="button"
                          onClick={() => handleUnitSelect(u)}
                          aria-pressed={isCurrent}
                          aria-label={`Selecionar unidade ${u}${isCurrent ? ', atualmente selecionada' : ''}`}
                          className={`min-h-[48px] h-[48px] min-w-[48px] px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#3CA64C] ${
                            isCurrent
                              ? 'bg-[#1D734B] text-white border-2 border-[#3CA64C] shadow-xs'
                              : 'bg-white/10 text-slate-300 hover:bg-white/15 active:bg-white/20'
                          }`}
                        >
                          {u}
                        </button>
                      );
                    })}
                  </div>
                  {activeField.availableUnits.length > 3 && (
                    <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#0e3830] to-transparent" aria-hidden="true" />
                  )}
                </div>
              </div>
            )}

            {/* Presets em Carrossel Horizontal Compacto (máximo 4 atalhos) */}
            {activeField.presets && activeField.presets.length > 0 && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                  {t('unifiedKeypad.presets', 'Atalhos')}:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1">
                  {activeField.presets.slice(0, 4).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      aria-label={`Aplicar atalho ${formatNumberForDisplay(preset)}`}
                      className="min-h-[40px] h-[40px] min-w-[50px] px-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-mono-numbers font-bold text-xs transition-all border border-white/5 cursor-pointer shrink-0 flex items-center justify-center"
                    >
                      {formatNumberForDisplay(preset)}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleClearField}
                  aria-label={`Limpar valor de ${activeField.label}`}
                  className="min-h-[40px] h-[40px] min-w-[64px] px-3 rounded-xl text-xs text-amber-300 hover:text-amber-200 font-extrabold bg-amber-950/60 border border-amber-500/50 hover:bg-amber-900/70 active:scale-95 transition-all shrink-0 cursor-pointer flex items-center justify-center"
                >
                  Limpar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Teclado Numérico e Aritmético Integrado (com alvos tácteis estritamente >= 48x48px) */}
        <section
          aria-label="Teclado numérico e aritmético"
          className="p-2 sm:p-2.5 bg-[#0d332c] border-t border-[#1D734B]/40 shrink-0"
        >
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 max-w-md mx-auto">
            {/* Linha 1 */}
            <button
              type="button"
              onClick={() => handleInputChar('7')}
              className="h-[48px] sm:h-[52px] min-h-[48px] min-w-[48px] bg-white/10 hover:bg-white/15 active:bg-white/25 active:scale-95 text-white font-mono-numbers text-xl sm:text-2xl font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[#3CA64C]"
            >
              7
            </button>
            <button
              type="button"
              onClick={() => handleInputChar('8')}
              className="h-[48px] sm:h-[52px] min-h-[48px] min-w-[48px] bg-white/10 hover:bg-white/15 active:bg-white/25 active:scale-95 text-white font-mono-numbers text-xl sm:text-2xl font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[#3CA64C]"
            >
              8
            </button>
            <button
              type="button"
              onClick={() => handleInputChar('9')}
              className="h-[48px] sm:h-[52px] min-h-[48px] min-w-[48px] bg-white/10 hover:bg-white/15 active:bg-white/25 active:scale-95 text-white font-mono-numbers text-xl sm:text-2xl font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[#3CA64C]"
            >
              9
            </button>
            <button
              type="button"
              onClick={() => handleInputChar('÷')}
              aria-label="Dividir"
              className="h-[48px] sm:h-[52px] min-h-[48px] min-w-[48px] bg-[#175348] hover:bg-[#1d6b5c] active:bg-[#238270] active:scale-95 text-[#3CA64C] text-lg sm:text-xl font-black rounded-xl flex items-center justify-center transition-all cursor-pointer select-none border border-[#3CA64C]/30 focus-visible:outline-2 focus-visible:outline-[#3CA64C]"
            >
              ÷
            </button>

            {/* Linha 2 */}
            <button
              type="button"
              onClick={() => handleInputChar('4')}
              className="h-[48px] sm:h-[52px] min-h-[48px] min-w-[48px] bg-white/10 hover:bg-white/15 active:bg-white/25 active:scale-95 text-white font-mono-numbers text-xl sm:text-2xl font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[#3CA64C]"
            >
              4
            </button>
            <button
              type="button"
              onClick={() => handleInputChar('5')}
              className="h-[48px] sm:h-[52px] min-h-[48px] min-w-[48px] bg-white/10 hover:bg-white/15 active:bg-white/25 active:scale-95 text-white font-mono-numbers text-xl sm:text-2xl font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[#3CA64C]"
            >
              5
            </button>
            <button
              type="button"
              onClick={() => handleInputChar('6')}
              className="h-[48px] sm:h-[52px] min-h-[48px] min-w-[48px] bg-white/10 hover:bg-white/15 active:bg-white/25 active:scale-95 text-white font-mono-numbers text-xl sm:text-2xl font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[#3CA64C]"
            >
              6
            </button>
            <button
              type="button"
              onClick={() => handleInputChar('×')}
              aria-label="Multiplicar"
              className="h-[48px] sm:h-[52px] min-h-[48px] min-w-[48px] bg-[#175348] hover:bg-[#1d6b5c] active:bg-[#238270] active:scale-95 text-[#3CA64C] text-lg sm:text-xl font-black rounded-xl flex items-center justify-center transition-all cursor-pointer select-none border border-[#3CA64C]/30 focus-visible:outline-2 focus-visible:outline-[#3CA64C]"
            >
              ×
            </button>

            {/* Linha 3 */}
            <button
              type="button"
              onClick={() => handleInputChar('1')}
              className="h-[48px] sm:h-[52px] min-h-[48px] min-w-[48px] bg-white/10 hover:bg-white/15 active:bg-white/25 active:scale-95 text-white font-mono-numbers text-xl sm:text-2xl font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[#3CA64C]"
            >
              1
            </button>
            <button
              type="button"
              onClick={() => handleInputChar('2')}
              className="h-[48px] sm:h-[52px] min-h-[48px] min-w-[48px] bg-white/10 hover:bg-white/15 active:bg-white/25 active:scale-95 text-white font-mono-numbers text-xl sm:text-2xl font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[#3CA64C]"
            >
              2
            </button>
            <button
              type="button"
              onClick={() => handleInputChar('3')}
              className="h-[48px] sm:h-[52px] min-h-[48px] min-w-[48px] bg-white/10 hover:bg-white/15 active:bg-white/25 active:scale-95 text-white font-mono-numbers text-xl sm:text-2xl font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[#3CA64C]"
            >
              3
            </button>
            <button
              type="button"
              onClick={() => handleInputChar('-')}
              aria-label="Subtrair"
              className="h-[48px] sm:h-[52px] min-h-[48px] min-w-[48px] bg-[#175348] hover:bg-[#1d6b5c] active:bg-[#238270] active:scale-95 text-[#3CA64C] text-lg sm:text-xl font-black rounded-xl flex items-center justify-center transition-all cursor-pointer select-none border border-[#3CA64C]/30 focus-visible:outline-2 focus-visible:outline-[#3CA64C]"
            >
              −
            </button>

            {/* Linha 4 */}
            <button
              type="button"
              onClick={() => handleInputChar('0')}
              className="h-[48px] sm:h-[52px] min-h-[48px] min-w-[48px] bg-white/10 hover:bg-white/15 active:bg-white/25 active:scale-95 text-white font-mono-numbers text-xl sm:text-2xl font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[#3CA64C]"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handleInputChar(decimalSeparator)}
              aria-label={decimalSeparator === ',' ? t('unifiedKeypad.comma', 'Vírgula decimal') : t('unifiedKeypad.dot', 'Ponto decimal')}
              className="h-[48px] sm:h-[52px] min-h-[48px] min-w-[48px] bg-white/10 hover:bg-white/15 active:bg-white/25 active:scale-95 text-white font-mono-numbers text-xl sm:text-2xl font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[#3CA64C]"
            >
              {decimalSeparator}
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              aria-label="Apagar carater"
              className="h-[48px] sm:h-[52px] min-h-[48px] min-w-[48px] bg-amber-600/80 hover:bg-amber-600 active:bg-amber-700 active:scale-95 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-amber-400"
            >
              <Delete className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => handleInputChar('+')}
              aria-label="Somar"
              className="h-[48px] sm:h-[52px] min-h-[48px] min-w-[48px] bg-[#175348] hover:bg-[#1d6b5c] active:bg-[#238270] active:scale-95 text-[#3CA64C] text-lg sm:text-xl font-black rounded-xl flex items-center justify-center transition-all cursor-pointer select-none border border-[#3CA64C]/30 focus-visible:outline-2 focus-visible:outline-[#3CA64C]"
            >
              +
            </button>
          </div>
        </section>

        {/* Barra de Ações Inferiores (Cancelar vs Concluir) */}
        <footer className="p-2.5 sm:p-3 bg-[#0a2621] border-t border-[#1D734B]/40 shrink-0 pb-safe">
          <div className="grid grid-cols-2 gap-2.5 max-w-md mx-auto">
            <button
              type="button"
              onClick={handleCancelAndClose}
              className="h-[48px] sm:h-[50px] px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>{t('unifiedKeypad.cancel', 'Cancelar')}</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmAndClose}
              className="h-[48px] sm:h-[50px] px-3 py-2 rounded-xl bg-[#3CA64C] hover:bg-[#3AAA35] active:scale-95 text-[#0d332c] font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-[#3CA64C]/20 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
            >
              <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" />
              <span>{t('unifiedKeypad.confirm', 'Concluir')}</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
