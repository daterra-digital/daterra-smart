import React from 'react';
import { useTranslation } from '../../../context/LanguageContext';
import iconDaterraMono from '../../../assets/icon-daterra-mono.png';

export interface AuthHeaderProps {
  step: 'form' | 'sent' | 'confirm_email';
  mode: 'login' | 'register';
  email: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ step, mode, email }) => {
  const { t } = useTranslation();

  return (
    <div className="text-center space-y-2.5">
      <div className="w-16 h-16 mx-auto flex items-center justify-center shadow-soft rounded-2xl overflow-hidden bg-[#114037]/5 p-2">
        <img src={iconDaterraMono} alt="DATERRA Smart" className="w-full h-full object-contain" />
      </div>
      <h1 className="text-2xl font-black text-[#114037]">
        {step === 'confirm_email'
          ? t('auth.confirmEmailTitle', 'Confirmar E-mail')
          : mode === 'login'
          ? t('auth.signInTitle', 'Entrar na DATERRA Smart')
          : t('auth.signUpTitle', 'Criar Conta DATERRA Smart')}
      </h1>
      <p className="text-xs text-slate-500">
        {step === 'sent'
          ? t('auth.subtitleSent', 'Enviámos um link mágico de acesso para {{email}}', { email })
          : step === 'confirm_email'
          ? t('auth.subtitleConfirm', 'Confirme o seu e-mail para concluir a autenticação neste dispositivo.')
          : t('auth.subtitleForm', 'Acesso seguro através de conta Google ou link enviado para o seu e-mail.')}
      </p>
    </div>
  );
};
