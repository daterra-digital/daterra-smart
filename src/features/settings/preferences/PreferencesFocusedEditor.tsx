// src/features/settings/preferences/PreferencesFocusedEditor.tsx
import React, { useMemo } from 'react';
import { LANGUAGE_OPTIONS, useLanguage, type SupportedLanguage } from '../../../context/LanguageContext.tsx';
import { CultureFocusedEditorModal } from '../../perfis/components/CultureFocusedEditorModal.tsx';
import { SearchableRoundedDropdown } from '../../perfis/components/SearchableRoundedDropdown.tsx';
import type { CatalogSelectOption } from '../../perfis/data/cultureCatalogData.ts';
import {
  normalizeLanguageCode,
  PWA_ICON_THEMES,
  UNITS_PROFILE_OPTIONS,
  type AppThemeId
} from './preferencesCatalog.ts';

export interface PreferencesFocusedEditorProps {
  isOpen: boolean;
  language: SupportedLanguage;
  appTheme: AppThemeId;
  selectedUnitsProfile: string;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  onChangeTheme: (theme: AppThemeId) => void;
  onChangeUnitsProfile: (profileId: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export const PreferencesFocusedEditor: React.FC<PreferencesFocusedEditorProps> = ({
  isOpen,
  language,
  appTheme,
  selectedUnitsProfile,
  onChangeLanguage,
  onChangeTheme,
  onChangeUnitsProfile,
  onClose,
  onSave
}) => {
  const { t } = useLanguage();

  const languageOptions: CatalogSelectOption[] = useMemo(
    () =>
      LANGUAGE_OPTIONS.map((opt) => ({
        id: opt.code,
        label: opt.label,
        code: opt.code.toUpperCase()
      })),
    []
  );

  const normalizedLang = normalizeLanguageCode(language);
  const activeLangOption = languageOptions.find((o) => o.id === normalizedLang) || languageOptions[0];

  return (
    <CultureFocusedEditorModal
      isOpen={isOpen}
      title={t('settings.preferencesTab.editTitle', 'Configurar Preferências & Unidades')}
      subtitle={t('settings.preferencesTab.editSubtitle', 'Ajuste o idioma, o ícone móvel PWA e as unidades padrão.')}
      submitLabel={t('settings.preferencesTab.saveShort', 'Guardar Preferências')}
      cancelLabel={t('common.cancel', 'Cancelar')}
      onClose={onClose}
      onSubmit={onSave}
    >
      {/* Secção 1: Idioma e Região */}
      <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200 space-y-3">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-[#1D734B]">
          {t('settings.languageAndRegion', 'Idioma e Região')}
        </h3>
        <SearchableRoundedDropdown
          label={t('settings.interfaceLanguage', 'Idioma da Interface')}
          value={activeLangOption.label}
          selectedId={activeLangOption.id}
          options={languageOptions}
          onSelectOption={(opt) => onChangeLanguage(opt.id as SupportedLanguage)}
        />
      </div>

      {/* Secção 2: Ícones da Aplicação Móvel (PWA & Ecrã de Início) */}
      <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200 space-y-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-[#1D734B]">
              {t('settings.preferencesTab.appIconsTitle', 'Ícones da Aplicação Móvel (PWA & Ecrã de Início)')}
            </h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {t('settings.preferencesTab.mobileExclusive', 'Exclusivo Mobile')}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t(
              'settings.preferencesTab.appIconsNote',
              'Estes ícones são exclusivos para a aplicação instalada em smartphones e tablets. Nos navegadores web, o ícone de separador é fixo através do favicon oficial DATERRA.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {PWA_ICON_THEMES.map((theme) => {
            const selected = appTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => onChangeTheme(theme.id)}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-3.5 touch-target ${
                  selected
                    ? 'bg-emerald-50/70 border-[#3CA64C] shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <img
                  src={theme.iconSrc}
                  alt={t(theme.titleKey, theme.titleFallback)}
                  className="w-11 h-11 rounded-xl shadow-sm object-contain shrink-0 bg-white"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 text-xs">
                      {t(theme.titleKey, theme.titleFallback)}
                    </span>
                    {theme.isDefault && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        {t('settings.preferencesTab.defaultBadge', 'Padrão')}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {t(theme.noteKey, theme.noteFallback)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secção 3: Perfis de Unidades de Medida Padrão */}
      <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200 space-y-3">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-[#1D734B]">
          {t('settings.unitsProfilesTitle', 'Perfis de Unidades de Medida Padrão')}
        </h3>

        <div className="grid grid-cols-1 gap-2.5">
          {UNITS_PROFILE_OPTIONS.map((unit) => {
            const selected = selectedUnitsProfile === unit.id;
            return (
              <label
                key={unit.id}
                onClick={() => onChangeUnitsProfile(unit.id)}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 touch-target ${
                  selected
                    ? 'bg-emerald-50/70 border-[#3CA64C] shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <span className="font-extrabold text-slate-900 text-xs block">
                      {t(unit.titleKey, unit.titleFallback)}
                    </span>
                    <span className="inline-block text-[11px] text-slate-700 font-mono tabular-nums bg-white border border-slate-200 rounded-md px-2 py-0.5">
                      {unit.unitsPill}
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="units-drawer"
                    checked={selected}
                    onChange={() => onChangeUnitsProfile(unit.id)}
                    className="w-4 h-4 mt-0.5 text-[#3CA64C] accent-[#3CA64C] shrink-0"
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  {t(unit.descKey, unit.descFallback)}
                </p>
              </label>
            );
          })}
        </div>
      </div>
    </CultureFocusedEditorModal>
  );
};
