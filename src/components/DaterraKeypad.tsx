import React, { useState, useEffect } from 'react';
import { Delete, Check, X, Calculator } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export type { KeypadValidationRules } from './keypadValidation.ts';
export { validateKeypadValue } from './keypadValidation.ts';
import { validateKeypadValue, type KeypadValidationRules } from './keypadValidation.ts';

export interface DaterraKeypadProps {
  // Modo Modal (quando controlado externamente por isOpen)
  isOpen?: boolean;
  onClose?: () => void;
  initialValue?: string;
  initialUnit?: string;
  availableUnits?: string[];
  commonValues?: number[];
  label?: string;
  validationRules?: KeypadValidationRules;
  onConfirm?: (value: number, unit?: string) => void;

  // Modo Input Embutido com Atalhos/Presets
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  unit?: string;
  presets?: number[];
  disabled?: boolean;
  className?: string;
}

export const DaterraKeypadModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialValue: string;
  initialUnit?: string;
  availableUnits?: string[];
  commonValues?: number[];
  label: string;
  validationRules?: KeypadValidationRules;
  onConfirm: (value: number, unit?: string) => void;
}> = ({
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
  const { t } = useLanguage();
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

  // Avaliação matemática segura do visor
  useEffect(() => {
    if (!expression || expression.trim() === '') {
      setEvaluatedResult(0);
      setEvalError(false);
      return;
    }

    try {
      // Substitui vírgula por ponto para cálculo
      let sanitized = expression.replace(/,/g, '.');
      // Trata caso a expressão termine num operador incompleto
      if (/[+\-*/.]$/.test(sanitized)) {
        sanitized = sanitized.slice(0, -1);
      }
      
      if (!sanitized) {
        setEvaluatedResult(0);
        return;
      }

      // Avalia apenas expressões matemáticas numéricas seguras
      if (/^[0-9+\-*/.\s]+$/.test(sanitized)) {
        // eslint-disable-next-line no-new-func
        const res = Function(`"use strict"; return (${sanitized})`)();
        if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
          setEvaluatedResult(Number(res.toFixed(3)));
          setEvalError(false);
        } else {
          setEvaluatedResult(0);
          setEvalError(true);
        }
      } else {
        setEvalError(true);
      }
    } catch {
      setEvalError(true);
      setEvaluatedResult(0);
    }
  }, [expression]);

  if (!isOpen) return null;

  const handleKeyPress = (char: string) => {
    setExpression((prev) => {
      if (prev === '0' && !['+', '-', '*', '/', ','].includes(char)) {
        return char;
      }
      // Impede múltiplos operadores seguidos
      if (['+', '-', '*', '/', ','].includes(char) && /[+\-*/,]$/.test(prev)) {
        return prev.slice(0, -1) + char;
      }
      return prev + char;
    });
  };

  const handleBackspace = () => {
    setExpression((prev) => {
      if (prev.length <= 1) return '0';
      return prev.slice(0, -1);
    });
  };

  const handleClear = () => {
    setExpression('0');
  };

  const handleShortcutClick = (val: number) => {
    setExpression(String(val).replace('.', ','));
  };

  // Validação declarativa por campo: botão OK ativo apenas quando as regras são cumpridas
  const keypadValidation = validateKeypadValue(evaluatedResult, expression, evalError, validationRules);
  const isOkDisabled = !keypadValidation.isValid;

  const handleConfirm = () => {
    if (!isOkDisabled) {
      onConfirm(evaluatedResult, selectedUnit);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div 
        className="w-full max-w-lg bg-daterra-primary text-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-daterra-secondary/30 flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Teclado */}
        <div className="px-5 py-3.5 bg-daterra-primary-hover flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-daterra-accent" />
            <span className="font-bold text-sm text-slate-100 truncate">{label}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visor Numérico (JetBrains Mono) */}
        <div className="p-4 bg-slate-900/90 text-right flex flex-col justify-end border-b border-slate-800 font-mono-numbers">
          <div className="text-xs text-slate-400 font-sans tracking-wide uppercase mb-1">
            {t('keypad.expressionHeader')}
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-wider overflow-x-auto whitespace-nowrap scrollbar-none">
            {expression || '0'}
          </div>
          <div className="text-sm font-semibold text-daterra-accent mt-1 flex items-center justify-between">
            <span className="text-[11px] font-sans text-slate-400">{t('keypad.evaluatedResult')}</span>
            <span>
              {evalError ? (
                <span className="text-rose-400 font-sans text-xs">{t('keypad.invalidExpression')}</span>
              ) : (
                `${formatNumberPt(evaluatedResult)} ${selectedUnit}`
              )}
            </span>
          </div>
        </div>

        {/* Linha de Seletor de Unidades (se aplicável) */}
        {availableUnits.length > 0 && (
          <div className="px-4 py-2 bg-slate-800/60 border-b border-slate-700/50 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider shrink-0">{t('keypad.unitLabel')}</span>
            <div className="flex items-center gap-1.5">
              {availableUnits.map((u) => (
                <button
                  key={u}
                  onClick={() => setSelectedUnit(u)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all touch-target flex items-center justify-center ${
                    selectedUnit === u
                      ? 'bg-daterra-accent text-white shadow-md shadow-daterra-accent/30'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Linha de Valores Comuns (Atalhos na largura do ecrã) */}
        {commonValues.length > 0 && (
          <div className="p-3 bg-slate-900/40 border-b border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
              {t('keypad.commonShortcuts')}
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 sm:gap-2">
              {commonValues.map((val) => (
                <button
                  key={val}
                  onClick={() => handleShortcutClick(val)}
                  className="py-2 bg-white/10 hover:bg-daterra-accent/30 hover:border-daterra-accent border border-white/10 text-white font-mono-numbers font-bold text-xs sm:text-sm rounded-xl transition-all active:scale-95 shadow-xs"
                >
                  {formatNumberPt(val)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Teclado Numérico Completo */}
        <div className="p-4 grid grid-cols-4 gap-2 bg-daterra-primary font-mono-numbers">
          {/* Linha 1 */}
          <button onClick={() => handleKeyPress('7')} className="keypad-btn">7</button>
          <button onClick={() => handleKeyPress('8')} className="keypad-btn">8</button>
          <button onClick={() => handleKeyPress('9')} className="keypad-btn">9</button>
          <button onClick={() => handleKeyPress('/')} className="keypad-operator">/</button>

          {/* Linha 2 */}
          <button onClick={() => handleKeyPress('4')} className="keypad-btn">4</button>
          <button onClick={() => handleKeyPress('5')} className="keypad-btn">5</button>
          <button onClick={() => handleKeyPress('6')} className="keypad-btn">6</button>
          <button onClick={() => handleKeyPress('*')} className="keypad-operator">*</button>

          {/* Linha 3 */}
          <button onClick={() => handleKeyPress('1')} className="keypad-btn">1</button>
          <button onClick={() => handleKeyPress('2')} className="keypad-btn">2</button>
          <button onClick={() => handleKeyPress('3')} className="keypad-btn">3</button>
          <button onClick={() => handleKeyPress('-')} className="keypad-operator">-</button>

          {/* Linha 4 */}
          <button onClick={() => handleKeyPress('0')} className="keypad-btn">0</button>
          <button onClick={() => handleKeyPress(',')} className="keypad-btn font-bold">,</button>
          <button onClick={handleBackspace} className="keypad-action bg-amber-600/80 hover:bg-amber-600">
            <Delete className="w-5 h-5 mx-auto" />
          </button>
          <button onClick={() => handleKeyPress('+')} className="keypad-operator">+</button>
        </div>

        {/* Mensagem curta auxiliar fora do rótulo do botão */}
        {isOkDisabled && keypadValidation.reason && (keypadValidation.reason === 'below_min' || keypadValidation.reason === 'above_max') && (
          <div className="px-4 pb-2 text-center text-xs font-sans text-amber-300 font-medium" aria-live="polite">
            {keypadValidation.reason === 'below_min' && validationRules?.min !== undefined && (
              <span>Valor mínimo: {formatNumberPt(validationRules.min)}{selectedUnit ? ` ${selectedUnit}` : ''}</span>
            )}
            {keypadValidation.reason === 'above_max' && validationRules?.max !== undefined && (
              <span>Valor máximo: {formatNumberPt(validationRules.max)}{selectedUnit ? ` ${selectedUnit}` : ''}</span>
            )}
          </div>
        )}

        {/* Botões Finais de Ação: C e OK */}
        <div className="p-4 pt-0 grid grid-cols-3 gap-3 bg-daterra-primary">
          <button
            onClick={handleClear}
            className="py-3 bg-rose-700/80 hover:bg-rose-700 text-white font-sans font-bold text-sm rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1"
          >
            {t('keypad.clearButton')}
          </button>

          <button
            onClick={handleConfirm}
            disabled={isOkDisabled}
            aria-disabled={isOkDisabled}
            className={`col-span-2 py-3 font-sans font-bold text-base rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 ${
              isOkDisabled
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60 shadow-none'
                : 'bg-daterra-accent hover:bg-daterra-accent/90 text-white shadow-daterra-accent/30'
            }`}
          >
            <Check className="w-5 h-5" />
            <span>{t('keypad.confirmButton') || 'OK (Confirmar)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const DaterraKeypad: React.FC<DaterraKeypadProps> = (props) => {
  const [modalOpen, setModalOpen] = useState(false);

  // Se for utilizado no modo modal tradicional (controlado por isOpen)
  if (props.isOpen !== undefined) {
    return (
      <DaterraKeypadModal
        isOpen={props.isOpen}
        onClose={props.onClose || (() => {})}
        initialValue={props.initialValue || ''}
        initialUnit={props.initialUnit}
        availableUnits={props.availableUnits}
        commonValues={props.commonValues}
        label={props.label || ''}
        validationRules={props.validationRules}
        onConfirm={props.onConfirm || (() => {})}
      />
    );
  }

  // Modo Input Embutido com Presets táteis (usado em novas calculadoras)
  const {
    value = '',
    onChange,
    placeholder = '0.0',
    unit = 'm',
    presets = [],
    disabled = false,
    className = ''
  } = props;

  return (
    <div className="space-y-2">
      <div className="relative flex items-center">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-base font-bold font-mono-numbers text-slate-800 focus:bg-white focus:border-[#3CA64C] focus:ring-2 focus:ring-[#3CA64C]/20 transition-all outline-none pr-20 ${className}`}
        />
        <div className="absolute right-2.5 flex items-center gap-1.5">
          {unit && (
            <span className="px-2 py-1 bg-slate-200/80 text-slate-700 text-xs font-extrabold rounded-lg">
              {unit}
            </span>
          )}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="p-2 text-slate-500 hover:text-[#114037] hover:bg-slate-200/60 rounded-xl transition-colors touch-target"
            title="Abrir Teclado DATERRA"
            aria-label="Abrir Teclado DATERRA"
          >
            <Calculator className="w-4 h-4" />
          </button>
        </div>
      </div>

      {presets && presets.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Atalhos:
          </span>
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange?.(String(preset))}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all shrink-0 active:scale-95 touch-target ${
                value === String(preset)
                  ? 'bg-[#114037] text-white border-[#114037] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-[#3CA64C] hover:bg-[#3CA64C]/10'
              }`}
            >
              {preset}{unit ? ` ${unit}` : ''}
            </button>
          ))}
        </div>
      )}

      {modalOpen && (
        <DaterraKeypadModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          initialValue={value}
          initialUnit={unit}
          availableUnits={unit ? [unit] : []}
          commonValues={presets}
          label={placeholder || 'Valor'}
          validationRules={props.validationRules}
          onConfirm={(numVal) => {
            onChange?.(String(numVal));
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

