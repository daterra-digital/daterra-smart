/**
 * DATERRA Smart - Assistência Agronómica TRV
 * Componente: CanopyDensitySelector
 * Subfase 1B.4B
 */

import React from 'react';
import { Info, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext.tsx';
import { formatNumberForDisplay } from '../../calculators/core/expressionParser.ts';
import type {
  CanopyProfileId,
  CanopyDensityTierId,
  CanopyDensityTier,
  TrvInterpretationResult
} from '../trvAssistance.ts';
import { getCanopyDensityTiers } from '../trvAssistance.ts';
import { CanopyProfileSelector } from './CanopyProfileSelector.tsx';

export interface CanopyDensitySelectorProps {
  selectedProfile: CanopyProfileId;
  onSelectProfile: (profile: CanopyProfileId) => void;
  selectedTier: CanopyDensityTierId | null;
  onSelectTier: (tier: CanopyDensityTier) => void;
  isManualK: boolean;
  kValue?: number | string;
  interpretation: TrvInterpretationResult;
  isDesktop?: boolean;
}

export const CanopyDensitySelector: React.FC<CanopyDensitySelectorProps> = ({
  selectedProfile,
  onSelectProfile,
  selectedTier,
  onSelectTier,
  isManualK,
  kValue,
  interpretation,
  isDesktop = false
}) => {
  const { t } = useLanguage();

  const availableTiers = getCanopyDensityTiers(selectedProfile);
  const activeTierObj = availableTiers.find((tier) => tier.id === selectedTier);

  return (
    <section
      aria-labelledby="canopy-density-assistance-title"
      className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft space-y-4"
    >
      {/* 1 & 2. Perfil Cultural Orientador */}
      <CanopyProfileSelector
        selectedProfile={selectedProfile}
        onSelectProfile={onSelectProfile}
        kValue={kValue}
        isManualK={isManualK}
        activeTierObj={activeTierObj}
      />

      {/* 3. Grelha de Patamares de Densidade (Apenas Pomar e Citrinos) */}
      {availableTiers.length > 0 && (
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
      )}

      {/* 4. Aviso Contextual de Interpretação do Volume Calculado */}
      {interpretation.messageKey && (
        <div
          role="status"
          aria-live="polite"
          className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs transition-all animate-fade-in ${
            interpretation.severity === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : interpretation.isValidation
              ? 'bg-sky-50 border-sky-200 text-sky-900'
              : interpretation.severity === 'neutral'
              ? 'bg-slate-50 border-slate-200 text-slate-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          {interpretation.severity === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <Info
              className={`w-4 h-4 shrink-0 mt-0.5 ${
                interpretation.isValidation
                  ? 'text-sky-600'
                  : interpretation.severity === 'neutral'
                  ? 'text-slate-500'
                  : 'text-emerald-600'
              }`}
              aria-hidden="true"
            />
          )}
          <span className="leading-relaxed font-medium">
            {t(interpretation.messageKey)}
          </span>
        </div>
      )}
    </section>
  );
};
