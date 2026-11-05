/**
 * DATERRA Smart - Seletor de Atalhos Numéricos com Refluxo Mobile-First
 * Sem scroll horizontal, touch target >= 44px
 */

import React from 'react';
import { Edit3 } from 'lucide-react';
import { useLanguage } from '../../../../src/context/LanguageContext';

export interface ManualShortcutSelectorProps {
  shortcuts: number[];
  currentVal: number | undefined;
  unit: string;
  fieldLabel: string;
  onSelect: (val: number) => void;
  onOpenKeypad: (field: string, currentVal: number | undefined, unit: string, label: string) => void;
}

export const ManualShortcutSelector: React.FC<ManualShortcutSelectorProps> = ({
  shortcuts,
  currentVal,
  unit,
  fieldLabel,
  onSelect,
  onOpenKeypad
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-3 pt-2">
      <div className="flex flex-wrap gap-2">
        {shortcuts.map((val) => {
          const isSelected = currentVal === val;
          return (
            <button
              key={val}
              type="button"
              onClick={() => onSelect(val)}
              className={`min-h-[46px] px-4 py-2.5 rounded-2xl text-sm font-bold font-mono-numbers transition-all touch-target cursor-pointer flex items-center justify-center gap-1.5 ${
                isSelected
                  ? 'bg-[#114037] text-white shadow-md shadow-[#114037]/25 border-2 border-[#3CA64C]'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{new Intl.NumberFormat('pt-PT').format(val)}</span>
              <span className="text-xs text-slate-400 font-sans">{unit}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onOpenKeypad('custom', currentVal, unit, fieldLabel)}
          className={`min-h-[46px] px-4 py-2.5 rounded-2xl text-sm font-bold transition-all touch-target cursor-pointer flex items-center gap-1.5 ${
            currentVal !== undefined && !shortcuts.includes(currentVal)
              ? 'bg-[#114037] text-white border-2 border-[#3CA64C]'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
          }`}
        >
          <Edit3 className="w-4 h-4 text-[#3CA64C]" />
          <span>
            {currentVal !== undefined && !shortcuts.includes(currentVal)
              ? `${new Intl.NumberFormat('pt-PT').format(currentVal)} ${unit}`
              : t('manual.shortcuts.other', 'Outro valor')}
          </span>
        </button>
      </div>
    </div>
  );
};
