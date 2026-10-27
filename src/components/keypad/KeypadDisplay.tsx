import React from 'react';
import { useTranslation } from '../../context/LanguageContext';

interface KeypadDisplayProps {
  expression: string;
  evaluatedResult: number;
  evalError: boolean;
  selectedUnit: string;
  formatNumberPt: (num: number) => string;
}

export const KeypadDisplay: React.FC<KeypadDisplayProps> = ({
  expression,
  evaluatedResult,
  evalError,
  selectedUnit,
  formatNumberPt
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-4 bg-slate-900/90 text-right flex flex-col justify-end border-b border-slate-800 font-mono-numbers">
      <div className="text-xs text-slate-400 font-sans tracking-wide uppercase mb-1">
        {t('keypad.expressionHeader', 'Expressão & Cálculo')}
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-white tracking-wider overflow-x-auto whitespace-nowrap scrollbar-none">
        {expression || '0'}
      </div>
      <div className="text-sm font-semibold text-daterra-accent mt-1 flex items-center justify-between">
        <span className="text-[11px] font-sans text-slate-400">
          {t('keypad.evaluatedResult', 'Resultado Avaliado:')}
        </span>
        <span>
          {evalError ? (
            <span className="text-rose-400 font-sans text-xs">
              {t('keypad.invalidExpression', 'Expressão Inválida')}
            </span>
          ) : (
            `${formatNumberPt(evaluatedResult)} ${selectedUnit}`
          )}
        </span>
      </div>
    </div>
  );
};
