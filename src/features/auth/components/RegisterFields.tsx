import React from 'react';
import { User, Building2 } from 'lucide-react';
import { useTranslation } from '../../../context/LanguageContext';

export interface RegisterFieldsProps {
  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  companyName: string;
  setCompanyName: (val: string) => void;
  disabled?: boolean;
}

export const RegisterFields: React.FC<RegisterFieldsProps> = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  companyName,
  setCompanyName,
  disabled = false
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            {t('auth.firstNameLabel', 'Nome')}
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={t('auth.firstNamePlaceholder', 'Nome')}
              required
              disabled={disabled}
              className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-semibold outline-none focus:border-[#3CA64C] disabled:opacity-60"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            {t('auth.lastNameLabel', 'Apelido')}
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder={t('auth.lastNamePlaceholder', 'Apelido')}
            required
            disabled={disabled}
            className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-semibold outline-none focus:border-[#3CA64C] disabled:opacity-60"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          {t('auth.companyLabel', 'Entidade')}
        </label>
        <div className="relative">
          <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder={t('auth.companyPlaceholder', 'Nome da empresa ou exploração agrícola')}
            required
            disabled={disabled}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-semibold outline-none focus:border-[#3CA64C] disabled:opacity-60"
          />
        </div>
      </div>
    </>
  );
};
