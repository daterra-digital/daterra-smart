import React from 'react';
import { Check, Sprout } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext.tsx';
import type { CanopyProfileId, CanopyDensityTier } from '../trvAssistance.ts';

export interface CanopyProfileSelectorProps {
  selectedProfile: CanopyProfileId;
  onSelectProfile: (profile: CanopyProfileId) => void;
  kValue?: number | string;
  isManualK: boolean;
  activeTierObj?: CanopyDensityTier;
}

export const CanopyProfileSelector: React.FC<CanopyProfileSelectorProps> = ({
  selectedProfile,
  onSelectProfile,
  kValue,
  isManualK,
  activeTierObj
}) => {
  const { t } = useLanguage();

  const profiles: { id: CanopyProfileId; labelKey: string; isValidation?: boolean }[] = [
    { id: null, labelKey: 'volumeCaldaTrv.assistance.profiles.noProfile' },
    { id: 'mediterranean_narrow_medium_orchard', labelKey: 'volumeCaldaTrv.assistance.profiles.orchardProfile' },
    { id: 'citrus_orchard', labelKey: 'volumeCaldaTrv.assistance.profiles.citrusProfile' },
    { id: 'olive_grove', labelKey: 'volumeCaldaTrv.assistance.profiles.oliveProfile', isValidation: true }
  ];

  return (
    <>
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

      {/* Nota curta para Citrinos */}
      {selectedProfile === 'citrus_orchard' && (
        <p className="text-[11px] text-slate-500 italic leading-snug px-0.5 animate-fade-in">
          {t(
            'volumeCaldaTrv.assistance.profiles.citrusValidationNotice',
            'Valores orientadores internos. Confirme o coeficiente e a calibração nas condições reais de aplicação.'
          )}
        </p>
      )}
    </>
  );
};
