import React from 'react';
import { useTranslation } from '../../../context/LanguageContext';

interface CalculatorPresetsBarProps {
  presets: number[];
  value: number | string;
  unit: string;
  formatDisplayValue: (val: number | string) => string | number;
  onChange: (preset: number, unit: string) => void;
}

export const CalculatorPresetsBar: React.FC<CalculatorPresetsBarProps> = ({
  presets,
  value,
  unit,
  formatDisplayValue,
  onChange
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-0.5">
        {t('common.shortcuts', 'Atalhos:')}
      </span>
      {presets.slice(0, 4).map((preset) => (
        <button
          key={preset}
          type="button"
          onClick={() => onChange(preset, unit)}
          className={`px-2 py-0.5 text-xs font-bold rounded-lg transition-all font-mono-numbers shrink-0 cursor-pointer active:scale-95 ${
            Number(value) === preset
              ? 'bg-daterra-primary text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          title={t('common.setPreset', 'Definir {{value}} {{unit}}', {
            value: formatDisplayValue(preset),
            unit
          })}
        >
          {formatDisplayValue(preset)}
        </button>
      ))}
    </div>
  );
};
