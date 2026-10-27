import React, { useState, useEffect } from 'react';
import { Check, X, Calculator } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { validateKeypadValue, type KeypadValidationRules } from '../keypadValidation';
import { KeypadNumberGrid } from './KeypadNumberGrid';
import { KeypadDisplay } from './KeypadDisplay';
import { KeypadUnitAndShortcuts } from './KeypadUnitAndShortcuts';

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

export const DaterraKeypadModal: React.FC<DaterraKeypadModalProps> = ({
  isOpen,
  onClose,
  initialValue,
  initialUnit,
  availableUnits = [],
  commonValues = [50, 100, 200, 300, 400, 500, 1000, 1500],
  label,
  validationRules,
  onConfirm
}) => {
  const { t } = useTranslation();
  const [expression, setExpression] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>(initialUnit || (availableUnits[0] || ''));
  const [evaluatedResult, setEvaluatedResult] = useState<number>(0);
  const [evalError, setEvalError] = useState<boolean>(false);

  const formatNumberPt = (num: number): string => {
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('pt-PT', {
      maximumFractionDigits: 3,
      useGrouping: false
    }).format(num);
  };

  useEffect(() => {
    if (isOpen) {
      const cleanVal = initialValue ? String(initialValue).replace('.', ',') : '0';
      setExpression(cleanVal);
      if (initialUnit) setSelectedUnit(initialUnit);
      else if (availableUnits.length > 0) setSelectedUnit(availableUnits[0]);
    }
  }, [isOpen, initialValue, initialUnit, availableUnits]);

  useEffect(() => {
    if (!expression || expression.trim() === '') {
      setEvaluatedResult(0);
      setEvalError(false);
      return;
    }
    try {
      let sanitized = expression.replace(/,/g, '.');
      if (/[+\-*/.]$/.test(sanitized)) sanitized = sanitized.slice(0, -1);
      if (!sanitized) {
        setEvaluatedResult(0);
        return;
      }
      if (/^[0-9+\-*/.\s]+$/.test(sanitized)) {
        // eslint-disable-next-line no-new-func
        const res = Function(`"use strict"; return (${sanitized})`)();
        if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
          setEvaluatedResult(res);
          setEvalError(false);
        } else {
          setEvalError(true);
        }
      } else {
        setEvalError(true);
      }
    } catch {
      setEvalError(true);
    }
  }, [expression]);

  const handleKeyPress = (char: string) => {
    if (expression === '0' && char !== ',' && !['+', '-', '*', '/'].includes(char)) {
      setExpression(char);
      return;
    }
    setExpression((prev) => prev + char);
  };

  const handleBackspace = () => {
    setExpression((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
  };

  const handleClear = () => setExpression('0');

  const keypadValidation = validateKeypadValue(evaluatedResult, expression, evalError, validationRules);
  const isOkDisabled = evalError || !keypadValidation.isValid;

  const handleConfirm = () => {
    if (isOkDisabled) return;
    onConfirm(evaluatedResult, selectedUnit);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="w-full max-w-lg bg-daterra-primary text-white rounded-t-3xl shadow-2xl border-t border-daterra-secondary/30 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="p-4 flex items-center justify-between border-b border-daterra-secondary/30 bg-daterra-secondary/20">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-daterra-accent" />
            <h3 className="font-bold text-sm tracking-wide text-white">{label}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label={t('common.actions.close', 'Fechar')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visor Numérico */}
        <KeypadDisplay
          expression={expression}
          evaluatedResult={evaluatedResult}
          evalError={evalError}
          selectedUnit={selectedUnit}
          formatNumberPt={formatNumberPt}
        />

        {/* Unidades & Atalhos */}
        <KeypadUnitAndShortcuts
          availableUnits={availableUnits}
          selectedUnit={selectedUnit}
          onSelectUnit={setSelectedUnit}
          commonValues={commonValues}
          onSelectShortcut={(val) => setExpression(formatNumberPt(val))}
          formatNumberPt={formatNumberPt}
        />

        {/* Teclado Numérico */}
        <KeypadNumberGrid onKeyPress={handleKeyPress} onBackspace={handleBackspace} />

        {/* Mensagem de validação de limites */}
        {isOkDisabled && keypadValidation.reason && (keypadValidation.reason === 'below_min' || keypadValidation.reason === 'above_max') && (
          <div className="px-4 pb-2 text-center text-xs font-sans text-amber-300 font-medium" aria-live="polite">
            {keypadValidation.reason === 'below_min' && validationRules?.min !== undefined && (
              <span>{t('keypad.minValue', 'Valor mínimo: {{value}}', { value: `${formatNumberPt(validationRules.min)}${selectedUnit ? ' ' + selectedUnit : ''}` })}</span>
            )}
            {keypadValidation.reason === 'above_max' && validationRules?.max !== undefined && (
              <span>{t('keypad.maxValue', 'Valor máximo: {{value}}', { value: `${formatNumberPt(validationRules.max)}${selectedUnit ? ' ' + selectedUnit : ''}` })}</span>
            )}
          </div>
        )}

        {/* Botões de Ação C e OK */}
        <div className="p-4 pt-0 grid grid-cols-3 gap-3 bg-daterra-primary">
          <button
            type="button"
            onClick={handleClear}
            className="py-3 bg-rose-700/80 hover:bg-rose-700 text-white font-sans font-bold text-sm rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
          >
            {t('keypad.clearButton', 'C (Limpar)')}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isOkDisabled}
            aria-disabled={isOkDisabled}
            className={`col-span-2 py-3 font-sans font-bold text-base rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 ${
              isOkDisabled
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60 shadow-none'
                : 'bg-daterra-accent hover:bg-daterra-accent/90 text-white shadow-daterra-accent/30 cursor-pointer'
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
