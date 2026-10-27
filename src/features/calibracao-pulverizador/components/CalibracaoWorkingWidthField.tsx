import React from 'react';
import { RefreshCw, Pencil } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext.tsx';

export interface CalibracaoWorkingWidthFieldProps {
  widthNum?: number;
  rowSpacingNum?: number;
  canResetWidth: boolean;
  widthPresets: number[];
  formatNumber: (val: number, decimals: number) => string;
  onWidthChange: (width: number | string, source?: 'auto-row-spacing' | 'manual') => void;
  onOpenKeypad?: (fieldId: string) => void;
}

export const CalibracaoWorkingWidthField: React.FC<CalibracaoWorkingWidthFieldProps> = ({
  widthNum,
  rowSpacingNum,
  canResetWidth,
  widthPresets,
  formatNumber,
  onWidthChange,
  onOpenKeypad
}) => {
  const { t } = useLanguage();

  return (
    <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-1.5">
      <div className="flex items-center justify-between">
        <div>
          <label htmlFor="input-workingWidthM" className="text-xs font-bold text-slate-700 block">
            {t('calibracaoPulverizador.phaseB.workingWidth', 'Largura de trabalho')}
          </label>
          <span className="text-[11px] text-slate-500 block leading-tight">
            {t(
              'calibracaoPulverizador.phaseB.workingWidthHelp',
              'Normalmente corresponde à distância entre duas linhas tratadas numa passagem.'
            )}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onOpenKeypad?.('workingWidthM')}
          className="flex items-center gap-1.5 text-xs font-bold font-mono-numbers px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-900 shadow-2xs hover:border-[#114037] cursor-pointer touch-target shrink-0 ml-2"
          aria-label={t('calibracaoPulverizador.phaseB.editWidth', 'Editar largura de trabalho')}
        >
          <span>{widthNum !== undefined ? formatNumber(widthNum, 2) : '—'}</span>
          <span className="text-[#1D734B] font-semibold">m</span>
          <Pencil className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      {canResetWidth && rowSpacingNum !== undefined && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => onWidthChange(rowSpacingNum, 'auto-row-spacing')}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#1D734B] hover:text-[#114037] bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/60 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>
              {t(
                'calibracaoPulverizador.phaseB.useRowSpacingAction',
                `Usar a distância entrelinhas: ${formatNumber(rowSpacingNum, 2)} m`
              )}
            </span>
          </button>
        </div>
      )}

      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
          {t('calibracaoPulverizador.phaseB.shortcuts', 'Atalhos:')}
        </span>
        {widthPresets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onWidthChange(p, 'manual')}
            className={`px-2 py-0.5 text-xs font-bold rounded-lg transition-all font-mono-numbers cursor-pointer touch-target ${
              widthNum === p
                ? 'bg-[#114037] text-white shadow-xs'
                : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            {formatNumber(p, 2)}
          </button>
        ))}
      </div>
    </div>
  );
};
