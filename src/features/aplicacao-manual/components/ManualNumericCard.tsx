/**
 * DATERRA Smart - Subcartão de Entrada Numérica com Atalhos e Teclado
 * Padrão Canónico LWA / Master Blueprint DATERRA (< 200 LOC)
 */

import React from 'react';
import { Edit2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export interface ManualNumericCardProps {
  fieldLabel: string;
  currentVal?: number;
  unit: string;
  shortcuts: number[];
  onSelectShortcut: (val: number) => void;
  onOpenKeypad: () => void;
  fieldIcon?: React.ReactNode;
  helpText?: string;
  className?: string;
}

export const ManualNumericCard: React.FC<ManualNumericCardProps> = ({
  fieldLabel,
  currentVal,
  unit,
  shortcuts,
  onSelectShortcut,
  onOpenKeypad,
  fieldIcon,
  helpText,
  className = ''
}) => {
  const { t, language } = useLanguage();
  const numLocale = language === 'en-GB' ? 'en-GB' : 'pt-PT';

  const formattedVal =
    currentVal !== undefined
      ? new Intl.NumberFormat(numLocale, { maximumFractionDigits: 3 }).format(currentVal)
      : '—';

  return (
    <div
      className={`border border-slate-200 rounded-2xl p-4 sm:p-5 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-3.5 ${className}`}
    >
      {/* Cabeçalho do Campo */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {fieldIcon && <div className="text-[#114037] shrink-0">{fieldIcon}</div>}
          <span className="text-xs sm:text-sm font-bold text-slate-800">
            {fieldLabel}
          </span>
        </div>
        <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
          {t('common.tapToEdit', 'Toque para editar')}
        </span>
      </div>

      {/* Botão de Disparo para o Teclado Tátil DATERRA */}
      <button
        type="button"
        onClick={onOpenKeypad}
        aria-label={`${fieldLabel}: ${formattedVal} ${unit}. ${t('common.tapToEditAria', 'Toque para editar no teclado')}`}
        className="w-full min-h-[52px] bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between hover:border-[#3CA64C] transition-all cursor-pointer shadow-2xs touch-target group"
      >
        <div className="flex items-baseline gap-2 font-mono">
          <span className="text-2xl sm:text-3xl font-black font-mono-numbers text-slate-900 group-hover:text-[#114037] tracking-tight">
            {formattedVal}
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-500">
            {unit}
          </span>
        </div>
        <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-50 text-slate-500 group-hover:text-[#3CA64C] flex items-center justify-center transition-colors shrink-0">
          <Edit2 className="w-3.5 h-3.5" />
        </div>
      </button>

      {/* Atalhos Rápidos Canónicos */}
      {shortcuts.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 shrink-0">
              {t('common.shortcuts', 'Atalhos:')}
            </span>
            {shortcuts.map((val) => {
              const isSelected = currentVal === val;
              const valText = new Intl.NumberFormat(numLocale).format(val);
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => onSelectShortcut(val)}
                  aria-pressed={isSelected}
                  className={`min-h-[38px] px-3 py-1.5 text-xs rounded-xl font-bold font-mono transition-all cursor-pointer touch-target ${
                    isSelected
                      ? 'bg-[#114037] text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 shadow-2xs'
                  }`}
                >
                  {valText} {unit}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {helpText && (
        <p className="text-[11px] text-slate-500 leading-tight pt-0.5">
          {helpText}
        </p>
      )}
    </div>
  );
};
