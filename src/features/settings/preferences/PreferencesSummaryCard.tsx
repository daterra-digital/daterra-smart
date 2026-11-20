// src/features/settings/preferences/PreferencesSummaryCard.tsx
import React from 'react';
import { Globe, Info, Scale, SlidersHorizontal } from 'lucide-react';
import { LANGUAGE_OPTIONS, useLanguage, type SupportedLanguage } from '../../../context/LanguageContext.tsx';
import {
  formatLanguageSummary,
  normalizeLanguageCode,
  PWA_ICON_THEMES,
  UNITS_PROFILE_OPTIONS,
  type AppThemeId
} from './preferencesCatalog.ts';

export interface PreferencesSummaryCardProps {
  language: SupportedLanguage;
  appTheme: AppThemeId;
  selectedUnitsProfile: string;
  onOpenHelp: () => void;
  onConfigure: () => void;
}

export const PreferencesSummaryCard: React.FC<PreferencesSummaryCardProps> = ({
  language,
  appTheme,
  selectedUnitsProfile,
  onOpenHelp,
  onConfigure
}) => {
  const { t } = useLanguage();

  const normalizedLang = normalizeLanguageCode(language);
  const activeLang = LANGUAGE_OPTIONS.find((opt) => opt.code === normalizedLang) || LANGUAGE_OPTIONS[0];
  const activeTheme = PWA_ICON_THEMES.find((item) => item.id === appTheme) || PWA_ICON_THEMES[0];
  const activeUnits = UNITS_PROFILE_OPTIONS.find((u) => u.id === selectedUnitsProfile) || UNITS_PROFILE_OPTIONS[0];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
      {/* Cabeçalho Limpo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-fluid-subtitle font-black text-[#114037] shrink-0 whitespace-nowrap">
          {t('settings.preferencesTab.cardTitle', 'Preferências & Unidades Padrão')}
        </h2>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onOpenHelp}
            className="px-3.5 min-h-[44px] bg-[#3CA64C]/10 hover:bg-[#3CA64C]/20 text-[#114037] font-extrabold text-xs rounded-xl transition-all inline-flex items-center gap-1.5 touch-target cursor-pointer"
            title={t('common.guide', 'Guia')}
          >
            <Info className="w-4 h-4 text-[#3CA64C] shrink-0" />
            <span>{t('common.help', 'Ajuda')}</span>
          </button>

          <button
            type="button"
            onClick={onConfigure}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl min-h-[44px] px-4 text-xs font-medium inline-flex items-center gap-2 shrink-0 cursor-pointer touch-target"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#1D734B]" strokeWidth={1.75} />
            <span>{t('settings.preferencesTab.configureAction', 'Configurar')}</span>
          </button>
        </div>
      </div>

      {/* Corpo em Modo Leitura: 3 Blocos Curados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
        {/* 1. Idioma e Região */}
        <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#1D734B] shrink-0" />
            {t('settings.languageAndRegion', 'Idioma e Região')}
          </span>
          <p className="font-bold text-slate-900 text-sm break-words">
            {formatLanguageSummary(activeLang.label)}
          </p>
        </div>

        {/* 2. Ícone da Aplicação (PWA) */}
        <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3">
          <img
            src={activeTheme.iconSrc}
            alt={t(activeTheme.titleKey, activeTheme.titleFallback)}
            className="w-11 h-11 rounded-xl border border-slate-200 bg-white p-0.5 object-contain shrink-0 shadow-2xs"
          />
          <div className="min-w-0 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block">
              {t('settings.preferencesTab.pwaIconLabel', 'Ícone da Aplicação (PWA)')}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-slate-900">
                {t(activeTheme.titleKey, activeTheme.titleFallback)}
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                {t('settings.preferencesTab.mobilePwaTag', 'Mobile / PWA')}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Unidades de Medida Padrão */}
        <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-[#1D734B] shrink-0" />
            {t('settings.preferencesTab.unitsSummaryLabel', 'Unidades de Medida Padrão')}
          </span>
          <p className="font-bold text-slate-900 break-words">
            {t(activeUnits.titleKey, activeUnits.titleFallback)}
          </p>
          <span className="inline-block px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-[#114037] font-mono tabular-nums">
            {activeUnits.unitsPill}
          </span>
        </div>
      </div>
    </div>
  );
};
