// src/features/settings/branding/CoBrandingSummaryCard.tsx
import React from 'react';
import { CheckCircle2, Globe, Image as ImageIcon, Mail, Palette, Phone, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from '../../../context/LanguageContext.tsx';
import type { CoBrandingConfig } from '../../smart-debito/types';
import { CoBrandingBannerPreview } from './CoBrandingBannerPreview.tsx';

export interface CoBrandingSummaryCardProps {
  coBranding: CoBrandingConfig;
  feedbackMessage: string | null;
  isSaving: boolean;
  onToggleEnabled: () => void;
  onConfigure: () => void;
}

export const CoBrandingSummaryCard: React.FC<CoBrandingSummaryCardProps> = ({
  coBranding,
  feedbackMessage,
  isSaving,
  onToggleEnabled,
  onConfigure
}) => {
  const { t } = useTranslation();
  const emptyText = t('settings.profile.notProvided', 'Não indicado');
  const statusLabel = coBranding.isEnabled
    ? t('settings.branding.statusActive', 'Co-Branding Ativo')
    : t('settings.branding.statusDisabled', 'Desativado');

  return (
    <div className="bg-white p-6 rounded-3xl shadow-soft border border-slate-200 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <h2 className="text-fluid-subtitle font-black text-[#114037] shrink-0 whitespace-nowrap">
          {t('settings.branding.shortTitle', 'Personalização Institucional')}
        </h2>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 min-h-[44px]">
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">{statusLabel}</span>
            <button
              type="button"
              onClick={onToggleEnabled}
              disabled={isSaving}
              aria-pressed={coBranding.isEnabled}
              aria-label={t('settings.branding.toggleAria', 'Ativar ou desativar Co-Branding')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                coBranding.isEnabled ? 'bg-[#3CA64C]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  coBranding.isEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <button
            type="button"
            onClick={onConfigure}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl min-h-[44px] px-4 text-xs font-medium inline-flex items-center gap-2 shrink-0 cursor-pointer touch-target"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#1D734B]" strokeWidth={1.75} />
            <span>{t('settings.branding.configureAction', 'Configurar')}</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      <CoBrandingBannerPreview coBranding={coBranding} statusLabel={statusLabel} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
        <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3">
          <div className="h-12 w-24 bg-white rounded-xl border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
            {coBranding.logoUrl ? (
              <img src={coBranding.logoUrl} alt={coBranding.companyName} className="max-h-full max-w-full object-contain" />
            ) : (
              <ImageIcon className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-slate-500 block">
              {t('settings.branding.institutionalLogoSummary', 'Logótipo Institucional')}
            </span>
            <span className="font-bold text-slate-800 block mt-0.5">
              {coBranding.logoUrl
                ? t('settings.branding.logoLoaded', 'Logótipo carregado')
                : t('settings.branding.noLogoLong', 'Sem logótipo')}
            </span>
          </div>
        </div>

        <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 space-y-2">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[#1D734B] shrink-0" />
            {t('settings.branding.activePaletteSummary', 'Paleta de 3 Cores Ativa')}
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {[coBranding.primaryColor, coBranding.secondaryColor, coBranding.textColor].map((hex, idx) => (
              <div key={`${idx}-${hex}`} className="inline-flex items-center gap-1.5 shrink-0">
                <span style={{ backgroundColor: hex }} className="w-4 h-4 rounded-md border border-slate-300 shrink-0" />
                <span className="font-mono tabular-nums font-bold text-slate-800 uppercase whitespace-nowrap">{hex}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">
            {t('settings.branding.bannerContactsSummary', 'Contactos no Banner')}
          </span>
          <div className="space-y-0.5 text-slate-800 font-semibold">
            <div className="flex items-center gap-1.5 font-mono tabular-nums">
              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{coBranding.phone.trim() || emptyText}</span>
            </div>
            <div className="flex items-center gap-1.5 break-all">
              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{coBranding.email.trim() || emptyText}</span>
            </div>
            <div className="flex items-center gap-1.5 break-all">
              <Globe className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{coBranding.website.trim() || emptyText}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
