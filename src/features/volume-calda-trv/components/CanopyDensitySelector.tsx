/**
 * DATERRA Smart - Assistência Agronómica TRV
 * Componente: CanopyDensitySelector
 * Subfase 1B.4B
 * 
 * Responsabilidades:
 * - Apresentar seletor de perfil cultural
 * - Apresentar grelha 2×2 (mobile/tablet) ou 4 colunas (desktop) de patamares de densidade
 * - Indicar patamar ativo ("Valor orientador — [patamar]") ou "Valor manual"
 * - Apresentar salvaguardas e interpretações neutras não bloqueantes
 * - Cumprir WCAG 2.2 AA (touch targets >= 48×48 px, cartões >= 56 px de altura, foco visível)
 */

import React from 'react';
import { Info, AlertTriangle, Check, Sprout } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext.tsx';
import { formatNumberForDisplay } from '../../calculators/core/expressionParser.ts';
import type {
  CanopyProfileId,
  CanopyDensityTierId,
  CanopyDensityTier,
  TrvInterpretationResult
} from '../trvAssistance.ts';
import { getCanopyDensityTiers } from '../trvAssistance.ts';

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

  const profiles: { id: CanopyProfileId; labelKey: string; isValidation?: boolean }[] = [
    { id: null, labelKey: 'volumeCaldaTrv.assistance.profiles.noProfile' },
    { id: 'mediterranean_narrow_medium_orchard', labelKey: 'volumeCaldaTrv.assistance.profiles.orchardProfile' },
    { id: 'citrus_orchard', labelKey: 'volumeCaldaTrv.assistance.profiles.citrusProfile' },
    { id: 'olive_grove', labelKey: 'volumeCaldaTrv.assistance.profiles.oliveProfile', isValidation: true }
  ];

  // Identificação do rótulo do patamar ativo
  const activeTierObj = availableTiers.find((t) => t.id === selectedTier);

  return (
    <section
      aria-labelledby="canopy-density-assistance-title"
      className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft space-y-4"
    >
      {/* 1. Cabeçalho do Seletor de Perfil Cultural */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#114037]/10 flex items-center justify-center text-[#114037] shrink-0">
            <Sprout className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
          </div>
          <div>
            <h3
              id="canopy-density-assistance-title"
              className="text-xs sm:text-sm font-black text-slate-800 tracking-tight"
            >
              {t('volumeCaldaTrv.assistance.profiles.title', 'Perfil Cultural Orientador')}
            </h3>
            <p className="text-[11px] text-slate-500">
              {t('volumeCaldaTrv.assistance.a11y.selectProfile', 'Selecione para apoio de calibração')}
            </p>
          </div>
        </div>

        {/* Indicador de Estado do Coeficiente k (Orientador vs Manual) */}
        {kValue !== undefined && kValue !== '' && (
          <div className="self-start sm:self-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700">
            {!isManualK && activeTierObj ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#114037]" aria-hidden="true" />
                <span>
                  {t('volumeCaldaTrv.assistance.density.guidanceValue', 'Valor orientador')} — {t(activeTierObj.labelKey)}
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true" />
                <span>{t('volumeCaldaTrv.assistance.density.manualValue', 'Valor manual')}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* 2. Botões de Seleção de Perfil Cultural */}
      <div
        role="radiogroup"
        aria-label={t('volumeCaldaTrv.assistance.a11y.selectProfile', 'Selecionar perfil cultural orientador')}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2"
      >
        {profiles.map((p) => {
          const isSelected = selectedProfile === p.id;
          return (
            <button
              key={p.id ?? 'no_profile'}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectProfile(p.id)}
              className={`min-h-[48px] px-3 py-2 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-center focus-visible:outline-2 focus-visible:outline-[#114037] focus-visible:ring-2 focus-visible:ring-[#3CA64C] ${
                isSelected
                  ? 'border-[#114037] bg-[#114037] text-white shadow-xs font-black'
                  : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-semibold'
              }`}
            >
              <div className="flex items-center justify-between gap-1 w-full">
                <span className="text-xs truncate block">{t(p.labelKey)}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#3CA64C] shrink-0" aria-hidden="true" />}
              </div>
              {p.isValidation && (
                <span
                  className={`text-[9.5px] font-medium tracking-tight mt-0.5 truncate block ${
                    isSelected ? 'text-[#3CA64C]' : 'text-amber-700'
                  }`}
                >
                  {t('volumeCaldaTrv.assistance.profiles.oliveValidation', 'Interpretação em validação')}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Nota curta, discreta e não bloqueante para Citrinos */}
      {selectedProfile === 'citrus_orchard' && (
        <p className="text-[11px] text-slate-500 italic leading-snug px-0.5 animate-fade-in">
          {t(
            'volumeCaldaTrv.assistance.profiles.citrusValidationNotice',
            'Valores orientadores internos. Confirme o coeficiente e a calibração nas condições reais de aplicação.'
          )}
        </p>
      )}

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
