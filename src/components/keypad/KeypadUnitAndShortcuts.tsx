import React from 'react';
import { useTranslation } from '../../context/LanguageContext';

interface KeypadUnitAndShortcutsProps {
  availableUnits: string[];
  selectedUnit: string;
  onSelectUnit: (unit: string) => void;
  commonValues: number[];
  onSelectShortcut: (val: number) => void;
  formatNumberPt: (num: number) => string;
}

export const KeypadUnitAndShortcuts: React.FC<KeypadUnitAndShortcutsProps> = ({
  availableUnits,
  selectedUnit,
  onSelectUnit,
  commonValues,
  onSelectShortcut,
  formatNumberPt
}) => {
  const { t } = useTranslation();

  return (
    <>
      {availableUnits.length > 0 && (
        <div className="px-4 py-2 bg-slate-800/60 border-b border-slate-700/50 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider shrink-0">
            {t('keypad.unitLabel', 'Unidade:')}
          </span>
          <div className="flex items-center gap-1.5">
            {availableUnits.map((u) => (
              <button
                type="button"
                key={u}
                onClick={() => onSelectUnit(u)}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all touch-target flex items-center justify-center cursor-pointer ${
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

      {commonValues.length > 0 && (
        <div className="p-3 bg-slate-900/40 border-b border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
            {t('keypad.commonShortcuts', 'Valores Comuns (Atalhos)')}
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 sm:gap-2">
            {commonValues.map((val) => (
              <button
                type="button"
                key={val}
                onClick={() => onSelectShortcut(val)}
                className="py-2 bg-white/10 hover:bg-daterra-accent/30 hover:border-daterra-accent border border-white/10 text-white font-mono-numbers font-bold text-xs sm:text-sm rounded-xl transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                {formatNumberPt(val)}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
