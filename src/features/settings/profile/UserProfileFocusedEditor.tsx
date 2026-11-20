// src/features/settings/profile/UserProfileFocusedEditor.tsx
import React from 'react';
import { useTranslation } from '../../../context/LanguageContext.tsx';
import { CultureFocusedEditorModal } from '../../perfis/components/CultureFocusedEditorModal.tsx';

export interface UserProfileFocusedEditorProps {
  isOpen: boolean;
  isLoadingProfile: boolean;
  isSaving: boolean;
  errorMessage: string | null;
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
  onChangeFirstName: (v: string) => void;
  onChangeLastName: (v: string) => void;
  onChangeMobile: (v: string) => void;
  onChangeCompany: (v: string) => void;
  onChangeRole: (v: string) => void;
  onChangeJobTitle: (v: string) => void;
  onChangeNif: (v: string) => void;
  onChangeAddress: (v: string) => void;
  onChangePostalCode: (v: string) => void;
  onChangeCity: (v: string) => void;
  onClose: () => void;
  onSave: () => Promise<void>;
}

const INPUT_CLS =
  'w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-[#3CA64C] disabled:opacity-50';

export const UserProfileFocusedEditor: React.FC<UserProfileFocusedEditorProps> = (p) => {
  const { t } = useTranslation();
  const busy = p.isLoadingProfile || p.isSaving;

  return (
    <CultureFocusedEditorModal
      isOpen={p.isOpen}
      title={t('settings.profile.editTitle', 'Editar Perfil do Utilizador')}
      subtitle={t('settings.profile.editSubtitle', 'Atualize a sua identidade, dados fiscais e morada.')}
      submitLabel={t('settings.profile.saveShort', 'Guardar Perfil')}
      cancelLabel={t('settings.profile.cancel', 'Cancelar')}
      isSubmitting={p.isSaving}
      errorMessage={p.errorMessage ?? undefined}
      onClose={p.onClose}
      onSubmit={p.onSave}
    >
      <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200 space-y-3">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-[#1D734B]">
          {t('settings.profile.personalData', 'Dados do Perfil do Utilizador')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-700 block">{t('settings.profile.firstName', 'Nome Próprio')}</span>
            <input type="text" value={p.firstName} onChange={(e) => p.onChangeFirstName(e.target.value)} disabled={busy} className={INPUT_CLS} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-700 block">{t('settings.profile.lastName', 'Apelido')}</span>
            <input type="text" value={p.lastName} onChange={(e) => p.onChangeLastName(e.target.value)} disabled={busy} className={INPUT_CLS} />
          </label>
        </div>
        <label className="block space-y-1">
          <span className="text-xs font-bold text-slate-700 block">{t('settings.profile.email', 'Endereço de E-mail')}</span>
          <input type="email" value={p.email} readOnly disabled className="w-full min-h-[48px] px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed outline-none" />
          <span className="text-[11px] text-slate-500 font-medium block">
            {t('settings.profile.emailShortNote', 'Associado à autenticação segura (apenas leitura).')}
          </span>
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-bold text-slate-700 block">{t('settings.profile.mobile', 'Telemóvel')}</span>
          <input type="text" value={p.mobile} onChange={(e) => p.onChangeMobile(e.target.value)} disabled={busy} className={`${INPUT_CLS} input-mono`} />
        </label>
      </div>

      <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200 space-y-3">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-[#1D734B]">
          {t('settings.profile.professionalInfo', 'Informação Profissional e Morada')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-700 block">{t('settings.profile.company', 'Empresa')}</span>
            <input type="text" value={p.company} onChange={(e) => p.onChangeCompany(e.target.value)} disabled={busy} className={INPUT_CLS} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-700 block">{t('settings.profile.nif', 'NIF')}</span>
            <input type="text" value={p.nif} onChange={(e) => p.onChangeNif(e.target.value)} disabled={busy} className={`${INPUT_CLS} input-mono`} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-700 block">{t('settings.profile.role', 'Função')}</span>
            <input type="text" value={p.role} onChange={(e) => p.onChangeRole(e.target.value)} disabled={busy} className={INPUT_CLS} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-700 block">{t('settings.profile.jobTitle', 'Cargo')}</span>
            <input type="text" value={p.jobTitle} onChange={(e) => p.onChangeJobTitle(e.target.value)} disabled={busy} className={INPUT_CLS} />
          </label>
        </div>
        <label className="block space-y-1">
          <span className="text-xs font-bold text-slate-700 block">{t('settings.profile.address', 'Morada')}</span>
          <input type="text" value={p.address} onChange={(e) => p.onChangeAddress(e.target.value)} disabled={busy} className={INPUT_CLS} />
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-700 block">{t('settings.profile.postalCode', 'Código-Postal')}</span>
            <input type="text" value={p.postalCode} onChange={(e) => p.onChangePostalCode(e.target.value)} disabled={busy} className={`${INPUT_CLS} input-mono`} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-700 block">{t('settings.profile.city', 'Localidade')}</span>
            <input type="text" value={p.city} onChange={(e) => p.onChangeCity(e.target.value)} disabled={busy} className={INPUT_CLS} />
          </label>
        </div>
      </div>
    </CultureFocusedEditorModal>
  );
};
