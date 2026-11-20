// src/features/settings/branding/CoBrandingFocusedEditor.tsx
import React from 'react';
import { Image as ImageIcon, Palette, Upload } from 'lucide-react';
import { useTranslation } from '../../../context/LanguageContext.tsx';
import { CultureFocusedEditorModal } from '../../perfis/components/CultureFocusedEditorModal.tsx';
import { PRESET_CO_BRANDING_PALETTES } from '../../smart-debito/coBrandingStorage';
import type { CoBrandingConfig } from '../../smart-debito/types';
import { BRANDING_COLOR_FIELDS, BRANDING_COMPANY_FIELDS } from './coBrandingFieldSpecs.ts';

export interface CoBrandingFocusedEditorProps {
  isOpen: boolean;
  isSaving: boolean;
  coBranding: CoBrandingConfig;
  onChangeCoBranding: React.Dispatch<React.SetStateAction<CoBrandingConfig>>;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFillFromProfile: () => void;
  onClose: () => void;
  onSave: () => Promise<void>;
}

const INPUT_CLS =
  'w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-[#3CA64C]';

export const CoBrandingFocusedEditor: React.FC<CoBrandingFocusedEditorProps> = ({
  isOpen, isSaving, coBranding, onChangeCoBranding, onLogoUpload, onFillFromProfile, onClose, onSave
}) => {
  const { t } = useTranslation();

  return (
    <CultureFocusedEditorModal
      isOpen={isOpen}
      title={t('settings.branding.editTitle', 'Configurar Personalização Institucional')}
      subtitle={t('settings.branding.editSubtitle', 'Personalize o logótipo, paleta de cores e contactos nos relatórios.')}
      submitLabel={t('settings.branding.saveShort', 'Guardar Configuração')}
      cancelLabel={t('common.cancel', 'Cancelar')}
      isSubmitting={isSaving}
      onClose={onClose}
      onSubmit={onSave}
    >
      <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200 space-y-3">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-[#1D734B]">
          {t('settings.branding.logoSectionTitle', 'Logótipo da Empresa')}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          {t('settings.branding.logoSectionDesc', 'Carregue o logótipo da sua organização (PNG, JPG ou SVG) para aplicação nos relatórios e na plataforma.')}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="h-14 w-28 bg-white rounded-xl border border-slate-300 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
            {coBranding.logoUrl ? (
              <img src={coBranding.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
            ) : (
              <div className="flex items-center gap-1.5 text-slate-400">
                <ImageIcon className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {t('settings.branding.noLogo', 'Sem Logo')}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="min-h-[44px] px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition-colors touch-target">
              <Upload className="w-4 h-4 text-[#1D734B]" />
              <span>{t('settings.branding.uploadLogo', 'Carregar Ficheiro de Logotipo')}</span>
              <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={onLogoUpload} className="hidden" />
            </label>

            {coBranding.logoUrl && (
              <button
                type="button"
                onClick={() => onChangeCoBranding((prev) => ({ ...prev, logoUrl: null }))}
                className="text-xs text-rose-600 hover:text-rose-800 font-bold text-left hover:underline px-1 cursor-pointer"
              >
                {t('settings.branding.removeLogo', 'Remover Logótipo Atual')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-[#1D734B]">
            {t('settings.branding.colorPaletteTitle', 'Paleta de 3 Cores')}
          </h3>
          <Palette className="w-4 h-4 text-[#1D734B]" />
        </div>

        <div className="space-y-2.5">
          {BRANDING_COLOR_FIELDS.map((cf) => {
            const label = t(cf.labelKey, cf.labelFallback);
            return (
              <div key={cf.key} className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-slate-700">{label}</span>
                  <span className="block text-[10px] text-slate-500">{t(cf.hintKey, cf.hintFallback)}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="color"
                    value={coBranding[cf.key]}
                    onChange={(e) => onChangeCoBranding((prev) => ({ ...prev, [cf.key]: e.target.value }))}
                    aria-label={label}
                    className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0"
                  />
                  <input
                    type="text"
                    value={coBranding[cf.key]}
                    onChange={(e) => onChangeCoBranding((prev) => ({ ...prev, [cf.key]: e.target.value }))}
                    aria-label={`${label} HEX`}
                    className="w-28 min-h-[40px] px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono tabular-nums font-bold uppercase text-slate-900 outline-none focus:border-[#3CA64C]"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-1">
          <span className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
            {t('settings.branding.quickPresets', 'Sugestões Rápidas:')}
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_CO_BRANDING_PALETTES.map((pal) => (
              <button
                key={pal.name}
                type="button"
                onClick={() =>
                  onChangeCoBranding((prev) => ({ ...prev, primaryColor: pal.primary, secondaryColor: pal.secondary, textColor: pal.text }))
                }
                className="py-1.5 px-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 hover:border-[#114037] text-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span style={{ backgroundColor: pal.primary }} className="w-3 h-3 rounded-full inline-block border border-slate-300" />
                <span style={{ backgroundColor: pal.secondary }} className="w-3 h-3 rounded-full inline-block border border-slate-300" />
                <span>{pal.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-[#1D734B]">
            {t('settings.branding.companyDataTitle', 'Dados da Empresa no Banner e Relatórios')}
          </h3>
          <button
            type="button"
            onClick={onFillFromProfile}
            className="text-xs font-bold text-[#1D734B] hover:text-[#114037] hover:underline self-start cursor-pointer"
          >
            {t('settings.branding.fillFromProfile', 'Preencher com dados do Perfil de Utilizador')}
          </button>
        </div>

        <div className="space-y-2.5">
          {BRANDING_COMPANY_FIELDS.map((field) => (
            <label key={field.key} className="block space-y-1">
              <span className="text-xs font-bold text-slate-700 block">{t(field.labelKey, field.labelFallback)}</span>
              <input
                type={field.type ?? 'text'}
                value={coBranding[field.key]}
                onChange={(e) => onChangeCoBranding((prev) => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholderKey ? t(field.placeholderKey, field.placeholderFallback) : field.placeholderFallback}
                className={field.mono ? `${INPUT_CLS} input-mono` : INPUT_CLS}
              />
            </label>
          ))}
        </div>
      </div>
    </CultureFocusedEditorModal>
  );
};
