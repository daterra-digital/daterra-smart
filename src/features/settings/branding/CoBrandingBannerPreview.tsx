// src/features/settings/branding/CoBrandingBannerPreview.tsx
import React from 'react';
import { Building2 } from 'lucide-react';
import { useTranslation } from '../../../context/LanguageContext.tsx';
import type { CoBrandingConfig } from '../../smart-debito/types';

export interface CoBrandingBannerPreviewProps {
  coBranding: CoBrandingConfig;
  statusLabel: string;
}

export const CoBrandingBannerPreview: React.FC<CoBrandingBannerPreviewProps> = ({ coBranding, statusLabel }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-[#1D734B]">
          {t('settings.branding.bannerPreviewTitle', 'Pré-visualização do Banner Oficial')}
        </h3>
        <span className="text-[11px] font-semibold text-slate-500">
          {t('settings.branding.bannerPreviewSubtitle', 'Aparência nos Relatórios PDF e na Aplicação')}
        </span>
      </div>

      <div
        style={{
          backgroundColor: coBranding.primaryColor,
          color: coBranding.textColor,
          borderColor: coBranding.secondaryColor
        }}
        className="w-full rounded-2xl p-4 sm:p-5 border-2 shadow-xs relative overflow-hidden"
      >
        <div style={{ backgroundColor: coBranding.secondaryColor }} className="absolute top-0 left-0 right-0 h-1.5" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0 flex-1">
            <div
              style={{ borderColor: coBranding.secondaryColor }}
              className="h-14 w-32 sm:h-16 sm:w-36 bg-white rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-sm border overflow-hidden"
            >
              {coBranding.logoUrl ? (
                <img src={coBranding.logoUrl} alt={coBranding.companyName} className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Building2 className="w-5 h-5 text-slate-400 shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t('settings.branding.logo', 'Logótipo')}
                  </span>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm sm:text-base font-extrabold tracking-tight break-words">
                  {coBranding.companyName || t('settings.branding.defaultCompanyName', 'Nome da Empresa')}
                </h4>
                <span
                  style={{ backgroundColor: coBranding.secondaryColor, color: coBranding.textColor }}
                  className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded shadow-xs shrink-0 whitespace-nowrap"
                >
                  {statusLabel}
                </span>
              </div>

              <p className="text-xs opacity-90 break-words">
                {coBranding.address || t('settings.branding.defaultCompanyAddress', 'Morada da Empresa')}
                {coBranding.postalCode ? ` · ${coBranding.postalCode}` : ''}
              </p>

              {(coBranding.phone || coBranding.email || coBranding.website) && (
                <div className="text-[11px] opacity-85 flex flex-wrap items-center gap-x-3 gap-y-0.5 break-all">
                  {coBranding.phone && <span>Tel: {coBranding.phone}</span>}
                  {coBranding.email && <span>Email: {coBranding.email}</span>}
                  {coBranding.website && <span>{coBranding.website}</span>}
                </div>
              )}
            </div>
          </div>

          <div className="self-start lg:self-center shrink-0">
            <span
              style={{ backgroundColor: coBranding.secondaryColor, color: '#FFFFFF' }}
              className="inline-block whitespace-nowrap text-[10px] font-black tracking-wider uppercase px-3 py-1.5 rounded-lg shadow-xs"
            >
              {t('settings.branding.officialInspectionBadge', 'CALIBRAÇÃO & AUDITORIA ISO 16122')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
