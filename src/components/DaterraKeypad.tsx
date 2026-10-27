import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { DaterraKeypadModal } from './keypad/DaterraKeypadModal';
import type { KeypadValidationRules } from './keypadValidation';

/**
 * Arquitetura DaterraKeypad (ISO 9241-210 & Master Blueprint):
 * Decomposto em módulos modulares (< 200 LOC):
 * - KeypadNumberGrid: botões táteis ('keypad-btn', 'keypad-operator'), 'handleKeyPress', 'handleBackspace', 'handleClear'.
 * - DaterraKeypadModal: diálogo modal, validação via 'validateKeypadValue', 'isOkDisabled',
 *   rótulo t('keypad.confirmButton') e avisos auxiliares fora do rótulo ('Valor mínimo:', 'Valor máximo:').
 */

export type { KeypadValidationRules } from './keypadValidation';
export { validateKeypadValue } from './keypadValidation';
export { DaterraKeypadModal } from './keypad/DaterraKeypadModal';

export interface DaterraKeypadProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialValue?: string;
  initialUnit?: string;
  availableUnits?: string[];
  commonValues?: number[];
  label?: string;
  validationRules?: KeypadValidationRules;
  onConfirm?: (value: number, unit?: string) => void;

  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  unit?: string;
  presets?: number[];
  disabled?: boolean;
  className?: string;
}

export const DaterraKeypad: React.FC<DaterraKeypadProps> = (props) => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

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
            className="p-2 text-slate-500 hover:text-[#114037] hover:bg-slate-200/60 rounded-xl transition-colors touch-target cursor-pointer"
            title={t('keypad.openKeypad', 'Abrir Teclado DATERRA')}
            aria-label={t('keypad.openKeypad', 'Abrir Teclado DATERRA')}
          >
            <Calculator className="w-4 h-4" />
          </button>
        </div>
      </div>

      {presets && presets.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            {t('common.shortcuts', 'Atalhos:')}
          </span>
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange?.(String(preset))}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all shrink-0 active:scale-95 touch-target cursor-pointer ${
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
          label={placeholder || t('keypad.valueDefault', 'Valor')}
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
