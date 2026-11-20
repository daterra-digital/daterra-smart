// src/features/settings/profile/UserProfileSummaryCard.tsx
import React from 'react';
import { Building2, Mail, MapPin, Pencil, Phone, ShieldCheck, User } from 'lucide-react';
import { useTranslation } from '../../../context/LanguageContext.tsx';

export interface UserProfileSummaryCardProps {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  company: string;
  role: string;
  jobTitle: string;
  nif: string;
  address: string;
  postalCode: string;
  city: string;
  isLoadingProfile: boolean;
  errorMessage: string | null;
  onEdit: () => void;
}

export const UserProfileSummaryCard: React.FC<UserProfileSummaryCardProps> = ({
  firstName, lastName, email, mobile, company, role, jobTitle, nif, address, postalCode, city,
  isLoadingProfile, errorMessage, onEdit
}) => {
  const { t } = useTranslation();
  const emptyText = t('settings.profile.notProvided', 'Não indicado');
  const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ') || emptyText;
  const roleJob = [role.trim(), jobTitle.trim()].filter(Boolean).join(' · ') || emptyText;
  const postalCity = [postalCode.trim(), city.trim()].filter(Boolean).join(' ');
  const fullAddress = [address.trim(), postalCity].filter(Boolean).join(' · ') || emptyText;

  return (
    <div className="bg-white p-6 rounded-3xl shadow-soft border border-slate-200 space-y-5">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4 flex-wrap">
        <h2 className="text-fluid-subtitle font-black text-[#114037] shrink-0 whitespace-nowrap">
          {t('settings.profile.cardTitle', 'Perfil do Utilizador')}
        </h2>
        <button
          type="button"
          onClick={onEdit}
          disabled={isLoadingProfile}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl min-h-[44px] px-4 text-xs font-medium inline-flex items-center gap-2 shrink-0 cursor-pointer touch-target disabled:opacity-50"
        >
          <Pencil className="w-4 h-4 text-[#1D734B]" strokeWidth={1.75} />
          <span>{t('settings.profile.editAction', 'Editar Perfil')}</span>
        </button>
      </div>

      {isLoadingProfile && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs font-bold text-blue-800 animate-pulse">
          {t('settings.loadingProfile', 'A carregar perfil…')}
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800">
          {errorMessage}
        </div>
      )}

      {/* Dados Curados em Grelha Compacta Horizontal */}
      <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-xs">
        <div className="min-w-0">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <User className="w-3 h-3 text-slate-400 shrink-0" />
            {t('settings.profile.fullName', 'Nome Completo')}
          </span>
          <span className="font-extrabold text-[#114037] text-sm break-words block mt-0.5">{fullName}</span>
        </div>

        <div className="min-w-0">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
            {t('settings.profile.email', 'Endereço de E-mail')}
          </span>
          <span className="font-bold text-slate-800 break-all block mt-0.5">{email || emptyText}</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#1D734B] text-[10px] font-bold">
            <ShieldCheck className="w-3 h-3 shrink-0" />
            {t('settings.profile.authenticatedAccount', 'Conta autenticada')}
          </span>
        </div>

        <div className="min-w-0">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
            {t('settings.profile.mobile', 'Telemóvel')}
          </span>
          <span className="font-bold text-slate-800 font-mono tabular-nums block mt-0.5">{mobile.trim() || emptyText}</span>
        </div>

        <div className="min-w-0">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
            {t('settings.profile.company', 'Empresa')}
          </span>
          <span className="font-bold text-slate-800 break-words block mt-0.5">{company.trim() || emptyText}</span>
        </div>

        <div className="min-w-0">
          <span className="text-[11px] font-semibold text-slate-500 block">
            {t('settings.profile.roleAndJob', 'Função / Cargo')}
          </span>
          <span className="font-bold text-slate-800 break-words block mt-0.5">{roleJob}</span>
        </div>

        <div className="min-w-0">
          <span className="text-[11px] font-semibold text-slate-500 block">
            {t('settings.profile.nif', 'NIF')}
          </span>
          <span className="font-bold text-slate-800 font-mono tabular-nums block mt-0.5">{nif.trim() || emptyText}</span>
        </div>

        <div className="min-w-0 sm:col-span-2">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            {t('settings.profile.fullAddress', 'Morada Completa')}
          </span>
          <span className="font-bold text-slate-800 break-words block mt-0.5">{fullAddress}</span>
        </div>
      </div>
    </div>
  );
};
