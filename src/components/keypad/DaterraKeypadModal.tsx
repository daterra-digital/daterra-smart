import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Calculator } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { validateKeypadValue, type KeypadValidationRules } from '../keypadValidation';
import { KeypadNumberGrid } from './KeypadNumberGrid';
import { KeypadDisplay } from './KeypadDisplay';
import { KeypadUnitAndShortcuts } from './KeypadUnitAndShortcuts';
import {
  applyKeypadBackspace,
  applyKeypadCharacter,
  evaluateKeypadExpression,
  formatKeypadInitialExpression,
  getKeypadValidationMessage
} from './keypadHelpers';

export interface DaterraKeypadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValue: string;
  initialUnit?: string;
  availableUnits?: string[];
  commonValues?: number[];
  label: string;
  validationRules?: KeypadValidationRules;
  onConfirm: (value: number, unit?: string) => void;
}

const EMPTY_UNITS: string[] = [];
const DEFAULT_COMMON_VALUES: number[] = [50, 100, 200, 300, 400, 500, 1000, 1500];

export const DaterraKeypadModal: React.FC<DaterraKeypadModalProps> = ({
  isOpen,
  onClose,
  initialValue,
  initialUnit,
  availableUnits = EMPTY_UNITS,
  commonValues = DEFAULT_COMMON_VALUES,
  label,
  validationRules,
  onConfirm
}) => {
  const { t } = useTranslation();
  const [expression, setExpression] = useState<string>(() => formatKeypadInitialExpression(initialValue));
  const [selectedUnit, setSelectedUnit] = useState<string>(initialUnit || (availableUnits[0] || ''));

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const triggerElRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef<boolean>(false);
  const sessionSigRef = useRef<string>('');
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const formatNumberPt = (num: number): string => {
    if (Number.isNaN(num)) return '0';
    return new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 3, useGrouping: false }).format(num);
  };

  useEffect(() => {
    const sig = `${label}::${initialUnit ?? ''}`;
    if (isOpen && (!wasOpenRef.current || sessionSigRef.current !== sig)) {
      if (!wasOpenRef.current && typeof document !== 'undefined') {
        triggerElRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      }
      setExpression(formatKeypadInitialExpression(initialValue));
      setSelectedUnit(initialUnit || (availableUnits.length > 0 ? availableUnits[0] : ''));
      if (typeof window !== 'undefined') {
        window.requestAnimationFrame(() => closeBtnRef.current?.focus());
      }
    } else if (!isOpen && wasOpenRef.current) {
      const target = triggerElRef.current;
      triggerElRef.current = null;
      if (target && typeof document !== 'undefined' && document.contains(target)) {
        window.requestAnimationFrame(() => target.focus());
      }
    }
    wasOpenRef.current = isOpen;
    sessionSigRef.current = isOpen ? sig : '';
  }, [isOpen, initialValue, initialUnit, availableUnits, label]);

  useEffect(() => {
    return () => {
      const target = triggerElRef.current;
      triggerElRef.current = null;
      if (target && typeof document !== 'undefined' && document.contains(target)) {
        window.setTimeout(() => target.focus(), 0);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const { evaluatedResult, evalError } = evaluateKeypadExpression(expression);
  const keypadValidation = validateKeypadValue(evaluatedResult, expression, evalError, validationRules);
  const isOkDisabled = evalError || !keypadValidation.isValid;
  const unitSuffix = selectedUnit ? ` ${selectedUnit}` : '';

  const validationFeedback = isOkDisabled
    ? keypadValidation.reason === 'below_min' && validationRules?.min !== undefined
      ? t('keypad.minValue', 'Valor mínimo: {{value}}', { value: `${formatNumberPt(validationRules.min)}${unitSuffix}` })
      : keypadValidation.reason === 'above_max' && validationRules?.max !== undefined
        ? t('keypad.maxValue', 'Valor máximo: {{value}}', { value: `${formatNumberPt(validationRules.max)}${unitSuffix}` })
        : getKeypadValidationMessage(keypadValidation.reason, evalError, validationRules, unitSuffix, formatNumberPt)
    : null;

  const handleConfirm = () => {
    if (isOkDisabled) return;
    onConfirm(evaluatedResult, selectedUnit);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="daterra-keypad-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-lg bg-daterra-primary text-white rounded-t-3xl shadow-2xl border-t border-daterra-secondary/30 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-4 flex items-center justify-between border-b border-daterra-secondary/30 bg-daterra-secondary/20">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-daterra-accent" aria-hidden="true" />
            <h3 id="daterra-keypad-title" className="font-bold text-sm tracking-wide text-white">{label}</h3>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer touch-target flex items-center justify-center"
            aria-label={t('common.actions.close', 'Fechar')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <KeypadDisplay expression={expression} evaluatedResult={evaluatedResult} evalError={evalError} selectedUnit={selectedUnit} formatNumberPt={formatNumberPt} />
        <KeypadUnitAndShortcuts availableUnits={availableUnits} selectedUnit={selectedUnit} onSelectUnit={setSelectedUnit} commonValues={commonValues} onSelectShortcut={(val) => setExpression(formatNumberPt(val))} formatNumberPt={formatNumberPt} />
        <KeypadNumberGrid onKeyPress={(char) => setExpression((p) => applyKeypadCharacter(p, char, validationRules?.allowNegative))} onBackspace={() => setExpression(applyKeypadBackspace)} />

        {validationFeedback && (
          <div role="status" aria-live="polite" className="px-4 pb-2 text-center text-xs font-sans text-amber-300 font-medium">
            {validationFeedback}
          </div>
        )}

        <div className="p-4 pt-0 grid grid-cols-3 gap-3 bg-daterra-primary">
          <button type="button" onClick={() => setExpression('')} className="py-3 bg-rose-700/80 hover:bg-rose-700 text-white font-sans font-bold text-sm rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1 cursor-pointer">
            {t('keypad.clearButton', 'C (Limpar)')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isOkDisabled}
            aria-disabled={isOkDisabled}
            className={`col-span-2 py-3 font-sans font-bold text-base rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 ${
              isOkDisabled ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60 shadow-none' : 'bg-daterra-accent hover:bg-daterra-accent/90 text-white shadow-daterra-accent/30 cursor-pointer'
            }`}
          >
            <Check className="w-5 h-5" />
            <span>{t('keypad.confirmButton', 'OK (Confirmar)')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
