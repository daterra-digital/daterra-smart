import React from 'react';
import { useLanguage } from '../../../context/LanguageContext.tsx';
import { formatNumberForDisplay } from '../../calculators/core/expressionParser.ts';
import type { CanopyDensityTier, CanopyDensityTierId } from '../trvAssistance.ts';

export interface CanopyDensityTierGridProps {
  availableTiers: CanopyDensityTier[];
  selectedTier: CanopyDensityTierId | null;
  isManualK: boolean;
  isDesktop?: boolean;
  onSelectTier: (tier: CanopyDensityTier) => void;
}

export const CanopyDensityTierGrid: React.FC<CanopyDensityTierGridProps> = ({
  availableTiers,
  selectedTier,
  isManualK,
  isDesktop = false,
  onSelectTier
}) => {
  const { t } = useLanguage();

  if (availableTiers.length === 0) return null;

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-700">
          {t('volumeCaldaTrv.assistance.density.title', 'Densidade da Copa')}
        </h4>
        <span className="text-[11px] text-slate-500">
          {t('volumeCaldaTrv.assistance.density.guidanceValue', 'Valor orientador')}
        </span>
      </div>

      <div
        className={`grid ${
          isDesktop ? 'grid-cols-4' : 'grid-cols-2 md:grid-cols-4'
        } gap-2 sm:gap-2.5`}
      >
        {availableTiers.map((tier) => {
          const isSelected = selectedTier === tier.id && !isManualK;
          const formattedK = formatNumberForDisplay(tier.kValue, 3);
          return (
            <button
              key={tier.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectTier(tier)}
              aria-label={`${t(tier.labelKey)}: ${formattedK} L/m³ - ${t(
                'volumeCaldaTrv.assistance.density.guidanceValue',
                'Valor orientador'
              )}${isSelected ? ` (${t('volumeCaldaTrv.assistance.a11y.selectedDensity', 'selecionado')})` : ''}`}
              className={`min-h-[56px] min-w-[48px] p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between focus-visible:outline-2 focus-visible:outline-[#114037] focus-visible:ring-2 focus-visible:ring-[#3CA64C] ${
                isSelected
                  ? 'border-[#114037] bg-[#114037]/10 ring-2 ring-[#114037] shadow-xs'
                  : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 active:bg-slate-200/70'
              }`}
            >
              <div className="flex items-center justify-between gap-1 w-full">
                <span className="text-xs font-bold text-slate-800 block leading-tight">
                  {t(tier.labelKey)}
                </span>
                {isSelected && (
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-[#114037] shrink-0"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-sm sm:text-base font-black font-mono-numbers text-slate-900">
                  {formattedK}
                </span>
                <span className="text-[10px] font-bold text-[#1D734B]">L/m³</span>
              </div>
              <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                {t('volumeCaldaTrv.assistance.density.guidanceValue', 'Valor orientador')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
